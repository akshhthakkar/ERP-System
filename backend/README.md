# ERP System Backend

This repository contains the backend for the ERP (Enterprise Resource Planning) System, built with Node.js, Express.js, and MongoDB. It serves as the central data management and business logic hub for various ERP functionalities, including accounting, human resources, inventory, and customer relationship management.

## About the Project

The ERP System Backend is a robust and scalable API designed to support the frontend web application. It handles user authentication, data persistence, business logic execution, and provides RESTful endpoints for various ERP modules. The goal is to provide a centralized and efficient system for managing core business processes.

## Features

* **User Authentication & Authorization:** Secure login, registration, and role-based access control.
* **Module Management:** APIs for managing different ERP modules (e.g., Inventory, HR, Finance etc).
* **Data Persistence:** MongoDB for storing all application data.
* **Scalable Architecture:** Designed for easy extension and addition of new functionalities.
* **Error Handling:** Robust error management for API requests.
* **Data Validation:** Ensuring data integrity for all incoming requests.

## Technologies Used

* **Node.js:** JavaScript runtime environment
* **Express.js:** Web application framework for Node.js
* **MongoDB:** NoSQL database
* **Mongoose:** MongoDB object modeling for Node.js
* **JWT (JSON Web Tokens):** For secure authentication
* **Bcrypt.js:** For password hashing
* **Dotenv:** For managing environment variables

*Note: This project utilizes a personal MongoDB database for data storage.*

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/akshhthakkar/H5-Backend.git](https://github.com/akshhthakkar/H5-Backend.git)
    cd H5-Backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
