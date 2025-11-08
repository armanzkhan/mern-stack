const jwt = require('jsonwebtoken');

// Test different JWT secrets
const secrets = [
  'supersecretkey',
  'your-secret-key',
  'jwt-secret-key',
  'secret',
  'mysecret',
  'ressichem-secret'
];

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OGU2MGRlNThlODBkYTVhYjVlZTdkN2EiLCJlbWFpbCI6ImFtYW5AamF6ei5jb20iLCJjb21wYW55X2lkIjoiUkVTU0lDSEVNIiwicm9sZSI6IkN1c3RvbWVyIiwiaWF0IjoxNzM3NDY0MjEwLCJleHAiOjE3Mzc1NTA2MTB9.placeholder';

console.log('🔍 Testing JWT secrets...');

for (const secret of secrets) {
  try {
    const decoded = jwt.verify(token, secret);
    console.log(`✅ Secret "${secret}" works:`, decoded);
    break;
  } catch (err) {
    console.log(`❌ Secret "${secret}" failed:`, err.message);
  }
}

