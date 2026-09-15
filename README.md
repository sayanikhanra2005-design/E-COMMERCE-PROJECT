# ShopStack — Java Enterprise Multi-Vendor E-Commerce Platform

## 📌 Project Overview

**ShopStack** is a full-stack multi-vendor e-commerce platform developed as part of the **Infosys Springboard Virtual Internship**.

The platform allows customers to browse products, manage their shopping cart, apply coupons, place orders, make payments, track orders, request returns and receive refunds.

Vendors can manage products, inventory and customer orders, while administrators can manage vendors, products, orders, returns, refunds and commission reports.

The application is designed using a **React.js frontend, Spring Boot backend and PostgreSQL database**.

---

## 🎯 Objectives

* Develop a complete multi-vendor e-commerce platform.
* Provide separate functionalities for Customers, Vendors, Administrators and Warehouse Staff.
* Implement secure authentication and role-based authorization.
* Manage products, inventory, carts and orders.
* Provide coupon and commission management.
* Implement return and refund workflows.
* Provide responsive and user-friendly interfaces.
* Handle invalid requests and server/API errors gracefully.

---

## 👥 User Roles

### 👤 Customer

Customers can:

* Register and log in.
* Browse available products.
* Add products to cart.
* Update cart quantities.
* Manage delivery addresses.
* Apply available coupons.
* Select payment methods.
* Place orders.
* View order history.
* Cancel eligible orders.
* Request returns for delivered orders.
* Track order status.
* View refund information.

### 🏪 Vendor

Vendors can:

* Access the vendor dashboard.
* Manage products.
* Manage product prices and details.
* Monitor inventory.
* View customer orders.
* Update order status.
* Track product stock.

### 👑 Administrator

Administrators can:

* Access the admin dashboard.
* Manage vendors.
* Approve or reject vendors.
* Manage products.
* Monitor orders.
* Manage returns and refunds.
* View commission records.
* View commission reports.
* Monitor platform activity.

### 🏭 Warehouse Staff

Warehouse staff are intended to support warehouse and shipment-related operations within the platform.

---

## ✨ Main Features

### 🔐 Authentication & Authorization

* User registration
* User login
* JWT-based authentication
* Role-based authorization
* Protected API endpoints
* Customer, Vendor and Administrator access control

### 🛍️ Product Management

* Product listing
* Product details
* Product creation and management
* Vendor-specific products
* Product quantity management
* Product availability checking

### 🛒 Shopping Cart

* Add products to cart
* Increase/decrease quantity
* Remove products
* Stock validation
* Automatic total calculation
* Empty cart handling

### 📍 Address Management

Customers can:

* Add delivery addresses
* View saved addresses
* Select an address during checkout

### 🎟️ Coupon Management

* Display active coupons
* Select available coupons
* Validate coupon codes
* Handle invalid or expired coupons
* Apply discounts during checkout
* Track coupon usage

### 💳 Checkout & Payment

The checkout process follows:

**Cart → Address → Coupon → Payment Method → Review → Place Order**

The system validates:

* Customer authentication
* Delivery address
* Cart contents
* Product availability
* Product stock
* Coupon validity
* Payment method

### 📦 Order Management

Customers can:

* Place orders
* View orders
* Cancel eligible orders
* Track order status
* Request returns

Vendors/Admins can manage order status.

Order status flow:

**PENDING → CONFIRMED → SHIPPED → DELIVERED**

Orders can also be cancelled when permitted.

### 📊 Inventory Management

When an order is successfully placed:

1. Product stock is checked.
2. Order is saved.
3. Order items are created.
4. Product quantity is reduced.
5. Inventory quantity is updated.
6. Reserved quantity is updated.
7. Cart is cleared after successful checkout.

Insufficient-stock situations are handled with user-friendly error messages.

### ↩️ Return Management

Customers can request a return after an eligible order has been delivered.

Return workflow:

**DELIVERED → RETURN REQUESTED → APPROVED / REJECTED**

The customer must provide a return reason.

### 💰 Refund Management

Approved returns can proceed to refund processing.

The system stores:

* Refund amount
* Refund transaction ID
* Refund date
* Refund status

Refund transaction IDs are generated for processed refunds.

### 💼 Commission Management

The platform calculates vendor commission for completed orders.

Commission information includes:

* Order amount
* Commission amount
* Vendor amount
* Vendor
* Product
* Order

Administrators can view commission reports.

### 📱 Responsive Design

The frontend is designed to support:

* Desktop
* Laptop
* Tablet
* Mobile

Responsive layouts have been implemented for:

* Customer Dashboard
* Products
* Cart
* Checkout
* Orders
* Vendor Dashboard
* Admin Dashboard
* Reports

---

## 🛠️ Technology Stack

### Frontend

* React.js
* JavaScript
* HTML5
* CSS3
* Axios
* Vite

### Backend

* Java 21
* Spring Boot
* Spring Security
* Spring Data JPA
* REST APIs
* JWT Authentication
* Maven
* Lombok

### Database

* PostgreSQL

### Development Tools

* Visual Studio Code
* pgAdmin
* Postman
* Git
* GitHub

