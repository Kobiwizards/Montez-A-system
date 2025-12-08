#!/bin/bash

# This script adds type casting to authenticate middleware calls

# Function to fix a route file
fix_route_file() {
  local file="$1"
  echo "Fixing $file..."
  
  # Add type import if not present
  if ! grep -q "import.*AuthRequest" "$file"; then
    sed -i "1a import { AuthRequest } from '../middleware/auth.middleware'" "$file"
  fi
  
  # Replace authenticate with type cast
  sed -i 's/authenticate,/authenticate as unknown as (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>,/g' "$file"
  
  # Replace authorize with type cast
  sed -i 's/authorize(/authorize(/g' "$file" # Just a placeholder, we'll handle this separately
}

# Fix all route files
for file in src/routes/*.routes.ts; do
  if [ -f "$file" ]; then
    fix_route_file "$file"
  fi
done

echo "Route files fixed!"
