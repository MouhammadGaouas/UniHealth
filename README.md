# 🏥 UniHealth

**UniHealth** is a comprehensive, modern healthcare appointment management system designed for university health services. It connects students (patients) with university doctors, facilitating easy appointment booking, real-time availability management, and efficient administrative oversight.

---

## 🏗️ System Architecture

UniHealth is built as a full-stack Next.js application, leveraging the App Router for seamless server-side rendering and API handling.

```mermaid
graph TD
    Client[Client Browser]
    subgraph "UniHealth Application (Next.js)"
        UI[React Components / Pages]
        API[API Routes / Server Actions]
        Auth[Auth Middleware (JWT)]
    end
    DB[(PostgreSQL Database)]

    Client -->|HTTPS Interactions| UI
    UI -->|Data Fetching| API
    API -->|ORM Queries| DB
    Client -->|Auth Request| Auth
    Auth -->|Validation| API
```

---

## 🗄️ Database Schema

The system uses a relational database model managed by Prisma ORM.

```mermaid
erDiagram
    User ||--o{ Appointment : "books as patient"
    User ||--o| Doctor : "has profile"
    Doctor ||--o{ Appointment : "manages"
    Doctor ||--o{ AppointmentType : "offers"
    AppointmentType ||--o{ Appointment : "defines"
    
    User {
        string id PK
        string email UK
        string password
        string name
        enum role "PATIENT | DOCTOR | ADMIN"
        datetime createdAt
        datetime updatedAt
    }
    
    Doctor {
        string id PK
        string userId FK
        string specialty
        string bio
        boolean available
        string startTime
        string endTime
    }
    
    AppointmentType {
        string id PK
        string name
        int duration "minutes"
        float price
        string doctorId FK
    }
    
    Appointment {
        string id PK
        datetime dateTime
        datetime endTime
        enum status "PENDING | CONFIRMED | CANCELLED | COMPLETED"
        string reason
        string notes
        string patientId FK
        string doctorId FK
        string appointmentTypeId FK
        datetime createdAt
        datetime updatedAt
    }
```

---

## 🚀 User Flows

### 👨‍🎓 Patient Flow
1.  **Registration**: Sign up with email and password at `/auth/register`.
2.  **Login**: Authenticate at `/auth/login`.
3.  **Dashboard**: View upcoming appointments and history at `/dashboard`.
4.  **Book Appointment** (Multi-step wizard at `/book`):
    *   **Step 1**: Browse and select service categories.
    *   **Step 2**: Select a Doctor based on specialty and availability.
    *   **Step 3**: Choose from real-time available time slots.
    *   **Step 4**: Review and confirm booking details.
5.  **Manage Appointments**: View, cancel, or reschedule from the dashboard.

### 👩‍⚕️ Doctor Flow
1.  **Login**: Access the dedicated Doctor Dashboard at `/dashboard/doctor`.
2.  **View Appointments**: See all incoming and confirmed appointments.
3.  **Availability Management**: 
    *   Set daily working hours (Start Time - End Time).
    *   Toggle availability status (available/unavailable).
4.  **Appointment Actions**: Confirm, complete, or cancel appointments.

### 🛡️ Admin Flow
1.  **Login**: Access admin panel at `/dashboard/admin`.
2.  **System Oversight**: View all users, doctors, and appointments.
3.  **User Management**: 
    *   View all registered users.
    *   Promote users to Doctor role.
    *   Manage doctor profiles.
4.  **Analytics**: Monitor system usage and appointment statistics.

---

## 🎭 Implemented Use Cases by Actor

### 👨‍🎓 Patient
*   **Register**: Create a new account (`/auth/register`).
*   **Login**: Access the system securely (`/auth/login`).
*   **View Dashboard**: See upcoming appointments and history (`/dashboard`).
*   **Track Appointments**: Monitor the status of booked appointments (Pending, Confirmed, Cancelled).
*   **Book Appointment** (`/book`):
    *   **Select Doctor**: Choose a doctor from the list.
    *   **Select Appointment Type**: Choose the type of consultation.
    *   **Select Date & Time**: Pick a slot from real-time availability.
    *   **Confirm Booking**: Review and finalize the appointment.
*   **Cancel Appointment**: Cancel an existing appointment from the dashboard.

### 👩‍⚕️ Doctor
*   **Login**: Access the doctor-specific dashboard (`/auth/login`).
*   **View Dashboard**: Overview of schedule and stats (`/dashboard/doctor`).
*   **View Appointments**: List of all assigned appointments with patient details.
*   **Manage Availability**: Set working hours (Start Time, End Time) and toggle availability status (`/dashboard/doctor` -> Settings).
*   **Appointment Actions**:
    *   **Confirm**: Accept a pending appointment.
    *   **Cancel**: Decline or cancel an appointment.
    *   **Complete**: Mark an appointment as finished.

### 🛡️ Admin
*   **Login**: Access the admin panel (`/auth/login`).
*   **View Dashboard**: System-wide statistics and management (`/dashboard/admin`).
*   **Manage Users**:
    *   **View All Users**: List and filter all registered users.
    *   **Search Users**: Find users by name or email.
    *   **Filter by Role**: specific views for Patients, Doctors, Admin.
    *   **Promote to Doctor**: Upgrade a user account to a Doctor role with a specialty.
