import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'FRONTEND_URL',
  'NODE_ENV',
  'PORT',
] as const;

for (const key of requiredEnvVars) {
  if (!process.env[key] || process.env[key]?.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

// Minimum 32 chars AND at least 128 bits of unique characters
const validateJwtSecret = (key: string, name: string) => {
  const value = process.env[key] as string;
  if (value.length < 32) {
    throw new Error(`${name} must be at least 32 characters long`);
  }
  // Rough entropy check: must not be all same characters
  const uniqueChars = new Set(value.split('')).size;
  if (uniqueChars < 10) {
    throw new Error(`${name} does not have sufficient entropy (too repetitive)`);
  }
};

validateJwtSecret('JWT_ACCESS_SECRET', 'JWT_ACCESS_SECRET');
validateJwtSecret('JWT_REFRESH_SECRET', 'JWT_REFRESH_SECRET');

if (process.env.JWT_ACCESS_SECRET === process.env.JWT_REFRESH_SECRET) {
  throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different');
}

const bcryptRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
if (bcryptRounds < 10 || bcryptRounds > 14) {
  throw new Error('BCRYPT_SALT_ROUNDS must be between 10 and 14');
}

// Parse allowed origins: support comma-separated list
const parseAllowedOrigins = (): string[] => {
  const raw = process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || '';
  return raw
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
};

export const env = {
  supabaseUrl: process.env.SUPABASE_URL as string,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET as string,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET as string,
  jwtAccessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
  jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  jwtIssuer: process.env.JWT_ISSUER || 'nexuscrm-api',
  jwtAudience: process.env.JWT_AUDIENCE || 'nexuscrm-app',
  frontendUrl: process.env.FRONTEND_URL as string,
  allowedOrigins: parseAllowedOrigins(),
  nodeEnv: process.env.NODE_ENV as string,
  port: parseInt(process.env.PORT as string, 10),
  bcryptRounds,
  smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
  smtpSecure: process.env.SMTP_SECURE === 'true',
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  smtpFrom: process.env.SMTP_FROM || 'NexusCRM <noreply@nexuscrm.com>',
  // Rate limiting (configurable via env for different deployment tiers)
  authRateLimitMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '5', 10),
  authRateLimitWindowMs: parseInt(
    process.env.AUTH_RATE_LIMIT_WINDOW_MS || String(15 * 60 * 1000),
    10,
  ),
  apiRateLimitMax: parseInt(process.env.API_RATE_LIMIT_MAX || '200', 10),
  apiRateLimitWindowMs: parseInt(
    process.env.API_RATE_LIMIT_WINDOW_MS || String(60 * 1000),
    10,
  ),
};
