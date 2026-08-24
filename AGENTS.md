# AGENTS.md

## 1. Project Overview

* **Project Purpose:** Enterprise full-stack Work Report Management and Team Analytics System designed for tracking, managing, filtering, reviewing, and analyzing daily engineering work entries across individual, team, and multi-tenant organizational workspaces.
* **Application Type:** Full-Stack Monorepo Web Application (React SPA Frontend + Spring Boot REST Backend + PostgreSQL Database).
* **Major Technologies:** Java 25, Spring Boot 4.1.0, Spring Data JPA, Spring Security (Stateless JWT), PostgreSQL, React 19, TypeScript 6, Vite 8, Tailwind CSS v4, Motion (Framer Motion), Recharts, OpenPDF, Apache POI.
* **Major Architectural Style:** Layered RESTful Architecture with strict DTO boundaries, Multi-Tenant Organizational Scoping, Role-Based Access Control (RBAC), and Client-Side React SPA with centralized API layer and Context-driven state management.

---

## 2. Technology Stack

### Frontend
* **Core:** React 19 (`19.2.8`), TypeScript (`~6.0.2`), HTML5, CSS3
* **Build & Dev Tool:** Vite 8 (`^8.2.0`), `@vitejs/plugin-react` (`^6.0.4`)
* **Routing:** React Router v7 (`react-router-dom` `^7.18.2`)
* **Styling:** Tailwind CSS v4 (`tailwindcss` `^4.3.3`, `@tailwindcss/vite` `^4.3.3`)
* **Animations & Smooth Scrolling:** Motion (`motion` `^13.1.1`), Lenis (`lenis` `^1.3.26`)
* **Data Visualization & Icons:** Recharts (`^3.10.1`), Lucide React (`lucide-react` `^1.32.0`)
* **Linter:** Oxlint (`oxlint` `^1.75.0`)

### Backend
* **Language & Runtime:** Java 25 (`25.0.2`)
* **Framework:** Spring Boot 4.1.0 (`spring-boot-starter-webmvc`, `spring-boot-starter-parent`)
* **ORM & Persistence:** Spring Data JPA, Hibernate 7.4.1 (`spring-boot-starter-data-jpa`)
* **Validation:** Jakarta Bean Validation (`spring-boot-starter-validation`)
* **Build Tool:** Maven with Maven Wrapper (`mvnw`, `mvnw.cmd`)

### Database
* **Database Engine:** PostgreSQL (Default database: `work_report_db`, PostgreSQL Driver `42.7.x`)
* **Schema Management:** Hibernate auto-DDL (`spring.jpa.hibernate.ddl-auto=update`)
* **Connection Pooling:** HikariCP (`HikariDataSource`)

### Authentication & Authorization
* **Security Framework:** Spring Security (`spring-boot-starter-security`)
* **Token Mechanism:** Stateless JSON Web Token via JJWT (`io.jsonwebtoken:jjwt-api:0.12.6`, `jjwt-impl`, `jjwt-jackson`)
* **Password Hashing:** `BCryptPasswordEncoder`
* **Authorization Model:** RBAC (Roles: `ADMIN`, `MANAGER`, `USER`; Account Statuses: `PENDING`, `ACTIVE`, `SUSPENDED`, `REJECTED`)
* **Client Token Persistence:** Browser `localStorage` (`work_report_token`, `work_report_user`)

### Reporting & Document Export
* **PDF Export:** OpenPDF (`com.github.librepdf:openpdf:2.0.3`)
* **Excel (.xlsx) & Word (.docx) Export:** Apache POI (`org.apache.poi:poi-ooxml:5.4.0`)

### Testing
* **Backend:** Spring Boot Starter Test, Spring Security Test, Spring Data JPA Test (`spring-boot-starter-test`)
* **Frontend:** TypeScript static analysis (`tsc -b`), Oxlint

---

## 3. Repository Structure

