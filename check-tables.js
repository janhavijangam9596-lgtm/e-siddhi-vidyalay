import { Client } from 'pg';

// Database configuration
const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'e_siddhi_school',
  user: 'postgres',
  password: 'root',
  ssl: false
};

async function checkTables() {
  const client = new Client(dbConfig);

  try {
    console.log('🔍 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully!');

    console.log('🔍 Checking database tables...');

    // Query to get all table names
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log(`📊 Found ${result.rows.length} tables:`);
    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.table_name}`);
    });

    // Check if key tables exist
    const keyTables = ['users', 'students', 'staff', 'classes', 'departments'];
    console.log('\n🔑 Key tables status:');
    keyTables.forEach(table => {
      const exists = result.rows.some(row => row.table_name === table);
      console.log(`${table}: ${exists ? '✅' : '❌'}`);
    });

    // Check some sample data
    if (result.rows.length > 0) {
      console.log('\n📋 Sample data check:');

      try {
        const userCount = await client.query('SELECT COUNT(*) as count FROM users');
        console.log(`Users: ${userCount.rows[0].count}`);

        const studentCount = await client.query('SELECT COUNT(*) as count FROM students');
        console.log(`Students: ${studentCount.rows[0].count}`);

        const staffCount = await client.query('SELECT COUNT(*) as count FROM staff');
        console.log(`Staff: ${staffCount.rows[0].count}`);
      } catch (dataError) {
        console.log('⚠️  Could not check sample data (tables might be empty)');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed.');
  }
}

checkTables();