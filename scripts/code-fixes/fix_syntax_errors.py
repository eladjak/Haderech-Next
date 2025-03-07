#!/usr/bin/env python3
import os
import re
import glob

def read_file(file_path):
    """Read file content and handle errors."""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return None

def write_file(file_path, content):
    """Write content to file and handle errors."""
    try:
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(content)
        return True
    except Exception as e:
        print(f"Error writing to {file_path}: {e}")
        return False

def fix_ui_component_syntax(content, file_path):
    """Fix common UI component syntax errors."""
    original_content = content
    
    # Fix missing closing JSX tags like 'Link', 'Alert', 'CardHeader', etc.
    jsx_tags = ['Link', 'Alert', 'CardHeader', 'div', 'nav']
    for tag in jsx_tags:
        pattern = rf'<{tag}([^>]*)>([^<]*?)<(?!/{tag})'
        content = re.sub(pattern, rf'<{tag}\1>\2</{tag}><', content)
    
    # Fix missing closing brackets and parentheses
    bracket_pairs = [
        # Fix missing closing parenthesis in JSX expressions
        (r'\(\s*<([^>]+)>[^)]*$', r')\n'),
        # Fix missing closing braces
        (r'{\s*([^{}]*)$', r'}\n'),
        # Fix broken JSX components with ')' expected
        (r'return\s*\(\s*<([^>]+)>[^)]*$', r')\n')
    ]
    
    for pattern, replacement in bracket_pairs:
        if re.search(pattern, content, re.MULTILINE):
            content = content + replacement
    
    # Fix "Identifier expected" errors in function/const declarations
    if "Identifier expected. 'const' is a reserved word" in file_path or "Identifier expected" in file_path:
        # Check if "export const" is used incorrectly
        if re.search(r'export\s+const\s+\w+\s*=', content) and not '"use client"' in content:
            content = '"use client";\n\n' + content
        
        # Try to fix missing "export" before function or const
        content = re.sub(r'^(const\s+\w+\s*=)', r'export \1', content, flags=re.MULTILINE)
        content = re.sub(r'^(function\s+\w+\s*\()', r'export \1', content, flags=re.MULTILINE)
    
    # Fix "Expression expected" errors
    if "Expression expected" in file_path:
        # Add "use client" if missing
        if not '"use client"' in content:
            content = '"use client";\n\n' + content
        
        # Fix incomplete generic types
        content = re.sub(r'<\s*([A-Za-z]+)\s*>', r'<\1><\1>', content)
    
    # Fix missing commas
    if "',' expected" in file_path:
        # Finding key-value pairs without commas in objects
        content = re.sub(r'(\w+)\s*:\s*([^,{}\n]+)(\s*)(\w+\s*:)', r'\1: \2,\3\4', content)
    
    # Fix "Declaration or statement expected" errors
    if "Declaration or statement expected" in file_path:
        # Add "use client" directive
        if not '"use client"' in content:
            content = '"use client";\n\n' + content
        
        # Check for missing semicolons
        content = re.sub(r'(const\s+\w+\s*=\s*[^;{]+)(\s*?)(interface|type|const|let|var|function|export|class)', 
                          r'\1;\2\3', content)
    
    # Fix "'(' expected" errors
    if "'(' expected" in file_path:
        # Fix function calls without parentheses
        content = re.sub(r'(\w+)\s*=>\s*{\s*(\w+)(\s*)([\w.]+)', r'\1 => {\2\3\4(', content)
    
    # Fix broken function arguments
    if "Argument expression expected" in file_path:
        # Add empty parentheses to function calls without arguments
        content = re.sub(r'(\w+)\s*\(\s*(?:\))?$', r'\1()', content)
    
    # Fix multiple exports of same name
    if "Multiple exports of name" in file_path:
        # Identify and fix redundant exports
        matches = re.findall(r'export\s+{\s*(\w+)\s*}', content)
        for match in matches:
            # Count occurrences and remove duplicates
            if content.count(f'export {{ {match} }}') > 1:
                # Keep only the first occurrence
                parts = content.split(f'export {{ {match} }}')
                content = parts[0] + f'export {{ {match} }}' + ''.join(parts[2:])
    
    # Return True if changes were made, False otherwise
    return content if content != original_content else None

