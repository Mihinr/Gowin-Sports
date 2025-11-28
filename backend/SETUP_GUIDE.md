# Complete Setup Guide - Gowin Sports Backend

This guide will help you set up the Node.js backend from scratch.

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server (v5.7 or higher)
- npm or yarn

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Database Setup

#### Option A: Using MySQL Command Line

```bash
mysql -u root -p < database.sql
```

When prompted, enter your MySQL root password.

#### Option B: Using MySQL Workbench

1. Open MySQL Workbench
2. Connect to your MySQL server
3. File → Open SQL Script → Select `database.sql`
4. Execute the script (⚡ button)

#### Option C: Manual Execution

1. Open MySQL command line or Workbench
2. Copy and paste the contents of `database.sql`
3. Execute

**This creates:**
- `badminton_store` database
- All required tables (products, variants, product_images, admin_users)

### 3. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=badminton_store

# Session Secret (change this to a random string in production)
SESSION_SECRET=your77gff99-hhjj88-mmmmmmn-here-12345

# Server Configuration
PORT=5000
NODE_ENV=development

# Upload Configuration
UPLOAD_FOLDER=static/images
```

**Important:** Replace `your_mysql_password` with your actual MySQL root password.

### 4. Create Your First Admin User

After the database is set up, create an admin account:

```bash
node createadmin.js admin mypassword123 admin@example.com
```

**Replace:**
- `admin` - Your desired username
- `mypassword123` - Your desired password (min 6 characters)
- `admin@example.com` - Your email address

**Example:**
```bash
node createadmin.js admin securepass123 admin@gowinsports.com
```

**Output:**
```
✅ Connected to database

✅ Admin user 'admin' created successfully!

📋 Details:
   Username: admin
   Email: admin@gowinsports.com
   Password: **********
```

### 5. Start the Server

#### Development Mode (with auto-reload):
```bash
npm run dev
```

#### Production Mode:
```bash
npm start
```

You should see:
```
🚀 Server running on port 5000
📦 Environment: development
🔗 API available at http://localhost:5000/api
```

### 6. Verify Installation

Test the API:
```bash
# Health check
curl http://localhost:5000/api/health

# Should return: {"status":"ok","message":"Server is running"}
```

## Troubleshooting

### Database Connection Errors

**Error: "Access denied"**
- Check your MySQL username and password in `.env`
- Make sure MySQL server is running
- Verify the user has permissions to create databases

**Error: "Connection refused"**
- Make sure MySQL server is running
- Check if MySQL is running on port 3306 (default)
- Verify `DB_HOST` in `.env` is correct

**Error: "Unknown database"**
- Make sure you've run `database.sql` first
- Check `DB_NAME` in `.env` matches the database name

### Admin Creation Errors

**Error: "Table doesn't exist"**
- Run `database.sql` first to create tables
- Check if you're using the correct database

**Error: "Username or email already exists"**
- Choose a different username or email
- Or delete the existing admin user from database

### Port Already in Use

**Error: "Port 5000 already in use"**
- Change `PORT` in `.env` to a different port (e.g., 5001)
- Or stop the process using port 5000

## Testing Admin Login

1. Start the server: `npm run dev`
2. Open your frontend admin panel
3. Login with the credentials you created
4. You should be able to access the admin panel

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Update database credentials for production
3. Use a strong `SESSION_SECRET`
4. Build React frontend and place in `static/dist/`
5. Use PM2 or similar process manager:
   ```bash
   npm install -g pm2
   pm2 start server.js --name gowin-backend
   ```

## File Structure

```
backend/
├── config/
│   └── database.js          # Database connection
├── middleware/
│   ├── auth.js              # Authentication middleware
│   └── upload.js            # File upload configuration
├── routes/
│   ├── auth.js              # Login/logout endpoints
│   ├── products.js          # Product CRUD endpoints
│   ├── upload.js            # Image upload endpoint
│   └── seo.js               # Sitemap & robots.txt
├── utils/
│   └── slug.js              # Slug generation utilities
├── static/
│   ├── images/              # Uploaded images
│   └── dist/                # React build (production)
├── database.sql             # Database schema
├── createadmin.js           # Admin user creation script
├── server.js                # Main server file
├── package.json             # Dependencies
└── .env                     # Environment variables (create this)
```

## Next Steps

1. ✅ Database created
2. ✅ Admin user created
3. ✅ Server running
4. ✅ Test admin login
5. ✅ Start adding products via admin panel

You're all set! 🎉

