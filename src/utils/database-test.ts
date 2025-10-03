import { testConnection } from './database';

export const testDatabaseConnection = async () => {
  console.log('Testing database connection...');
  const isConnected = await testConnection();

  if (isConnected) {
    console.log('✅ Successfully connected to local PostgreSQL database!');
    alert('Database connection successful!');
  } else {
    console.log('❌ Failed to connect to database');
    alert('Database connection failed. Please check your configuration.');
  }

  return isConnected;
};

// Export for use in components
export default testDatabaseConnection;