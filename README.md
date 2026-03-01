# Urban Infrastructure Data Portal – Smart City Management System

A production-ready management system for city infrastructure assets, built with Node.js, React, and PostgreSQL.

## 🚀 Features
- **Dashboard**: High-level overview with charts (Assets by Type, Asset Health).
- **Asset Management**: Full CRUD operations for roads, utilities, and facilities.
- **Maintenance Tracking**: Log maintenance events, costs, and auto-update asset condition.
- **Reports**: Advanced filtering by Ward, Type, and Condition.
- **Modern UI**: Built with Tailwind CSS, Lucide icons, and Framer Motion for a premium feel.

## 🛠️ Technology Stack
- **Frontend**: React.js, Tailwind CSS, Chart.js, Axios.
- **Backend**: Node.js, Express.js, PostgreSQL (pg-pool).
- **Icons**: Lucide React.

## 📋 Prerequisites
- Node.js (v16+)
- PostgreSQL installed and running.

## ⚙️ Setup Instructions

### 1. Database Setup
1. Create a database named `smart_city_db` in PostgreSQL.
2. Run the SQL schema found in `backend/schema.sql`.
   ```bash
   psql -U postgres -d smart_city_db -f backend/schema.sql
   ```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a `.env` file based on `.env.example`:
   ```env
   PORT=5000
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_NAME=smart_city_db
   DB_HOST=localhost
   DB_PORT=5432
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. (Optional) Seed the database with 50 dummy records:
   ```bash
   node seed.js
   ```
5. Start the server:
   ```bash
   npm start
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

## 📂 Project Structure
- `backend/`: Express API, Controllers, Routes, Models, and Seed script.
- `frontend/`: React components, Pages, and Tailwind styles.

---
Built as part of the Smart City Management Project.
