# Takda Frontend

The frontend of **Takda** is built with **React and Vite**. It provides the user interface for task management, authentication, account management, and other client-side features of the application.

Vite is used as the frontend development and build tool, while React is used to build the application's components and user interface.

## Frontend Technologies

- React
- Vite
- React Router
- Tailwind CSS
- Lucide React
- Sonner
- ESLint
- Vitest
- React Testing Library

## Features

The frontend currently supports:

- User registration, login, and logout
- Persistent authentication sessions
- Protected application routes
- Password recovery and reset
- Profile and account updates
- Signup and form validation
- Task creation, viewing, editing, and deletion
- Task status updates and filtering
- Task organization using tags
- Dashboard and calendar views
- Responsive layouts
- Light and dark themes
- Loading, success, error, and confirmation feedback

The authentication forms also preserve appropriate non-sensitive information when moving between related authentication pages. Signup display name and email progress may be retained for the current browser session, while passwords and password confirmations are not stored in session storage.

## Installation

Install the frontend dependencies from the `frontend` directory:

```bash
npm install
```

## Development

Start the Vite development server:

```bash
npm run dev
```

By default, the frontend is available at:

```text
http://localhost:5173/
```

Features that communicate with the API require the Takda backend to be running as well.

## Testing

Run the frontend test suite:

```bash
npm test
```

The frontend tests cover authentication behavior, protected routing, services, hooks, task handlers, utilities, and form validation.

## ESLint

The project uses ESLint to check the frontend source code.

Run ESLint with:

```bash
npm run lint
```

## Production Build

Create a production build with:

```bash
npm run build
```

Vite generates the production files in the `dist/` directory.

## Project Structure

```text
frontend/
├── src/
│   ├── features/
│   │   ├── auth/
│   │   └── tasks/
│   ├── layouts/
│   ├── pages/
│   └── shared/
├── tests/
├── package.json
└── vite.config.js
```

The frontend is organized by application features, with shared components and utilities separated from feature-specific functionality.

## React + Vite

Takda uses the React + Vite setup for frontend development. Vite provides the development server, Hot Module Replacement (HMR), and production build process used by the project.

## ESLint Configuration

ESLint is configured for the current JavaScript and React codebase. The configuration is maintained as part of the frontend project and can be checked using the lint command described above.

Any future changes to the linting configuration should remain consistent with the technologies and source files actually used by Takda.
