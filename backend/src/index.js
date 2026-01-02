const generateBillPDF = require("./billGenerator");
const sendEmail = require("./emailSender");

const billData = {
  customerName: "Elvish Bhaiiiiiii",
  address: "The one technologies",
  city: "Ahmedabad",
  state: "Gujarat",
  country: "Bharat",
  postal_code: 94111,
  amount: "1,00,000 INR",
  // Include other bill details here
};

const pdfFilePath = "pdfs/bill.pdf";
generateBillPDF(billData, pdfFilePath);

const userEmail = "vedantb658@gmail.com";
const emailSubject = "Your Bill";
const emailBody = "Thank you for your purchase.";

sendEmail(userEmail, emailSubject, emailBody, pdfFilePath)
  .then(() => {
    console.log("Email sent successfully.");
  })
  .catch((error) => {
    console.error("Error sending email:", error);
  });
