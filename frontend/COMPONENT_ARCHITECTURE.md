# NBA System - Component Architecture

## Application Architecture

### Routing Structure

```
App.tsx (BrowserRouter)
├── /login → LoginPage
├── /dashboard → AdminDashboard
├── /dean → DeanDashboard
├── /hod → HODDashboard
├── /staff → StaffDashboard
├── /faculty → FacultyDashboard
├── / → Navigate to /login
└── * → Navigate to /login
```

## Component Hierarchy

```
App.tsx (Root)
├── BrowserRouter
│   └── Routes
│       ├── LoginPage (/login)
│       │   ├── Card
│       │   │   ├── Form
│       │   │   │   ├── Label + Input (Email/Employee ID)
│       │   │   │   ├── Label + Input (Password)
│       │   │   │   └── Button (Submit)
│       │   │   └── Error Display
│       │   └── Background Effects
│       │
│       ├── AdminDashboard (/dashboard)
│       │   ├── Sidebar
│       │   │   ├── Logo + Navigation Menu
│       │   │   ├── Logout Button
│       │   │   └── User Profile
│       │   └── Main Content
│       │       ├── PageHeader
│       │       ├── StatsCards (Admin variant)
│       │       ├── QuickAccessCards (Admin variant)
│       │       └── Views (Users, Departments, Courses, Students, Tests)
│       │
│       ├── DeanDashboard (/dean)
│       │   ├── Sidebar
│       │   └── Main Content
│       │       ├── PageHeader
│       │       ├── StatsCards (Dean variant - 6 cards)
│       │       ├── QuickAccessCards (Dean variant)
│       │       └── Views (Departments, Users, Courses, Students, Tests, Analytics)
│       │
│       ├── HODDashboard (/hod)
│       │   ├── Sidebar
│       │   └── Main Content
│       │       ├── PageHeader
│       │       ├── StatsCards (HOD variant)
│       │       ├── QuickAccessCards (HOD variant)
│       │       └── Views (Courses, Faculty Management, Students, Assessments)
│       │
│       ├── StaffDashboard (/staff)
│       │   ├── Sidebar
│       │   └── Main Content
│       │       ├── PageHeader
│       │       ├── StatsCards (Staff variant)
│       │       ├── QuickAccessCards (Staff variant)
│       │       └── Views (Courses, Students, Enrollments)
│       │
│       └── FacultyDashboard (/faculty)
│           ├── Sidebar
│           └── Main Content
│               ├── PageHeader
│               ├── StatsCards (Faculty variant)
│               ├── QuickAccessCards (Faculty variant)
│               └── Views (My Courses, Assessments, Students)
```

## Shared Component Library

### Overview

Created reusable components to eliminate redundancy across dashboards.

### 1. StatsCard Component (`src/components/shared/StatsCard.tsx`)

**Purpose**: Unified statistics display  
**Props**:

```typescript
{
  title: string;
  value: number;
  icon: React.ReactNode;
  variant?: 'gradient' | 'solid' | 'outline';
  suffix?: string;  // e.g., "%" for percentages
}
```

**Variants**:

-   `gradient` - Gradient background with white text
-   `solid` - Solid color background
-   `outline` - Border with transparent background

**Used By**: All dashboards (Admin, Dean, HOD, Staff, Faculty)

---

### 2. QuickAccessCard Component (`src/components/shared/QuickAccessCard.tsx`)

**Purpose**: Action shortcuts  
**Props**:

```typescript
{
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  onItemClick: (id: string) => void;
  variant?: 'default' | 'elevated' | 'compact';
}
```

**Variants**:

-   `default` - Standard card with hover effect
-   `elevated` - Drop shadow with scale animation
-   `compact` - Reduced padding for dense layouts

**Used By**: All dashboards for quick navigation

---

### 3. DataTableView Component (`src/components/shared/DataTableView.tsx`)

**Purpose**: Generic data table with CRUD actions  
**Props**:

```typescript
{
  data: any[];
  columns: Column[];
  onAdd?: () => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onView?: (item: any) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}
```

**Features**:

-   Action buttons (Add, Edit, Delete, View)
-   Loading states with skeleton
-   Empty state display
-   Responsive table layout

---

### 4. LoadingSpinner Component (`src/components/shared/LoadingSpinner.tsx`)

