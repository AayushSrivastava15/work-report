# 📊 Work Report Management System

A full-stack enterprise web application designed to track, manage, filter, and analyze daily work entries across various projects with interactive analytics dashboards.

Repository: [https://github.com/AayushSrivastava15/work-report](https://github.com/AayushSrivastava15/work-report)

---

## 🚀 Tech Stack

### **Backend**
* **Language & Framework:** Java 25, Spring Boot 4.1.0
* **Persistence & Database:** Spring Data JPA, Hibernate, PostgreSQL
* **Validation:** Jakarta Bean Validation (`@NotNull`, `@NotBlank`, `@Valid`)
* **Architecture:** Controller → Service → Repository → PostgreSQL (Strict DTO-based architecture, zero entity leakage, no Lombok)
* **Build Tool:** Maven Wrapper (`mvnw`)

### **Frontend**
* **Framework:** React 19, TypeScript
* **Build Tool:** Vite 8
* **Routing:** React Router v7 (`react-router-dom`)
* **Styling:** Tailwind CSS v4
* **Charts & Analytics:** Recharts
* **Icons:** Lucide React

---

## ✨ Features

### 1. 📈 Interactive Analytics Dashboard
* **Summary Metrics:** Total work entries count, total projects count, current calendar month entries, and current week activity (dynamic Monday–Sunday range).
* **Visual Charts:**
  * **Work by Project:** Bar Chart grouping total work entries by project.
  * **Work by Category:** Pie Chart highlighting development vs testing vs bug fixes.
  * **Work by Technology:** Horizontal Bar Chart representing technical skill distribution.
  * **Work by Status:** Donut Chart with status distribution (Completed, In Progress, Pending).
* **Current Week Activity:** Dynamic Monday–Sunday table listing.

### 2. 🗂️ Project Management (CRUD)
* Create, list, edit, and delete projects for each user.
* Full relationship validation and confirmation safeguards on deletions.

### 3. 📝 Work Entry Management (CRUD)
* Record daily work entries categorized by date, project, title, description, category, technology stack, and status.
* Edit and delete work records with real-time UI updates.

### 4. 🔍 Keyword Search & Advanced Filtering
* **Live Keyword Search:** Instant search across title, description, category, and technology.
* **Multi-Criteria Filter Drawer:**
  * Date range filter (`startDate` to `endDate`) with automatic validation (`startDate <= endDate`).
  * User + Date Range filter.
  * Project + Date Range filter.
  * User + Project + Date Range filter.
  * Case-insensitive Category, Technology, and Status filtering.

### 5. 🛡️ User Data Isolation
* All statistics, projects, and work entries are isolated strictly per user at the database query level.

---

## 🏛️ System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                 React 19 + Vite Frontend                    │
│            (Dashboard, Projects, Work Entries)              │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST APIs (JSON / DTOs)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Spring Boot Backend                       │
│  Controller  ──►  Service Layer  ──►  Spring Data JPA Repo   │
└──────────────────────────────┬──────────────────────────────┘
                               │ SQL Queries & Aggregations
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                      │
│            (users, projects, work_entries)                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔌 REST API Reference

### 👤 User APIs
| Method | Endpoint | Description | Status |
|---|---|---|---|
| `POST` | `/api/users` | Create user | `201 Created` |
| `GET` | `/api/users` | Get all users | `200 OK` |
| `GET` | `/api/users/{id}` | Get user by ID | `200 OK` / `404 Not Found` |

### 📁 Project APIs
| Method | Endpoint | Description | Status |
|---|---|---|---|
| `POST` | `/api/projects/user/{userId}` | Create project for user | `201 Created` |
| `GET` | `/api/projects/user/{userId}` | Get user's projects | `200 OK` |
| `GET` | `/api/projects/{id}` | Get project by ID | `200 OK` / `404 Not Found` |
| `PUT` | `/api/projects/{id}` | Update project | `200 OK` |
| `DELETE` | `/api/projects/{id}` | Delete project | `204 No Content` |

### 📝 Work Entry APIs
| Method | Endpoint | Description | Status |
|---|---|---|---|
| `POST` | `/api/work-entries/user/{userId}/project/{projectId}` | Record work entry | `201 Created` |
| `GET` | `/api/work-entries/user/{userId}` | Get user's work history (date desc) | `200 OK` |
| `GET` | `/api/work-entries/{id}` | Get work entry by ID | `200 OK` / `404 Not Found` |
| `PUT` | `/api/work-entries/{id}` | Update work entry | `200 OK` |
| `DELETE` | `/api/work-entries/{id}` | Delete work entry | `204 No Content` |
| `GET` | `/api/work-entries/search?keyword={keyword}` | Keyword search | `200 OK` |
| `GET` | `/api/work-entries/filter?startDate=...&endDate=...` | Date range filter | `200 OK` / `400 Bad Request` |
| `GET` | `/api/work-entries/filter/user/{userId}?startDate=...&endDate=...` | User + Date filter | `200 OK` / `404 Not Found` |
| `GET` | `/api/work-entries/filter/project/{projectId}?startDate=...&endDate=...` | Project + Date filter | `200 OK` / `404 Not Found` |
| `GET` | `/api/work-entries/filter/user/{userId}/project/{projectId}?startDate=...&endDate=...` | User + Project + Date filter | `200 OK` / `404 Not Found` |
| `GET` | `/api/work-entries/filter/category/{category}` | Category filter | `200 OK` |
| `GET` | `/api/work-entries/filter/technology/{technology}` | Technology filter | `200 OK` |
| `GET` | `/api/work-entries/filter/status/{status}` | Status filter | `200 OK` |

### 📊 Dashboard APIs
| Method | Endpoint | Description | Status |
|---|---|---|---|
| `GET` | `/api/dashboard/user/{userId}/work-count` | Total work count | `200 OK` |
| `GET` | `/api/dashboard/user/{userId}/project-count` | Total project count | `200 OK` |
| `GET` | `/api/dashboard/user/{userId}/current-month` | Current calendar month work entries | `200 OK` |
| `GET` | `/api/dashboard/user/{userId}/current-week` | Current week work entries (Mon–Sun) | `200 OK` |
| `GET` | `/api/dashboard/user/{userId}/projects` | Work count grouped by project | `200 OK` |
| `GET` | `/api/dashboard/user/{userId}/categories` | Work count grouped by category | `200 OK` |
| `GET` | `/api/dashboard/user/{userId}/technologies` | Work count grouped by technology | `200 OK` |
| `GET` | `/api/dashboard/user/{userId}/status` | Work count grouped by status | `200 OK` |

---

## 🛠️ Getting Started

### **Prerequisites**
* **Java:** JDK 17 or 25+
* **Database:** PostgreSQL (created database `work_report_db`)
* **Node.js:** Node 18+ and npm

---

### **1. Backend Setup**

1. Clone repository:
   ```bash
   git clone https://github.com/AayushSrivastava15/work-report.git
   cd work-report/work-report-backend
   ```

2. Configure environment variables:
   Copy `.env.example` to `.env` or configure database credentials in `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=${DB_URL:jdbc:postgresql://localhost:5432/work_report_db}
   spring.datasource.username=${DB_USERNAME:postgres}
   spring.datasource.password=${DB_PASSWORD:YourPostgresPassword}
   spring.jpa.hibernate.ddl-auto=update
   ```

3. Run the Spring Boot application:
   ```bash
   # Windows
   .\mvnw.cmd spring-boot:run

   # Linux/macOS
   ./mvnw spring-boot:run
   ```
   *Backend starts at `http://localhost:8080`*

---

### **2. Frontend Setup**

1. Open a new terminal in the `work-report-frontend` directory:
   ```bash
   cd work-report/work-report-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start Vite development server:
   ```bash
   npm run dev
   ```
   *Frontend starts at `http://localhost:5173`*

---

## 📂 Project Structure

```text
work-report/
├── README.md
├── .gitignore
├── work-report-backend/
│   ├── src/main/java/work_report_backend/
│   │   ├── controller/         # REST Controllers (Dashboard, Project, User, WorkEntry)
│   │   ├── dto/                # Request & Response DTOs
│   │   ├── entity/             # JPA Entities (User, Project, WorkEntry)
│   │   ├── exception/          # GlobalExceptionHandler & Custom Exceptions
│   │   ├── repository/         # Spring Data JPA Repositories
│   │   └── service/            # Business logic & validations
│   ├── src/main/resources/     # application.properties
│   └── pom.xml
│
└── work-report-frontend/
    ├── src/
    │   ├── api/                # Centralized API service modules
    │   ├── components/         # Reusable UI components & Layouts
    │   ├── context/            # UserContext (user management & switching)
    │   ├── pages/              # DashboardPage, ProjectsPage, WorkEntriesPage
    │   ├── types/              # TypeScript DTO interfaces
    │   ├── App.tsx             # Route configurations
    │   └── main.tsx
    ├── package.json
    └── vite.config.ts
```

---

## 📜 License
This project is licensed under the MIT License.
