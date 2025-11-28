# Gowin Sports Backend API

Node.js/Express backend for Gowin Sports e-commerce platform.

## Features

- ✅ Product CRUD operations
- ✅ Admin authentication with sessions
- ✅ Image upload handling
- ✅ Product variants management
- ✅ Category-based filtering
- ✅ SEO (Sitemap.xml, Robots.txt)
- ✅ MySQL database integration

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

**Create the database and tables:**

1. Open MySQL command line or MySQL Workbench
2. Run the SQL file:
   ```bash
   mysql -u root -p < database.sql
   ```
   
   Or manually:
   ```sql
   source database.sql;
   ```

This will create:
- `badminton_store` database
- `products` table
- `variants` table
- `product_images` table
- `admin_users` table

### 3. Configure Environment

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=badminton_store
SESSION_SECRET=your77gff99-hhjj88-mmmmmmn-here-12345
PORT=5000
NODE_ENV=development
UPLOAD_FOLDER=static/images
```

### 4. Create Admin User

After setting up the database, create your first admin user:

```bash
node createadmin.js <username> <password> <email>
```

**Example:**
```bash
node createadmin.js admin mypassword123 admin@example.com
```

**Important:** 
- Password must be at least 6 characters
- Email must be valid
- Username and email must be unique

### 5. Start the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/check-auth` - Check authentication status

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/slug/:slug` - Get product by slug
- `GET /api/products/category/:category` - Get products by category
- `GET /api/collections/:category` - Get collections for category
- `GET /api/types/:category` - Get types for category

### Admin Products (Protected)
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product

### Upload
- `POST /api/admin/upload-image` - Upload product image

### SEO
- `GET /sitemap.xml` - Generate sitemap
- `GET /robots.txt` - Serve robots.txt

## Database Schema

The database includes the following tables:

- **products** - Main product information
- **variants** - Product variants (colors, sizes, prices, stock)
- **product_images** - Product images with main image flag
- **admin_users** - Admin user accounts

See `database.sql` for the complete schema definition.

## Creating Admin Users

Use the `createadmin.js` script to create admin users:

```bash
node createadmin.js <username> <password> <email>
```

**Example:**
```bash
node createadmin.js admin mypassword123 admin@example.com
```

**Requirements:**
- Username: Must be unique
- Password: Minimum 6 characters
- Email: Must be valid and unique

**Troubleshooting:**
- If you get "table doesn't exist" error, make sure you've run `database.sql` first
- If you get "access denied" error, check your database credentials in `.env`
- If you get "connection refused" error, make sure MySQL server is running

## Development

The backend uses:
- **Express.js** - Web framework
- **MySQL2** - Database driver
- **Multer** - File upload handling
- **Bcryptjs** - Password hashing
- **Express-session** - Session management

## Production

For production deployment:
1. Set `NODE_ENV=production` in `.env`
2. Build your React frontend and place it in `static/dist/`
3. Configure proper database credentials
4. Use a process manager like PM2