**Purpose**: Loading indicator  
**Props**: `size?: 'sm' | 'md' | 'lg'`  
**Used By**: All data fetching components

---

### 5. EmptyState Component (`src/components/shared/EmptyState.tsx`)

**Purpose**: No data placeholder  
**Props**:

```typescript
{
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}
```

---

### 6. PageHeader Component (`src/components/shared/PageHeader.tsx`)

**Purpose**: Consistent page titles  
**Props**:

```typescript
{
  title: string;
  description?: string;
  action?: React.ReactNode;
}
```

## Role-Based Dashboards

### AdminDashboard

**Route**: `/dashboard`  
**Role**: `admin`  
**Stats**: Total Users, Total Courses, Total Students, Total Assessments  
**Quick Access**: Manage Users, Manage Departments, View Courses, View Students, View Tests  
**Views**: Users Management, Departments Management, Courses List, Students List, Tests List

---

### DeanDashboard

**Route**: `/dean`  
**Role**: `dean`  
**Stats**: Total Departments, Total Users, Total Courses, Total Students, Total Assessments, Users by Role  
**Quick Access**: View Departments, View Users, View Courses, View Analytics  
**Views**: Departments (read-only), Users (read-only), Courses (read-only), Students (read-only), Tests (read-only), Department Analytics

**Note**: All views are read-only for institutional oversight

---

### HODDashboard

**Route**: `/hod`  
**Role**: `hod`  
**Stats**: Total Courses, Total Faculty, Total Students, Total Assessments  
**Quick Access**: Manage Courses, Manage Faculty, View Students, View Assessments  
**Views**: Course Management (CRUD), Faculty Management (CRUD), Students List, Assessments Management

---

### StaffDashboard

**Route**: `/staff`  
**Role**: `staff`  
**Stats**: Total Courses, Total Students, Total Enrollments  
**Quick Access**: View Courses, Manage Students, Manage Enrollments  
**Views**: Courses List, Students Management, Enrollment Management

---

### FacultyDashboard

**Route**: `/faculty`  
**Role**: `faculty`  
**Stats**: Total Courses, Total Assessments, Total Students, Average Attainment %  
**Quick Access**: My Courses, Create Assessment, View Students, Grade Assessments  
**Views**: My Courses, Assessments, Enrolled Students, Marks Entry

## UI Component Library

### ShadCN UI Components

```typescript
// Layout
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// Forms
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

// Data Display
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

// Feedback
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
```

### Magic UI Components

```typescript
import { NumberTicker } from "@/components/ui/number-ticker";
import { DotPattern } from "@/components/ui/dot-pattern";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
```

### Lucide React Icons

```typescript
import {
	// Navigation
	LayoutDashboard,
	Home,
	Settings,
	LogOut,
	Menu,
	X,

	// Data
	Users,
	BookOpen,
	GraduationCap,
	Building2,
	ClipboardList,
	FileText,
	BarChart3,
	TrendingUp,
	Calendar,
	Upload,

	// Actions
	Plus,
	Edit,
	Trash2,
	Eye,
	Search,
	Filter,
	Download,

	// Status
	CheckCircle,
	XCircle,
	AlertCircle,
	Info,
} from "lucide-react";
```

## State Management

### React Router

```typescript
// Navigation state managed by react-router-dom
import { useNavigate, useLocation } from "react-router-dom";

// Programmatic navigation
const navigate = useNavigate();
navigate("/dashboard"); // After login
navigate("/login"); // After logout
```

### TanStack Query (React Query)

```typescript
// Server state management for API calls
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Example: Fetch admin stats
const { data: stats, isLoading, error } = useQuery({
  queryKey: ['adminStats'],
  queryFn: adminApi.getStats,
});

// Example: Create user mutation
const createUser = useMutation({
  mutationFn: adminApi.createUser,
  onSuccess: () => {
    queryClient.invalidateQueries(['adminUsers']);
  },
}); Architecture

### Authentication Flow
```

1. Login:
   LoginPage → authApi.login() → Receive JWT + User
   → Store in localStorage → Navigate to role-based dashboard

2. Logout:
   Dashboard Logout → Clear localStorage → Navigate to /login

3. Protected Routes:
   Route Access → Check localStorage for token
   → If missing: Navigate to /login
   → If present: Load dashboard

```

### API Data Flow
```

