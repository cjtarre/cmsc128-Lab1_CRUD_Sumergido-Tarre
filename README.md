# Takda

Takda is a web-based task management application developed for **CMSC 128 – Software Engineering**. It helps students organize schoolwork, deadlines, and everyday tasks through task management, filtering, sorting, calendar views, and user accounts.

The application uses a React frontend, an Express backend, and Supabase PostgreSQL for persistent data storage.

---

## Features

### Task Management
* Add tasks with:
  * Title
  * Description
  * Due date and time
  * Priority
  * Tags
* View all tasks
* Edit tasks
* Delete tasks with confirmation
* Undo recently deleted tasks
* Mark tasks as completed
* Change task status
* Search tasks
* Filter tasks by category, status, priority, and tag
* Sort tasks by title, priority, due date, and date added
* Calendar view
* Pagination
* Persistent task data
* Completed tasks remain visible and are visually distinguished

### Authentication
* User registration
* User login
* Password visibility controls
* Password confirmation during registration
* Form validation and error feedback
* Session persistence across page refreshes
* Protected application routes
* Logout with confirmation
* Profile page
* Account information display
* Update username
* Change email address (with confirmation)
* Change password
* Forgot password / password recovery via email
* Privacy Policy

### Notifications
* View task-related notifications
* Display task activity and relevant reminders through the Notifications page

### Appearance
* Light and dark themes
* Persistent theme preference
* Responsive layouts for desktop, tablet, and mobile devices
* Desktop sidebar navigation
* Mobile bottom navigation

---

## Tech Stack

### Frontend

* **React** – builds the user interface using reusable components
* **Vite** – development server and build tool
* **Tailwind CSS** – provides utility classes for styling
* **@tailwindcss/vite** – integrates Tailwind CSS with Vite
* **React Router** – handles application routing
* **Axios** – communicates with the backend API
* **Lucide React** – provides interface icons
* **Sonner** – provides toast notifications and user feedback

### Backend

* **Node.js** – JavaScript runtime
* **Express.js** – handles API routes and HTTP requests
* **CORS** – allows communication between the frontend and backend
* **dotenv** – loads environment variables from `.env`

### Database

* **Supabase / PostgreSQL** – provides persistent data storage

---

## Project Architecture
Takda follows a frontend-backend architecture where the React frontend communicates with the Express backend through REST API endpoints. The backend handles application logic and communicates with Supabase for persistent data storage and authentication.

```mermaid
flowchart TD
    A[User] --> B[React Frontend]

    B --> C[Pages / Components]
    C --> D[Task Handlers]

    D --> E[Task Context]
    E --> F[Task Services]

    F -->|HTTP Requests| G[Express Backend]

    G --> H[Routes]
    H --> I[Controllers]

    I --> J[Supabase]
    J --> K[(PostgreSQL Database)]

    B --> L[Auth Context] 
    L --> M[Auth Service] 
    M --> G

    K --> N[tasks] 
    K --> O[tags] 
    K --> P[task_tag]
```

### CRUD Data Flow
```text
User
 ↓
React Component
 ↓
Task Handler
 ↓
Task Context / useTasks
 ↓
taskService.js
 ↓
Express Route
 ↓
Controller
 ↓
Supabase
 ↓
PostgreSQL Database
```

### Authentication Data Flow
```text
User
  ↓
Login / Signup
  ↓
React Auth Context
  ↓
authService.js
  ↓
Express Authentication Route
  ↓
Supabase Authentication
  ↓
Authentication Session
  ↓
Authenticated Use
```

The backend uses two Supabase clients depending on the operation:

* **Anon-key client** (`config/supabaseClient.js`) — used for anything acting *as* a specific user (login, session refresh, logout, email/password changes). These respect Row Level Security.
* **Service-role client** (`config/supabaseAdmin.js`) — used for task/tag writes and profile updates, where `requireAuth` has already verified identity and the controller enforces ownership in code (`req.user.id`) rather than relying on RLS.

---

## Project Structure

```text
cmsc128-Lab1_CRUD_Sumergido-Tarre/

│
├── backend/
│   ├── config/
│   │   ├── supabaseClient.js
│   │   └── supabaseAdmin.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── taskController.js
│   │   ├── tagController.js
│   │   └── userController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── taskRoutes.js
│   │   ├── tagRoutes.js
│   │   └── userRoutes.js
│   ├── app.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── calendar/
│   │   │   ├── notifications/
│   │   │   ├── profile/
│   │   │   └── tasks/
│   │   │
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   └── shared/
│   │       ├── components/
│   │       ├── constants/
│   │       ├── context/
│   │       ├── services/
│   │       └── utils/
│   │
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   ├── main.jsx
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore
├── README.md
└── package.json
```

