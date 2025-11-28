# Frontend-Backend Connection Guide

## Quick Setup Checklist

### ✅ Step 1: Database Setup

1. **Create database:**
   ```bash
   mysql -u root -p < database.sql
   ```

2. **Verify database:**
   ```bash
   mysql -u root -p -e "USE badminton_store; SHOW TABLES;"
   ```

### ✅ Step 2: Create Admin User

```bash
cd backend
node createadmin.js admin password123 admin@example.com
```

**Important:** Replace with your own credentials!

### ✅ Step 3: Test Backend Connection

```bash
cd backend
node test-connection.js
```

This will verify:
- Database connection
- Tables exist
- Admin users exist

### ✅ Step 4: Start Backend Server

```bash
cd backend
npm run dev
```

**Expected output:**
```
✅ Database connected successfully
🚀 Server running on port 5000
📦 Environment: development
🔗 API available at http://localhost:5000/api
```

### ✅ Step 5: Start Frontend

**In a NEW terminal:**
```bash
cd frontend
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### ✅ Step 6: Test Connection

1. Open browser: `http://localhost:5173`
2. Open browser console (F12)
3. Test health endpoint:
   ```javascript
   fetch('http://localhost:5000/api/health')
     .then(r => r.json())
     .then(console.log);
   ```
4. Should return: `{status: "ok", message: "Server is running"}`

## Common Issues & Solutions

### Issue 1: "Cannot connect to backend"

**Symptoms:**
- 401 Unauthorized
- 500 Internal Server Error
- Network error in browser console

**Solutions:**
1. **Check if backend is running:**
   ```bash
   # In backend directory
   npm run dev
   ```

2. **Check if port 5000 is available:**
   ```bash
   # Windows
   netstat -ano | findstr :5000
   
   # If port is in use, change PORT in backend/.env
   ```

3. **Verify Vite proxy:**
   - Check `frontend/vite.config.js` has proxy configured
   - Restart Vite dev server after changes

### Issue 2: "Database connection error"

**Symptoms:**
- Backend console shows: `❌ Database connection error`

**Solutions:**
1. **Check MySQL is running:**
   ```bash
   # Windows - Check Services
   # Search for "MySQL" in Services
   ```

2. **Verify .env file:**
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_actual_password
   DB_NAME=badminton_store
   ```

3. **Test database connection:**
   ```bash
   mysql -u root -p
   # Enter password, then:
   USE badminton_store;
   SHOW TABLES;
   ```

### Issue 3: "Invalid credentials" on login

**Symptoms:**
- Login returns 401 Unauthorized
- "Invalid credentials" error

**Solutions:**
1. **Verify admin user exists:**
   ```bash
   cd backend
   node test-connection.js
   ```

2. **Create admin user if missing:**
   ```bash
   node createadmin.js admin password123 admin@example.com
   ```

3. **Check password:**
   - Make sure you're using the correct password
   - Password is case-sensitive

### Issue 4: "Session not working"

**Symptoms:**
- Login succeeds but immediately logged out
- Check-auth returns false

**Solutions:**
1. **Check cookie settings in `server.js`:**
   ```javascript
   cookie: {
     secure: false,  // Must be false for http://localhost
     httpOnly: true,
     sameSite: 'lax'
   }
   ```

2. **Clear browser cookies:**
   - Open DevTools → Application → Cookies
   - Delete all cookies for localhost

3. **Check CORS settings:**
   - Make sure `credentials: true` in CORS config
   - Make sure frontend sends `withCredentials: true`

## Verification Commands

### Test Backend Health
```bash
curl http://localhost:5000/api/health
```

### Test Database
```bash
cd backend
node test-connection.js
```

### Test Login (from browser console)
```javascript
fetch('http://localhost:5000/api/admin/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    username: 'admin',
    password: 'password123'
  })
})
  .then(r => r.json())
  .then(console.log);
```

## Expected Flow

1. ✅ Backend running on port 5000
2. ✅ Frontend running on port 5173
3. ✅ Vite proxy forwards `/api/*` to `http://localhost:5000`
4. ✅ CORS allows requests from `http://localhost:5173`
5. ✅ Sessions work with cookies
6. ✅ Database connection successful
7. ✅ Admin user exists

## Still Having Issues?

1. Check backend console for error messages
2. Check browser Network tab to see actual requests
3. Verify both servers are running
4. Clear browser cache and cookies
5. Restart both servers