*   **Manage Doctors**: View all registered doctors and their availability status.
*   **System Stats**: View total counts for users, doctors, and appointment statuses.

---

## 🛠️ Tech Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | **Next.js 16** (App Router) | Full-stack React framework with SSR |
| **Language** | **TypeScript** | Type-safe development |
| **Database** | **PostgreSQL** | Relational data storage |
| **ORM** | **Prisma** | Type-safe database client & migrations |
| **Styling** | **Tailwind CSS 4** | Utility-first CSS framework |
| **Auth** | **Custom JWT** (jose + bcrypt) | Secure stateless authentication |
| **Icons** | **React Icons** | UI iconography |
| **Date Handling** | **date-fns** | Date manipulation utilities |

---

## 📂 Project Structure

```
UniHealth/
├── app/                          # Next.js App Router (pages & API)
│   ├── api/                      # Backend API routes
│   │   ├── admin/               # Admin-only endpoints
│   │   │   ├── doctors/         # Doctor management
│   │   │   └── users/           # User management
│   │   ├── appointments/        # Appointment CRUD operations
│   │   │   ├── route.ts         # Create & list appointments
│   │   │   ├── my/              # User's appointments
│   │   │   ├── doctor/          # Doctor's appointments
│   │   │   └── [id]/            # Update/delete specific appointment
│   │   ├── auth/                # Authentication endpoints
│   │   │   ├── login/           # User login
│   │   │   ├── register/        # User registration
│   │   │   └── logout/          # User logout
│   │   └── doctors/             # Doctor-related endpoints
│   │       ├── route.ts         # List all doctors
│   │       ├── [id]/            # Get specific doctor
│   │       └── availability/    # Update doctor availability
│   ├── auth/                    # Authentication pages
│   │   ├── login/               # Login page
│   │   └── register/            # Registration page
│   ├── book/                    # Multi-step booking wizard
│   │   └── page.tsx             # Booking flow component
│   ├── dashboard/               # Role-based dashboards
│   │   ├── page.tsx             # Patient dashboard
│   │   ├── admin/               # Admin dashboard
│   │   └── doctor/              # Doctor dashboard
│   ├── layout.tsx               # Root layout with navigation
│   ├── page.tsx                 # Homepage
│   └── globals.css              # Global styles
├── components/                   # Reusable React components
│   ├── BookingSteps/            # Booking wizard components
│   ├── DashboardCards/          # Dashboard UI elements
│   ├── Forms/                   # Form components
│   └── Navigation/              # Header, footer, etc.
├── lib/                         # Utility functions & helpers
│   ├── auth.ts                  # JWT verification & generation
│   └── prisma.ts                # Prisma client singleton
├── prisma/                      # Database configuration
│   ├── schema.prisma            # Database schema definition
│   ├── seed.ts                  # Seed script for test data
│   └── migrations/              # Database migration history
├── middleware.ts                # Route protection & auth middleware
├── .env                         # Environment variables (not in git)
├── package.json                 # Dependencies & scripts
└── tsconfig.json                # TypeScript configuration
```

### Key Directories Explained

*   **`app/api/`**: Contains all backend logic. Each folder represents an API endpoint that handles HTTP requests (GET, POST, PUT, DELETE).
*   **`app/book/`**: The appointment booking wizard that guides patients through selecting services, doctors, and time slots.
*   **`components/`**: Reusable UI components to maintain consistency across the application.
*   **`lib/`**: Shared utilities like database connection and authentication helpers.
*   **`prisma/`**: Database schema and migration files. The `schema.prisma` file is the single source of truth for the data model.
*   **`middleware.ts`**: Protects routes by verifying JWT tokens and redirecting unauthorized users.

---

## ⚙️ Installation & Setup

### Prerequisites
*   **Node.js** (v18 or higher)
*   **npm** or **yarn**
*   **PostgreSQL** database (local or cloud-hosted)

### Step-by-Step Setup

#### 1. Clone & Install Dependencies
```bash
git clone https://github.com/YOUR_USERNAME/UniHealth.git
cd UniHealth
npm install
```

#### 2. Configure Environment Variables
Create a `.env` file in the root directory with the following variables:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:password@localhost:5432/unihealth` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `your-super-secret-key-change-this` |

**Example `.env` file:**
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/unihealth"
JWT_SECRET="my-secret-jwt-key-12345"
```

#### 3. Database Setup
Initialize the database schema and populate it with test data:

```bash
# Generate Prisma Client (creates type-safe database client)
npx prisma generate

# Create database tables (run migrations)
npx prisma migrate dev --name init

# Seed the database with sample doctors
npx tsx prisma/seed.ts
```

> **Note**: If you modify `schema.prisma`, always run `npx prisma generate` and `npx prisma migrate dev` to update the database.

#### 4. Run Development Server
```bash
npm run dev
```

Visit **http://localhost:3000** in your browser.

