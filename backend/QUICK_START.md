# Quick Start - Get Backend Running

## 🚀 Fast Setup (5 minutes)

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup Database
```bash
# Option A: Using MySQL command line
mysql -u root -p < database.sql

# Option B: Copy database.sql content and run in MySQL Workbench
```

### 3. Configure Environment
Create `.env` file in `backend/` directory:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=badminton_store
SESSION_SECRET=your77gff99-hhjj88-mmmmmmn-here-12345
PORT=5000
NODE_ENV=development
```

### 4. Create Admin User
```bash
node createadmin.js admin password123 admin@example.com
```

### 5. Test Connection
```bash
node test-connection.js
```

### 6. Start Server
```bash
npm run dev
```

You should see:
```
✅ Database connected successfully
🚀 Server running on port 5000
```

### 7. Test in Browser
Open: `http://localhost:5000/api/health`

Should return: `{"status":"ok","message":"Server is running"}`

## ✅ Connection Verified!

Now start your frontend and test the admin login!

