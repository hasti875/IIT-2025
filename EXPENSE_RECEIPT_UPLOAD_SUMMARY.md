# Expense Receipt Upload Feature - Implementation Summary

## Overview
Implemented file upload functionality for expense receipts/bills, allowing users to attach photos or PDFs when creating expenses, and enabling admins to view these uploaded receipts.

## Features Implemented

### 1. Backend Infrastructure
- **Multer Configuration** (`backend/middleware/upload.js`)
  - Configured disk storage with unique filenames using timestamps
  - File filter to accept only images (jpg, jpeg, png, gif, webp) and PDFs
  - 5MB file size limit
  - Storage path: `backend/uploads/receipts/`

- **Static File Serving** (`backend/app.js`)
  - Added Express static middleware to serve uploaded files
  - Route: `/uploads` → serves from `backend/uploads/` directory
  - Allows direct access to uploaded receipt files

- **Controller Updates** (`backend/controllers/expenseController.js`)
  - Modified `createExpense` to handle file uploads
  - Saves receipt file path to database: `/uploads/receipts/${filename}`
  - Maintains backward compatibility (receipt field is optional)

- **Route Updates** (`backend/routes/financeRoutes.js`)
  - Added `upload.single('receipt')` middleware to POST `/expenses` route
  - Handles multipart/form-data requests

### 2. Frontend Implementation

#### Expense Submission Form (`frontend/src/pages/Expenses.jsx`)
- **File Upload Input**
  - Added file input field in expense creation modal
  - Accepts images and PDFs
  - Shows selected file name and size
  - Displays helper text about 5MB limit

- **Form Submission**
  - Converts expense data to FormData instead of JSON
  - Includes receipt file when selected
  - Clears file selection after successful submission

#### Receipt Display
- **Table Column**
  - Added "Receipt" column to expense table
  - Shows "View" button with image icon if receipt exists
  - Shows "No receipt" placeholder if not uploaded

- **Receipt Viewer Modal**
  - Full-screen modal to view receipts
  - Supports both images and PDFs
  - Images: displayed with max-height constraint
  - PDFs: embedded using iframe
  - Close button to dismiss modal

#### Service Updates (`frontend/src/services/index.js`)
- Modified `createExpense` to detect FormData
- Sets proper Content-Type header for multipart uploads
- Maintains backward compatibility with JSON requests

## File Structure
```
backend/
├── uploads/
│   └── receipts/          # Storage for uploaded receipts
├── middleware/
│   └── upload.js          # Multer configuration
├── controllers/
│   └── expenseController.js  # Handles receipt file path
└── routes/
    └── financeRoutes.js   # Upload middleware integration

frontend/
└── src/
    ├── pages/
    │   └── Expenses.jsx   # UI for upload and viewing
    └── services/
        └── index.js       # FormData handling
```

## Usage Flow

### Creating Expense with Receipt
1. User clicks "Submit Expense" button
2. Fills expense details (category, amount, date, project, description)
3. Optionally uploads receipt file (image or PDF)
4. File name and size displayed for confirmation
5. Clicks "Submit" - data sent as multipart/form-data
6. Backend saves file to `uploads/receipts/` directory
7. File path stored in database

### Viewing Receipts
1. Expense table shows "View" button for entries with receipts
2. Clicking "View" opens modal with full receipt
3. Images displayed with zoom capability
4. PDFs embedded in iframe for viewing
5. Click close icon or outside modal to dismiss

## Technical Details

### File Storage
- Location: `backend/uploads/receipts/`
- Naming: `receipt-{timestamp}-{random}.{extension}`
- Example: `receipt-1699478400000-abc123.jpg`

### Database Field
- Column: `receipt` (TEXT)
- Format: `/uploads/receipts/filename.ext`
- Nullable: Yes (backward compatible)

### Security Considerations
- File type validation (images and PDFs only)
- Size limit enforcement (5MB max)
- Unique filenames prevent overwrites
- Static serving limited to uploads directory

### Browser Compatibility
- FormData API (supported in all modern browsers)
- File input type (universal support)
- PDF embedding via iframe (standard HTML)

## Testing Checklist

✅ Create expense without receipt (backward compatibility)
✅ Create expense with image receipt
✅ Create expense with PDF receipt
✅ File size validation (reject >5MB)
✅ File type validation (reject non-image/PDF)
✅ View image receipt in modal
✅ View PDF receipt in modal
✅ Receipt column displays correctly
✅ Receipt accessible via direct URL

## Dependencies Added
- **Backend**: `multer@^1.4.5-lts.1` (file upload middleware)
- **Frontend**: None (uses native FormData and File APIs)

## Future Enhancements
- Multiple receipt uploads per expense
- Receipt thumbnail previews in table
- Download receipt button in viewer modal
- Receipt deletion/replacement functionality
- Image compression before upload
- Cloud storage integration (S3, Azure Blob, etc.)
