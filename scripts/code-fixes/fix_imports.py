import os
import re
from pathlib import Path

def fix_file(file_path):
    """Fix import statements in a TypeScript file."""
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()

    # Fix 'use client' directive to be on its own line
    content = re.sub(r'("use client";?)(\s*import)', r'\1\n\2', content)

    # Fix import statements with wrong formatting
    # Match multiline import statements ending with comma before closing brace
    content = re.sub(r'import\s*{([^}]*),\s*}', r'import {\1}', content)
    
    # Fix single line imports ending with comma before closing brace
    content = re.sub(r'import\s*{([^}]*),\s*}', r'import {\1}', content)

    # Ensure proper spacing after 'use client'
    content = re.sub(r'("use client";?)(?!\n)', r'\1\n', content)

    # Fix 'import type' statements
    content = re.sub(r'import\s+type\s*{([^}]*),\s*}', r'import type {\1}', content)

    # Fix issues with closing braces at the beginning of a line
    content = re.sub(r'^\s*}\s*from', r'} from', content, flags=re.MULTILINE)

    # Ensure no commas before closing braces
    content = re.sub(r',\s*}', r'}', content)

    # Fix issues with "as" keyword in imports
    content = re.sub(r'(\w+)\s+as\s+(\w+),', r'\1 as \2,', content)

    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(content)
    
    return file_path

def process_ts_files(directory='.'):
    """Process all TypeScript files in the given directory recursively."""
    count = 0
    fixed_files = []
    
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(('.ts', '.tsx')) and not file.endswith(('.d.ts')):
                file_path = os.path.join(root, file)
                try:
                    fix_file(file_path)
                    fixed_files.append(file_path)
                    count += 1
                    if count % 10 == 0:
                        print(f"Processed {count} files...")
                except Exception as e:
                    print(f"Error processing {file_path}: {str(e)}")
    
    return fixed_files, count

if __name__ == "__main__":
    directory = '.'  # Process current directory
    fixed_files, total_count = process_ts_files(directory)
    
    print(f"\nScanned {total_count} TypeScript files.")
    print(f"Fixed {len(fixed_files)} files.")
    
    # Print a sample of fixed files
    print("\nSample of fixed files:")
    for file_path in fixed_files[:10]:  # Show only first 10
        print(f"- {file_path}")
    
    if len(fixed_files) > 10:
        print(f"...and {len(fixed_files) - 10} more files.") 