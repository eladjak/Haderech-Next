#!/usr/bin/env python3
import os
import re
import glob

def fix_type_files(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as file:
            content = file.read()
    except:
        print(f"Error reading file: {filepath}")
        return False

    # Flag to track if we made changes
    changes_made = False
    original_content = content
    
    # Fix common issues in type files
    
    # Add export to interfaces and types - using simpler approach without lookbehind
    lines = content.split('\n')
    new_lines = []
    for line in lines:
        # Add export to interface declarations if not already present
        if re.match(r'^\s*interface\s+\w+', line) and not re.match(r'^\s*export\s+interface', line):
            line = re.sub(r'(^\s*)interface', r'\1export interface', line)
            changes_made = True
        
        # Add export to type declarations if not already present
        if re.match(r'^\s*type\s+\w+', line) and not re.match(r'^\s*export\s+type', line):
            line = re.sub(r'(^\s*)type', r'\1export type', line)
            changes_made = True
        
        new_lines.append(line)
    
    content = '\n'.join(new_lines)
    
    # Fix missing semicolons after interface or type declarations
    content = re.sub(r'(interface|type)\s+(\w+)\s*{([^}]*)}\s*(?=[a-zA-Z])', r'\1 \2 {\3};\n', content)
    
    # Fix api.ts specific issues
    if 'api.ts' in filepath:
        # Fix declaration errors
        # Add missing semicolons
        content = re.sub(r'}\s*(?=export|interface|type)', r'};\n\n', content)
        changes_made = True
    
    # Fix models.ts specific issues
    if 'models.ts' in filepath:
        # Fix declaration errors
        # Add missing semicolons
        content = re.sub(r'}\s*(?=export|interface|type)', r'};\n\n', content)
        changes_made = True
    
    # Fix forumSlice.ts specific issues
    if 'forumSlice.ts' in filepath:
        # Fix declaration errors
        # Add missing semicolons after interface declarations
        content = re.sub(r'(interface\s+\w+\s*{[^}]*})\s*(?=\w)', r'\1;\n', content)
        
        # Ensure proper imports
        if not re.search(r'import\s+{\s*createSlice', content):
            content = "import { createSlice, PayloadAction } from '@reduxjs/toolkit';\n" + content
            changes_made = True
    
    # Fix test-mocks.ts specific issues
    if 'test-mocks.ts' in filepath:
        # Fix declaration errors
        # Add missing semicolons
        content = re.sub(r'}\s*(?=export|const|function|interface|type)', r'};\n\n', content)
        changes_made = True
    
    if changes_made or content != original_content:
        try:
            with open(filepath, 'w', encoding='utf-8') as file:
                file.write(content)
            return True
        except:
            print(f"Error writing to file: {filepath}")
            return False
    return False

def process_files():
    # Focus on type files
    target_patterns = [
        './src/types/*.ts',
        './src/types/*.d.ts',
        './src/store/slices/forumSlice.ts',
        './src/tests/utils/test-mocks.ts',
        './src/lib/services/simulator.ts'
    ]
    
    fixed_count = 0
    total_files = 0
    
    for pattern in target_patterns:
        for filepath in glob.glob(pattern, recursive=True):
            total_files += 1
            if fix_type_files(filepath):
                fixed_count += 1
                print(f"Fixed: {filepath}")
    
    print(f"Processed {total_files} files, fixed {fixed_count} files with type declaration issues.")

if __name__ == "__main__":
    process_files() 