```text
c:\Projects\Work_Report\
├── AGENTS.md                         # Codebase navigation index & AI context map
├── README.md                         # Project documentation and getting started guide
├── .env                              # Environment variable definitions (DB credentials)
├── .gitignore                        # Git exclusion rules
│
├── work-report-backend/              # Spring Boot REST API Application
│   ├── pom.xml                       # Maven build configuration and dependencies
│   ├── mvnw / mvnw.cmd               # Maven wrappers
│   └── src/
│       ├── main/
│       │   ├── java/work_report_backend/
│       │   │   ├── config/           # Security, JWT Filter, CORS, Migration Runners
│       │   │   ├── controller/       # REST Controllers (Auth, WorkEntry, Project, Dashboard, etc.)
│       │   │   ├── dto/              # Request/Response Data Transfer Objects (No Lombok)
│       │   │   ├── entity/           # JPA Entities (User, Project, WorkEntry, Organization, Team)
│       │   │   ├── exception/        # GlobalExceptionHandler & Domain Exceptions
│       │   │   ├── repository/       # Spring Data JPA Repository Interfaces
│       │   │   ├── service/          # Business Logic, Aggregations, RBAC, Document Exports
│       │   │   ├── util/             # Utility classes & constants
│       │   │   └── WorkReportBackendApplication.java # Spring Boot entrypoint
│       │   └── resources/
│       │       └── application.properties # Spring Boot configuration
│       └── test/                     # Unit and integration test suites
│
└── work-report-frontend/             # React 19 + TypeScript + Vite SPA
    ├── package.json                  # Frontend dependencies and npm scripts
    ├── vite.config.ts                # Vite configuration with Tailwind CSS plugin
    ├── tsconfig.json                 # TypeScript compiler configuration
    ├── index.html                    # Single Page App HTML template
    └── src/
        ├── api/                      # Centralized API service modules (Axios/Fetch wrappers)
        ├── auth/                     # AuthProvider, AuthContext, Protected/Admin Route Guards
        ├── components/
        │   ├── auth/                 # Auth cards, form fields, workspace selector
        │   ├── common/               # Modal, Pagination, Tabs, Breadcrumbs, EmptyState
        │   ├── dashboard/            # Analytics charts, KPI cards, filters drawer, header
        │   ├── layout/               # Header, Sidebar, Layout, ThemeToggle
        │   └── work-entries/         # Work entry details modal, form drawers
        ├── context/                  # UserContext, ThemeContext, ToastContext
        ├── motion/                   # Framer Motion animation variants & Lenis smooth scroll
        ├── pages/                    # Routed Views (Dashboard, Projects, WorkEntries, Reports, etc.)
        ├── types/                    # TypeScript interfaces matching backend DTOs
        ├── utils/                    # Formatters, date math, CSV export utilities
        ├── App.tsx                   # Top-level Route definitions & Context tree
        ├── main.tsx                  # React DOM mount point
        └── index.css                 # Global Tailwind v4 styles & CSS custom properties
```

---

## 4. Application Architecture

```text
[ Browser / React 19 SPA ]
           │
           │  (HTTP / JSON REST API with Bearer JWT)
           ▼
[ Spring Security & JwtAuthenticationFilter ]
           │
           ▼
[ REST Controllers (@RestController) ]
           │
           ▼  (Strict DTO Request/Response Mapping)
[ Service Layer (@Service) ]
           │  ◄── RBAC, Tenant Scoping, Business Validations, Audit Logs
           ▼
[ Spring Data JPA Repositories (@Repository) ]
           │  ◄── JPQL Queries, Aggregations, Pagination
           ▼
[ PostgreSQL Database (work_report_db) ]
```

### Communication Flow Details
1. **Frontend API Requests:** Handled by specialized modules in `src/api/` using `apiClient.ts`, automatically attaching the Bearer JWT token from `localStorage` to the `Authorization` header.
2. **Backend Authentication & Security:** `JwtAuthenticationFilter` intercepts requests, extracts the JWT, verifies the signature via `JwtService`, and populates `SecurityContextHolder`.
3. **Controller Layer:** Validates inputs via `@Valid` Jakarta annotations and delegates directly to dedicated Service classes.
4. **Service Layer:** Enforces business logic, organization-level isolation, permissions via `RbacService`, and maps Entities to DTOs.
5. **Persistence Layer:** Repositories interface with PostgreSQL using Spring Data JPA method signatures and JPQL aggregation queries.

---

## 5. Feature / Module Map

### 1. Authentication & Tenant Onboarding
* **Main Entry:** `work-report-frontend/src/pages/LoginPage.tsx`, `RegisterPage.tsx`
* **Frontend Components:** `src/auth/AuthProvider.tsx`, `src/components/auth/WorkspaceSelector.tsx`, `AuthCard.tsx`, `AuthField.tsx`
* **API Client:** `src/api/authApi.ts`
* **Backend Controller:** `work-report-backend/src/main/java/work_report_backend/controller/AuthController.java`
* **Backend Services:** `AuthService` (via `UserService.java`), `JwtService.java`, `LoginAttemptService.java`, `OrganizationService.java`
* **Database Entities:** `User`, `Organization`

