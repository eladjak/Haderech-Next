import os
import re

def fix_file(file_path):
    """Fix typescript syntax errors in the file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        original_content = content
        
        # Fix "use client" - this is the critical issue causing most errors
        # Change "use client"; to export a variable that TypeScript understands
        if '"use client"' in content:
            content = re.sub(r'"use client"\s*;?', '/* @client-directive */\nexport {}', content)
        
        # Fix multiline imports with closing bracket on a separate line
        content = re.sub(r'import\s*{([^}]*?),\s*}', r'import {\1}', content, flags=re.DOTALL)
        
        # Fix single line imports ending with comma before closing brace
        content = re.sub(r'import\s*{([^}]*?),\s*}', r'import {\1}', content)
        
        # Fix import type statements with comma before closing brace
        content = re.sub(r'import\s+type\s*{([^}]*?),\s*}', r'import type {\1}', content, flags=re.DOTALL)
        
        # Fix imports with "as" keywords
        content = re.sub(r'(\w+)\s+as\s+(\w+),\s*(\w+)', r'\1 as \2, \3', content)
        
        # Fix closing braces on a new line
        content = re.sub(r'([^}])\n\s*}\s*from', r'\1\n} from', content)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as file:
                file.write(content)
            return True
        return False
    except Exception as e:
        print(f"Error processing {file_path}: {str(e)}")
        return False

def find_and_fix_all_ts_files(base_dir='src'):
    """Find and fix all TypeScript files."""
    fixed_count = 0
    total_count = 0
    
    for root, _, files in os.walk(base_dir):
        for file in files:
            if file.endswith(('.ts', '.tsx')) and not file.endswith('.d.ts'):
                file_path = os.path.join(root, file)
                total_count += 1
                
                # בדוק אם יש שגיאות ידועות בקובץ
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                    # חפש דפוסי שגיאות ידועים
                    has_errors = ('"use client"' in content or 
                                  'import {' in content and ',}' in content or
                                  'import type {' in content and ',}' in content)
                    
                    if has_errors:
                        print(f"Checking file with potential errors: {file_path}")
                        if fix_file(file_path):
                            print(f"Fixed file: {file_path}")
                            fixed_count += 1
                
                except Exception as e:
                    print(f"Error checking {file_path}: {str(e)}")
    
    return fixed_count, total_count

if __name__ == "__main__":
    fixed_count, total_count = find_and_fix_all_ts_files()
    print(f"\nScanned {total_count} TypeScript files.")
    print(f"Fixed {fixed_count} files with issues")
    
    print("Done!") 