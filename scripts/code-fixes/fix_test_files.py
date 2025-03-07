#!/usr/bin/env python3
import os
import re
import glob

def fix_test_files(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as file:
            content = file.read()
    except:
        print(f"Error reading file: {filepath}")
        return False

    # Flag to track if we made changes
    changes_made = False
    original_content = content
    
    # Fix missing jest/vitest functions
    if 'Argument expression expected' in content or 'argument expected' in content:
        # Fix missing parentheses in test functions
        content = re.sub(r'(describe|test|it|beforeEach|afterEach|beforeAll|afterAll)\s*\(\s*[\'"]([^\'"]+)[\'"]\s*(?:,|\))', 
                         r'\1("\2"', content)
        content = content.replace('("', '("')
        content = content.replace('")', '")')
        changes_made = True
    
    # Fix import issues from test modules
    if 'test-mocks' in content and 'test-mocks.ts' not in filepath:
        # Fix missing imports
        if not re.search(r'import\s+{[^}]*}\s+from\s+[\'"]@/tests/utils/test-mocks[\'"]', content):
            # Add import
            content = re.sub(r'(import\s+[^;]+;\n)', r'\1import { mockUser, mockPost } from "@/tests/utils/test-mocks";\n', content, count=1)
            changes_made = True
    
    # Fix expected commas in test assertions
    comma_pattern = r'(\s*expect\([^)]+\)\.to[A-Za-z\.]+\([^)]+\))(\s+expect)'
    if re.search(comma_pattern, content):
        content = re.sub(comma_pattern, r'\1;\2', content)
        changes_made = True
    
    # Fix missing semi-colons in test assertions
    if re.search(r'(expect\([^)]+\)\.to[A-Za-z\.]+\([^)]+\))\s*(?!;|\))', content):
        content = re.sub(r'(expect\([^)]+\)\.to[A-Za-z\.]+\([^)]+\))\s*(?!;|\))', r'\1;', content)
        changes_made = True
    
    # Fix problems in forum test files
    if 'forum' in filepath and 'test' in filepath:
        # Fix import issues
        if 'CreatePost' in content and not 'import { CreatePost }' in content:
            content = re.sub(r'(import\s+[^;]+;\n)', r'\1import { CreatePost } from "@/components/forum/CreatePost";\n', content, count=1)
            changes_made = True
        
        if 'ForumComment' in content and not 'import { ForumComment }' in content:
            content = re.sub(r'(import\s+[^;]+;\n)', r'\1import { ForumComment } from "@/components/forum/ForumComment";\n', content, count=1)
            changes_made = True
    
    # Fix performance test issues
    if 'perf' in filepath and 'test' in filepath:
        # Fix common identifier issue
        content = re.sub(r'export\s+(const|function)', r'\1', content)
        # Add exports at the end
        const_funcs = re.findall(r'(const|function)\s+(\w+)', content)
        if const_funcs and not 'export {' in content:
            export_names = [name for _, name in const_funcs]
            content += f"\n\nexport {{\n  {', '.join(export_names)}\n}};\n"
            changes_made = True
    
    # Fix security test files
    if 'security' in filepath and 'test' in filepath:
        # Fix common issues
        if 'Argument expression expected' in content:
            content = re.sub(r'(test|describe)\s+\(\s*[\'"]([^\'"]+)[\'"]', r'\1("\2"', content)
            changes_made = True
    
    # Fix build test files
    if 'build' in filepath and 'test' in filepath:
        # Fix identifier issues
        content = re.sub(r'export\s+(const|function)', r'\1', content)
        # Add exports at the end
        const_funcs = re.findall(r'(const|function)\s+(\w+)', content)
        if const_funcs and not 'export {' in content:
            export_names = [name for _, name in const_funcs]
            content += f"\n\nexport {{\n  {', '.join(export_names)}\n}};\n"
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
    # Focus on test files with issues
    target_patterns = [
        './src/tests/unit/components/forum/*.test.tsx',
        './src/tests/unit/services/*.test.ts',
        './src/tests/performance/*.test.ts',
        './src/tests/performance/*.test.tsx',
        './src/tests/security/*.test.ts', 
        './src/tests/build/*.test.ts',
        './src/app/api/__tests__/*.test.ts',
        './src/tests/a11y/*.test.tsx',
        './src/tests/integration/forum/*.test.tsx'
    ]
    
    fixed_count = 0
    total_files = 0
    
    for pattern in target_patterns:
        for filepath in glob.glob(pattern, recursive=True):
            total_files += 1
            if fix_test_files(filepath):
                fixed_count += 1
                print(f"Fixed: {filepath}")
    
    print(f"Processed {total_files} files, fixed {fixed_count} files with test issues.")

if __name__ == "__main__":
    process_files() 