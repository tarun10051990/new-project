# ELITe JioMart - Bulk Order Dashboard

A full-stack bulk ordering management system inspired by JioMart, built with React (frontend) and Spring Boot (backend).

## Tech Stack

### Frontend
- **React 19** (with Vite)
- **React Router** for navigation
- **Axios** for API calls
- **React Hot Toast** for notifications
- **Lucide React** for icons

### Backend
- **Spring Boot 3.2** with Java 17
- **Spring Data JPA** with H2 in-memory database
- **Spring Web** for REST API

## Features

- Access key authentication (jm_xxx format)
- Dashboard with statistics (Total Accounts, Orders, Spent)
- Credit balance display
- Dark/Light theme toggle
- Bulk Order Management:
  - Add delivery addresses (Manual Entry, JSON Payload, Import from Account)
  - Target address selection with delete capability
  - Randomize mobile number option
  - Multi-cart support with product URLs, quantities, coupons, expected prices
  - Repeat order count
  - Optional features section
  - Start Bulk Orders
- Connected Accounts management:
  - Add/Delete/Search accounts
  - Bulk select and delete
  - Row range selection
  - Pagination (10/20/40/100 per page)
  - Live activity tracking
- Cookie to JSON Converter tool
- How to Use guide page
- Vault and Credit History sections

## Getting Started

### Prerequisites
- Java 17+
- Maven 3.6+
- Node.js 18+

### Backend Setup

```bash
cd backend
mvn clean install
mvn spring-boot:run
```
Backend runs on `http://localhost:8080`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`

### Demo Access
Use access key: `jm_demo`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Authenticate with access key |
| GET | /api/auth/me/:userId | Get user details |
| GET | /api/addresses/:userId | List addresses |
| POST | /api/addresses | Create address |
| DELETE | /api/addresses/:id | Delete address |
| GET | /api/accounts/:userId | List accounts |
| GET | /api/accounts/:userId/search | Search accounts |
| POST | /api/accounts | Add account |
| DELETE | /api/accounts/:id | Delete account |
| DELETE | /api/accounts/bulk | Bulk delete accounts |
| GET | /api/orders/:userId | List orders |
| GET | /api/orders/:userId/stats | Get dashboard stats |
| POST | /api/orders | Create bulk order |
| GET | /api/credits/:userId | Credit history |

## Project Structure

```
├── backend/
│   ├── pom.xml
│   └── src/main/java/com/jiomart/bulk/
│       ├── BulkOrderApplication.java
│       ├── config/WebConfig.java
│       ├── controller/
│       │   ├── AuthController.java
│       │   ├── AddressController.java
│       │   ├── AccountController.java
│       │   ├── OrderController.java
│       │   └── CreditController.java
│       ├── model/
│       │   ├── User.java
│       │   ├── Address.java
│       │   ├── ConnectedAccount.java
│       │   ├── BulkOrder.java
│       │   ├── CartItem.java
│       │   └── CreditTransaction.java
│       ├── repository/
│       │   ├── UserRepository.java
│       │   ├── AddressRepository.java
│       │   ├── ConnectedAccountRepository.java
│       │   ├── BulkOrderRepository.java
│       │   ├── CartItemRepository.java
│       │   └── CreditTransactionRepository.java
│       └── service/
│           ├── UserService.java
│           ├── AddressService.java
│           ├── AccountService.java
│           ├── OrderService.java
│           └── CreditService.java
├── frontend/
│   ├── index.html
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── context/AuthContext.jsx
│       ├── utils/api.js
│       ├── components/
│       │   ├── Header.jsx
│       │   ├── AddressForm.jsx
│       │   ├── CartBlock.jsx
│       │   ├── BulkOrderSection.jsx
│       │   └── ConnectedAccounts.jsx
│       └── pages/
│           ├── Login.jsx
│           ├── Dashboard.jsx
│           ├── HowToUse.jsx
│           └── CookieConverter.jsx
└── README.md
```
