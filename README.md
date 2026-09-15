# Subscrr

### Smart Subscription Management Platform

Subscrr is a full-stack subscription management platform that helps users track recurring subscriptions, monitor spending, manage renewal reminders, and understand their subscription habits through analytics and AI-powered features.

The project extends a modern frontend experience into a functional full-stack product with authentication, persistent database storage, REST-style APIs, AI integration, subscription analytics, reminders, and Razorpay test payments.

---

## 🔗 Project Links

| Resource | Link |
|---|---|
| 🌐 Live Demo | `https://subscrrproassignment.vercel.app/` |
| 💻 GitHub Repository | `https://github.com/anuragpandey-01/subscrr.pro_assignment` |

> Replace the placeholders above with the final Vercel deployment URL and GitHub repository URL before submission.

---

# 📌 Overview

Managing multiple digital subscriptions can become difficult when payments are spread across different services.

Subscrr provides a centralized dashboard where users can:

- Track subscriptions
- Monitor recurring expenses
- View upcoming payments
- Analyze spending by category
- Manage renewal reminders
- Scan receipts using AI
- Ask questions through an AI Assistant
- Upgrade to Pro using Razorpay

The application is designed with a focus on usability, security, responsiveness, and production-oriented architecture.

---

# ✨ Features

## 🔐 Authentication

- User registration
- User login
- Secure password hashing
- JWT-based authentication
- HTTP-only authentication cookie
- Protected API routes
- Session validation
- Logout functionality
- User-specific data access

Passwords are never stored in plain text.

---

## 📋 Subscription Management

Users can manage their subscriptions from the dashboard.

### Supported operations

- Add subscription
- View subscriptions
- Edit subscription
- Delete subscription
- Search subscriptions
- Filter subscriptions
- Sort subscriptions
- Assign categories
- Track billing cycle
- Track next billing date
- Track subscription status
- Configure renewal reminders

All subscription data is persisted in MongoDB.

---

## 📊 Dashboard

The dashboard provides a centralized overview of the user's subscription activity.

### Dashboard includes

- Total subscription spending
- Subscription count
- Upcoming payments
- Category breakdown
- Subscription Health
- Subscription list
- Search and filtering
- Reminder information
- Daily spending information

The dashboard also includes smooth UI transitions and lightweight animations.

---

## ❤️ Subscription Health

Subscrr analyzes subscription activity and spending patterns to provide a simple health score.

The analysis considers factors such as:

- Total subscription spending
- Number of subscriptions
- Paused subscriptions
- Category distribution
- Spending concentration

### Health statuses

- **Healthy**
- **Watch**
- **Review**

The feature also provides insights and recommendations based on the user's subscription data.

---

# 🤖 AI Features

## 📸 AI Snap

AI Snap allows users to upload a subscription receipt or billing screenshot.

The AI extracts information such as:

- Subscription name
- Price
- Currency
- Billing cycle
- Next billing date
- Category

The extracted information is validated before being returned to the application.

### Supported image formats

- JPEG
- PNG
- WebP
- HEIC
- HEIF

### Reliability

The AI Snap API includes retry handling for temporary Gemini API failures, including:

- `429`
- `500`
- `502`
- `503`
- `504`
- `UNAVAILABLE`
- `RESOURCE_EXHAUSTED`

If the AI provider remains unavailable, the application returns a user-friendly temporary failure response.

Uploaded receipt images are processed for extraction and are not permanently stored by the application.

---

## 💬 AI Assistant

Subscrr includes an AI-powered assistant designed specifically around the application's subscription-management features.

The assistant can help with:

- Upcoming subscriptions
- Subscription costs
- Spending
- Categories
- Savings
- Subscription details
- Plans
- Dashboard features
- Subscription management
- Reminder functionality
- Application help

### Interaction modes

The assistant supports:

- Text input
- Voice input
- Spoken AI responses for voice interactions

Typed questions remain text-only.

### UI functionality

- Scrollable conversation
- Automatic scrolling to latest messages
- Loading/thinking state
- Voice interaction feedback
- Speech controls
- Smooth message animations

---

# 💳 Payment Integration

Subscrr integrates Razorpay for the Pro upgrade flow.

The payment system uses server-side verification to ensure that a successful payment is validated before upgrading the user's account.

### Payment flow

