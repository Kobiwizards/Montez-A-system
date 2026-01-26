#!/bin/bash

# Fix all files that import Request, Response, NextFunction, Router from express
for file in src/controllers/*.ts src/middleware/*.ts src/routes/*.ts; do
  if [ -f "$file" ]; then
    echo "Fixing $file"
    # Remove any imports from '../types' that include express types
    sed -i "/import.*from.*['\"]\.\.\/types['\"]/d" "$file"
    # Ensure express imports are correct
    if grep -q "import.*Request.*from" "$file" || grep -q "import.*Response.*from" "$file" || grep -q "import.*Router.*from" "$file"; then
      sed -i "1i import { Request, Response } from 'express'" "$file"
    fi
  fi
done

# Fix specific files
echo "import { Request, Response } from 'express'" > temp.txt
for file in src/controllers/analytics.controller.ts src/controllers/auth.controller.ts src/controllers/maintenance.controller.ts src/controllers/payment.controller.ts src/controllers/receipt.controller.ts src/controllers/tenant.controller.ts src/controllers/water.controller.ts; do
  if [ -f "$file" ]; then
    # Remove first line if it's an import
    sed -i '1{/^import/d;}' "$file"
    cat temp.txt "$file" > "$file.tmp" && mv "$file.tmp" "$file"
  fi
done

# Fix middleware files
echo "import { Request, Response, NextFunction } from 'express'" > temp2.txt
for file in src/middleware/auth.middleware.ts src/middleware/error.middleware.ts src/middleware/not-found.middleware.ts src/middleware/validation.middleware.ts; do
  if [ -f "$file" ]; then
    sed -i '1{/^import/d;}' "$file"
    cat temp2.txt "$file" > "$file.tmp" && mv "$file.tmp" "$file"
  fi
done

# Fix route files
echo "import { Router } from 'express'" > temp3.txt
for file in src/routes/*.ts; do
  if [ -f "$file" ]; then
    sed -i '1{/^import/d;}' "$file"
    cat temp3.txt "$file" > "$file.tmp" && mv "$file.tmp" "$file"
  fi
done

rm -f temp.txt temp2.txt temp3.txt