---

## 🏗️ Application Architecture

```text
                    ┌──────────────────────┐
                    │      React.js        │
                    │      Frontend        │
                    └──────────┬───────────┘
                               │
                               │ REST API
                               ▼
                    ┌──────────────────────┐
                    │     Spring Boot      │
                    │       Backend        │
                    ├──────────────────────┤
                    │ Controllers           │
                    │ Services              │
                    │ Repositories          │
                    │ Spring Security       │
                    │ JWT Authentication    │
                    └──────────┬───────────┘
                               │
                               │ JPA / Hibernate
                               ▼
                    ┌──────────────────────┐
                    │     PostgreSQL       │
                    │       Database       │
                    └──────────────────────┘
```

---

## 📂 Major Modules

```text
ShopStack
│
├── Authentication
├── Customer Management
├── Vendor Management
├── Admin Management
├── Warehouse Management
├── Product Management
├── Cart Management
├── Address Management
├── Coupon Management
├── Checkout
├── Payment
├── Order Management
├── Inventory Management
├── Shipment Management
├── Return Management
├── Refund Management
└── Commission & Reports
```

---

## 🔄 Order Processing Workflow

```text
Customer
   │
   ▼
Browse Products
   │
   ▼
Add to Cart
   │
   ▼
Select Address
   │
   ▼
Apply Coupon
   │
   ▼
Select Payment Method
   │
   ▼
Review Order
   │
   ▼
Place Order
   │
   ▼
Validate Stock
   │
   ▼
Create Order
   │
   ├──────────────► Update Inventory
   │
   ├──────────────► Calculate Commission
   │
   └──────────────► Update Coupon Usage
   │
   ▼
Clear Cart
   │
   ▼
Customer Orders
```

---

## 🔄 Return & Refund Workflow

```text
Delivered Order
      │
      ▼
Customer Requests Return
      │
      ▼
Admin Reviews Request
      │
      ├──────────────► Reject
      │
      ▼
    Approve
      │
      ▼
Inventory Restored
      │
      ▼
Refund Processed
      │
      ▼
REFUNDED
```

---

## ⚠️ Error Handling

The application provides user-friendly error handling for common scenarios.

Handled cases include:

* Invalid login credentials
* Duplicate registration
* Empty or invalid form fields
* Unauthorized access
* Expired session
* Backend unavailable
* API/server errors
* Insufficient stock
* Invalid product
* Invalid or expired coupon
* Missing address
* Missing payment method
* Invalid order
* Invalid cancellation request
* Invalid return request
* Refund errors

Instead of displaying technical stack traces, the frontend displays understandable messages to the user.

---

## 🧪 Testing

The following areas were tested:

### Authentication

* Valid login
* Invalid email
* Invalid password
* Duplicate registration
* Empty form fields
* Logout

### Shopping

* Product listing
* Add to cart
* Quantity updates
* Stock validation
* Empty cart
* Total calculation

### Checkout

* Address selection
* Address creation
* Coupon validation
* Invalid coupon
* Payment method selection
* Order placement
* Insufficient stock
* Backend error handling

### Orders

* Order creation
* Order history
* Order status
* Order cancellation
* Return request
* Refund workflow

### Vendor

* Product management
* Inventory
* Order management
* Order status updates

### Admin

* Vendor approval/rejection
* Product management
* Order management
* Returns/refunds
* Commission reports

### Responsive Testing

The UI was tested across different screen sizes, including:

* Mobile: 375 × 667
* Mobile: 390 × 844
* Tablet: 768 × 1024
* Laptop: 1024 × 768
* Desktop: 1440 × 900

---

## 🚀 How to Run the Project

### Prerequisites

Install:

* Java 21
* Node.js
* PostgreSQL
* Git
* Visual Studio Code or another IDE

---

### Backend Setup

Navigate to the backend project:

```bash
cd authentication
```

Configure PostgreSQL database settings in:

```text
src/main/resources/application.properties
```

Create/use the PostgreSQL database:

```text
authentication_db
```

Run the backend:

```bash
mvnw.cmd spring-boot:run
```

Backend runs on:

```text
http://localhost:8080
```

---

### Frontend Setup

Navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm.cmd install
```

Start the development server:

```bash
npm.cmd run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

## 🔧 Build Commands

### Backend

```bash
mvnw.cmd clean compile
```

### Frontend

```bash
npm.cmd run build
```

---

## 🔒 Security

The application uses:

* JWT authentication
* Password encryption
* Spring Security
* Role-based authorization
* Protected REST endpoints
* Token-based API access

Sensitive credentials should not be committed to the GitHub repository.

---

---

## 🚀 Deployment Architecture & Modes

ShopStack supports multiple deployment environments, ranging from local developer workflows to containerized and cloud architectures:

