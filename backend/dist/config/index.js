"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
exports.config = {
    // Server
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',
    // Database
    databaseUrl: process.env.DATABASE_URL || 'postgresql://montez_a_db_user:T87pOFxrcTBECwCfQtnopJCnBiXoywpw@dpg-d4r141qli9vc73a60960-a/montez_a_db?sslmode=require',
    // JWT
    jwtSecret: process.env.JWT_SECRET || '5900f9f295d1542943203c2e227d4bd6',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || '4686b297b5ab30ea3bdb0f558953ac2f',
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
    // CORS - Allow both local and production
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000,https://montez-a.onrender.com',
    // File upload
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
    uploadPath: process.env.UPLOAD_PATH || 'uploads',
    receiptsPath: process.env.RECEIPTS_PATH || 'receipts',
    // Email (optional)
    emailHost: process.env.EMAIL_HOST,
    emailPort: parseInt(process.env.EMAIL_PORT || '587'),
    emailUser: process.env.EMAIL_USER,
    emailPassword: process.env.EMAIL_PASSWORD,
    emailFrom: process.env.EMAIL_FROM || 'noreply@monteza.com',
    // Application
    appName: process.env.APP_NAME || 'Montez A Property Management',
    appUrl: process.env.APP_URL || 'http://localhost:3000',
    // Water rate
    waterRatePerUnit: parseFloat(process.env.WATER_RATE_PER_UNIT || '150'),
    // Rent rates
    oneBedroomRent: parseFloat(process.env.ONE_BEDROOM_RENT || '15000'),
    twoBedroomRent: parseFloat(process.env.TWO_BEDROOM_RENT || '18000'),
};
// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
        console.warn(`⚠️  Warning: ${envVar} environment variable is not set`);
    }
});
