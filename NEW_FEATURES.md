# Symbio Project - New Features Documentation

## ✅ CHANGE 1: PDF Report Download

### What Changed
- Reports now download as **PDF files** instead of plain text files
- The `/api/files/:id/report` endpoint now generates professionally formatted PDF documents

### Implementation Details
- **Library Used**: `pdfkit`
- **File Created**: `backend/controllers/pdfController.js`
- **Modified**: `backend/server.js` (updated route to use PDF controller)

### How It Works
1. User clicks "Download Report" button
2. Backend generates a formatted PDF with:
   - Title and header
   - File information
   - Sequence metrics
   - Nucleotide composition
   - Biological interpretation
3. Browser downloads the file as `report-{filename}.pdf`

### Testing
1. Upload a FASTA file
2. Click "Download Report" on any sequence
3. Verify the downloaded file is a PDF (not .txt)

---

## ✅ CHANGE 2: Authentication System

### What Changed
- Added full user authentication with email/password and OAuth
- Users must sign in to access the application
- Supports Google, Microsoft, and GitHub OAuth login

### Implementation Details

#### Backend Files Created:
1. **`backend/database/User.js`** - User model schema
2. **`backend/controllers/authController.js`** - Authentication logic
3. **`backend/config/passport.js`** - OAuth configuration
4. **`backend/.env.example`** - Environment variables template

#### Backend Files Modified:
- **`backend/server.js`** - Added auth routes and middleware

#### Frontend Files Created:
1. **`frontend/src/components/AuthPage.jsx`** - Login/Signup UI

#### Frontend Files Modified:
- **`frontend/src/App.jsx`** - Added authentication state and conditional rendering

### Features Implemented

#### A) Email + Password Authentication
- **Sign Up**: Create new account with email and password
- **Sign In**: Login with existing credentials
- **Password Security**: Passwords hashed with bcrypt
- **JWT Tokens**: Stored in HTTP-only cookies (7-day expiration)

#### B) OAuth Authentication
- **Google OAuth**: Sign in with Google account
- **Microsoft OAuth**: Sign in with Microsoft account
- **GitHub OAuth**: Sign in with GitHub account

#### C) Session Management
- **Auto-login**: Users stay logged in for 7 days
- **Sign Out**: Clear session and redirect to login

### API Endpoints

#### Authentication Routes
```
POST   /auth/signup          - Create new account
POST   /auth/signin          - Login with email/password
POST   /auth/signout         - Logout
GET    /auth/me              - Get current user info

GET    /auth/google          - Initiate Google OAuth
GET    /auth/google/callback - Google OAuth callback

GET    /auth/github          - Initiate GitHub OAuth
GET    /auth/github/callback - GitHub OAuth callback

GET    /auth/microsoft          - Initiate Microsoft OAuth
GET    /auth/microsoft/callback - Microsoft OAuth callback
```

### Environment Variables

Add these to your `backend/.env` file:

```env
# Required
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your-secret-key-change-this-in-production
SESSION_SECRET=session-secret-change-this

# Optional - for OAuth (leave blank to disable)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
```

### Setting Up OAuth (Optional)

#### Google OAuth
1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Add authorized redirect URI: `http://localhost:3000/auth/google/callback`
6. Copy Client ID and Client Secret to `.env`

#### GitHub OAuth
1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Set Authorization callback URL: `http://localhost:3000/auth/github/callback`
4. Copy Client ID and Client Secret to `.env`

#### Microsoft OAuth
1. Go to https://portal.azure.com/
2. Navigate to "Azure Active Directory" → "App registrations"
3. Click "New registration"
4. Add redirect URI: `http://localhost:3000/auth/microsoft/callback`
5. Copy Application (client) ID and create a Client Secret
6. Add to `.env`

### Testing Authentication

#### Test Email/Password
1. Open http://localhost:5173/
2. You should see the login page
3. Click "Don't have an account? Sign Up"
4. Enter email, password, and name
5. Click "Sign Up"
6. You should be logged in and see the dashboard

#### Test OAuth (if configured)
1. Click "Google", "Microsoft", or "GitHub" button
2. Complete OAuth flow in popup/redirect
3. You should be logged in and redirected to dashboard

### Security Features
- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ JWT tokens in HTTP-only cookies (prevents XSS)
- ✅ 7-day token expiration
- ✅ Secure cookies in production (HTTPS only)
- ✅ Session secret for OAuth state management

---

## 🚀 Running the Application

### Install Dependencies
```bash
cd backend
npm install

cd ../frontend
npm install
```

### Start Servers
```bash
# Terminal 1 - Backend
cd backend
node server.js

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Access Application
- Frontend: http://localhost:5173/
- Backend API: http://localhost:3000/

---

## 📦 New Dependencies

### Backend
- `pdfkit` - PDF generation
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT token generation
- `cookie-parser` - Cookie parsing middleware
- `passport` - Authentication middleware
- `passport-google-oauth20` - Google OAuth strategy
- `passport-microsoft` - Microsoft OAuth strategy
- `passport-github2` - GitHub OAuth strategy
- `express-session` - Session management

### Frontend
- No new dependencies (uses existing React)

---

## ⚠️ Important Notes

### What Was NOT Changed
- ✅ Existing FASTA upload logic - unchanged
- ✅ ORF detection logic - unchanged
- ✅ Dashboard and charts - unchanged
- ✅ Report generation logic - unchanged (only output format changed to PDF)
- ✅ Database schema for sequences - unchanged
- ✅ Soft-delete functionality - unchanged
- ✅ UI styling and theme - unchanged

### What WAS Changed
- ✅ Report download now generates PDF instead of .txt
- ✅ Added authentication system (optional - can be disabled)
- ✅ Added login page (shown only when not authenticated)

---

## 🔧 Troubleshooting

### PDF Download Issues
- Ensure `pdfkit` is installed: `npm install pdfkit`
- Check backend console for errors
- Verify `/api/files/:id/report` endpoint is accessible

### Authentication Issues
- Ensure all auth packages are installed
- Check `.env` file has `JWT_SECRET` and `SESSION_SECRET`
- For OAuth: Verify client IDs and secrets are correct
- Check MongoDB connection is working

### OAuth Not Working
- OAuth providers are **optional**
- If you don't configure OAuth, the buttons will still appear but won't work
- To hide OAuth buttons, you can modify `AuthPage.jsx`
- Email/password authentication works without OAuth configuration

---

## 📝 Summary

Both features have been successfully implemented:

1. **PDF Reports**: Download button now generates professional PDF documents
2. **Authentication**: Full login system with email/password + OAuth (Google, Microsoft, GitHub)

All existing functionality remains unchanged. The application works exactly as before, with these two additions.
