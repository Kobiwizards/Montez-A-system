-- Create tables from your schema
CREATE TABLE "User" (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'TENANT',
    apartment VARCHAR(10) UNIQUE NOT NULL,
    "unitType" VARCHAR(50) NOT NULL,
    "rentAmount" FLOAT NOT NULL,
    "waterRate" FLOAT DEFAULT 150,
    balance FLOAT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'CURRENT',
    "moveInDate" TIMESTAMP NOT NULL,
    "leaseEndDate" TIMESTAMP,
    "emergencyContact" VARCHAR(255),
    notes TEXT,
    "idCopyUrl" TEXT,
    "contractUrl" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create other tables similarly or use:
