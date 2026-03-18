# Brain Tumor Detection System

## Overview

Full-stack healthcare SaaS platform for AI-powered brain tumor detection from MRI scans. Role-based system with 3 user types: Admin, Doctor, and Student/Patient.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/brain-tumor)
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (zod/v4), drizzle-zod
- **Auth**: JWT (jsonwebtoken + bcryptjs)
- **File Upload**: multer
- **UI**: Tailwind CSS + shadcn/ui components
- **Charts**: Recharts
- **Routing**: Wouter
- **Forms**: react-hook-form + zod
- **API codegen**: Orval (from OpenAPI spec)

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@braintumor.com | Admin123 |
| Doctor | doctor@braintumor.com | Doctor123 |
| Student | student@braintumor.com | Student123 |

## Architecture

### Roles & Layouts

- **Admin**: Dark sidebar, top navbar, grid analytics, data tables
- **Doctor**: Light UI, patient cards, medical data focus
- **Student**: Mobile-first, bottom navigation, simple UX

### Frontend Pages

**Auth**: Splash, Login, Register, Forgot Password, OTP Verification, Reset Password

**Admin** (/admin):
- Dashboard: stats, charts, recent scans
- Users: table with CRUD, role filter
- Scans: all scans management
- Analysis: AI results overview

**Doctor** (/doctor):
- Dashboard: assigned scans, critical cases
- Patients: patient cards
- Scan Detail: MRI view + analysis + doctor notes

**Student** (/student):
- Dashboard: greeting, how-it-works, recent analysis
- Upload: file picker, preview, start analysis
- History: scan list with search, status badges
- Result: MRI image, tumor type, confidence, findings
- Profile: settings, password change
- Notifications: notification list
- Data & Privacy page

## API Endpoints

- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `POST /api/auth/forgot-password` - Send reset code
- `POST /api/auth/verify-code` - Verify OTP
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password
- `GET /api/users` - List users (admin)
- `PUT /api/users/:id` - Update user (admin)
- `DELETE /api/users/:id` - Delete user (admin)
- `GET /api/scans` - List scans
- `POST /api/scans` - Upload scan
- `GET /api/scans/:id` - Scan details with analysis
- `POST /api/scans/:id/notes` - Add doctor note
- `POST /api/analysis/:scanId` - Run AI analysis
- `GET /api/analysis/:scanId` - Get analysis result
- `GET /api/stats` - Dashboard statistics
- `GET /api/notifications` - User notifications
- `PUT /api/notifications/:id/read` - Mark as read

## Structure

```
artifacts/
├── brain-tumor/          # React + Vite frontend
│   ├── src/
│   │   ├── lib/auth.tsx  # Auth context + JWT handling
│   │   ├── pages/
│   │   │   ├── auth.tsx     # All auth pages
│   │   │   ├── admin.tsx    # Admin pages
│   │   │   ├── doctor.tsx   # Doctor pages
│   │   │   └── student.tsx  # Student pages
│   │   └── App.tsx          # Router + layouts
│   └── public/images/        # Brain scan images
├── api-server/           # Express API
│   └── src/
│       ├── lib/auth.ts   # JWT + bcrypt utilities
│       └── routes/       # API route handlers
lib/
├── db/src/schema/        # Drizzle ORM schemas
│   ├── users.ts
│   ├── scans.ts
│   ├── analysis.ts
│   └── notifications.ts
├── api-spec/openapi.yaml # Full OpenAPI 3.1 spec
scripts/src/seed.ts       # DB seeding script
```
