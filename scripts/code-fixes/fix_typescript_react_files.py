import os
import re
import glob

def fix_client_directive(content):
    """מסיר את ה-directive של "use client" ומחליף אותו בהערה"""
    # מסיר את directive של use client
    if '"use client"' in content:
        content = content.replace('"use client";', '// @use-client')
        content = content.replace('"use client"', '// @use-client')
        content = content.replace('/* @client-directive */\nexport {}', '// @use-client')
        content = content.replace('export {});', '')
        content = content.replace('export {}', '')
        content = re.sub(r'\(export const runtime = "client";\);', '// @use-client', content)
        content = re.sub(r'export const runtime = "client";', '// @use-client', content)
    return content

def fix_import_statements(content):
    """מתקן את הצהרות הייבוא השונות בקובץ"""
    # מתקן מבנה של import עם סוגריים מסולסלים
    content = re.sub(r'import\s*{([^}]*?)(?:,\s*)?}', r'import {\1}', content)
    
    # מתקן מבנה של import type
    content = re.sub(r'import\s+type\s*{([^}]*?)(?:,\s*)?}', r'import type {\1}', content)
    
    # מתקן סוגריים מסולסלים בהתחלת שורה
    content = re.sub(r'^\s*}\s+from', r'} from', content, flags=re.MULTILINE)
    
    # מתקן מקרים של "as" בייבוא
    content = re.sub(r'(\w+)\s+as\s+(\w+)', r'\1 as \2', content)
    
    return content

def process_file(file_path):
    """מעבד קובץ ומתקן את השגיאות בו"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        original_content = content
        
        content = fix_client_directive(content)
        content = fix_import_statements(content)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
            
        return False
    except Exception as e:
        print(f"Error processing {file_path}: {str(e)}")
        return False

def main():
    # מצא את כל קבצי TypeScript/React בפרויקט
    ts_files = glob.glob("src/**/*.ts", recursive=True) + glob.glob("src/**/*.tsx", recursive=True)
    ts_files = [f for f in ts_files if not f.endswith('.d.ts')]
    
    fixed_count = 0
    for file_path in ts_files:
        if process_file(file_path):
            print(f"Fixed file: {file_path}")
            fixed_count += 1
    
    print(f"\nProcessed {len(ts_files)} files")
    print(f"Fixed {fixed_count} files with issues")
    print("Done!")

if __name__ == "__main__":
    main() 