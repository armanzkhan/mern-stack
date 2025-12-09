const mongoose = require('mongoose');
const User = require('../models/User');
const { generateToken } = require('../services/authService');

async function testNotificationStream() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ressichem');
    console.log('✅ Connected to MongoDB');

    console.log('\n🔍 Testing notification stream endpoint...');

    // Find a user to test with
    const user = await User.findOne({ email: 'sales@ressichem.com' });
    if (!user) {
      console.log('❌ No user found for testing');
      return;
    }

    console.log('✅ Test user found:', user.email);

    // Generate token
    const token = await generateToken({
      user_id: user.user_id,
      company_id: user.company_id,
      email: user.email,
      isSuperAdmin: false,
      isManager: true
    });

    console.log('✅ Token generated');

    // Test the stream endpoint
    const streamUrl = `http://localhost:5000/api/notifications/stream?token=${token}`;
    console.log('🔗 Stream URL:', streamUrl);

    // Test if the endpoint is accessible
    const response = await fetch(streamUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache'
      }
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      console.log('✅ Notification stream endpoint is accessible');
      
      // Read a few lines from the stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      console.log('📖 Reading from stream...');
      
      for (let i = 0; i < 3; i++) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        console.log(`📦 Chunk ${i + 1}:`, chunk);
      }
      
      reader.releaseLock();
    } else {
      console.log('❌ Notification stream endpoint failed');
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testNotificationStream();