### 2. Work Analytics Dashboard
* **Main Entry:** `work-report-frontend/src/pages/DashboardPage.tsx`
* **Frontend Components:** `src/components/dashboard/DashboardHeader.tsx`, `DashboardKpiCards.tsx`, `WorkActivityTrendCard.tsx`, `TopProjectsCard.tsx`, `TopCategoriesCard.tsx`, `TopTechnologiesCard.tsx`, `LifecycleStatusCard.tsx`, `WorkDistributionCard.tsx`, `AnalyticsDetailsDrawer.tsx`
* **API Client:** `src/api/dashboardApi.ts`
* **Backend Controller:** `work-report-backend/src/main/java/work_report_backend/controller/DashboardController.java`
* **Backend Service:** `DashboardService.java`
* **Database Entities:** `WorkEntry`, `Project`, `User`, `Team`

### 3. Work Entry Management & Review Lifecycle
* **Main Entry:** `work-report-frontend/src/pages/WorkEntriesPage.tsx`
* **Frontend Components:** `src/components/work-entries/WorkEntryDetailsModal.tsx`, `src/components/common/Pagination.tsx`
* **API Client:** `src/api/workEntryApi.ts`
* **Backend Controller:** `work-report-backend/src/main/java/work_report_backend/controller/WorkEntryController.java`
* **Backend Service:** `WorkEntryService.java`, `RbacService.java`
* **Database Entities:** `WorkEntry`, `Project`, `User`, `Organization`, `Team`

### 4. Project Management (CRUD)
* **Main Entry:** `work-report-frontend/src/pages/ProjectsPage.tsx`
* **API Client:** `src/api/projectApi.ts`
* **Backend Controller:** `work-report-backend/src/main/java/work_report_backend/controller/ProjectController.java`
* **Backend Service:** `ProjectService.java`
* **Database Entities:** `Project`, `User`, `Organization`

### 5. Multi-Format Report Export (PDF, Excel, Word, CSV)
* **Main Entry:** `work-report-frontend/src/pages/ReportsPage.tsx`
* **API Client:** `src/api/reportApi.ts`
* **Backend Controller:** `work-report-backend/src/main/java/work_report_backend/controller/ReportController.java`
* **Backend Services:** `ReportService.java`, `ReportExportService.java`
* **Database Entities:** `WorkEntry`, `User`, `Project`, `Organization`

### 6. Team & Workspace Administration
* **Main Entry:** `work-report-frontend/src/pages/AdminTeamsPage.tsx`
* **API Client:** `src/api/teamApi.ts`, `src/api/organizationApi.ts`
* **Backend Controller:** `work-report-backend/src/main/java/work_report_backend/controller/TeamController.java`, `OrganizationController.java`
* **Backend Service:** `TeamService.java`, `OrganizationService.java`
* **Database Entities:** `Team`, `Organization`, `User`

### 7. User & Access Administration
* **Main Entry:** `work-report-frontend/src/pages/AdminUsersPage.tsx`
* **API Client:** `src/api/adminApi.ts`
* **Backend Controller:** `work-report-backend/src/main/java/work_report_backend/controller/AdminUserController.java`
* **Backend Service:** `UserService.java`, `RbacService.java`
* **Database Entities:** `User`, `Team`, `Organization`

### 8. User Profile & Settings
* **Main Entry:** `work-report-frontend/src/pages/SettingsPage.tsx`
* **API Client:** `src/api/userProfileApi.ts`
* **Backend Controller:** `work-report-backend/src/main/java/work_report_backend/controller/UserController.java`
* **Backend Service:** `UserService.java`
* **Database Entities:** `User`, `Organization`

---

## 6. Important File Map

