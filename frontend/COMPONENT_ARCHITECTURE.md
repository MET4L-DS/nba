# NBA System - Component Architecture

## Application Architecture

### Routing Structure

```
App.tsx (BrowserRouter)
├── /login → LoginPage
├── /forgot-password → ForgotPasswordPage
├── /reset-password → ResetPasswordPage
│
├── DashboardLayout (Protected — wraps all role routes)
│
│   ├── Admin Routes
│   │   ├── /dashboard → AdminHome
│   │   ├── /dashboard/users → AdminUsers
│   │   ├── /dashboard/schools → AdminSchools
│   │   ├── /dashboard/departments → AdminDepartments
│   │   ├── /dashboard/programmes → AdminProgrammes
│   │   ├── /dashboard/students → AdminStudents
│   │   ├── /dashboard/courses → AdminCourses
│   │   └── /dashboard/logs → AdminLogs
│   │
│   ├── HOD Routes
│   │   ├── /hod → HODHome
│   │   ├── /hod/faculty → HODFaculty
│   │   ├── /hod/students → HODStudents
│   │   ├── /hod/programmes → HODProgrammes
│   │   ├── /hod/courses → HODCourses
│   │   ├── /hod/courses/:id/copo → HODCourseCOPO
│   │   └── /hod/logs → HODLogs
│   │
│   ├── Faculty Routes
│   │   ├── /faculty → FacultyHome
│   │   ├── /faculty/assessments → FacultyAssessments
│   │   ├── /faculty/students → FacultyStudents
│   │   ├── /faculty/marks → FacultyMarks
│   │   ├── /faculty/copo → FacultyCOPO
│   │   └── /faculty/logs → FacultyLogs
│   │
│   ├── Dean Routes
│   │   ├── /dean → DeanHome
│   │   ├── /dean/departments → DeanDepartments
│   │   ├── /dean/hod-management → DeanHODManagement
│   │   ├── /dean/users → DeanUsers
│   │   ├── /dean/courses → DeanCourses
│   │   ├── /dean/students → DeanStudents
│   │   ├── /dean/assessments → DeanAssessments
│   │   ├── /dean/analytics → DeanAnalytics
│   │   └── /dean/logs → DeanAuditLogs
│   │
│   └── Staff Routes
│       ├── /staff → StaffHome
│       ├── /staff/courses → StaffCourses
│       └── /staff/enrollments → StaffEnrollments
│
├── / → Redirect to /login
└── * → Redirect to /login
```

---

## Component Hierarchy

```
App.tsx (Root)
├── BrowserRouter
│   └── Routes
│       ├── LoginPage (/login)
│       │   ├── Card (Shadcn)
│       │   └── LoginForm (employeeIdOrEmail + Password)
│       │
│       ├── ForgotPasswordPage (/forgot-password)
│       ├── ResetPasswordPage (/reset-password)
│       │
│       ├── DashboardLayout (shared layout wrapper)
│       │   ├── AppSidebar (role-aware navigation)
│       │   │   └── ProfileSettingsDialog (change password form)
│       │   ├── AppHeader (title, breadcrumb, theme toggle, logout)
│       │   └── <Outlet /> (nested route content)
│       │
│       ├── Admin Pages
│       │   ├── AdminHome — Stats cards, quick access
│       │   ├── AdminUsers — CRUD table (DataTableView)
│       │   ├── AdminSchools — CRUD table
│       │   ├── AdminDepartments — CRUD table
│       │   ├── AdminProgrammes — CRUD table
│       │   ├── AdminStudents — Read-only table
│       │   ├── AdminCourses — Read-only table
│       │   └── AdminLogs — Audit log viewer with filters
│       │
│       ├── HOD Pages
│       │   ├── HODHome — Stats, quick access, course overview
│       │   ├── HODFaculty — Faculty CRUD
│       │   ├── HODStudents — Student management
│       │   ├── HODProgrammes — Programme CRUD + course mapping
│       │   ├── HODCourses — Course offering management (conclude/reopen)
│       │   ├── HODCourseCOPO — Read-only CO-PO viewer for locked courses
│       │   └── HODLogs — Department-level audit log viewer
│       │
│       ├── Faculty Pages
│       │   ├── FacultyHome — Stats, quick access, course cards
│       │   ├── FacultyAssessments — Create/manage tests per offering
│       │   ├── FacultyStudents — Enrolled students list
│       │   ├── FacultyMarks — Spreadsheet-like marks entry (by-CO/by-question)
│       │   ├── FacultyCOPO — CO-PO matrix + attainment tables + conclude
│       │   └── FacultyLogs — Personal audit log viewer
│       │
│       ├── Dean Pages
│       │   ├── DeanHome — School-level stats
│       │   ├── DeanDepartments — Department listing + Add/Edit/Delete
│       │   ├── DeanHODManagement — Appoint/demote HODs
│       │   ├── DeanUsers — View all users
│       │   ├── DeanCourses — View all courses
│       │   ├── DeanStudents — View all students
│       │   ├── DeanAssessments — View all assessments
│       │   ├── DeanAnalytics — Department analytics
│       │   └── DeanAuditLogs — School-level audit log viewer
│       │
│       └── Staff Pages
│           ├── StaffHome — Stats
│           ├── StaffCourses — Course management
│           └── StaffEnrollments — Student enrollment management
```

