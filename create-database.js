import { Client } from 'pg';

// Connect to default postgres database to create our database
const adminClient = new Client({
  host: 'localhost',
  port: 5432,
  database: 'postgres', // Connect to default postgres database
  user: 'postgres',
  password: 'root',
  ssl: false
});

async function createDatabase() {
  try {
    console.log('🔄 Connecting to PostgreSQL...');
    await adminClient.connect();
    console.log('✅ Connected to PostgreSQL admin database');

    // Check if database exists
    const dbCheck = await adminClient.query(`
      SELECT datname FROM pg_database WHERE datname = 'e_siddhi_school';
    `);

    if (dbCheck.rows.length > 0) {
      console.log('✅ Database "e_siddhi_school" already exists');
    } else {
      console.log('📦 Creating database "e_siddhi_school"...');
      await adminClient.query('CREATE DATABASE e_siddhi_school;');
      console.log('✅ Database "e_siddhi_school" created successfully');
    }

    // List all databases
    const allDbs = await adminClient.query(`
      SELECT datname FROM pg_database
      WHERE datistemplate = false
      ORDER BY datname;
    `);

    console.log('\n📋 All databases:');
    allDbs.rows.forEach(db => {
      console.log(`- ${db.datname}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await adminClient.end();
    console.log('🔌 Connection closed.');
  }
}

createDatabase();