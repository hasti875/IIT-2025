# OneFlow - Plan to Bill in One Place

A complete project management and billing platform built for the hackathon MVP.

## 🚀 Features

- **User Authentication**: JWT-based auth with role-based access control
- **Project Management**: Create and track projects with budgets, timelines, and progress
- **Task Management**: Assign and track tasks with status updates
- **Financial Tracking**: 
  - Sales Orders (revenue)
  - Purchase Orders (costs)
  - Expenses
  - Auto-calculated profit metrics
- **Dashboard Analytics**: KPIs and charts showing project performance
- **Responsive Design**: Works on desktop and mobile

## 🛠️ Tech Stack

### Backend
- Node.js + Express
- PostgreSQL + Sequelize ORM
- JWT Authentication
- RESTful API

### Frontend
- React 18
- Tailwind CSS
- React Router
- Recharts for analytics
- Axios for API calls

## 📦 Installation

### Prerequisites
- Node.js (v16+)
- PostgreSQL (v12+)
- npm or yarn

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```env
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

4. Create PostgreSQL database:
```bash
psql -U postgres
CREATE DATABASE oneflow_db;
\q
```

5. Start the backend server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## 🎯 Usage Flow

1. **Sign Up** → Create account with role (Admin, ProjectManager, Finance, TeamMember)
2. **Login** → Access dashboard
3. **Create Project** → Set budget, dates, and details
4. **Add Tasks** → Assign team members and track progress
5. **Add Finance** → Record sales orders, purchases, and expenses
6. **View Dashboard** → See profit analysis and charts

## 🔑 User Roles

- **Admin**: Full access to all features
- **ProjectManager**: Can create/manage projects and tasks
- **Finance**: Can manage financial records
- **TeamMember**: Can view and update assigned tasks

## 📊 API Endpoints

### Authentication
- POST `/api/auth/signup` - Register user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user

### Projects
- GET `/api/projects` - Get all projects
- POST `/api/projects` - Create project
- GET `/api/projects/:id` - Get project details
- PUT `/api/projects/:id` - Update project
- DELETE `/api/projects/:id` - Delete project

### Tasks
- GET `/api/tasks` - Get all tasks
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

## 🏗️ Project Structure

```
Oneflow/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Auth & error middleware
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
│
└── frontend/
    ├── src/
    │   ├── components/  # Reusable components
    │   ├── context/     # React context (Auth)
    │   ├── pages/       # Page components
    │   ├── services/    # API services
    │   ├── App.jsx      # Main app component
    │   └── main.jsx     # Entry point
    └── index.html
```

## 🎨 Design Philosophy

- **MVC Pattern**: Clean separation of concerns
- **RESTful API**: Standard HTTP methods and status codes
- **Component-Based UI**: Reusable React components
- **Responsive Design**: Mobile-first approach
- **User Experience**: Intuitive navigation and feedback

## 📝 License

MIT License - feel free to use for your hackathon or projects!

## 👥 Contributing

This is a hackathon MVP. Contributions welcome!

---

Built with ❤️ for the 24-hour hackathon challenge