---

## Feature Modules (`src/features/`)

### 1. assessments/
Assessment creation and management workflow.

| Component | Purpose |
|-----------|---------|
| `CreateAssessmentForm` | Multi-step form: test metadata + questions |
| `QuestionsTable` | Dynamic CO-mapped question grid |
| `ViewAssessmentDialog` | Read-only test detail view |

### 2. marks/
High-performance spreadsheet-style marks entry.

| Component | Purpose |
|-----------|---------|
| `BulkMarksTable` | Cell-editable table for rapid marks entry |
| `MarksEntrySelector` | Toggle between by-CO and by-question modes |
| `TestInfoCard` | Contextual test metadata |

### 3. copo/
CO-PO mapping, attainment calculation, and export.

| Component | Purpose |
|-----------|---------|
| `MatrixView` | Top-level orchestrator for all CO-PO tables |
| `COPOMatrixTable` | Grid mapping COs → POs (correlation values 0-3) |
| `COAttainmentTable` | Per-CO attainment percentage + level |
| `PODirectAttainmentTable` | PO attainment from weighted CO levels |
| `POComputation3PointTable` | 3-point PO attainment breakdown |
| `POComputationPercentageTable` | Percentage-based PO attainment |
| `StudentMarksTable` | Raw student marks by CO per test |
| `PassingMarksCard` | Visual threshold indicator |
| `AttainmentCriteriaCard` | Level → percentage range display |
| `AttainmentSettingsPanel` | Threshold configuration dialog |
| `BaseAttainmentTable` | Shared table renderer |
| `useCOPOMappingData` | Hook: fetches marks, runs calculations, fetches snapshots |

### 4. programmes/
Programme-level attainment dashboard (used by HOD).

| Component | Purpose |
|-----------|---------|
| `ProgrammeAttainment` | PO attainment averaged across locked offerings in a programme |

### 5. audit/
Shared audit log viewer.

| Component | Purpose |
|-----------|---------|
| `AuditLogViewer` | Paginated table with action/entity/date filters |

### 6. courses/
Shared course management components.

| Component | Purpose |
|-----------|---------|

### 7. users/
Shared user management components.

| Component | Purpose |
|-----------|---------|

### 8. admin/
Admin-specific feature components.

### 9. shared/
Cross-feature reusable components.

| Component | Purpose |
|-----------|---------|
| `CSVUploader` | CSV file parsing for matrix/data import |
| `SkeletonTable` | Loading placeholder |

---

## Shared Layout Components (`src/components/layout/`)

| Component | Purpose |
|-----------|---------|
| `AppSidebar` | Role-aware navigation sidebar with icons |
| `AppHeader` | Top bar with title, breadcrumb, theme toggle, logout |
| `DashboardLayout` | Outlet-based wrapper with sidebar + header |
| `theme-provider` | Dark/light mode context |

## Shared UI Components (`src/components/ui/`)

Shadcn primitives: `Button`, `Card`, `Dialog`, `DropdownMenu`, `Input`, `Label`, `Select`, `Table`, `Tabs`, `Toast`, `Skeleton`, `Badge`, `Separator`, `Switch`, `Textarea`.

---

## Services Layer (`src/services/`)

### Entry Point: `src/services/api/index.ts`

Exports a unified `apiService` object with all API methods and individual role API modules.

### API Modules (`src/services/api/`)

| Module | File | Purpose |
|--------|------|---------|
| `auth` | `auth.ts` | Login, logout, token management |
| `admin` | `admin.ts` | Users, schools, departments, programmes |
| `hod` | `hod.ts` | Faculty, courses, programmes, reopen |
| `faculty` | `faculty.ts` | Courses, conclusion workflow |
| `staff` | `staff.ts` | Courses, enrollments |
| `dean` | `dean.ts` | HOD management, analytics |
| `assessments` | `assessments.ts` | Test CRUD |
| `marks` | `marks.ts` | Marks by-CO/by-question/bulk |
| `courses` | `courses.ts` | Course offerings, enrollments |
| `attainment` | `attainment.ts` | Offering/programme snapshots |
| `audit` | `audit.ts` | Audit log queries |
| `base` | `base.ts` | Axios instance, interceptors, `apiGet`/`apiPost`/etc. |
| `types` | `types.ts` | Shared TypeScript interfaces |

