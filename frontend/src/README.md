# Frontend Code Organization

This document describes the organization of the frontend code.

## Directory Structure

```
src/
├── components/
│   ├── auth/           # Authentication-related components
│   │   └── LogoutButton.jsx
│   ├── context/        # Context and share code management
│   │   ├── CreateContext.jsx
│   │   ├── GenerateCode.jsx
│   │   └── RedeemCode.jsx
│   ├── dashboard/      # Dashboard-specific components
│   │   ├── DashboardHeader.jsx
│   │   └── NotificationPopover.jsx
│   ├── profile/        # Profile management components
│   │   └── CompanyProfileEditDialog.jsx
│   └── ui/            # Reusable UI components
│       ├── ActionDialog.jsx
│       ├── DataTable.jsx
│       ├── LoadingButton.jsx
│       └── index.js
├── hooks/             # Custom React hooks
├── pages/             # Page components (routed components)
├── routes/            # Routing configuration
├── utils/             # Utility functions
├── constants/         # Application constants
├── api.js            # API configuration
├── App.jsx           # Main app component
└── index.js          # App entry point
```

## Component Organization Guidelines

### 1. **Auth Components** (`components/auth/`)
Components related to user authentication and authorization.

### 2. **Context Components** (`components/context/`)
Components for managing contexts, share codes, and redemption functionality.

### 3. **Dashboard Components** (`components/dashboard/`)
Components specific to dashboard layouts and functionality.

### 4. **Profile Components** (`components/profile/`)
Components for user and company profile management.

### 5. **UI Components** (`components/ui/`)
Reusable, generic UI components that can be used across the application.

## Import Guidelines

- Always import UI components from the index file: `import { DataTable } from '../components/ui'`
- Import feature-specific components directly: `import LogoutButton from '../components/auth/LogoutButton'`
- Keep imports organized by type (external libraries, internal components, utilities)

## Adding New Components

1. Place the component in the appropriate feature directory
2. If it's a reusable UI component, add it to `components/ui/` and export it from `index.js`
3. Update this README if you create new categories