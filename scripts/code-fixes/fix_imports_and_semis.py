#!/usr/bin/env python3
"""
סקריפט זה מתקן בעיות נפוצות הקשורות לסדר ייבוא וסמיקולונים מיותרים:
1. מוסיף שורות ריקות בין קבוצות ייבוא 
2. מסיר סמיקולונים מיותרים (במקומות שגורמים לאזהרות לינט)
3. מסדר קבוצות ייבוא לפי הסדר המומלץ
"""

import os
import re
import glob
from typing import List, Tuple

def read_file(file_path):
    """קריאת הקובץ וטיפול בשגיאות"""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()
    except Exception as e:
        print(f"שגיאה בקריאת {file_path}: {e}")
        return None

def write_file(file_path, content):
    """כתיבה לקובץ וטיפול בשגיאות"""
    try:
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(content)
        return True
    except Exception as e:
        print(f"שגיאה בכתיבה ל {file_path}: {e}")
        return False

def categorize_imports(imports: List[str]) -> Tuple[List[str], List[str], List[str], List[str], List[str]]:
    """
    Categorize imports into five groups:
    1. React and Next.js imports (e.g., 'react', 'next', 'next/*')
    2. External library imports (node modules)
    3. Absolute internal imports (e.g., '@/components/*')
    4. Relative internal imports (e.g., '../utils')
    5. Type imports (import type)
    """
    react_nextjs_imports = []
    external_imports = []
    absolute_internal_imports = []
    relative_internal_imports = []
    type_imports = []

    for imp in imports:
        # Check if it's a type import
        if re.search(r'import\s+type\s+', imp):
            type_imports.append(imp)
        # Check if it's a React or Next.js import
        elif re.search(r'import\s+.*from\s+[\'"](?:react|next|next\/.*)[\'"]', imp):
            react_nextjs_imports.append(imp)
        # Check if it's an absolute internal import
        elif re.search(r'import\s+.*from\s+[\'"]@\/', imp):
            absolute_internal_imports.append(imp)
        # Check if it's a relative internal import
        elif re.search(r'import\s+.*from\s+[\'"]\.\/', imp) or re.search(r'import\s+.*from\s+[\'"]\.\.[\'"]', imp):
            relative_internal_imports.append(imp)
        # Otherwise, it's an external import
        else:
            external_imports.append(imp)

    return (
        react_nextjs_imports,
        external_imports,
        absolute_internal_imports,
        relative_internal_imports,
        type_imports
    )

def fix_import_order(content):
    """Fix import order in file content."""
    # Match all import statements
    import_section_match = re.search(r'^(import[\s\S]+?)(const|let|var|function|class|interface|type|export|\/\/|\n\n|$)', content, re.MULTILINE)
    
    if not import_section_match:
        return content
    
    import_section = import_section_match.group(1)
    remaining_content = content[len(import_section):]
    
    # Split import statements
    imports = re.findall(r'(import\s+(?:(?:type\s+)?(?:(?:\{[^}]*\})|(?:[^{}\s;]+))\s+from\s+(?:[\'"][^\'";]+[\'"])|(?:\*\s+as\s+[^\s;]+\s+from\s+[\'"][^\'";]+[\'"])|(?:[^\s;]+\s+from\s+[\'"][^\'";]+[\'"])|(?:[\'"][^\'";]+[\'"]))\s*;?)', import_section)
    
    if not imports:
        return content
    
    # Remove imports from original content for replacement
    content_without_imports = content[len(import_section_match.group(0)):]
    
    # Categorize imports
    (
        react_nextjs_imports,
        external_imports,
        absolute_internal_imports,
        relative_internal_imports,
        type_imports
    ) = categorize_imports(imports)
    
    # Function to ensure imports end with a newline
    def ensure_newline(imports_list):
        return [imp if imp.endswith('\n') else imp + '\n' for imp in imports_list]
    
    # Organize imports with empty lines between categories
    organized_imports = []
    if react_nextjs_imports:
        organized_imports.extend(ensure_newline(react_nextjs_imports))
        if external_imports or absolute_internal_imports or relative_internal_imports or type_imports:
            organized_imports.append('\n')
    
    if external_imports:
        organized_imports.extend(ensure_newline(external_imports))
        if absolute_internal_imports or relative_internal_imports or type_imports:
            organized_imports.append('\n')
    
    if absolute_internal_imports:
        organized_imports.extend(ensure_newline(absolute_internal_imports))
        if relative_internal_imports or type_imports:
            organized_imports.append('\n')
    
    if relative_internal_imports:
        organized_imports.extend(ensure_newline(relative_internal_imports))
        if type_imports:
            organized_imports.append('\n')
    
    if type_imports:
        organized_imports.extend(ensure_newline(type_imports))
    
    # Join organized imports and add the rest of the content
    if import_section_match.group(2).strip() == "":
        # If there was a double newline after imports, we need to maintain that
        return ''.join(organized_imports) + remaining_content
    else:
        # Otherwise, ensure a single newline before the rest of the content
        return ''.join(organized_imports) + remaining_content

def remove_unnecessary_semicolons(content):
    """הסרת סמיקולונים מיותרים בקוד JSX/TSX"""
    # החלפת סמיקולונים מיותרים בסוף הצהרות JSX
    content = re.sub(r'(<[^>]+>);', r'\1', content)
    
    # הסרת סמיקולונים בסוף שורות בקוד JSX
    content = re.sub(r'(\s+)};', r'\1}', content)
    
    # הסרת סמיקולונים בסוף הצהרות פונקציה - יש לשים לב לא להשתמש ב-\w במקטע ההחלפה
    content = re.sub(r'function\s+(\w+)\([^)]*\)\s*{[^}]*};', 
                     r'function \1([^)]*) {[^}]*}', content)
    
    return content

def fix_file(file_path):
    """תיקון קובץ ספציפי"""
    content = read_file(file_path)
    if content is None:
        return False
    
    original_content = content
    
    # הפעלת התיקונים
    content = fix_import_order(content)
    content = remove_unnecessary_semicolons(content)
    
    # שמירת הקובץ רק אם היו שינויים
    if content != original_content:
        if write_file(file_path, content):
            return True
    
    return False

def process_files():
    """עיבוד כל הקבצים הרלוונטיים"""
    # הגדרת תבניות קבצים לטיפול
    patterns = [
        "./src/**/*.ts",
        "./src/**/*.tsx",
        "./src/**/*.js",
        "./src/**/*.jsx",
    ]
    
    fixed_files = 0
    total_files = 0
    
    for pattern in patterns:
        for file_path in glob.glob(pattern, recursive=True):
            total_files += 1
            if fix_file(file_path):
                fixed_files += 1
                print(f"תוקן: {file_path}")
    
    print(f"\nסיכום: נבדקו {total_files} קבצים, תוקנו {fixed_files} קבצים")

if __name__ == "__main__":
    process_files() 