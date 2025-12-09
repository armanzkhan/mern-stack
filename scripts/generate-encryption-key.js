// Script to generate a secure encryption key for ENCRYPTION_KEY environment variable
const crypto = require('crypto');

console.log('🔐 Generating Encryption Key for ENCRYPTION_KEY\n');

// Generate a random 32-byte key
const key = crypto.randomBytes(32);
const keyBase64 = key.toString('base64');

console.log('✅ Generated 32-byte encryption key:');
console.log('');
console.log('Add this to your .env file:');
console.log(`ENCRYPTION_KEY=${keyBase64}`);
console.log('');
console.log('Or set it as an environment variable:');
console.log(`export ENCRYPTION_KEY=${keyBase64}`);
console.log('');
console.log('⚠️  IMPORTANT: Keep this key secret and never commit it to version control!');
console.log('⚠️  If you lose this key, you will not be able to decrypt existing encrypted data!');

