# Testing Frontend-Backend Connection

## Quick Test Steps

### 1. Start the Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
✅ Database connected successfully
🚀 Server running on port 5000
📦 Environment: development
🔗 API available at http://localhost:5000/api
```

### 2. Start the Frontend

In a new terminal:
```bash
cd frontend
npm run dev
```

### 3. Test the Connection

Open browser console and test:

```javascript
// Test health endpoint
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(console.log);

// Should return: {status: "ok", message: "Server is running"}
```

### 4. Test Admin Login

Make sure you have created an admin user first:
```bash
cd backend
node createadmin.js admin password123 admin@example.com
```

Then test login in browser console:
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

## Troubleshooting

### Error: "Cannot connect to backend"
- Make sure backend is running on port 5000
- Check if port 5000 is already in use
- Verify `.env` file has correct PORT

### Error: "Database connection error"
- Make sure MySQL is running
- Check database credentials in `.env`
- Verify database exists: `mysql -u root -p -e "SHOW DATABASES;"`

### Error: "401 Unauthorized"
- Check if admin user exists in database
- Verify username and password are correct
- Check if password was hashed correctly

### Error: "500 Internal Server Error"
- Check backend console for error messages
- Verify database tables exist
- Check if admin_users table has data

### Vite Proxy Not Working
- Restart Vite dev server after changing `vite.config.js`
- Clear browser cache
- Check browser Network tab to see actual request URL

