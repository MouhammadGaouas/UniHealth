# 🏥 UniHealth

A modern healthcare appointment management system built with Next.js, designed for university health services.

## ✨ Features

- **Multi-role system**: Patient, Doctor, and Admin dashboards
- **Appointment booking**: Browse doctors, select time slots, book appointments
- **Doctor availability**: Doctors can set their working hours
- **Admin management**: User management, analytics, and doctor promotion
- **Secure authentication**: JWT-based auth with protected routes

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **PostgreSQL** database
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/UniHealth.git
   cd UniHealth
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
   JWT_SECRET="your-secret-key-here"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate dev
   
   # Seed the database with sample data
   npx tsx prisma/seed.ts
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open** [http://localhost:3000](http://localhost:3000) in your browser

---

## 📁 Project Structure

```
UniHealth/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── admin/         # Admin endpoints
│   │   ├── appointments/  # Appointment CRUD
│   │   ├── auth/          # Authentication
│   │   └── doctors/       # Doctor endpoints
│   ├── auth/              # Auth pages (login/register)
│   ├── book/              # Booking wizard
│   └── dashboard/         # Role-based dashboards
│       ├── admin/         # Admin dashboard
│       └── doctor/        # Doctor dashboard
├── components/            # Reusable React components
├── lib/                   # Utility functions
│   ├── auth.ts           # Auth helpers
│   └── prisma.ts         # Database client
├── prisma/               
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed data
└── middleware.ts         # Route protection
```

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 |
| Language | TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Styling | Tailwind CSS |
| Auth | JWT (jsonwebtoken + jose) |

---

## 👥 Default Users (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Doctor | dr.smith@unihealth.com | password123 |
| Doctor | dr.jones@unihealth.com | password123 |
| Doctor | dr.lee@unihealth.com | password123 |

> Register a new account to test as a patient, or modify `seed.ts` to add an admin user.

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx prisma studio` | Open Prisma database GUI |

---

## 📄 License

MIT License