```text
User selects Pro
        │
        ▼
Create Razorpay Order
        │
        ▼
Razorpay Checkout
        │
        ▼
Payment Completed
        │
        ▼
Frontend receives payment details
        │
        ▼
Backend verifies Razorpay signature
        │
        ▼
Payment marked as paid
        │
        ▼
User upgraded to Pro

Razorpay is configured in test mode for the assignment/demo environment.

No real financial transaction is required.

------

🛠️Technology Stack

Frontend
Next.js 16
React 19
TypeScript
Tailwind CSS
GSAP
Lenis
Next.js App Router
Backend
Next.js API Routes
Node.js
MongoDB
Mongoose
Zod
bcryptjs
jose
AI
Google Gemini API
@google/genai
Payments
Razorpay
Deployment
Vercel
MongoDB Atlas

======

🏗️ Architecture
                         ┌──────────────────┐
                         │      User        │
                         └────────┬─────────┘
                                  │
                                  ▼
                     ┌────────────────────────┐
                     │    Next.js Frontend    │
                     │ React + Tailwind CSS    │
                     └────────────┬───────────┘
                                  │
                              API Requests
                                  │
                                  ▼
                     ┌────────────────────────┐
                     │     Next.js API        │
                     │                        │
                     │ Authentication         │
                     │ Validation             │
                     │ Business Logic         │
                     └───────┬─────────┬──────┘
                             │         │
                ┌────────────┘         └─────────────┐
                ▼                                    ▼
       ┌──────────────────┐                 ┌──────────────────┐
       │     MongoDB      │                 │ External Services│
       │                  │                 │                  │
       │ Users            │                 │ Gemini AI        │
       │ Subscriptions    │                 │ Razorpay         │
       │ Payments         │                 │                  │
       └──────────────────┘                 └──────────────────┘

======

📁 Project Structure
subscrr/
│
├── app/
│   ├── api/
│   │   ├── ai-snap/
│   │   ├── analytics/
│   │   ├── assistant/
│   │   ├── auth/
│   │   ├── payments/
│   │   └── subscriptions/
│   │
│   ├── dashboard/
│   ├── login/
│   ├── register/
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── dashboard/
│   ├── AI.tsx
│   ├── Assistant.tsx
│   ├── Hero.tsx
│   ├── Nav.tsx
│   ├── Privacy.tsx
│   ├── Pricing.tsx
│   └── ...
│
├── lib/
│   ├── auth.ts
│   ├── db.ts
│   ├── validation.ts
│   └── ...
│
├── models/
│   ├── User.ts
│   ├── Subscription.ts
│   └── Payment.ts
│
├── public/
│   └── assets/
│
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md

======

🔌 API Documentation

Authentication API
Method	Endpoint	Description
POST	/api/auth/register	Register a new user
POST	/api/auth/login	Authenticate a user
POST	/api/auth/logout	Logout
GET	/api/auth/me	Get authenticated user
Subscription API
Method	Endpoint	Description
GET	/api/subscriptions	Get user's subscriptions
POST	/api/subscriptions	Create subscription
GET	/api/subscriptions/:id	Get subscription
PUT	/api/subscriptions/:id	Update subscription
DELETE	/api/subscriptions/:id	Delete subscription

All subscription endpoints are authenticated and user-scoped.

Analytics API
Method	Endpoint	Description
GET	/api/analytics	Retrieve spending and subscription analytics
AI Snap API
Method	Endpoint	Description
POST	/api/ai-snap	Extract subscription information from an uploaded receipt
AI Assistant API
Method	Endpoint	Description
POST	/api/assistant	Process an assistant question
Payment API
Method	Endpoint	Description
POST	/api/payments/create-order	Create Razorpay Pro order
POST	/api/payments/verify	Verify Razorpay payment

======

🗄️ Database Models

User
User
├── name
├── email
├── passwordHash
├── plan
├── createdAt
└── updatedAt

======

Possible plans:

free
pro
Subscription
Subscription
├── userId
├── name
├── price
├── currency
├── billingCycle
├── nextBillingDate
├── category
├── icon
├── color
├── reminderEnabled
├── reminderDaysBefore
├── status
├── createdAt
└── updatedAt
Payment
Payment
├── userId
├── razorpayOrderId
├── razorpayPaymentId
├── amount
├── currency
├── status
├── plan
├── createdAt
└── updatedAt


======


Payment statuses:

created
paid
failed
✅ Validation & Error Handling

Subscrr uses Zod for server-side input validation.

Validation covers:

User registration
Login credentials
Subscription names
Prices
Currency
Billing cycle
Billing date
Categories
Reminder settings
Subscription status

The API also handles:

Invalid requests
Authentication failures
Unauthorized access
Invalid MongoDB IDs
Database errors
AI provider failures
Payment verification failures
Missing environment variables

The frontend provides appropriate:

Loading states
Error states
Empty states
User feedback
🔒 Security

Security was considered throughout the application.

Implemented measures include:

Password hashing using bcrypt
JWT authentication
HTTP-only authentication cookie
Protected API routes
User-scoped database queries
Server-side authentication checks
Zod input validation
Razorpay signature verification
Server-side payment processing
Environment variables for secrets
.env.local excluded from Git
Server-only API credentials

Sensitive credentials are never intended to be committed to the repository.

======

🎨 UI/UX

The application maintains a clean editorial-inspired visual style with:

Responsive layouts
Rounded UI components
Clear typography
Smooth transitions
Hover interactions
Dashboard animations
AI interaction animations
Voice interaction feedback
Loading indicators
Empty states
Error states

The interface is designed to work across:

Desktop
Laptop
Tablet
Mobile browsers

Reduced-motion support is also included for users who prefer minimal animation.

======

⚡ Performance & Reliability

The application includes several reliability-focused improvements.

Database
Cached MongoDB connections
Database indexes
User-scoped queries
API
Server-side validation
Authentication checks
Structured error handling
Input validation
AI
Retry handling for temporary Gemini failures
Friendly temporary failure responses
No permanent receipt-image storage
Frontend
Lightweight animations
Responsive layouts
Loading states
Empty states
Optimized interactions

======

🚀 Local Development

Prerequisites

Make sure the following are installed:

Node.js
npm
Git
MongoDB or MongoDB Atlas
1. Clone the Repository
git clone <YOUR_GITHUB_REPOSITORY_URL>

Navigate into the project:

cd subscrr

2. Install Dependencies
npm install

3. Configure Environment Variables

Create a file named:

.env.local

Add:

MONGODB_URI=

JWT_SECRET=

GEMINI_API_KEY=

RAZORPAY_KEY_ID=

RAZORPAY_KEY_SECRET=

RAZORPAY_PRO_PRICE=

Use .env.example as the reference.

Never commit .env.local to GitHub.

4. Configure MongoDB

Set your MongoDB connection string:

MONGODB_URI=<your-mongodb-connection-string>

The application connects to MongoDB through Mongoose.

5. Run the Development Server
npm run dev

Open:

http://localhost:3000

======

🏭 Production Build

Before deployment, verify the production build locally:

npm run build

Then:

npm start

This helps identify production-specific build or runtime issues before deployment.

======

☁️ Deployment

Subscrr is designed to be deployed using Vercel with MongoDB Atlas as the production database.

Deploying to Vercel
Step 1 — Push to GitHub

Make sure the latest code is committed:

git add .
git commit -m "Prepare Subscrr for production"
git push
Step 2 — Create a Vercel Project
Open Vercel.
Create a new project.
Import the Subscrr GitHub repository.
Select the correct project root.
Vercel should automatically detect Next.js.
Configure the required environment variables.
Deploy the application.
Environment Variables on Vercel

Go to:

Vercel
→ Project
→ Settings
→ Environment Variables

Add:

MONGODB_URI=
JWT_SECRET=
GEMINI_API_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_PRO_PRICE=

Configure them for the required deployment environments:

Development
Preview
Production

Never place actual secret values inside this README.

======

🗃️ MongoDB Atlas Production Setup

For the production deployment, use MongoDB Atlas or another accessible MongoDB deployment.

Set:

MONGODB_URI=<production-mongodb-connection-string>

Make sure the database accepts connections from the deployed application.

🤖 Gemini Production Setup

AI Snap and the AI Assistant require:

GEMINI_API_KEY=<your-gemini-api-key>

The key is used server-side.

Do not expose it through a NEXT_PUBLIC_* environment variable.

======

💳 Razorpay Production Setup

The Pro upgrade flow requires:

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_PRO_PRICE=

For the assignment deployment, Razorpay should remain configured for test mode.

The Razorpay secret key must remain server-side.

======

🧪 Production Verification Checklist

After deploying to Vercel, verify the complete application.

Authentication

 Registration works
 Login works
 Logout works
 Protected routes work
 Session persists correctly

Dashboard

 Dashboard loads
 Subscription data loads
 Analytics work
 Subscription Health works
 Upcoming payments work

Subscription Management

 Add subscription
 Edit subscription
 Delete subscription
 Search subscriptions
 Filter subscriptions
 Data persists after refresh

AI

 AI Snap works
 Receipt extraction works
 AI Assistant works
 Voice input works
 Voice responses work

Pro

 Razorpay checkout opens
 Test payment works
 Payment verification works
 User upgrades to Pro
 Pro feature gating works

Production

 MongoDB connection works
 No secrets are exposed
 Responsive UI works
 No critical Vercel errors
 Production build succeeds

 ======

🧠 Technical Decisions

Next.js

Next.js was retained because the original project was built using the Next.js App Router.

Using Next.js for both the frontend and backend API layer keeps the application architecture relatively simple while allowing server-side functionality to live alongside the UI.

MongoDB + Mongoose

MongoDB was selected as the persistent database because subscription records are naturally represented as documents.

Mongoose provides:

Schema definitions
Validation
Models
Indexing
Database abstraction
Zod

Zod provides structured validation for API requests.

This prevents invalid or malformed input from reaching the application's business logic and database layer.

JWT Authentication

JWT authentication provides a lightweight authentication mechanism for the application.

The authentication token is stored using an HTTP-only cookie to reduce exposure to client-side JavaScript.

Gemini

Gemini is used for AI functionality including:

Receipt information extraction
AI Assistant responses

The Gemini API is accessed through server-side routes.

Razorpay

Razorpay was selected for the Pro upgrade flow because it provides a realistic payment integration while supporting test-mode development.

The implementation demonstrates:

Order creation
Checkout
Payment verification
Plan upgrade

======


⚖️ Product Decisions & Trade-offs
Core Features Remain Free

The application keeps the primary subscription-management experience accessible without requiring a paid plan.

This includes:

Subscription tracking
Dashboard
Analytics
Subscription Health
AI Snap
AI Assistant
Pro Focuses on Advanced Reminders

Instead of locking basic functionality behind a paywall, the Pro plan focuses on advanced reminder capabilities.

This keeps the product useful for free users while providing a clear upgrade reason.

No Custom Themes

Custom theme functionality was intentionally excluded from the current product scope to keep the experience focused on subscription management.

AI as a Supporting Feature

AI is used to reduce manual effort and improve the subscription-management experience rather than replacing the core application functionality.

⚠️ Known Limitations

The current implementation has the following limitations:

Razorpay is configured for test payments.
AI functionality depends on Gemini API availability.
Gemini rate limits can temporarily affect AI features.
The application does not process real financial transactions.
The iOS and Apple Watch experiences shown in the marketing UI are product demonstrations rather than native applications.
Advanced automation and notification infrastructure can be expanded in future versions.
The application currently focuses on subscription management rather than complete banking/account aggregation.

======

🤖 AI-Assisted Development

AI tools were used during development for:

Debugging
Code review
API development
Validation logic
UI refinement
Error handling
AI integration
Architecture discussions
Documentation

AI-generated suggestions were reviewed, adapted, and tested against the application's actual requirements.

No production secrets or private credentials were intentionally included in AI prompts or committed to the repository.

======

📋 Assignment Alignment

Requirement	Implementation
Full-stack application	Next.js + API routes + MongoDB
Backend integration	Functional API endpoints
Persistent storage	MongoDB + Mongoose
Authentication	JWT + HTTP-only cookie
Validation	Zod
Error handling	API and UI error states
Loading states	Implemented
Empty states	Implemented
Meaningful functionality	Subscriptions, analytics, AI, reminders, payments
Responsive UI	Desktop, tablet and mobile
AI integration	Gemini AI Snap + Assistant
Payment integration	Razorpay test mode
Production deployment	Vercel
Documentation	README

======


🔑 Demo Credentials

For evaluation, a dedicated demo account can be provided.

Email: <DEMO_EMAIL>
Password: <DEMO_PASSWORD>
Plan: Free / Pro

Use a dedicated test account rather than personal credentials.

======

🌱 Future Improvements

Potential future improvements include:

Native iOS application
Apple Watch companion application
Automated email reminders
Push notifications
More advanced spending analytics
Subscription cancellation recommendations
Bank/account aggregation
Multi-currency analytics
Advanced AI financial insights
Subscription price-change detection
More advanced recurring-payment automation

These features are outside the current assignment scope.

======

📦 Submission Checklist

Before submitting the project:

git status

Make sure no sensitive files are included.

Then:

git add .
git commit -m "Finalize Subscrr production-ready application"
git push

Verify that the repository contains:

README.md
.env.example
.gitignore
package.json
app/
components/
lib/
models/
public/

The repository should not contain:

.env.local
API keys
Database credentials
Razorpay secret keys
Private credentials
📎 Final Submission
GitHub Repository
<YOUR_GITHUB_REPOSITORY_URL>
Live Vercel Application
<YOUR_VERCEL_URL>
Project

Subscrr — Smart Subscription Management Platform

A full-stack subscription management platform combining persistent data storage, authentication, analytics, AI-powered tools, renewal reminders, and Razorpay test payments in a modern responsive web application.

======

📄 License

This project was developed as a technical assignment and portfolio project.