| Path | Responsibility | Important Dependencies | Relevant Tasks |
|---|---|---|---|
| `work-report-backend/src/main/resources/application.properties` | Spring Boot datasource, JWT, and JPA settings | PostgreSQL, JVM env vars | Database URL/credentials, port, JWT secrets |
| `work-report-backend/.../config/SecurityConfig.java` | Spring Security filter chain, CORS rules, endpoint matchers | `JwtAuthenticationFilter`, `CustomAuthenticationEntryPoint` | Modifying public endpoints, CORS origins, security filters |
| `work-report-backend/.../config/JwtAuthenticationFilter.java` | JWT token parsing from `Authorization: Bearer <token>` | `JwtService`, `CustomUserDetailsService` | Modifying token validation, request authentication flow |
| `work-report-backend/.../service/WorkEntryService.java` | Work entry CRUD, multi-criteria filtering, lifecycle approvals | `WorkEntryRepository`, `UserRepository`, `ProjectRepository` | Changing work entry business logic, status transitions, filters |
| `work-report-backend/.../service/DashboardService.java` | Aggregates KPIs, charts, category/tech counts, trend analysis | `WorkEntryRepository`, `ProjectRepository` | Modifying dashboard metrics, date aggregations, drilldowns |
| `work-report-backend/.../service/ReportExportService.java` | Generates binary PDF, Excel (.xlsx), and Word (.docx) documents | OpenPDF, Apache POI | Updating exported document formats, styling, layout tables |
| `work-report-backend/.../service/RbacService.java` | Validates role hierarchies and tenant permissions | `UserRepository` | Adding/updating role permissions, manager scopes |
| `work-report-frontend/src/App.tsx` | Top-level SPA routing, Route Guards, Context wrapping | React Router, `AuthProvider`, `ThemeProvider` | Adding new pages, changing route guards or layout structure |
| `work-report-frontend/src/auth/AuthProvider.tsx` | Global authentication state, login, register, logout, role check | `authApi.ts`, `localStorage` | Modifying authentication state, token refresh, auto-logout |
| `work-report-frontend/src/api/apiClient.ts` | Centralized Fetch/Axios client with auto-Bearer token injection | Native Fetch / `localStorage` | Base URL changes, global HTTP headers, 401 interceptor |
| `work-report-frontend/src/pages/DashboardPage.tsx` | Main analytics dashboard UI with KPIs, charts, quick actions | `DashboardHeader`, `dashboardApi.ts`, `Recharts` | Adding/reorganizing dashboard cards, filter controls |
| `work-report-frontend/src/pages/WorkEntriesPage.tsx` | Work log table, search, multi-filter drawer, review workflows | `workEntryApi.ts`, `WorkEntryDetailsModal` | Modifying work log views, table actions, filtering |
| `work-report-frontend/src/context/ThemeContext.tsx` | Light/Dark/System theme state management and DOM class syncing | `localStorage`, CSS root classes | Updating dark mode behavior, theme persistence |
| `work-report-frontend/src/index.css` | Tailwind CSS v4 root import, custom variants, base theme styles | Tailwind CSS v4, Lenis | Global CSS variables, custom Tailwind variants |

---

## 7. Dependency / Relationship Map

### 1. Authentication Flow
```text
LoginPage.tsx / RegisterPage.tsx
 └──► AuthProvider.tsx
       └──► authApi.ts (`login()`, `register()`)
             └──► apiClient.ts (POST /api/auth/login)
                   └──► AuthController.java
                         └──► UserService.java / JwtService.java
                               └──► UserRepository.java
                                     └──► PostgreSQL `users` table
```

### 2. Work Entry Recording & Review Flow
```text
WorkEntriesPage.tsx / DashboardPage.tsx ("Quick Record")
 └──► workEntryApi.ts (`createWorkEntry()`, `submitWorkEntry()`, `approveWorkEntry()`)
       └──► WorkEntryController.java
             └──► WorkEntryService.java
                   ├──► RbacService.java (Validates permission & tenant scope)
                   └──► WorkEntryRepository.java
                         └──► PostgreSQL `work_entries` table
```

### 3. Dashboard Analytics Flow
```text
DashboardPage.tsx
 └──► dashboardApi.ts (`getComprehensiveAnalytics()`)
       └──► DashboardController.java (`POST /api/dashboard/analytics`)
             └──► DashboardService.java
                   └──► WorkEntryRepository.java (Custom JPQL Aggregations & Group Bys)
                         └──► Returns `DashboardAnalyticsResponse` DTO
                               └──► Recharts Visualizations (Bar, Line, Pie, Donut)
```

### 4. Multi-Tenant Organization & Team Flow
```text
AdminTeamsPage.tsx / AdminUsersPage.tsx
 └──► teamApi.ts / adminApi.ts
       └──► TeamController.java / AdminUserController.java
             └──► TeamService.java / UserService.java
                   ├──► OrganizationRepository.java
                   ├──► TeamRepository.java
                   └──► UserRepository.java
```

