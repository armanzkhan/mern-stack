# Firebase Setup for Mobile Push Notifications

To enable mobile push notifications, you need to set up Firebase Admin SDK credentials.

## Steps to Set Up Firebase:

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Create a new project** or select an existing one
3. **Go to Project Settings** (gear icon) > **Service Accounts**
4. **Click "Generate new private key"** to download the service account JSON file
5. **Create a `.env` file** in the backend directory with the following variables:

```env
# Firebase Admin SDK (for mobile push notifications)
FIREBASE_PROJECT_ID=your_project_id_from_json
FIREBASE_CLIENT_EMAIL=your_client_email_from_json
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_from_json\n-----END PRIVATE KEY-----\n"
FIREBASE_PRIVATE_KEY_ID=your_private_key_id_from_json
FIREBASE_CLIENT_ID=your_client_id_from_json
```

## Example .env file:

```env
# Database
MONGO_URI=mongodb://127.0.0.1:27017/rbac_demo

# JWT Secret
JWT_SECRET=supersecretkey

# Firebase Admin SDK
FIREBASE_PROJECT_ID=my-notification-app
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-abc123@my-notification-app.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
FIREBASE_PRIVATE_KEY_ID=abc123def456
FIREBASE_CLIENT_ID=123456789012345678901

# Server
PORT=5000
```

## Important Notes:

- The `FIREBASE_PRIVATE_KEY` should include the full private key with newlines (`\n`)
- Make sure to keep your `.env` file secure and never commit it to version control
- The mobile push service will be disabled if these environment variables are not set
- Web push notifications will still work without Firebase (they use VAPID keys)

## Testing:

After setting up the environment variables, restart the backend server. You should see:
```
Firebase Admin SDK initialized successfully
```

Instead of:
```
Firebase environment variables not set. Mobile push notifications will be disabled.
```