---

## Installation

### Preliminary

Create a `.env` file in `/backend`:

```env
PORT=5000
FRONTEND_URL=http://localhost:5173

SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

* `SUPABASE_ANON_KEY` (or `SUPABASE_KEY`) — public-safe key; required for the backend to authenticate as a user and fetch data.
* `SUPABASE_SERVICE_ROLE_KEY` — required for task/tag writes and profile updates, which bypass Row Level Security. **Never expose this key to the frontend or commit it to version control.**
* `FRONTEND_URL` — used to build the password-reset link emailed by Supabase.

Do not commit the actual `.env` file or expose your credentials.

#### Supabase Dashboard configuration

Two settings must also be configured directly in the Supabase Dashboard:

* **Authentication → URL Configuration → Redirect URLs** — add `<FRONTEND_URL>/reset-password` and `<FRONTEND_URL>/verify-email`, or redirect links will be rejected.
* **Authentication → Providers → Email → "Secure email change"** — controls whether an email change requires confirmation from both the old and new address, or just the new one.

### 1. Install Dependencies

Run `npm install` in both the `/backend` and `/frontend` directories.

#### Backend Dependencies

* `express`: handles application routing and HTTP requests
* `cors`: allows communication between the frontend and backend
* `dotenv`: loads environment variables from `.env` into `process.env`
* `@supabase/supabase-js`: official JavaScript client library for Supabase

#### Frontend Dependencies

* `react`: builds the user interface
* `react-router-dom`: handles application routing
* `axios`: sends HTTP requests to the backend API
* `tailwindcss`: provides utility classes for styling
* `@tailwindcss/vite`: integrates Tailwind CSS with Vite
* `lucide-react`: provides interface icons
* `sonner`: provides toast notifications
* `vite`: provides the development server and build tools

### 2. Start the Backend Server

From the `/backend` directory:

```bash
node app.js
```

or:

```bash
npm start
```

The backend runs on:

```text
http://localhost:5000
```

There is no `nodemon` configured — the server does not reload automatically on code or `.env` changes and must be restarted manually.

### 3. Start the Frontend

From the `/frontend` directory:

```bash
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

Open the frontend URL in a browser to use Takda.

---

## API Endpoints

### Auth (`/api/auth`)

| Method | Endpoint | Auth | Description |
| ------ | -------- | ---- | ----------- |
| `POST` | `/api/auth/signup` | — | Register a new account (`email`, `password`, optional `username`) |
| `POST` | `/api/auth/login` | — | Log in and receive a session |
| `POST` | `/api/auth/logout` | — | Invalidate the current session |
| `POST` | `/api/auth/refresh` | — | Refresh an expired access token |
| `GET` | `/api/auth/me` | Required | Retrieve the current authenticated user |
| `POST` | `/api/auth/forgot-password` | — | Send a password reset email |
| `POST` | `/api/auth/reset-password` | — | Complete a password reset using the tokens from the reset email |

### Tasks (`/api/tasks`)

| Method   | Endpoint              | Auth | Description        |
| -------- | ---------------------- | ---- | ------------------ |
| `GET`    | `/api/tasks`            | Required | Retrieve all tasks for the current user |
| `POST`   | `/api/tasks`            | Required | Create a task      |
| `PUT`    | `/api/tasks/:task_id`   | Required | Update a task      |
| `DELETE` | `/api/tasks/:task_id`   | Required | Soft-delete a task |
| `PATCH`  | `/api/tasks/:task_id/restore` | Required | Restore a soft-deleted task |

### Tags (`/api/tags`)

| Method | Endpoint    | Auth | Description             |
| ------ | ----------- | ---- | ------------------------ |
| `GET`  | `/api/tags` | Required | Retrieve available tags |

### User (`/api/user`)

| Method | Endpoint | Auth | Description |
| ------ | -------- | ---- | ----------- |
| `PATCH` | `/api/user/me` | Required | Update display name and/or username |
| `PATCH` | `/api/user/me/email` | Required | Change email address (sends confirmation) |
| `PATCH` | `/api/user/me/password` | Required | Change password |

---

## Database Schema / ERD

The database is hosted in Supabase and consists of three main tables:

