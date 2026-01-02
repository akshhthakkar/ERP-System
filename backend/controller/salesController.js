const Sales = require("../models/sales");
const Product = require("../models/product");
const ProductImage = require("../models/productImage");
const User = require("../models/user");
const successResponse = require("../responses/successResponse");
const errorResponse = require("../responses/errorResponse");
const generateBillPDF = require("../src/billGenerator");
const sendEmail = require("../src/emailSender");
const path = require("path");
const fs = require("fs");
const cloudinaryUpload = require("../utils/cloudinaryUpload");
const auditLogger = require("../utils/auditLogger");
const notificationService = require("../utils/notificationService");

const salesController = {
  createSale: async (req, res) => {
    try {
      const { customer, customermail, products } = req.body;
      const owner = req.user.userId;

      // ============ PHASE 1: VALIDATE ALL PRODUCTS FIRST (HARD LOCK) ============
      // Check all products BEFORE making any changes
      const validationErrors = [];
      const productData = [];

      for (const item of products) {
        const { productId, quantity } = item;

        const product = await Product.findOne({ _id: productId, owner: owner });

        if (!product) {
          validationErrors.push(
            `Product ${productId} not found or unauthorized`
          );
          continue;
        }

        // HARD LOCK: Prevent negative inventory
        if (product.inventory < quantity) {
          validationErrors.push(
            `Insufficient inventory for "${product.name}". Available: ${product.inventory}, Requested: ${quantity}`
          );
          continue;
        }

        productData.push({ product, quantity });
      }

      // If any validation errors, abort entire sale
      if (validationErrors.length > 0) {
        return errorResponse(res, 400, validationErrors.join("; "));
      }

      // ============ PHASE 2: PROCESS SALE ============
      const createdSales = [];
      const billProducts = [];

      for (const { product, quantity } of productData) {
        const beforeState = product.toObject();

        // Deduct inventory
        product.inventory -= quantity;

        // Update lastSoldAt for dead stock tracking
        product.lastSoldAt = new Date();

        // Recalculate dailySalesAvg (incremental update)
        // Formula: new average considering this sale
        const totalSalesForProduct = await Sales.countDocuments({
          "product.productId": product._id,
          owner: owner,
        });

        const totalQuantitySold = await Sales.aggregate([
          { $match: { "product.productId": product._id, owner: owner } },
          { $group: { _id: null, total: { $sum: "$quantity" } } },
        ]);

        const prevTotalQty = totalQuantitySold[0]?.total || 0;
        const newTotalQty = prevTotalQty + quantity;

        // Calculate days since first sale (or 1 if first sale)
        const firstSale = await Sales.findOne({
          "product.productId": product._id,
          owner: owner,
        }).sort({ date: 1 });

        let daysSinceFirstSale = 1;
        if (firstSale) {
          daysSinceFirstSale = Math.max(
            1,
            Math.ceil((Date.now() - firstSale.date) / (1000 * 60 * 60 * 24))
          );
        }

        product.dailySalesAvg = newTotalQty / daysSinceFirstSale;

        await product.save();

        // Calculate amount
        const price = product.price;
        const amount = price * quantity;
        const cp = product.cp || 0;

        // Create sale record
        const newSale = new Sales({
          customer,
          customermail,
          owner,
          product: {
            productId: product._id,
            productName: product.name,
          },
          quantity,
          price,
          cp,
          amount,
          date: new Date(),
        });

        const savedSale = await newSale.save();
        createdSales.push(savedSale);

        // Audit log
        await auditLogger.log(
          owner,
          "CREATE_SALE",
          "sale",
          savedSale._id,
          null,
          savedSale.toObject()
        );

        // Fetch product image for bill
        const productImage = await ProductImage.findOne({
          productId: product._id,
        });

        billProducts.push({
          ...savedSale.toObject(),
          image: productImage ? productImage.requestfile.imageUrl : null,
        });

        // ============ PHASE 3: TRIGGER NOTIFICATIONS ============
        // Check low stock
        await notificationService.checkLowStock(product, owner);

        // Check forecast warning
        await notificationService.checkForecast(product, owner);
      }

      // Update user stats
      await User.findByIdAndUpdate(owner, {
        $inc: { "stats.totalSalesCreated": createdSales.length },
      });

      // ============ PHASE 4: GENERATE BILL PDF ============
      const billData = {
        customerName: customer,
        customermail: customermail,
        sales: billProducts,
      };

      const fileName = `bill_${Date.now()}.pdf`;
      const pdfFilePath = path.join(__dirname, "../pdfs", fileName);

      // Ensure pdfs directory exists
      if (!fs.existsSync(path.join(__dirname, "../pdfs"))) {
        fs.mkdirSync(path.join(__dirname, "../pdfs"), { recursive: true });
      }

      // Generate PDF locally
      generateBillPDF(billData, pdfFilePath);

      // Wait for file to be written
      await new Promise((resolve) => setTimeout(resolve, 2000));

      let pdfUrl = null;

      try {
        // Upload to Cloudinary using utility
        const uploadResult = await cloudinaryUpload.uploadPDF(
          pdfFilePath,
          "h5erp_bills"
        );
        pdfUrl = uploadResult.secure_url;

        // Update sales with PDF URL and success status
        for (const sale of createdSales) {
          sale.pdfUrl = pdfUrl;
          sale.billStatus = "GENERATED";
          await sale.save();
        }

        // ============ PHASE 5: SEND EMAIL WITH ATTACHMENT ============
        const emailSubject = "Your Purchase Receipt - H5 ERP";
        const emailBody = `Dear ${customer},\n\nThank you for your purchase!\n\nPlease find your bill attached to this email.\n\nIf you have any questions, please don't hesitate to contact us.\n\nBest regards,\nH5 ERP`;

        // Send email with PDF attachment (local file before cleanup)
        await sendEmail(customermail, emailSubject, emailBody, pdfFilePath);
        console.log(`Email with PDF attachment sent to ${customermail}`);

        // Clean up local file AFTER sending email
        fs.unlinkSync(pdfFilePath);
      } catch (uploadError) {
        console.error("Cloudinary Upload or Email Error", uploadError);

        // Mark sales as FAILED for bill generation
        for (const sale of createdSales) {
          sale.billStatus = "FAILED";
          await sale.save();
        }

        // Try to clean up even on error
        try {
          if (fs.existsSync(pdfFilePath)) {
            fs.unlinkSync(pdfFilePath);
          }
        } catch (e) {}
      }

      successResponse(
        res,
        createdSales,
        "Sales created & Bill uploaded successfully"
      );
    } catch (error) {
      console.error(error);
      errorResponse(res, 500, "Internal Server Error", error);
    }
  },

  getSales: async (req, res) => {
    try {
      const owner = req.user.userId;

      let sales = await Sales.find({ owner: owner }).sort({ date: -1 });

      sales = sales.map((sale) => ({
        _id: sale._id,
        customer: sale.customer,
        customermail: sale.customermail,
        product: sale.product,
        quantity: sale.quantity,
        amount: sale.amount,
        date: sale.date.toISOString().split("T")[0],
        pdfUrl: sale.pdfUrl,
      }));

      successResponse(res, sales, "Sales retrieved successfully");
    } catch (error) {
      console.error(error);
      errorResponse(res, 500, "Internal Server Error", error);
    }
  },

  downloadBill: async (req, res) => {
    try {
      const { id } = req.params;
      const owner = req.user.userId;

      const sale = await Sales.findOne({ _id: id, owner: owner });

      if (!sale)
        return errorResponse(res, 404, "Sale not found or unauthorized");

      if (sale.pdfUrl) {
        return res.redirect(sale.pdfUrl);
      }

      return errorResponse(res, 404, "Bill not found");
    } catch (error) {
      console.error(error);
      errorResponse(res, 500, "Internal Server Error", error);
    }
  },
};

module.exports = salesController;
