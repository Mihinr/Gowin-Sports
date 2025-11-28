require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

/**
 * Create admin user script
 * 
 * Usage: node createadmin.js <username> <password> <email>
 * 
 * Example: node createadmin.js admin mypassword123 admin@example.com
 */

async function createAdminUser() {
  // Get command line arguments
  const args = process.argv.slice(2);
  
  if (args.length !== 3) {
    console.log('\n❌ Error: Missing required arguments\n');
    console.log('Usage: node createadmin.js <username> <password> <email>\n');
    console.log('Example:');
    console.log('  node createadmin.js admin mypassword123 admin@example.com\n');
    process.exit(1);
  }
  
  const [username, password, email] = args;
  
  // Validate inputs
  if (!username || !password || !email) {
    console.log('\n❌ Error: All fields are required\n');
    process.exit(1);
  }
  
  if (password.length < 6) {
    console.log('\n❌ Error: Password must be at least 6 characters long\n');
    process.exit(1);
  }
  
  if (!email.includes('@')) {
    console.log('\n❌ Error: Invalid email address\n');
    process.exit(1);
  }
  
  // Database connection
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'badminton_store'
    });
    
    console.log('✅ Connected to database\n');
    
    // Check if user already exists
    const [existingUsers] = await connection.execute(
      "SELECT * FROM admin_users WHERE username = ? OR email = ?",
      [username, email]
    );
    
    if (existingUsers.length > 0) {
      console.log('❌ Error: Username or email already exists\n');
      process.exit(1);
    }
    
    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Insert admin user
    await connection.execute(
      "INSERT INTO admin_users (username, password_hash, email) VALUES (?, ?, ?)",
      [username, passwordHash, email]
    );
    
    console.log(`✅ Admin user '${username}' created successfully!\n`);
    console.log('📋 Details:');
    console.log(`   Username: ${username}`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${'*'.repeat(password.length)}\n`);
    
  } catch (error) {
    console.error('\n❌ Error creating admin user:', error.message);
    
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.log('\n💡 Tip: Make sure you have run database.sql to create the tables first.\n');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Tip: Check your database credentials in .env file.\n');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Tip: Make sure MySQL server is running.\n');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the function
createAdminUser();

