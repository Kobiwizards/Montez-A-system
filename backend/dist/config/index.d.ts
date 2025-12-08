export declare const config: {
    port: string | number;
    nodeEnv: string;
    databaseUrl: string;
    jwtSecret: string;
    jwtExpiresIn: string;
    refreshTokenSecret: string;
    refreshTokenExpiresIn: string;
    corsOrigin: string;
    maxFileSize: number;
    uploadPath: string;
    receiptsPath: string;
    emailHost: string | undefined;
    emailPort: number;
    emailUser: string | undefined;
    emailPassword: string | undefined;
    emailFrom: string;
    appName: string;
    appUrl: string;
    waterRatePerUnit: number;
    oneBedroomRent: number;
    twoBedroomRent: number;
};
export type Config = typeof config;
//# sourceMappingURL=index.d.ts.map