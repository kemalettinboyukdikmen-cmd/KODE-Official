import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Firebase
  firebase: {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret_key_change_in_production',
    expiresIn: '7d',
    refreshExpiresIn: '30d',
  },

  // Admin
  admin: {
    ipWhitelist: (process.env.ADMIN_IP_WHITELIST || '').split(',').filter(Boolean),
    email: process.env.ADMIN_EMAIL,
  },

  // Server
  server: {
    port: parseInt(process.env.API_PORT || '5000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
  },

  // CORS
  cors: {
    origin: (process.env.FRONTEND_URL || 'http://localhost:3000').split(','),
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
};
