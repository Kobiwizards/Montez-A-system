#!/bin/bash

file="src/controllers/auth.controller.ts"

# Create a temporary file
cat > /tmp/fixed_auth.ts << 'CONTENT'
import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'
import { User } from '@prisma/client'
import { AuditLogService } from '../services/audit.service'

// AuthRequest type definition
type AuthRequest = Request & {
  user?: User
  userId?: string
}

CONTENT

# Add the rest of the file (from line 2 onward, skipping the first import line)
tail -n +2 "$file" >> /tmp/fixed_auth.ts

# Replace the original file
mv /tmp/fixed_auth.ts "$file"

echo "Fixed auth.controller.ts - added User import and AuthRequest type"
