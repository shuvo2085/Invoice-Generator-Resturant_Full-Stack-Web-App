# 🥗 HealthyChef Invoice Generator

A full-stack MERN invoicing application built for the HealthyChef assessment.

## Tech Stack
- **Frontend**: React.js (Create React App)
- **Backend**: Node.js + Express.js
- **Database**: MongoDB (local or Atlas)
- **PDF**: PDFKit

---

## 📋 Prerequisites

Make sure you have installed:
- [Node.js](https://nodejs.org/) (v16 or above)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) (local) OR a [MongoDB Atlas](https://www.mongodb.com/atlas) connection string
- npm (comes with Node.js)

---

## 🚀 How to Run

### Step 1 — Clone / Extract the project

```
invoice-app/
├── backend/
└── frontend/
```

### Step 2 — Set up the Backend

```bash
cd backend
npm install
```

Create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env`:
```
MONGODB_URI=mongodb://localhost:27017/invoiceapp
PORT=5000
```

> If using MongoDB Atlas, replace the URI with your Atlas connection string.

Start the backend:
```bash
npm run dev     # development (with auto-reload via nodemon)
# OR
npm start       # production
```

You should see:
```
✅ MongoDB connected
🚀 Server running on port 5000
```

### Step 3 — Set up the Frontend

Open a **new terminal**:

```bash
cd frontend
npm install
npm start
```

The app will open at **http://localhost:3000**

> The frontend proxies API calls to `http://localhost:5000` automatically.

---

## 🧭 App Features

| Module | Description |
|--------|-------------|
| **Dashboard** | Overview stats + recent invoices |
| **Items & Products** | Add / Edit / Delete inventory items with variants |
| **New Invoice** | Select items, add quantities, set GST & discounts, live calculation |
| **All Invoices** | List view with PDF download and delete |
| **Invoice Detail** | Full view of a saved invoice |
| **PDF Download** | Branded HealthyChef PDF with all details, line items, and T&C |

---

## 🗂️ Project Structure

```
backend/
├── controllers/
│   ├── itemController.js       # CRUD for items
│   └── invoiceController.js    # CRUD + PDF generation
├── models/
│   ├── Item.js                 # Item schema
│   └── Invoice.js              # Invoice schema
├── routes/
│   ├── items.js
│   └── invoices.js
├── server.js                   # Express app entry point
└── .env.example

frontend/
├── public/
│   └── index.html
└── src/
    ├── components/
    │   └── Sidebar.js
    ├── pages/
    │   ├── Dashboard.js
    │   ├── Items.js
    │   ├── NewInvoice.js
    │   ├── InvoiceList.js
    │   └── InvoiceView.js
    ├── utils/
    │   ├── api.js              # Axios API calls
    │   └── calc.js             # Invoice math logic
    ├── App.js
    ├── index.js
    └── index.css
```

---

## 🧮 Invoice Calculation Logic

```
Row Total = (basePrice × qty) − discount + GST on discounted amount

Discount:
  - Percent: gross × (discountValue / 100)
  - Absolute: fixed ₹ amount

GST:
  - Applied on (gross − discount)

Grand Total = Subtotal − Total Discount + Total GST
```

---

## 📺 Video Demo Tips
1. Start MongoDB and both servers
2. Add 2-3 items in Items & Products
3. Create a new invoice with multiple items, different GST rates and discounts
4. Show live row total updates as you change values
5. Save invoice → View detail → Download PDF
6. Show PDF in browser/preview
7. Briefly scroll through the main source files (controllers, models, pages)
