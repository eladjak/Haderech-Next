#!/usr/bin/env python3
import os
import re
import glob

def fix_parsing_issues(filepath):
    with open(filepath, 'r', encoding='utf-8') as file:
        content = file.read()

    # Flag to track if we made changes
    changes_made = False
    original_content = content
    
    # Fix missing parentheses in function calls
    parentheses_pattern = r'(\w+)\s+(\w+)\s*=\s*{}'
    if re.search(parentheses_pattern, content):
        content = re.sub(parentheses_pattern, r'\1 \2 = {}', content)
        changes_made = True
    
    # Fix missing commas in objects
    if "Error: Parsing error: ',' expected" in content:
        content = re.sub(r'(\w+):\s*([^,}]+)(?=\s+\w+:)', r'\1: \2,', content)
        changes_made = True
    
    # Fix declaration issues in type files
    if filepath.endswith('.ts') and "Declaration or statement expected" in content:
        # Check for interface or type with missing semicolons
        content = re.sub(r'(interface|type)\s+(\w+)\s*{([^}]*)}\s*(?=[a-zA-Z])', r'\1 \2 {\3};\n', content)
        changes_made = True
    
    # Fix common issues in types/api.ts 
    if 'types/api.ts' in filepath:
        # Fix export issue
        if not content.startswith('export ') and 'interface' in content:
            lines = content.split('\n')
            new_lines = []
            for line in lines:
                if line.startswith('interface '):
                    line = 'export ' + line
                new_lines.append(line)
            content = '\n'.join(new_lines)
            changes_made = True
    
    # Fix missing 'use client' in component files
    is_component = any(pattern in filepath for pattern in ['/components/', '/app/'])
    if is_component and not filepath.endswith('.ts') and not '/api/' in filepath:
        if not re.search(r'^[\'"]use client[\'"]', content):
            content = '"use client";\n\n' + content
            changes_made = True
    
    # Fix Expression expected in component files
    expression_pattern = r'(<\w+)[^>]*\s+$'
    if re.search(expression_pattern, content):
        content = re.sub(expression_pattern, r'\1 >', content)
        changes_made = True
    
    # Fix models.ts issues
    if 'types/models.ts' in filepath:
        # Add export to interfaces
        if 'interface' in content and not 'export interface' in content:
            content = content.replace('interface ', 'export interface ')
            changes_made = True
    
    # Fix AboutPage.tsx issues
    if 'AboutPage.tsx' in filepath and 'Expression expected' in content:
        content = '"use client";\n\n' + re.sub(r'export\s+default\s+function\s+AboutPage', r'export default function AboutPage', content)
        changes_made = True
    
    # Fix broken simulator.ts or service files
    if '/services/' in filepath and 'simulator.ts' in filepath:
        if 'Expression expected' in content:
            content = re.sub(r'export\s+const\s+(\w+)(?=[^\(])', r'export const \1', content)
            changes_made = True
    
    # Fix missing parentheses in test files
    if '/tests/' in filepath and "Argument expression expected" in content:
        content = re.sub(r'(describe|test|it)\s+\(\s*[\'"](.+?)[\'"]\s*([,)])', r'\1(\'\2\'\3', content)
        changes_made = True
    
    # Fix closing parentheses in component files
    if "')' expected" in content:
        if re.search(r'<([A-Za-z]+)(\s+[^>]*)?>\s*(\S+)\s*(?!</\1>)', content):
            content = re.sub(r'<([A-Za-z]+)(\s+[^>]*)?>\s*(\S+)\s*(?!</\1>)', r'<\1\2>\3</\1>', content)
            changes_made = True
    
    if changes_made:
        with open(filepath, 'w', encoding='utf-8') as file:
            file.write(content)
        return True
    return False

def process_files():
    # Focus on problematic files
    target_patterns = [
        './src/types/*.ts',
        './src/components/AboutPage.tsx',
        './src/lib/services/simulator.ts',
        './src/tests/unit/components/forum/*.test.tsx',
        './src/tests/unit/services/*.test.ts',
        './src/app/api/__tests__/*.test.ts',
        './src/components/simulator/*.tsx',
        './src/components/chatbot/*.tsx',
        './src/components/auth/*.tsx'
    ]
    
    fixed_count = 0
    total_files = 0
    
    for pattern in target_patterns:
        for filepath in glob.glob(pattern, recursive=True):
            total_files += 1
            if fix_parsing_issues(filepath):
                fixed_count += 1
                print(f"Fixed: {filepath}")
    
    print(f"Processed {total_files} files, fixed {fixed_count} files with parsing issues.")

if __name__ == "__main__":
    process_files() 