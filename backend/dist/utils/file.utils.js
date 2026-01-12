"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveFileToDisk = saveFileToDisk;
exports.readFileAsBuffer = readFileAsBuffer;
exports.calculateFileHash = calculateFileHash;
exports.streamToBuffer = streamToBuffer;
exports.bufferToFile = bufferToFile;
exports.getFileStats = getFileStats;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const crypto_1 = require("crypto");
// Remove all Buffer.from() calls and use the buffers directly:
async function saveFileToDisk(file, directory) {
    await fs.mkdir(directory, { recursive: true });
    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(directory, fileName);
    // FIX: Use file.buffer directly
    await fs.writeFile(filePath, file.buffer);
    return filePath;
}
async function readFileAsBuffer(filePath) {
    // FIX: Return directly without Buffer.from()
    return await fs.readFile(filePath);
}
async function calculateFileHash(filePath, algorithm = 'sha256') {
    const fileBuffer = await readFileAsBuffer(filePath);
    const hash = (0, crypto_1.createHash)(algorithm);
    // FIX: Use fileBuffer directly
    hash.update(fileBuffer);
    return hash.digest('hex');
}
async function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = []; // Change to Buffer[]
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
}
async function bufferToFile(buffer, filePath) {
    // FIX: Use buffer directly
    await fs.writeFile(filePath, buffer);
}
// Fix the getFileStats return type:
async function getFileStats(filePath) {
    return await fs.stat(filePath);
}
