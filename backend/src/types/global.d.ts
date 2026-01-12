// Global type declarations for Node.js
declare namespace NodeJS {
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

// Global Buffer declaration
declare var Buffer: {
  from(data: string | ArrayBuffer, encoding?: string): Buffer;
  alloc(size: number): Buffer;
  isBuffer(obj: any): boolean;
  prototype: any;
  // Add other Buffer methods as needed
};

// Declare missing Node.js modules
declare module 'fs/promises';
declare module 'path';
declare module 'crypto';
declare module 'stream';
declare module 'http';
declare module 'https';