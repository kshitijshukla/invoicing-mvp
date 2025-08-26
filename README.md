# Invoicing SaaS MVP — Full‑Stack (React + Node + MongoDB)

Professional invoicing web app with **subscription billing**, **GST invoices**, **WhatsApp sharing**, **branding (logo + color)**, and **S3 PDF storage**.

---

## ✨ Features
- OTP-style Login (mocked in MVP; swappable to Firebase Phone Auth)
- One‑time business setup: Business Name, GST, Address, Email
- **Subscription** checkout (Razorpay) + 30‑day access lock
- **Automatic subscription invoices** (GST) as PDFs
- **Sales invoices** with items, GST auto‑calc → PDF
- **WhatsApp share** (Twilio WhatsApp API)
- **Branding:** logo upload to S3 + brand color on invoice header
- **S3 storage** for PDFs (public HTTPS links)
- **Dashboard:** invoice & subscription history

---

## 🧱 Tech Stack
- **Frontend:** React (Vite) + TailwindCSS, Axios, React Router
- **Backend:** Node.js + Express, JWT, Mongoose (MongoDB)
- **Payments:** Razorpay Orders API (test keys)
- **PDFs:** pdfkit
- **File Storage:** AWS S3 (public-read ACL in MVP)
- **Messaging:** Twilio WhatsApp (Sandbox in MVP)

---

## 📂 Monorepo Structure
```
/backend
  /config      # db, s3, multerS3
  /controllers # auth, user, subscription, invoice
  /models      # User, Subscription, Invoice
  /routes      # authRoutes, userRoutes, subscriptionRoutes, invoiceRoutes
  /utils       # uploadToS3, pdfBranding
  server.js
/frontend
  /src
    /components  # Navbar, ProtectedRoute
    /pages       # Login, Dashboard, InvoiceForm, Subscriptions, Settings
    /utils       # api.js
    App.jsx, main.jsx
README.md
```
> Ensure a local folder `/backend/invoices` exists (temporary PDF writes before S3 upload).

---

## ✅ Prerequisites
- Node.js **18+** and npm
- MongoDB Atlas URI (or local MongoDB)
- AWS account with S3 bucket
- Razorpay Test Keys (for sandbox payments)
- Twilio account (WhatsApp Sandbox) — optional but recommended for share
- (Optional) Firebase project for real phone OTP auth

---

## 🚀 Quick Start (TL;DR)
```bash
# 1) Clone or copy the code into a folder with /backend and /frontend
# 2) Backend setup
cd backend
cp ../backend.env.example .env
npm install
mkdir -p invoices
npm run dev        # if you add nodemon, see below; otherwise: node server.js

# 3) Frontend setup
cd ../frontend
cp ../frontend.env.example .env
npm install
npm run dev
```
- Open **http://localhost:5173** (Vite default) and ensure **backend is on http://localhost:5000** (or update `VITE_API_BASE_URL`).

---

## 🔧 Backend Setup

### 1) Environment (.env)
Copy from `backend.env.example` and fill in values:
```
# Server
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/invoicing
JWT_SECRET=change_this_in_production

# Razorpay (sandbox)
RAZORPAY_KEY=rzp_test_xxxxxxxxxxxx
RAZORPAY_SECRET=xxxxxxxxxxxxxxxxxxxx

# AWS S3
AWS_ACCESS_KEY=AKIA...
AWS_SECRET_KEY=...
AWS_REGION=ap-south-1
AWS_BUCKET_NAME=your-s3-bucket-name

# Twilio WhatsApp (optional for sharing)
TWILIO_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH=xxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886  # Twilio sandbox sender

# Firebase (optional - if you wire real OTP)
FIREBASE_CONFIG_JSON=   # paste a single-line JSON or leave blank for MVP
```

### 2) Install Dependencies
```bash
cd backend
npm install express mongoose dotenv cors jsonwebtoken pdfkit multer multer-s3 axios razorpay aws-sdk twilio
# (optional, but handy for development)
npm install --save-dev nodemon
```
Add a dev script in `package.json` (backend):
```json
{ "scripts": { "start": "node server.js", "dev": "nodemon server.js" } }
```

### 3) Folders
```bash
mkdir -p invoices
```

### 4) Run
```bash
npm run dev   # or: npm start
```

---

## 🎨 Branding & Logo
- **Settings page** (frontend) lets you upload a **PNG/JPG/WebP** logo → stored on **S3**.
- Set **Brand Color** (hex). Invoices render a **top brand bar** + logo + business details.
- If logo fetch fails, the PDF gracefully renders text only.

---

## 💳 Razorpay (Sandbox) Setup
1. Create a Razorpay account → get **Test Key ID** and **Key Secret**.
2. Put them in backend `.env`.
3. The MVP uses a simplified **order → verify** flow; **signature verification is NOT enforced** here to keep MVP simple.
   - **Production TODO:** validate `razorpay_signature` server-side OR via **Webhooks**.