---

## 8. API Map

### Authentication APIs (`AuthController.java`)
* `POST /api/auth/login` ──► `UserService.login()` ──► Returns `LoginResponse` (JWT + User info)
* `POST /api/auth/register` ──► `UserService.register()` ──► Returns `UserResponse`
* `GET /api/auth/me` ──► `UserService.getCurrentUser()` ──► Returns `UserResponse`

### Dashboard APIs (`DashboardController.java`)
* `POST /api/dashboard/analytics` ──► `DashboardService.getComprehensiveAnalytics()` ──► `DashboardAnalyticsResponse`
* `GET /api/dashboard/user/{userId}/work-count` ──► `DashboardService.getTotalWorkCount()`
* `GET /api/dashboard/user/{userId}/project-count` ──► `DashboardService.getTotalProjectCount()`
* `GET /api/dashboard/user/{userId}/current-month` ──► `DashboardService.getCurrentMonthEntries()`
* `GET /api/dashboard/user/{userId}/current-week` ──► `DashboardService.getCurrentWeekEntries()`
* `GET /api/dashboard/user/{userId}/projects` ──► `DashboardService.getWorkCountByProject()`
* `GET /api/dashboard/user/{userId}/categories` ──► `DashboardService.getWorkCountByCategory()`
* `GET /api/dashboard/user/{userId}/technologies` ──► `DashboardService.getWorkCountByTechnology()`
* `GET /api/dashboard/user/{userId}/status` ──► `DashboardService.getWorkCountByStatus()`

### Work Entry APIs (`WorkEntryController.java`)
* `POST /api/work-entries/user/{userId}/project/{projectId}` ──► `WorkEntryService.createWorkEntry()`
* `GET /api/work-entries/user/{userId}` ──► `WorkEntryService.getWorkEntriesByUserId()`
* `GET /api/work-entries/{id}` ──► `WorkEntryService.getWorkEntryById()`
* `PUT /api/work-entries/{id}` ──► `WorkEntryService.updateWorkEntry()`
* `DELETE /api/work-entries/{id}` ──► `WorkEntryService.deleteWorkEntry()`
* `GET /api/work-entries/search?keyword={keyword}` ──► `WorkEntryService.searchWorkEntries()`
* `GET /api/work-entries/filter?startDate=...&endDate=...` ──► `WorkEntryService.filterByDateRange()`
* `GET /api/work-entries/filter/user/{userId}` ──► `WorkEntryService.filterByUserAndDateRange()`
* `GET /api/work-entries/filter/project/{projectId}` ──► `WorkEntryService.filterByProjectAndDateRange()`
* `GET /api/work-entries/filter/user/{userId}/project/{projectId}` ──► `WorkEntryService.filterByUserProjectAndDateRange()`
* `GET /api/work-entries/filter/category/{category}` ──► `WorkEntryService.filterByCategory()`
* `GET /api/work-entries/filter/technology/{technology}` ──► `WorkEntryService.filterByTechnology()`
* `GET /api/work-entries/filter/status/{status}` ──► `WorkEntryService.filterByStatus()`
* `PUT /api/work-entries/{id}/submit` ──► `WorkEntryService.submitWorkEntry()`
* `PUT /api/work-entries/{id}/withdraw` ──► `WorkEntryService.withdrawWorkEntry()`
* `PUT /api/work-entries/{id}/approve` ──► `WorkEntryService.approveWorkEntry()`
* `PUT /api/work-entries/{id}/reject` ──► `WorkEntryService.rejectWorkEntry()`
* `GET /api/work-entries/team/{teamId}` ──► `WorkEntryService.getWorkEntriesByTeam()`
* `GET /api/work-entries/organization/{orgId}` ──► `WorkEntryService.getWorkEntriesByOrganization()`

### Project APIs (`ProjectController.java`)
* `POST /api/projects/user/{userId}` ──► `ProjectService.createProject()`
* `GET /api/projects/user/{userId}` ──► `ProjectService.getProjectsByUserId()`
* `GET /api/projects/{id}` ──► `ProjectService.getProjectById()`
* `PUT /api/projects/{id}` ──► `ProjectService.updateProject()`
* `DELETE /api/projects/{id}` ──► `ProjectService.deleteProject()`