def fix_types_api_models(content, file_path):
    """Fix issues in types/api.ts and types/models.ts files."""
    original_content = content
    
    # Add "export" before type and interface declarations
    if re.search(r'^(type|interface)\s+\w+', content, re.MULTILINE):
        content = re.sub(r'^(type|interface)\s+(\w+)', r'export \1 \2', content, flags=re.MULTILINE)
    
    # Fix missing semicolons after type declarations
    content = re.sub(r'(type\s+\w+\s*=\s*[^;{]+)(\s*?)(type|interface|const|let|var|function|export|class)', 
                     r'\1;\2\3', content)
    
    # Fix "Declaration or statement expected" errors
    if re.search(r'[={]\s*$', content, re.MULTILINE):
        # Add placeholder for incomplete declarations
        content = re.sub(r'([={])\s*$', r'\1 {}', content, flags=re.MULTILINE)
    
    # Return True if changes were made, False otherwise
    return content if content != original_content else None

def fix_test_file_syntax(content, file_path):
    """Fix common syntax errors in test files."""
    original_content = content
    
    # Fix function calls with missing arguments
    content = re.sub(r'(describe|it|test|expect|render)\s*\(\s*(?:\))?$', r'\1("")', content)
    
    # Fix incomplete assertions
    content = re.sub(r'(expect\s*\([^)]*\))\s*\.\s*to\s*\.\s*([a-zA-Z]+)(\s*)$', r'\1.to.\2()', content)
    
    # Add placeholder test code for empty test files
    if re.search(r'(describe|it|test)\s*\(\s*["\'][^"\']*["\']\s*,\s*$', content):
        content += ') => {});\n'
    
    # Return True if changes were made, False otherwise
    return content if content != original_content else None

def fix_providers_components(content, file_path):
    """Fix provider components that have syntax errors."""
    original_content = content
    
    # Add "use client" if missing
    if not '"use client"' in content:
        content = '"use client";\n\n' + content
    
    # Fix incomplete React components
    if re.search(r'export\s+const\s+\w+\s*=\s*\(\s*{[^}]*}\s*\)\s*=>\s*\(\s*$', content):
        content += '<div></div>\n);\n'
    
    # Fix missing closing JSX tags
    jsx_tags = ['Provider', 'ThemeProvider', 'QueryClientProvider', 'StoreProvider']
    for tag in jsx_tags:
        pattern = rf'<{tag}([^>]*)>([^<]*?)<(?!/{tag})'
        content = re.sub(pattern, rf'<{tag}\1>\2</{tag}><', content)
    
    # Return True if changes were made, False otherwise
    return content if content != original_content else None

def fix_file(file_path):
    """Apply fixes to a file based on its type and location."""
    content = read_file(file_path)
    if content is None:
        return False
    
    modified_content = None
    
    # UI component fixes
    if file_path.endswith('.tsx') and ('/components/' in file_path or '/ui/' in file_path):
        modified_content = fix_ui_component_syntax(content, file_path)
    
    # Type files fixes
    elif file_path.endswith('.ts') and ('/types/' in file_path):
        if 'api.ts' in file_path or 'models.ts' in file_path:
            modified_content = fix_types_api_models(content, file_path)
    
    # Test files fixes
    elif 'test.ts' in file_path or 'test.tsx' in file_path:
        modified_content = fix_test_file_syntax(content, file_path)
    
    # Provider components fixes
    elif '/providers/' in file_path:
        modified_content = fix_providers_components(content, file_path)
    
    if modified_content:
        if write_file(file_path, modified_content):
            return True
    
    return False

def process_files():
    """Process files with common syntax errors."""
    # Files with common syntax errors from the linting output
    problem_patterns = [
        "./src/components/**/*.tsx",
        "./src/components/ui/*.tsx",
        "./src/types/*.ts",
        "./src/app/**/*.tsx",
        "./src/**/test*.ts",
        "./src/**/test*.tsx",
        "./src/providers/*.tsx",
    ]
    
    all_files = []
    for pattern in problem_patterns:
        all_files.extend(glob.glob(pattern, recursive=True))
    
    # Remove duplicates
    all_files = list(set(all_files))
    
    fixed_files = []
    for file_path in all_files:
        if fix_file(file_path):
            fixed_files.append(file_path)
            print(f"תוקן: {file_path}")
    
    return len(all_files), len(fixed_files), fixed_files

if __name__ == "__main__":
    total_files, fixed_files_count, fixed_files_list = process_files()
    print(f"\nנבדקו {total_files} קבצים, תוקנו {fixed_files_count} קבצים") 