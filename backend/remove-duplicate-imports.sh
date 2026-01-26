#!/bin/bash

# Function to remove duplicate imports from a file
remove_duplicate_imports() {
  local file="$1"
  local temp_file="/tmp/$(basename "$file").tmp"
  
  # Create a new file with unique imports
  awk '
  # For import lines
  /^import/ {
    if (!seen[$0]++) {
      print
    }
    next
  }
  # For all other lines
  {
    print
  }
  ' "$file" > "$temp_file"
  
  # Replace the original file
  mv "$temp_file" "$file"
  echo "Fixed: $file"
}

# Process all controller, middleware, and route files
for file in src/controllers/*.ts src/middleware/*.ts src/routes/*.ts; do
  if [ -f "$file" ]; then
    remove_duplicate_imports "$file"
  fi
done

echo "Done! All duplicate imports have been removed."