### Report & Export APIs (`ReportController.java`)
* `POST /api/reports/preview` ──► `ReportService.previewReport()`
* `POST /api/reports/export/pdf` ──► `ReportExportService.exportPdf()`
* `POST /api/reports/export/excel` ──► `ReportExportService.exportExcel()`
* `POST /api/reports/export/word` ──► `ReportExportService.exportWord()`

### Team APIs (`TeamController.java`)
* `POST /api/teams` ──► `TeamService.createTeam()`
* `GET /api/teams/{id}` ──► `TeamService.getTeamById()`
* `GET /api/teams/organization/{orgId}` ──► `TeamService.getTeamsByOrganization()`
* `PUT /api/teams/{id}` ──► `TeamService.updateTeam()`
* `DELETE /api/teams/{id}` ──► `TeamService.deleteTeam()`
* `POST /api/teams/{id}/members/{userId}` ──► `TeamService.addMember()`
* `DELETE /api/teams/{id}/members/{userId}` ──► `TeamService.removeMember()`

### Admin User APIs (`AdminUserController.java`)
* `GET /api/admin/users` ──► `UserService.getAllUsersPaged()`
* `GET /api/admin/users/stats` ──► `UserService.getAdminUserStats()`
* `PUT /api/admin/users/{id}/approve` ──► `UserService.approveUser()`
* `PUT /api/admin/users/{id}/reject` ──► `UserService.rejectUser()`
* `PUT /api/admin/users/{id}/suspend` ──► `UserService.suspendUser()`
* `PUT /api/admin/users/{id}/reactivate` ──► `UserService.reactivateUser()`
* `PUT /api/admin/users/{id}/role` ──► `UserService.updateUserRole()`
* `PUT /api/admin/users/{id}/team` ──► `UserService.updateUserTeam()`

### User & Profile APIs (`UserController.java`)
* `POST /api/users` ──► `UserService.createUser()`
* `GET /api/users` ──► `UserService.getAllUsers()`
* `GET /api/users/{id}` ──► `UserService.getUserById()`
* `PUT /api/users/{id}/profile` ──► `UserService.updateProfile()`
* `PUT /api/users/{id}/password` ──► `UserService.changePassword()`
* `GET /api/users/{id}/permissions` ──► `UserService.getEffectivePermissions()`

---

## 9. Database Map

### Entities & Relationships

```text
┌──────────────────────┐         ┌──────────────────────┐
│     Organization     │ 1 ──── *│         Team         │
│ ──────────────────── │         │ ──────────────────── │
│ id (PK)              │         │ id (PK)              │
│ name                 │         │ name                 │
│ company_code (UQ)    │         │ description          │
│ contact_email        │         │ organization_id (FK) │
└──────────┬───────────┘         │ manager_id (FK)      │
           │                     └──────────┬───────────┘
           │ 1                              │ 1
           │                                │
           │ *                              │ *
┌──────────▼───────────┐         ┌──────────▼───────────┐
│         User         │ 1 ──── *│       Project        │
│ ──────────────────── │         │ ──────────────────── │
│ id (PK)              │         │ id (PK)              │
│ email (UQ)           │         │ name                 │
│ password (BCrypt)    │         │ description          │
│ name                 │         │ user_id (FK)         │
│ role (ADMIN/MGR/USR) │         │ organization_id (FK) │
│ status (ACTIVE/etc.) │         └──────────┬───────────┘
│ organization_id (FK) │                    │ 1
│ team_id (FK)         │                    │
└──────────┬───────────┘                    │
           │ 1                              │
           │                                │ *
           └────────────────► ┌─────────────▼────────────┐
                              │        WorkEntry         │
                              │ ──────────────────────── │
                              │ id (PK)                  │
                              │ title, description       │
                              │ category, technology     │
                              │ date                     │
                              │ status (DRAFT/PEND/etc.) │
                              │ user_id (FK)             │
                              │ project_id (FK)          │
                              │ organization_id (FK)     │
                              │ team_id (FK)             │
                              │ reviewer_id (FK)         │
                              └──────────────────────────┘
```

### Database Repositories
* `OrganizationRepository.java`: Custom lookup by `companyCode`.
* `TeamRepository.java`: `findByOrganizationId()`, `findByManagerId()`.
* `UserRepository.java`: `findByEmail()`, `findByOrganizationId()`, `findByTeamId()`, `findByStatus()`.
* `ProjectRepository.java`: `findByUserId()`, `findByOrganizationId()`.
* `WorkEntryRepository.java`: Rich query methods including custom JPQL for user/project/team/date-range aggregations, keyword searches, and status grouping.

