/**
 * Application configuration management
 * Centralized configuration for environment-specific settings
 */

export const config = {
  // API Configuration
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',

  // Environment Detection
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',

  // Feature Flags (can be extended as needed)
  features: {
    enableChatWebSocket: process.env.NEXT_PUBLIC_ENABLE_WS === 'true',
    enableDevTools: process.env.NODE_ENV === 'development',
  },
} as const;

// Validate required environment variables at startup
if (!config.apiUrl) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is not defined');
}
