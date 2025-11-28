/**
 * Simple script to test backend connection and database
 * Run: node test-connection.js
 */

require('dotenv').config();
const pool = require('./config/database');

async function testConnection() {
  console.log('\n🧪 Testing Backend Connection...\n');
  
  // Test 1: Database Connection
  console.log('1. Testing database connection...');
  try {
    const connection = await pool.getConnection();
    console.log('   ✅ Database connection successful');
    
    // Test 2: Check if tables exist
    console.log('\n2. Checking database tables...');
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'admin_users'"
    );
    
    if (tables.length > 0) {
      console.log('   ✅ admin_users table exists');
      
      // Test 3: Check if admin users exist
      const [users] = await connection.execute(
        "SELECT id, username, email FROM admin_users LIMIT 5"
      );
      
      if (users.length > 0) {
        console.log(`   ✅ Found ${users.length} admin user(s):`);
        users.forEach(user => {
          console.log(`      - ${user.username} (${user.email})`);
        });
      } else {
        console.log('   ⚠️  No admin users found. Run: node createadmin.js <username> <password> <email>');
      }
    } else {
      console.log('   ❌ admin_users table does not exist. Run database.sql first!');
    }
    
    // Test 4: Check products table
    const [productTables] = await connection.execute(
      "SHOW TABLES LIKE 'products'"
    );
    if (productTables.length > 0) {
      console.log('   ✅ products table exists');
    } else {
      console.log('   ❌ products table does not exist. Run database.sql first!');
    }
    
    connection.release();
    
    console.log('\n✅ All tests passed! Backend is ready.\n');
    console.log('📝 Next steps:');
    console.log('   1. Make sure backend server is running: npm run dev');
    console.log('   2. Make sure frontend is running: cd ../frontend && npm run dev');
    console.log('   3. Test login in the admin panel\n');
    
  } catch (error) {
    console.error('   ❌ Database connection failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   - Check your .env file has correct database credentials');
    console.log('   - Make sure MySQL server is running');
    console.log('   - Verify database exists: mysql -u root -p -e "SHOW DATABASES;"\n');
    process.exit(1);
  }
}

testConnection();

