```
# LIA Leadership Portal

### 🚀 A Tokenized, Role-Based Web Ecosystem for Student Governance, Event Governance, and Transparent Performance Evaluation.

---

## 📌 Project Overview
In educational institutions, evaluating student participation, club activities, and leadership traits can often be an opaque, manually driven process prone to inconsistencies. The **LIA Leadership Portal** was engineered to solve this specific bottleneck. 

Developed entirely from scratch as a collaborative full-stack solution, this platform serves as the central operational layer for our school's leadership department. It replaces fragmented workflows with a transparent, verifiable, and **token-based reward grading system** that ensures absolute accountability and metric visibility for both students and administrators.

---

## 🛠️ Core Technology Stack

The platform is architected using a modern decoupled client-server framework:

* **Frontend:** React.js (Vite compiler framework) for atomic rendering speeds.
* **Styling:** Tailwind CSS with utility-first responsive layout structures.
* **Backend:** Node.js runtime alongside the Express.js routing engine.
* **Database:** MongoDB (using Mongoose ODM) for dynamic document-based persistence pipelines.
* **Authentication:** Stateless JSON Web Tokens (JWT) mapped inside client interceptors.

---

## 🔑 Key Features & Access Matrix

### 👤 Student Dashboard Experience
* **Identity Management:** Secure custom profile access mapped to institutional records.
* **Metric Tracking:** Real-time visibility into overall grade progression, club participation tallies, and earned leadership point/token balances.
* **Decentralized Event Creation:** Students can independently conceptualize and submit custom event proposals.
* **Attendance Ledger:** Event hosts can dynamically register attendees, automatically distributing token values upon execution.

### 🛡️ Administrative Command Matrix
* **Gateway Security:** Strong multi-factor authentication locks out unauthorized endpoints.
* **Proposal Governance:** Central panel to review, modify, reject, or approve student-submitted event requests.
* **Academic Profile Management:** Full CRUD operations over student accounts, baseline profiles, and club registries.
* **Data Portability:** Native utility configurations to instantly filter and export critical student performance data to external sheets.
* **Global Notifications:** Markdown-supported announcements board instantly pushed to the main consumer landing pages.

---

## 🔄 System User Flow Mapping

### 1. The Event & Token Lifecycle

```

[ Student Creates Proposal ] ➔ [ Held in Admin Pending Matrix ]
│
(Admin Evaluates)
│
[ Visible on Public Ledger ] 🗲 ─── [ Approved ]
│
(Event Concludes & Attendance Taken)
│
[ Automated Token Distribution ] ➔ [ Student Grade Calculations Updated ]

```

### 2. Operational Authentication Flow
1. **Handshake:** User submits credentials via the client interface.
2. **Verification:** Backend decrypts payloads, matching them against MongoDB hash references, and signs a unique bearer token.
3. **Session Interception:** The React web client catches the response, persists the token string locally, and automatically appends it to subsequent request headers via Axios interceptors.

---

## 📡 API Routing Matrix (Architectural Blueprint)

### `🔑 /api/auth`
* `POST /api/auth/register` — Provision a new identity schema record.
* `POST /api/auth/login` — Validate credentials, return bearer token credentials.

### `🎯 /api/projects` (System Events & Initiatives)
* `GET /api/projects` — Fetch active, approved events displayed globally.
* `POST /api/projects` — Submit a dynamic event proposal (Student/Admin scope).
* `PUT /api/projects/:id` — Perform structural update queries on an item identifier.
* `DELETE /api/projects/:id` — Execute a total database purge of the target record.

### `✉️ /api/messages` & Announcements
* `GET /api/messages` — Read active announcements data.
* `POST /api/messages` — Append public broad-spectrum broadcast rows.

---

## 💻 Local Installation & Workspace Configuration

Follow these steps to configure a local development sandbox instance of the ecosystem.

### Prerequisites
* **Node.js** (v16.x or higher recommended)
* **MongoDB** (Local instance running or an active MongoDB Atlas cloud URI)
* **npm** or **yarn** package managers

### Step 1: Environment Provisioning
Create a `.env` file inside your server/backend directory root level and populate the following keys:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_high_entropy_cryptographic_signing_key
TARGET_EMAIL=admin_fallback_email@school.com
TARGET_PASSWORD=secure_admin_fallback_password

```

### Step 2: Establish Backend Services

```bash
# Clone the repository workspace
git clone [https://github.com/BecomingABetterDev/LIA_Leadership-System.git](https://github.com/BecomingABetterDev/LIA_Leadership-System.git)

# Navigate into the service container directory
cd LIA_Leadership-System/backend

# Install dependencies
npm install

# Boot up the server instance in development hot-reload mode
npm run dev

```

### Step 3: Establish Client Services

```bash
# Open a secondary shell terminal window and step into the frontend app
cd LIA_Leadership-System/frontend

# Install user interface engine packages
npm install

# Start the local Vite development compilation server
npm run dev

```

Open your browser to `http://localhost:3000` (or the local port specified by your console terminal output) to access the application workspace.

---

## 👥 Engineering & Collaboration Matrix

This platform was conceptualized, structured, and pushed to active production solely by our core engineering group. We designed and managed the entire frontend component strategy, secure authentication loops, and the backend database architecture patterns end-to-end.

* **Lead Developers:** Team-built by three student engineers dedicated to modern software architecture transparency.

```

```