* **`tasks`** – stores task information
* **`tags`** – stores available tags
* **`task_tag`** – connects tasks and tags

The `task_tag` table manages the **many-to-many relationship** between tasks and tags.
![A relational schema hosted in Supabase managing a many-to-many (M-M) relationship between tasks and tags.](database_erd.png)

### Main Task Fields

| Field            | Description             |
| ---------------- | ----------------------- |
| `task_id`        | Unique task identifier  |
| `task_name`      | Task title              |
| `task_info`      | Task description        |
| `priority_level` | Task priority           |
| `user_id`        | UUID that owns the task |
| `status`         | Current task status     |
| `due_date`       | Task due date and time  |
| `created_at`     | Task creation timestamp |
| `deleted_at`     | Soft-delete timestamp; `null` when the task is active |

---

## CRUD Operations

| Operation  | Description                                    |
| ---------- | ---------------------------------------------- |
| **Create** | Adds a new entity entry to the database        |
| **Read**   | Retrieves and displays requested entity info   |
| **Update** | Modifies an existing entity in database        |
| **Delete** | Soft-deletes a task after confirmation, with the option to restore it |

All CRUD operations communicate with the Express backend and Supabase database.

---
---
## Authentication
Takda provides account authentication and account management through the backend and Supabase authentication services.

### Registration
Users can create an account through the registration interface. The registration form includes password confirmation and validation feedback.

### Login
Users can log in using their account credentials. Successful authentication creates a session that is used to access protected application features.

### Session Persistence
Takda uses a client-side, token-based session persistence. Doesn't use cookies and instead uses tokens generated upon user login, and saved in the device's `localStorage`. Validated and refreshed against the backend as needed and repopulates `user` state. Invalid/expired tokens will treat it as a logout, clearing both tokens from `localStorage` and revokes the session on the backend side. 

### Protected Routes
Authenticated application pages are protected through ProtectedRoute. Users without an authenticated session are redirected to the login page.

Protected pages include:
- Dashboard
- Calendar
- Notifications
- Profile
- Settings

### Logout
Users can log out through:

* Desktop navigation
* Profile menu
* Profile page

Each logout action uses a confirmation dialog before invalidating the session and returning the user to the public landing page.
Passwords are not stored as plaintext by the application.

### Profile Management
Users can update their display name and username from the Profile page. Changes are saved to the user's account metadata.

### Email and Password Changes
Users can change their email address and password from account settings. Changing an email address triggers a confirmation step handled by Supabase before the change takes effect.

### Forgot Password
Users who cannot log in can request a password reset email from the login page. The email contains a link that allows the user to set a new password without needing their old one.

---

## Expanded Features

### Lab 1 - Task Organization
Tasks can be searched, filtered by category, status, priority, and tag, and sorted by title, priority, due date, or date added. The Calendar View organizes tasks by due date, while the Undo option allows recently deleted tasks to be restored.

### Lab 2 - Task Organization

---

## Data Persistence
Task data is stored in the Supabase PostgreSQL database rather than only in the browser. This allows task data to remain available after refreshing the page or restarting the frontend and backend servers.

---

## Screenshots

### Dashboard

![Takda Dashboard](screenshots/dashboard.png)

![Takda Dashboard Empty State](screenshots/dashboard-empty-state.png)

### Add Task
![Add Task](screenshots/add-task.png)

### Edit Task
![Edit Task](screenshots/edit-task.png)

### Delete Confirmation
![Delete Confirmation](screenshots/delete-confirmation.png)

### Undo Delete
![Undo Delete](screenshots/undo-delete.png)

### Task Retrieval Update
![Task Retrieval Update](screenshots/task-retrieval-update.png)

### Calendar View
![Calendar Widget](screenshots/calendar-widget.png)
![Calendar View](screenshots/calendar-view.png)

---

## HCI Considerations

Takda applies basic HCI principles through:

* Clear labels for task fields and actions
* Consistent navigation and layout
* Visual distinction between task statuses
* Toast notifications for user feedback
* Confirmation before destructive actions
* Search, filtering, sorting, and pagination
* Calendar-based task organization
* Password visibility controls
* Form validation and error feedback
* Responsive layouts for different screen sizes

---

## Contributors

* **Gabrielle Sumergido**
* **Ma. Christie Jude Tarre**

---

## Course Information

**CMSC 128 – Software Engineering**
**University of the Philippines Visayas**
**1st Semester, AY 2026–2027**
