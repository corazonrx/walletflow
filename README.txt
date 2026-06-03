# WalletFlow

WalletFlow is personal finance tracker built with HTML, CSS, JavaScript, Node.js, Express, and SQLite.

Users can create an account, log in, add income and expense transactions, view their balance, see recent transactions, delete transactions, and convert their balance using a public exchange-rate API.

## Features

- User registration and login
- Password hashing with bcrypt
- JWT authentication
- Protected transaction routes
- Income and expense tracking
- Recent transaction history
- SQLite database storage
- localStorage session storage
- Public currency exchange API integration

## The project uses the free ExchangeRate API endpoint:
https://www.exchangerate-api.com/docs/free

## How to Run

Install dependencies:
```bash
npm install
->
npm start
->
http://localhost:3000 (demo account: Email:admin2@gmail.com /// Password:admin2)
    