```
                  ┌─────────────────────────────────────────────────────────┐
                  │                 GitHub Repository                       │
                  │   https://github.com/sayanikhanra2005-design/...        │
                  └────────────┬───────────────────────────────┬────────────┘
                               │ (Automated CI/CD)             │ (Manual Git Pull)
                               ▼                               ▼
       ┌───────────────────────────────┐     ┌──────────────────────────────────┐
       │         Vercel Edge           │     │            AWS EC2               │
       │    (React Production CDN)     │     │      (Public Host: 16.16.78.80)  │
       │  - Auto-builds on push        │     │                                  │
       │  - HTTPS / SSL Global Edge    │     │   ┌───────────────────────────┐  │
       │  - Dynamic SPA routing        │     │   │     Docker Compose        │  │
       └───────────────┬───────────────┘     │   │                           │  │
                       │                     │   │ ┌───────────────────────┐ │  │
                       │ (HTTPS / REST APIs) │   │ │  shopstack-frontend   │ │  │
                       │                     │   │ │  (Nginx Alpine :80)   │ │  │
                       └─────────────────────┼──►│ └───────────────────────┘ │  │
                                             │   │ ┌───────────────────────┐ │  │
                                             │   │ │   shopstack-backend   │ │  │
                                             │   │ │ (Spring Boot :8080)   │ │  │
                                             │   │ └───────────┬───────────┘ │  │
                                             │   │             │ (JDBC)      │  │
                                             │   │ ┌───────────▼───────────┐ │  │
                                             │   │ │   shopstack-postgres  │ │  │
                                             │   │ │  (PostgreSQL :5432)   │ │  │
                                             │   │ └───────────────────────┘ │  │
                                             │   └───────────────────────────┘  │
                                             └──────────────────────────────────┘
```

### 1. Manual AWS EC2 Deployment
* **Workflow**: The administrator connects via SSH to the remote AWS EC2 instance (`16.16.78.80`), synchronizes the repository using `git pull origin main`, and manages service state.
* **Characteristics**: Provides full administrative control over instance resources, logging, and environment variables without requiring automated external agents.

### 2. Docker Multi-Container Deployment
The entire platform is orchestrated through `docker-compose.yml`:
* **`shopstack-postgres`**: PostgreSQL 18 container with persistent volume storage (`postgres_data`) and integrated healthcheck (`pg_isready`).
* **`shopstack-backend`**: Multi-stage Java 21 container packaging the Spring Boot application, dynamically configured through `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, and `DB_PASSWORD`.
* **`shopstack-frontend`**: Multi-stage Node 24 build container serving optimized production assets through Nginx Alpine with custom SPA routing (`try_files $uri $uri/ /index.html;`).

#### Docker Compose Commands:
```bash
# Start all services in detached mode
docker compose up -d --build

# Inspect container status and health
docker compose ps

# View unified or service-specific logs
docker compose logs -f backend
docker compose logs -f frontend
```

### 3. Automated GitHub CI/CD Pipeline (Vercel Frontend)
* **Workflow**: When frontend source code is pushed to the `main` branch on GitHub, Vercel automatically detects the commit, runs `npm run build`, and redeploys the live frontend across its global edge network.
* **Environment Synchronization**: The Vercel frontend communicates with the EC2 backend via `VITE_API_URL`.

---

## 🛡️ AWS Security Group Port Configuration

To ensure accessibility from external client browsers and secure backend communication, the EC2 Security Group must have the following Inbound Rules configured:

| Port | Protocol | Source | Purpose | Required For |
| :--- | :--- | :--- | :--- | :--- |
| **22** | TCP | `Your IP` or `0.0.0.0/0` | SSH Administration | Remote instance access |
| **80** | TCP | `0.0.0.0/0` | HTTP Web Access | React frontend (Nginx) |
| **8080** | TCP | `0.0.0.0/0` | Spring Boot REST API | Frontend-to-Backend API calls |
| **443** | TCP | `0.0.0.0/0` | HTTPS Secured Traffic | SSL-encrypted web and API traffic |

> [!NOTE]
> **Troubleshooting External Access**:
> If the application is running locally inside EC2 (e.g., `curl http://localhost` returns 200 OK) but `http://16.16.78.80/` does not load in your local browser, ensure that **Port 80** and **Port 8080** are explicitly permitted under **AWS Console $\rightarrow$ EC2 $\rightarrow$ Instances $\rightarrow$ Security $\rightarrow$ Inbound Rules**.

---

## 📈 Future Enhancements

Possible future improvements include:

* Real online payment gateway integration
* SMS notifications
* Advanced product search
* Product reviews and ratings
* Wishlist improvements
* Advanced analytics
* AI-powered product recommendations

---

## 🎓 Project Information

**Project:** ShopStack — Java Enterprise Multi-Vendor E-Commerce Platform

**Program:** Infosys Springboard Virtual Internship

**Technology:** Java Enterprise / Spring Boot / React.js

**Department:** Information Technology

**Academic Year:** 4th Year, 7th Semester

---

## 👩‍💻 Developer

**Sayani Khanra**

B.Tech — Information Technology

St. Thomas' College of Engineering & Technology

---

## 📌 Project Status

**Development:** Completed
**Backend Build:** Successful
**Frontend Build:** Successful
**Testing:** Completed
**Responsive UI:** Implemented
**Error Handling:** Implemented

### ✅ Project Ready for Final Submission