Component → React Query Hook → API Service → Backend API
↓
Cache Management
↓
Automatic Re-fetch
↓
UI Update

Example (Admin Stats):
AdminDashboard → useQuery('adminStats') → adminApi.getStats()
→ GET /admin/stats → Cache result → Display in StatsCards

```

### CRUD Operations Flow
```

User Action → Mutation → API Call → Success/Error
↓ ↓
Modal Form Update Cache & Refetch
↓ ↓
Submit Close Modal & Toast

Example (Create User):
Click Add User → Open Dialog → Fill Form → Submit
→ useMutation(adminApi.createUser) → POST /admin/users
→ Success → Invalidate 'adminUsers' query → Refetch list
→ Close dialog → Show success toast

```

### Component Communication
```

Parent Dashboard
↓ (props)
Shared Components (StatsCard, QuickAccessCard)
↑ (callbacks)
Parent Dashboard
↓ (API mutation)
Backend
↑ (refetch query)
UI Update
// Persisted in localStorage as "vite-ui-theme"

````

### Authentication State
```typescript
// Stored in localStorage
const token = localStorage.getItem('authToken');
const user = JSON.parse(localStorage.getItem('user') || '{}');

// User object structure:
{
  employee_id: number;
  username: string;
  email: string;
  role: 'admin' | 'dean' | 'hod' | 'faculty' | 'staff';
  department_id?: number;
  department_name?: string;
  department_code?: string;
}
````

## Data Flow

```
User Action → State Update → Component Re-render → UI Update

Examples:

1. Login Flow:
   LoginPage.handleSubmit() → onLogin() → App.setIsLoggedIn(true) → Render AdminDashboard

2. Logout Flow:
   AdminDashboard Logout Button → onLogout() → App.setIsLoggedIn(false) → Render LoginPage

3. Theme Toggle:
   AnimatedThemeToggler → setTheme() → Update localStorage → Re-render with new theme

4. Sidebar Toggle:
   Menu Button → setSidebarOpen(!sidebarOpen) → Animate sidebar width
```

## Styling System

### Tailwind CSS Classes

```css
/* Gradients */
bg-linear-to-br from-blue-500 to-blue-600

/* Dark Mode */
dark:bg-gray-900 dark:text-white

/* Responsive */
md:grid-cols-2 lg:grid-cols-4

/* Animations */
transition-all duration-300 ease-in-out
```

API Service Layer

### Structure

```
src/services/
├── api.ts                  # Base configuration
└── api/
    ├── index.ts           # Export all API modules
    ├── auth.ts            # Authentication
    ├── admin.ts           # Admin endpoints
    ├── dean.ts            # Dean endpoints
    ├── hod.ts             # HOD endpoints
    ├── faculty.ts         # Faculty endpoints
    ├── staff.ts           # Staff endpoints
    ├── courses.ts         # Course management
    ├── assessments.ts     # Assessment management
    ├── marks.ts           # Marks management
    ├── enrollment.ts      # Enrollment management
    └── types.ts           # TypeScript interfaces
```

### Type Definitions (types.ts)

```typescript
// User Types
export interface User {
  employee_id: number;
  username: string;
  email: string;
  role: 'admin' | 'dean' | 'hod' | 'faculty' | 'staff';
  department_id?: number;
}

// Stats Types
export interface AdminStats {
  totalUsers: number;
  totalCourses: number;
  totalStudents: number;
  totalAssessments: number;
}

export interface DeanStats {
  totalDepartments: number;
  totalUsers: number;
  totalCourses: number;
  totalStudents: number;
  totalAssessments: number;
  usersByRole: Record<string, number>;
}

