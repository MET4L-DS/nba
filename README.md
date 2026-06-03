# NBA Assessment System (OBE)

A comprehensive **Outcome Based Education (OBE)** management system tailored for verifying National Board of Accreditation (NBA) compliance. This robust platform streamlines the calculation of **Course Attainment**, **CO-PO/PSO Mapping**, **Student Performance Assessment**, and institutional auditing.

## Key Features

- **Role-Based Access Control (RBAC)**: Dedicated, feature-rich dashboards for Admins, Deans, HODs, Faculty, and Staff.
- **Course Outcome (CO) Mapping**: Dynamic CO-PO and CO-PSO mapping matrices with persistence and visual attainment tracking.
- **Assessments & Marks Management**: 
  - Define custom assessments with specific question-to-CO mappings.
  - High-performance, spreadsheet-style marks entry (by question or by CO).
- **Automated Attainment Calculation**: Auto-calculation of Course Attainment Levels (1, 2, 3) and percentage-based attainment based on configurable thresholds. 
- **Programme & Batch Management**: Full lifecycle management of academic programmes, course offerings, and student enrollment batches.
- **Surveys & Action Plans**: Built-in modules for managing programmatic surveys and defining actionable improvement plans based on attainment results.
- **Comprehensive Audit Logging**: Detailed, paginated action logs for system-wide auditing and accountability tracking.
- **Bulk Imports**: Support for CSV/Excel data imports for rapid enrollment and matrix data setup.

## Tech Stack

### Backend
- **Core**: PHP 8.x (Custom MVC Architecture, REST API)
- **Database**: MySQL 8.0

### Frontend
- **Core**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + Shadcn UI
- **Routing**: React Router (Role-protected nested layouts)

### Deployment
- **Hosting**: AWS EC2 (Ubuntu/Nginx)
- **Local Dev**: XAMPP (Apache + MySQL), Node.js (Vite Dev Server)

## Project Structure

- `/api` - PHP backend (Controllers, Models, Middleware, Config). Uses custom routing and JWT authentication.
- `/frontend` - React SPA (Dashboards, UI Components, Hooks). Proxies API requests via Vite.
- `/docs` - Database schemas, ER diagrams, Postman collections, and detailed API documentation.

## Quick Setup

### 1. Database Setup
Ensure you have MySQL 8.0 running (e.g., via XAMPP).
Import the database structure and initial data:
1. `docs/db.sql`
2. `docs/migrations/*.sql`

### 2. Backend Configuration
The backend runs on Apache. Ensure URL rewriting is enabled (mod_rewrite).
Update `api/config/DatabaseConfig.php` with your local MySQL credentials.

### 3. Frontend Setup
The frontend uses Vite as the build tool and development server.
```bash
cd frontend
npm install
npm run dev      # Start dev server (typically on port 5173)
# npm run build  # TypeScript + Vite build for production
```
*Note: Ensure your `frontend/.env` file is configured with the correct `VITE_API_BASE_URL` pointing to your local Apache server (e.g., `http://localhost/nba/api`).*

## Documentation

For detailed architectural and API information, please refer to:
- `docs/API_REFERENCE.md` - Complete REST API specification
- `frontend/COMPONENT_ARCHITECTURE.md` - Frontend component tree and routing map
- `docs/NBA Assessment API.postman_collection.json` - Postman collection for API testing

## Live Demo
- **Frontend**: [https://nba.wily.in](https://nba.wily.in)
- **API**: [https://api.nba.wily.in](https://api.nba.wily.in)

---
*Developed for CSE Department, Tezpur University.*