### Data Flow

```
Page Component
  → API module (e.g., adminApi.getStats())
    → base.ts (axios GET/POST/PUT/DELETE with JWT interceptor)
      → PHP Backend (/api/routes/api.php)
```

TanStack Query is NOT used directly. Data fetching is managed via:
- `usePaginatedData` hook for lists (pagination wrapper)
- Direct Promise handling in page components with `useEffect` + `useState`

---

## Shared Component Patterns

### DataTableView (`src/components/shared/DataTableView.tsx`)

Generic table with search, pagination, loading state, action buttons (Edit/Delete).

```typescript
interface DataTableViewProps<T> {
  data: T[];
  columns: Column<T>[];
  searchFields: (keyof T)[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  loading?: boolean;
}
```

### StatsCard (`src/components/shared/StatsCard.tsx`)

```typescript
interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  variant?: 'gradient' | 'solid' | 'outline';
  suffix?: string;
}
```

---

## State Management

- **Local state**: `useState` + `useEffect` per page component
- **Shared state**: `useOutletContext` for sidebar toggle
- **Auth state**: JWT in `localStorage`, read via `apiService.getStoredUser()`
- **Logging**: `debugLogger` utility for structured console output

---

## UI/UX Technology Stack

- **Framework**: React 19 + TypeScript
- **Build**: Vite 6
- **Styling**: Tailwind CSS v4 with CSS variables
- **Components**: Shadcn UI (Radix primitives)
- **Icons**: Lucide React
- **Routing**: React Router v7
- **Notifications**: Sonner (toast)
- **Excel Export**: xlsx (SheetJS)
- **Dark Mode**: class-based via `next-themes` style provider

---

## Project Structure

```
frontend/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── layout/           # AppSidebar, AppHeader, DashboardLayout, theme-provider
│   │   ├── shared/           # DataTableView, StatsCard, CSVUploader, SkeletonTable
│   │   └── ui/               # Shadcn primitives (button, card, dialog, etc.)
│   │
│   ├── features/             # Domain-specific feature modules
│   │   ├── admin/            # Admin-specific components
│   │   ├── assessments/      # CreateAssessmentForm, QuestionsTable, etc.
│   │   ├── audit/            # AuditLogViewer
│   │   ├── copo/             # MatrixView, COPOMatrixTable, useCOPOMappingData, etc.
│   │   ├── courses/          # Course management components
│   │   ├── marks/            # BulkMarksTable, MarksEntrySelector
│   │   ├── programmes/       # ProgrammeAttainment
│   │   ├── shared/           # Cross-feature shared components
│   │   └── users/            # User management components
│   │
│   ├── pages/                # Route-level page components
│   │   ├── admin/            # AdminHome, AdminUsers, AdminSchools, etc.
│   │   ├── hod/              # HODHome, HODFaculty, HODCourses, etc.
│   │   ├── faculty/          # FacultyHome, FacultyAssessments, FacultyCOPO, etc.
│   │   ├── dean/             # DeanHome, DeanHODManagement, DeanAnalytics, etc.
│   │   ├── staff/            # StaffHome, StaffCourses, StaffEnrollments
│   │   └── LoginPage.tsx
│   │
│   ├── services/             # API and business logic
│   │   ├── api.ts            # Legacy entry point
│   │   └── api/              # Modular API modules
│   │       ├── index.ts      # Unified apiService export
│   │       ├── base.ts       # Axios instance + interceptors
│   │       ├── types.ts      # Shared TypeScript interfaces
│   │       ├── auth.ts, admin.ts, hod.ts, faculty.ts, dean.ts, staff.ts
│   │       ├── assessments.ts, marks.ts, courses.ts
│   │       ├── attainment.ts, audit.ts
│   │       └── ...
│   │
│   ├── lib/                  # Utilities
│   │   ├── debugLogger.ts    # Structured console logging
│   │   ├── usePaginatedData  # Pagination hook
│   │   └── excel/            # Excel export utilities (attainmentExcel.ts)
│   │
│   ├── App.tsx               # Router configuration
│   ├── App.css               # Global styles
│   ├── index.css             # Tailwind imports
│   └── main.tsx              # Entry point
│
├── public/
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.ts
```

---

**Version**: 4.0  
**Last Updated**: June 3, 2026  
**Status**: Updated with complete routing, feature modules, CO-PO snapshots, programme attainment, service layer documentation, and Staff/Dean dashboard mutations.