4. Subscription duration is fixed to **30 days** from payment verification in MVP.

---

## 💬 WhatsApp via Twilio (Sandbox)
1. In Twilio Console, enable **WhatsApp Sandbox** and note the `from` number.
2. Add to `.env` as `TWILIO_WHATSAPP_FROM`.
3. On first use, you must **join the sandbox** from your phone by sending the given **join code** to the sandbox number.
4. Frontend “WhatsApp” button prompts for a number. The backend sends a message with the **PDF link**.

> For production, apply for **WhatsApp Business API** and use a verified sender.

---

## ☁️ AWS S3
- Create a bucket (e.g., `my-invoicing-files`) in **ap-south-1** (or your region).
- Ensure the bucket allows **object read** for files you upload (MVP uses `ACL: public-read`).
- Put keys/region/bucket in `.env`.
- PDFs are uploaded to:
  - `invoices/invoice_<id>.pdf`
  - `subscriptions/sub_<id>.pdf`

> For stricter security, remove `public-read` and return **pre-signed URLs** instead.

---

## 🖥 Frontend Setup

### 1) Environment (.env)
Copy from `frontend.env.example`:
```
VITE_API_BASE_URL=http://localhost:5000/api
```
> Change to your deployed backend URL on Render/EC2 later.

### 2) Install & Run
```bash
cd frontend
npm install
npm run dev
```
- Visit the Vite dev server URL printed in the terminal.

---

## 🧭 How to Use (MVP Flow)
1. **Login** with Phone + GST number (mocked – no actual OTP in MVP).
2. Go to **Settings** → fill **Business Name, GST, Address, Email** → **upload logo** → choose **Brand Color** → Save.
3. Open **Subscriptions** → **Buy Subscription** (test order) → backend marks **30 days active** + generates **Subscription Invoice PDF** → stored on **S3**.
4. Go to **Create Invoice** → add items (Qty, Price, GST%) → Submit → **Sales Invoice PDF** on **S3**.
5. From **Dashboard**, download PDFs or **share via WhatsApp**.

---

## 🔗 API Endpoints (MVP)
- `POST /api/auth/login` → `{ phone, gstNumber }` → `{ token, user }` (mock OTP)
- `GET  /api/user/profile` → returns user (requires auth if you add middleware)
- `PUT  /api/user/profile` → update business + branding
- `POST /api/user/logo` (multipart `logo`) → uploads to S3 and saves `logoUrl`

- `POST /api/subscription/create` → creates Razorpay order
- `POST /api/subscription/verify` → (MVP) marks success + generates **subscription invoice PDF**
- `GET  /api/subscription/list?userId=...` → list past subscriptions

- `POST /api/invoices/create` → generates sales invoice + **PDF**
- `GET  /api/invoices/list?userId=...` → invoices for dashboard
- `POST /api/invoices/share` → send PDF link via WhatsApp (Twilio)

> Add JWT middleware to secure routes for production.

---

## 🚢 Deploy (Suggested)
**Backend (Render)**
- New Web Service → Node 18+
- Build: `npm install`
- Start: `npm start`
- Add **Environment Variables** from `.env`
- Set **Disk** not required (PDFs go to S3)

**Frontend (Vercel/Netlify)**
- Build Command: `npm run build`
- Output: `dist`
- Env: `VITE_API_BASE_URL=https://your-backend.onrender.com/api`

---

## 🛡️ Production Hardening (TODOs)
- ✅ Verify **Razorpay signature** (or use **Webhooks**)
- ✅ Replace mock login with **Firebase Phone Auth** (verify ID token server-side)
- ✅ Add **JWT middleware**, **rate limiting**, **CORS allow-list**
- ✅ Switch S3 to **private** + serve **pre-signed URLs**
- ✅ Validation with **Joi/Zod**, server-side invoice schema
- ✅ Logging/monitoring (Winston + CloudWatch)
- ✅ Database indexes & pagination for large histories

---

## 🧰 Troubleshooting
- **CORS error:** Ensure frontend `VITE_API_BASE_URL` matches backend URL; set `app.use(cors())` appropriately.
- **Mongo network error:** Whitelist your IP in MongoDB Atlas. Check `MONGO_URI`.
- **S3 403:** Wrong keys, region, or bucket policy. Try re-uploading with correct `AWS_REGION`.
- **Twilio not sending:** Join sandbox from your phone first; verify `TWILIO_SID/AUTH` and `TWILIO_WHATSAPP_FROM`.
- **PDF not downloading:** Check server logs; ensure `/backend/invoices` exists; confirm S3 upload succeeded.
- **Razorpay order ok but verify fails:** In MVP we “trust” the call; for real checkout integrate signature validation.

---

## 📜 License
This MVP is provided as-is for internal evaluation. Add your preferred license before distribution.