export interface HODStats {
  totalCourses: number;
  totalFaculty: number;
  totalStudents: number;
  totalAssessments: number;
}
theme-provider.tsx
│   │   ├── shared/               # Reusable components
│   │   │   ├── StatsCard.tsx
│   │   │   ├── QuickAccessCard.tsx
│   │   │   ├── DataTableView.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── PageHeader.tsx
│   │   ├── admin/                # Admin-specific components
│   │   │   ├── index.ts
│   │   │   ├── QuickAccessCards.tsx
│   │   │   ├── UsersView.tsx
│   │   │   ├── DepartmentsView.tsx
│   │   │   ├── CoursesView.tsx
│   │   │   ├── StudentsView.tsx
│   │   │   └── TestsView.tsx
│   │   ├── dean/                 # Dean-specific components
│   │   │   ├── index.ts
│   │   │   ├── DeanStatsCards.tsx
│   │   │   ├── DeanQuickAccess.tsx
│   │   │   └── [view components...]
│   │   ├── hod/                  # HOD-specific components
│   │   │   ├── index.ts
│   │   │   ├── HODStatsCards.tsx
│   │   │   ├── HODQuickAccess.tsx
│   │   │   ├── CourseManagement.tsx
│   │   │   └── FacultyManagement.tsx
│   │   ├── staff/                # Staff-specific components
│   │   │   ├── index.ts
│   │   │   ├── StaffStatsCards.tsx
│   │   │   └── StaffQuickAccess.tsx
│   │   ├── faculty/              # Faculty-specific components
│   │   │   ├── index.ts
│   │   │   ├── FacultyStatsCards.tsx
│   │   │   ├── FacultyQuickAccess.tsx
│   │   │   └── FacultyOverview.tsx
│   │   ├── layout/               # Layout components
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   └── ui/                   # ShadCN + Magic UI components
│   │       ├── card.tsx
│   │       ├── button.tsx
│   │       ├── table.tsx
│   │       ├── badge.tsx
│   │       ├── dialog.tsx
│   │       ├── select.tsx
│   │       ├── skeleton.tsx
│   │       ├── number-ticker.tsx
│   │       └── [30+ UI components...]
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── DeanDashboard.tsx
│   │   ├── HODDashboard.tsx
│   │   ├── StaffDashboard.tsx
│   │   └── FacultyDashboard.tsx
│   ├── services/
│   │   ├── api.ts                # Base API config
│   │   └── api/
│   │       ├── index.ts
│   │       ├── auth.ts
│   │       ├── admin.ts
│   │       ├── dean.ts
│   │       ├── hod.ts
│   │       ├── faculty.ts
│   │       ├── staff.ts
│   │       └── types.ts
│   ├── lib/
│   │   ├── utils.ts
│   │   └── excel/
│   │       └── excelParser.ts
│   ├── App.tsx
│   ├── App.css
## Key Features

### 1. Role-Based Access Control (RBAC)
- **Admin**: Full system access (users, departments, all data)
- **Dean**: Read-only access to all departments' data
- **HOD**: Manage department's courses, faculty, students
- **Staff**: Manage enrollments and students in department
- **Faculty**: Manage own courses, assessments, and marks

### 2. Component Reusability
- **Shared Components**: StatsCard, QuickAccessCard, DataTableView eliminate code duplication
- **Variant System**: Single component with multiple visual styles (gradient/solid/outline)
- **Props-based Customization**: Flexible components adapt to different contexts

### 3. Performance Optimizations
- **React Query**: Automatic caching, background refetching, optimistic updates
- **Code Splitting**: Route-based lazy loading (potential)
- **Memoization**: Prevent unnecessary re-renders in data-heavy components
- **Virtual Scrolling**: For large data tables (future enhancement)

### 4. Developer Experience
- **TypeScript**: Full type safety across API calls and components
- **Component Indexing**: Barrel exports (index.ts) for clean imports
- **Consistent Patterns**: Same structure across all dashboards
- **Type-Safe API**: Complete type definitions for all API responses

### 5. User Experience
- **Loading States**: Skeleton screens during data fetching
- **Empty States**: Helpful messages when no data exists
- **Error Handling**: Toast notifications for success/error feedback
- **Responsive Design**: Mobile-friendly layouts
- **Dark Mode**: Theme persistence across sessions

## Technology Stack

### Core
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router v6** - Client-side routing

### State Management
- **TanStack Query v5** - Server state management
- **React Context** - Theme provider

### UI Libraries
- **ShadCN UI** - Base component library
- **Magic UI** - Animated components
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library

### Data Handling
- **Axios** - HTTP client
- **React Hook Form** - Form management (future)
- **Zod** - Schema validation (future)

## Future Enhancements

### Planned Features
1. **Protected Routes**: Add AuthProvider and PrivateRoute components
2. **Form Validation**: Integrate React Hook Form + Zod
3. **File Upload**: Excel parsing for bulk operations
4. **PDF Generation**: Export reports and mark sheets
5. **Real-time Updates**: WebSocket integration for live data
6. **Advanced Filtering**: Search, sort, and filter across all tables
7. **Batch Operations**: Multi-select for bulk actions
8. **Analytics Dashboard**: Charts and graphs using Recharts
9. **Audit Logs**: Track all CRUD operations
10. **Notifications**: In-app notification system

