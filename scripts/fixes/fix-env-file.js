// Fix the .env file
const fs = require('fs');
const path = require('path');

const envContent = `PORT=5000
JWT_SECRET=my-secret-key
CONNECTION_STRING=mongodb://localhost:27017/Ressichem
ENCRYPTION_KEY=1PkGcK8xkXi8lZKQSCNgjzjJwTkEoXy08QZEVt9AqfA=`;

const envPath = path.join(__dirname, '.env');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file fixed successfully!');
  console.log('📄 New .env content:');
  console.log(envContent);
} catch (error) {
  console.error('❌ Failed to fix .env file:', error.message);
}