---

## 📡 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new patient account | ❌ |
| `POST` | `/api/auth/login` | Login and receive JWT cookie | ❌ |
| `POST` | `/api/auth/logout` | Clear authentication cookie | ✅ |

### Doctor Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/doctors` | Get list of all doctors | ❌ |
| `GET` | `/api/doctors/[id]` | Get specific doctor details | ❌ |
| `PUT` | `/api/doctors/availability` | Update doctor availability | ✅ (Doctor) |

### Appointment Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/appointments` | List all appointments | ✅ (Admin) |
| `POST` | `/api/appointments` | Create new appointment | ✅ (Patient) |
| `GET` | `/api/appointments/my` | Get current user's appointments | ✅ |
| `GET` | `/api/appointments/doctor` | Get doctor's appointments | ✅ (Doctor) |
| `PUT` | `/api/appointments/[id]` | Update appointment status | ✅ |
| `DELETE` | `/api/appointments/[id]` | Cancel appointment | ✅ |

### Admin Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/users` | Get all users | ✅ (Admin) |
| `GET` | `/api/admin/doctors` | Get all doctors | ✅ (Admin) |
| `POST` | `/api/admin/doctors` | Promote user to doctor | ✅ (Admin) |

---

## 👥 Default Test Accounts

After running `npx tsx prisma/seed.ts`, the following accounts are available:

| Role | Email | Password | Specialty |
| :--- | :--- | :--- | :--- |
| **Doctor** | `dr.smith@unihealth.com` | `password123` | General Medicine |
| **Doctor** | `dr.jones@unihealth.com` | `password123` | Cardiology |
| **Doctor** | `dr.lee@unihealth.com` | `password123` | Dermatology |

> **Patient Testing**: Register a new account via the registration page to test patient functionality.
>
> **Admin Testing**: Currently, admin users must be created manually via Prisma Studio (`npx prisma studio`) or by modifying the seed script.

---

## 🔒 Authentication & Security

*   **JWT Tokens**: Stored in HTTP-only cookies to prevent XSS attacks.
*   **Password Hashing**: Uses bcrypt with salt rounds for secure password storage.
*   **Middleware Protection**: `middleware.ts` verifies tokens and protects routes based on user roles.
*   **Role-Based Access Control (RBAC)**: Different dashboards and API endpoints for PATIENT, DOCTOR, and ADMIN roles.

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build production-ready application |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint for code quality checks |
| `npx prisma studio` | Open Prisma Studio (visual database editor) |
| `npx prisma generate` | Regenerate Prisma Client after schema changes |
| `npx prisma migrate dev` | Create and apply database migrations |
| `npx tsx prisma/seed.ts` | Seed database with test data |

---

## 🧪 Testing & Verification

### Manual Testing Checklist
- [ ] Register a new patient account
- [ ] Login as a patient and view dashboard
- [ ] Book an appointment through the wizard
- [ ] Login as a doctor and view appointments
- [ ] Update doctor availability settings
- [ ] Login as admin and view all users

### Using Prisma Studio
```bash
npx prisma studio
```
This opens a visual database editor at `http://localhost:5555` where you can:
*   View all tables and records
*   Manually create/edit/delete data
*   Create admin users by setting `role = ADMIN`

---

## 🚧 Known Limitations & Future Enhancements

*   **Admin Creation**: Currently requires manual database access. Future: Admin registration endpoint.
*   **Email Notifications**: Not yet implemented. Future: Send confirmation emails for appointments.
*   **Calendar Integration**: Future: Export appointments to Google Calendar/iCal.
*   **Real-time Updates**: Future: WebSocket support for live appointment updates.

---

## 📄 License

MIT License - feel free to use this project for educational purposes.

---

## 👨‍💻 For Developers

### Code Style Guidelines
*   Use **TypeScript** for all new files
*   Follow **Next.js App Router** conventions
*   Use **Prisma** for all database queries (no raw SQL)
*   Keep components small and reusable
*   Use **Tailwind CSS** utility classes for styling

### Common Development Tasks

**Adding a new API endpoint:**
1. Create a new folder in `app/api/`
2. Add a `route.ts` file with handler functions
3. Use `lib/auth.ts` to verify user authentication
4. Use `lib/prisma.ts` to query the database

**Modifying the database schema:**
1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name your_migration_name`
3. Run `npx prisma generate` to update the client

**Adding a new page:**
1. Create a new folder in `app/`
2. Add a `page.tsx` file
3. Update navigation in `app/layout.tsx` if needed

---

## 🆘 Troubleshooting

### Database Connection Issues
*   Verify PostgreSQL is running: `pg_isready`
*   Check `DATABASE_URL` in `.env` is correct
*   Ensure database exists: `createdb unihealth`

### Prisma Client Errors
*   Run `npx prisma generate` after schema changes
*   Delete `node_modules/.prisma` and regenerate

### Authentication Issues
*   Clear browser cookies
*   Verify `JWT_SECRET` is set in `.env`
*   Check middleware.ts is not blocking routes incorrectly

---

**Happy Coding! 🎉**
