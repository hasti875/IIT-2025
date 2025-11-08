# OneFlow - Quick Start Guide

## Prerequisites Check
- [ ] Node.js installed (v16+): Run `node --version`
- [ ] PostgreSQL installed: Run `psql --version`
- [ ] PostgreSQL running

## Step 1: Database Setup

```powershell
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE oneflow_db;

# Exit PostgreSQL
\q
```

## Step 2: Backend Setup

```powershell
# Navigate to backend
cd backend

# Install dependencies
npm install

# Update .env file with your PostgreSQL password
# Edit backend\.env and set DB_PASSWORD to your postgres password

# Start backend server
npm run dev
```

Backend should start on http://localhost:5000

## Step 3: Frontend Setup (New Terminal)

```powershell
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start frontend
npm run dev
```

Frontend should start on http://localhost:3000

## Step 4: Test the Application

1. Open browser to http://localhost:3000
2. Click "Sign up here"
3. Create account with role "ProjectManager"
4. Login with credentials
5. Create a new project
6. Add tasks to the project
7. Go to Finance and add sales order/expense
8. View Dashboard to see analytics

## Troubleshooting

### Backend won't start?
- Check PostgreSQL is running
- Verify database credentials in `backend/.env`
- Check port 5000 is not in use

### Frontend won't start?
- Check backend is running first
- Verify port 3000 is not in use
- Clear node_modules and reinstall: `rm -r node_modules; npm install`

### Database connection error?
- Ensure PostgreSQL is running
- Check DB_PASSWORD in .env matches your postgres password
- Verify database 'oneflow_db' exists

## Default Test User
After signup, use your own credentials. The app uses JWT authentication.

## API Documentation
Once backend is running, test endpoints:
- Health check: http://localhost:5000/health
- API base: http://localhost:5000/api

Enjoy building with OneFlow! 🚀