### Code Organization Goals
- Extract common patterns into custom hooks
- Implement error boundary components
- Add unit tests (Vitest + React Testing Library)
- Create Storybook documentation for components
- Implement CI/CD pipeline

---

**Version**: 2.0
**Last Updated**: December 27, 2025
**Architecture Status**: Fully implemented with shared component library and role-based dashboards
├── components.json
├── package.json
├── tsconfig.json
├── vite.config.ts
├── COMPONENT_ARCHITECTURE.md
└── README
export interface Department {
  department_id: number;
  department_name: string;
  department_code: string;
}
```

### API Module Example (admin.ts)

```typescript
import { apiGet, apiPost, apiPut, apiDelete } from '../api';
import { AdminStats, User, Department } from './types';

export const adminApi = {
  getStats: () => apiGet<AdminStats>('/admin/stats'),
  getUsers: () => apiGet<User[]>('/admin/users'),
  createUser: (data: CreateUserRequest) => apiPost('/admin/users', data),
  updateUser: (id: number, data: UpdateUserRequest) => apiPut(`/admin/users/${id}`, data),
  deleteUser: (id: number) => apiDelete(`/admin/users/${id}`),

  getDepartments: () => apiGet<Department[]>('/admin/departments'),
  createDepartment: (data: CreateDepartmentRequest) => apiPost('/admin/departments', data),
  // ... more endpoints
};g: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
```

### Responsive Behavior

-   **Mobile** (< 768px): Sidebar collapsed by default
-   **Tablet** (768px - 1024px): Collapsible sidebar
-   **Desktop** (> 1024px): Full sidebar visible

## Database Schema Mapping

### Dummy Data Structure

```typescript
// Courses
{
  id: number,
  code: string,      // Maps to course.course_code
  name: string,      // Maps to course.name
  credit: number,    // Maps to course.credit
  faculty: string,   // Maps to course.faculty
  year: number,      // Maps to course.year
  semester: number   // Maps to course.semester
}

// Students
{
  rollno: string,    // Maps to student.rollno
  name: string,      // Maps to student.name
  dept: string,      // Maps to student.dept
  programme: string  // Maps to student.programme
}

// Assessments
{
  student: string,   // Joined from student.name
  course: string,    // Joined from course.name
  marks: number,     // Maps to assessment.marks
  grade: string      // Maps to assessment.grade
}
```

## Performance Optimizations

1. **React Memo**: NumberTicker component is memoized
2. **ScrollArea**: Virtual scrolling for large lists
3. **CSS Transitions**: Hardware-accelerated transforms
4. **Lazy Loading**: Components rendered only when visible
5. **Theme Persistence**: LocalStorage caching

## Accessibility Features

1. **Semantic HTML**: Proper heading hierarchy
2. **ARIA Labels**: Screen reader support
3. **Keyboard Navigation**: Tab order and focus management
4. **Color Contrast**: WCAG AA compliant
5. **Focus Indicators**: Visible focus rings

## File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── AdminDashboard.tsx     (450 lines)
│   │   ├── LoginPage.tsx          (300 lines)
│   │   ├── theme-provider.tsx     (100 lines)
│   │   └── ui/
│   │       ├── card.tsx
│   │       ├── button.tsx
│   │       ├── table.tsx
│   │       ├── badge.tsx
│   │       ├── avatar.tsx
│   │       ├── separator.tsx
│   │       ├── scroll-area.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── shimmer-button.tsx
│   │       ├── dot-pattern.tsx
│   │       ├── animated-theme-toggler.tsx
│   │       └── number-ticker.tsx
│   ├── lib/
│   │   └── utils.ts
│   ├── App.tsx                    (25 lines)
│   ├── App.css
│   ├── main.tsx                   (15 lines)
│   └── index.css
├── components.json
├── package.json
├── tsconfig.json
├── vite.config.ts
├── ADMIN_PANEL_README.md
├── QUICK_START.md
└── IMPLEMENTATION_SUMMARY.md
```

---

This architecture provides a scalable, maintainable foundation for the NBA Admin Panel with clear separation of concerns and reusable components.
