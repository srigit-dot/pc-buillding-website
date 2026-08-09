# PC Building Website & AI Simulator

A comprehensive full-stack e-commerce and simulation platform for PC builders. This application allows users to browse PC components, build custom PCs, check for hardware bottlenecks, and purchase components. 

## 🚀 Features

*   **🛒 Product Store:** Browse a vast catalog of PC components (CPUs, GPUs, Motherboards, RAM, etc.) categorized for easy navigation.
*   **🤖 AI SimStore:** An intelligent PC build simulator that suggests optimal builds based on your budget and specific use cases (Gaming, CPU-intensive, General).
*   **⚖️ Bottleneck Checker:** Analyze potential performance bottlenecks between selected CPUs and GPUs before making a purchase.
*   **🔐 User Authentication:** Secure user registration, login, and OTP-based password reset functionality.
*   **💳 Shopping Cart & Checkout:** Full e-commerce flow with cart management and order placement.
*   **👨‍💼 Admin Dashboard:** A dedicated interface for administrators to view and manage customer orders.

## 🛠️ Technology Stack

**Frontend:**
*   React.js
*   React Router
*   Tailwind CSS / Vanilla CSS
*   Chart.js (for analytics/visualizations)

**Backend:**
*   Node.js & Express.js (Microservice-style architecture with multiple servers)
*   MongoDB & Mongoose (Database & ODM)
*   JWT (JSON Web Tokens) for Authentication
*   Nodemailer (for OTP emails)
*   CSV-Parser (for handling component data)

## 🏗️ Architecture & Services

The application runs on a microservice-inspired architecture with several independent Node.js servers handling specific domains:

*   **Auth Server** (`LoginServer.js` - Port 5000): Handles user signup, login, JWT generation, and OTP password resets.
*   **AI & Store Server** (`SimstoreServer.js` - Port 3001): Powers the AI build generation logic and handles order processing.
*   **Catalog Server** (`server.js` - Port 3003): Serves the product catalog from CSV data and manages cart operations.
*   **Bottleneck Server** (`BottleneckServer.js` - Port 3004): Calculates performance bottlenecks between hardware combinations.
*   **Admin Server** (`Adminserver.js` - Port 3005): Provides APIs for the admin dashboard.
*   **React Frontend** (Port 3000): The main user interface.

## 🚦 Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/) installed
*   [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally on port 27017 (`mongod`)

### Installation & Setup

1.  **Clone the repository**
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Start the Backend Servers:**
    Open multiple terminal windows/tabs and start each server:
    ```bash
    node LoginServer.js
    node SimstoreServer.js
    node server.js
    node BottleneckServer.js
    ```
    To run the Admin server (which uses ES modules):
    ```bash
    node Adminserver.js
    ```
4.  **Start the React Frontend:**
    In a new terminal, run:
    ```bash
    npm run dev
    ```
5.  **Open the App:** Navigate to `http://localhost:3000` in your browser.

## 📂 Data Structure
The application uses local JSON and CSV files located in the `data/` directory to simulate a massive hardware database, which is parsed and served dynamically to the frontend.
