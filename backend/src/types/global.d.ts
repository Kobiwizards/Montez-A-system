/// <reference types="node" />
/// <reference types="express" />

// Global declarations
declare global {
  var __dirname: string;
  var __filename: string;
  var process: NodeJS.Process;
  
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      PORT: string;
      DATABASE_URL: string;
      JWT_SECRET: string;
      JWT_REFRESH_SECRET: string;
      SMTP_HOST: string;
      SMTP_PORT: string;
      SMTP_USER: string;
      SMTP_PASS: string;
      FRONTEND_URL: string;
      UPLOAD_DIR: string;
      RECEIPT_DIR: string;
      ENCRYPTION_KEY: string;
    }
  }
  
  namespace Express {
    interface Multer {
      File: any;
    }
  }
}

export {};