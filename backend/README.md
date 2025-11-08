# OneFlow Backend API

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file with:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=oneflow_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
```

### 3. Create PostgreSQL Database
```bash
psql -U postgres
CREATE DATABASE oneflow_db;
\q
```

### 4. Run Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- POST `/api/auth/signup` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user (Protected)

### Projects
- GET `/api/projects` - Get all projects
- GET `/api/projects/:id` - Get project details
- POST `/api/projects` - Create project (PM/Admin)
- PUT `/api/projects/:id` - Update project (PM/Admin)
- DELETE `/api/projects/:id` - Delete project (Admin)

### Tasks
- GET `/api/tasks` - Get all tasks
- GET `/api/tasks/:id` - Get task details
- POST `/api/tasks` - Create task
- PUT `/api/tasks/:id` - Update task
- DELETE `/api/tasks/:id` - Delete task

### Finance
- GET `/api/finance/salesorders` - Get sales orders
- POST `/api/finance/salesorders` - Create sales order
- GET `/api/finance/purchaseorders` - Get purchase orders
- POST `/api/finance/purchaseorders` - Create purchase order
- GET `/api/finance/expenses` - Get expenses
- POST `/api/finance/expenses` - Create expense

### Dashboard
- GET `/api/dashboard` - Get analytics summary

## Database Models

- **User** - Authentication and user management
- **Project** - Project tracking
- **Task** - Task management
- **SalesOrder** - Revenue tracking
- **PurchaseOrder** - Purchase tracking
- **Expense** - Expense tracking