---

## 10. Authentication & Authorization

### Flow
1. User logs in via `POST /api/auth/login` with email and password.
2. `UserService` checks credentials via `BCryptPasswordEncoder` and verifies account status is `ACTIVE` (not `PENDING`, `SUSPENDED`, or `REJECTED`).
3. Upon success, `JwtService` creates a signed Bearer token with 1-hour expiration containing user ID, email, role, and organization ID.
4. Frontend `AuthProvider` stores the JWT token in `localStorage` under `work_report_token` and user profile under `work_report_user`.
5. Frontend route guards (`ProtectedRoute`, `AdminRoute`, `ManagerOrAdminRoute`) verify authentication and role permissions before rendering protected components.

### Roles & Permissions
* **`ADMIN`:** Full organization-wide access, user management (approval/rejection/suspension/role assignment), team management, organization settings, reports export, review any work entry.
* **`MANAGER`:** Team-level analytics, team work review (approve/reject team members' logs), team project assignment, report export.
* **`USER`:** Personal work logging, personal dashboard analytics, draft/submit/withdraw personal entries, personal project management.

---

## 11. State Management

### 1. Global Application State
* **`AuthContext` (`src/auth/AuthContext.tsx`, `AuthProvider.tsx`):** Holds `currentUser`, `token`, `isAuthenticated`, `isAdmin`, `isManager`, `isIndividual`, `login()`, `register()`, `logout()`.
* **`ThemeContext` (`src/context/ThemeContext.tsx`):** Holds `theme` (`light` | `dark` | `system`), `resolvedTheme` (`light` | `dark`), `setTheme()`, `toggleTheme()`. Synchronizes `dark` class to `document.documentElement`.
* **`ToastContext` (`src/context/ToastContext.tsx`):** Notification queue (`toasts`), `showSuccess()`, `showError()`, `showInfo()`, `removeToast()`.
* **`MotionProvider` (`src/motion/MotionProvider.tsx`):** Global animation reduction and performance toggles.

### 2. Local State
* Managed via React `useState` and `useMemo` hooks inside pages and components for filters, modals, pagination, and forms.

---

## 12. External Integrations

* **OpenPDF (`com.github.librepdf:openpdf`):** Programmatic enterprise PDF generation in `ReportExportService.java`.
* **Apache POI (`org.apache.poi:poi-ooxml`):** Excel spreadsheet (`.xlsx`) and Word document (`.docx`) generation in `ReportExportService.java`.
* **PostgreSQL:** Primary relational database via JDBC driver.

---

## 13. Development Commands

### Backend Commands (from `work-report-backend/`)
```bash
# Run Spring Boot backend (Starts at http://localhost:8080)
.\mvnw.cmd spring-boot:run          # Windows
./mvnw spring-boot:run              # Linux / macOS

# Build Backend JAR without tests
.\mvnw.cmd clean package -DskipTests

# Run Backend Tests
.\mvnw.cmd test
```

### Frontend Commands (from `work-report-frontend/`)
```bash
# Install dependencies
npm install

# Start Vite Development Server (Starts at http://localhost:5173)
npm run dev

# Type-check and build production bundle
npm run build

# Run Oxlint linter
npm run lint

# Preview production build locally
npm run preview
```

---

## 14. Architectural Conventions

1. **Strict DTO Architecture (Backend):**
   * Never leak JPA Entities into Controller return types. Always map entities to/from DTOs in `dto/`.
   * Standard Java getters/setters (Lombok is intentionally NOT used).
2. **Multi-Tenant Isolation:**
   * All queries and aggregations must filter by `organization_id` or `user_id`. Never allow cross-organization data access.
3. **API Client Centralization (Frontend):**
   * All API calls must live in `src/api/` using `apiClient.ts`. Do not write raw `fetch` or `axios` calls directly inside React components.
4. **Dark Mode Styling:**
   * Tailwind CSS v4 dark mode utilizes `@custom-variant dark (&:where(.dark, .dark *));`.
   * Always pair light background/text utility classes with valid `dark:` variants (e.g., `bg-white dark:bg-slate-900`, `text-slate-800 dark:text-white`, `border-slate-200 dark:border-slate-800`).
   * Never use non-existent Tailwind color shades like `slate-850` or `slate-750`.
5. **Error Handling:**
   * Backend errors are captured centrally in `GlobalExceptionHandler.java` and returned as `ErrorResponse` DTOs.
   * Frontend displays errors using `useToast().showError()`.

---

## 15. Important Constraints

* **Java Version:** JDK 25 required (Spring Boot 4.1.0 configured for `java.version=25`).
* **Database Credentials:** Loaded from environment variables (`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`) with defaults in `application.properties`.
* **Zero Entity Leakage:** REST endpoints must strictly return DTOs (`UserResponse`, `WorkEntryResponse`, `ProjectResponse`, etc.).
* **JWT Storage:** Client expects token key `work_report_token` and user key `work_report_user` in `localStorage`.
* **Stateless Backend:** Spring Security session creation policy is `SessionCreationPolicy.STATELESS`.

---

## 16. Common Task → Relevant Files

| Task | Start Here | Then Inspect |
|---|---|---|
| **Modify Login / Registration** | `work-report-frontend/src/pages/LoginPage.tsx` & `RegisterPage.tsx` | `src/auth/AuthProvider.tsx`, `src/api/authApi.ts`, `AuthController.java`, `UserService.java`, `SecurityConfig.java` |
| **Add / Edit Work Entry Fields** | `work-report-backend/.../entity/WorkEntry.java` | `WorkEntryRequest.java`, `WorkEntryResponse.java`, `WorkEntryService.java`, `WorkEntryController.java`, `src/types/index.ts`, `WorkEntriesPage.tsx` |
| **Modify Dashboard Metrics & Charts** | `work-report-frontend/src/pages/DashboardPage.tsx` | `src/components/dashboard/`, `src/api/dashboardApi.ts`, `DashboardController.java`, `DashboardService.java` |
| **Change Project CRUD or Scoping** | `work-report-frontend/src/pages/ProjectsPage.tsx` | `src/api/projectApi.ts`, `ProjectController.java`, `ProjectService.java`, `Project.java` |
| **Modify Document Export Formats** | `work-report-backend/.../service/ReportExportService.java` | `ReportController.java`, `ReportService.java`, `src/pages/ReportsPage.tsx` |
| **Update Admin / Team Management** | `work-report-frontend/src/pages/AdminUsersPage.tsx` & `AdminTeamsPage.tsx` | `src/api/adminApi.ts`, `src/api/teamApi.ts`, `AdminUserController.java`, `TeamController.java`, `UserService.java`, `TeamService.java` |
| **Update Security or Public Endpoints**| `work-report-backend/.../config/SecurityConfig.java` | `JwtAuthenticationFilter.java`, `JwtService.java` |
| **Adjust Dark Mode / UI Theme** | `work-report-frontend/src/context/ThemeContext.tsx` | `src/index.css`, `src/components/layout/Header.tsx`, `src/components/layout/Sidebar.tsx` |

---

## 17. Full Repository Scan Rules

### Default behavior
Future agents must:
1. Read `AGENTS.md` first.
2. Identify the affected feature/module.
3. Start with the files listed in the relevant section.
4. Trace only the necessary dependencies.
5. Avoid scanning unrelated directories.

### Full scan is allowed only when:
* `AGENTS.md` is clearly outdated.
* The requested change affects architecture across multiple modules.
* Dependencies cannot be determined from the context.
* A major refactor is requested.
* The user explicitly asks for a full codebase audit.

---

## 18. Context Maintenance Rules

Future agents should update `AGENTS.md` when a change materially affects:
* Project structure
* Important files
* Modules
* APIs
* Database structure
* Authentication
* Architecture
* Dependency relationships
* Major integrations

Do NOT update `AGENTS.md` for trivial implementation changes that do not affect repository structure or architecture.

---

## 19. Current Repository State

* **Backend:** Spring Boot 4.1.0 with Java 25 running on port 8080. Connected to PostgreSQL `work_report_db`. Fully active security, JWT authentication, RBAC, REST APIs, and document exporters.
* **Frontend:** React 19 + TypeScript + Vite 8 running on port 5173. Full dark mode support, Recharts analytics, role-guarded routes, smooth Lenis scrolling, and Motion transitions.
* **Integration:** REST communication verified and active between Frontend (`http://localhost:5173`) and Backend (`http://localhost:8080`).

---

## 20. Change Log

### Initial Context Build
- Created comprehensive repository context map in `AGENTS.md`.
