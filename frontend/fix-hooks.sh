#!/bin/bash
echo "Fixing TypeScript errors in hooks..."

# List of hook files
files=(
  "hooks/use-payments.ts"
  "hooks/use-tenants.ts" 
  "hooks/use-auth.ts"
  "hooks/use-analytics.ts"
  "hooks/use-water-bill.ts"
  "hooks/use-file-upload.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file"
    # Add <any> to all api.method() calls
    sed -i.bak "s/api\.get(/api.get<any>(/g" "$file"
    sed -i.bak "s/api\.post(/api.post<any>(/g" "$file"
    sed -i.bak "s/api\.put(/api.put<any>(/g" "$file"
    sed -i.bak "s/api\.delete(/api.delete<any>(/g" "$file"
    sed -i.bak "s/api\.patch(/api.patch<any>(/g" "$file"
    
    # Add type casting after each API call
    # This is more complex - might need manual editing
  fi
done

echo "Done! Some files may need manual type casting."
