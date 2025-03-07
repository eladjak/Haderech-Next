#!/usr/bin/env python3
import os
import re
import glob

def fix_component_files(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as file:
            content = file.read()
    except:
        print(f"Error reading file: {filepath}")
        return False

    # Flag to track if we made changes
    changes_made = False
    original_content = content
    
    # Ensure 'use client' is at the top of component files
    if 'components' in filepath and not '/api/' in filepath and not filepath.endswith('.ts'):
        if not re.search(r'^[\'"]use client[\'"]', content):
            content = '"use client";\n\n' + content
            changes_made = True
    
    # Fix AboutPage.tsx issues - add use client and proper export
    if 'AboutPage.tsx' in filepath:
        if not re.search(r'^[\'"]use client[\'"]', content):
            content = '"use client";\n\n' + content
            changes_made = True
        
        # Make sure export is working correctly
        content = re.sub(r'export\s+default\s+function\s+(\w+)', r'function \1', content)
        
        # Add export at the end of the file
        if not "export default" in content:
            function_name = re.search(r'function\s+(\w+)', content)
            if function_name:
                content += f"\n\nexport default {function_name.group(1)};\n"
                changes_made = True
    
    # Fix missing parentheses in JSX components
    if re.search(r'<\w+[^>]*>\s*[^<\s]+\s*(?!</)', content):
        # Identify all HTML tags missing closing tags
        for match in re.finditer(r'<(\w+)([^>]*)>([^<\s]+)\s*(?!</\1>)', content):
            tag_name = match.group(1)
            tag_props = match.group(2)
            tag_content = match.group(3)
            # Replace with proper closing tag
            content = content.replace(
                f"<{tag_name}{tag_props}>{tag_content}", 
                f"<{tag_name}{tag_props}>{tag_content}</{tag_name}>"
            )
            changes_made = True
    
    # Fix missing commas in objects with JSX props
    if re.search(r'(\w+)=\{[^}]+\}\s+(\w+)=', content):
        content = re.sub(r'(\w+)=\{([^}]+)\}(\s+)(\w+=)', r'\1={\2}\3,\4', content)
        changes_made = True
    
    # Fix simulator component issues
    if 'simulator' in filepath:
        # Fix common issue with FEEDBACK_CRITERIA
        if 'FEEDBACK_CRITERIA' in content and not 'export const FEEDBACK_CRITERIA' in content:
            content = re.sub(r'const\s+FEEDBACK_CRITERIA', r'export const FEEDBACK_CRITERIA', content)
            changes_made = True
    
    # Fix chatbot component issues
    if 'chatbot' in filepath and "')' expected" in content:
        # Fix specific JSX errors in chatbot components
        if re.search(r'<div[^>]*>\s*\{[^}]+\}\s*(?!</div>)', content):
            content = re.sub(r'(<div[^>]*>)(\s*\{[^}]+\}\s*)(?!</div>)', r'\1\2</div>', content)
            changes_made = True
    
    # Fix theme-toggle.tsx - common issue
    if 'theme-toggle.tsx' in filepath:
        # Make sure it has use client
        if not re.search(r'^[\'"]use client[\'"]', content):
            content = '"use client";\n\n' + content
            changes_made = True
        
        # Fix export issues
        if 'export function' in content:
            content = re.sub(r'export\s+function\s+(\w+)', r'function \1', content)
            
            # Add export at the end
            function_name = re.search(r'function\s+(\w+)', content)
            if function_name and not f"export default {function_name.group(1)}" in content:
                content += f"\n\nexport default {function_name.group(1)};\n"
                changes_made = True
    
    # Fix auth form issues
    if '/auth/' in filepath and ('.tsx' in filepath or '.jsx' in filepath):
        # Make sure it has use client
        if not re.search(r'^[\'"]use client[\'"]', content):
            content = '"use client";\n\n' + content
            changes_made = True
            
        # Fix common export issues
        if 'export function' in content:
            # Find the function name
            function_name = re.search(r'export\s+function\s+(\w+)', content)
            if function_name:
                # Replace the export function with just function
                content = re.sub(r'export\s+function\s+(\w+)', r'function \1', content)
                
                # Add export at the end
                if not f"export default {function_name.group(1)}" in content:
                    content += f"\n\nexport default {function_name.group(1)};\n"
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
    # Focus on component files with issues
    target_patterns = [
        './src/components/AboutPage.tsx',
        './src/components/theme-toggle.tsx',
        './src/components/auth/*.tsx',
        './src/components/simulator/*.tsx',
        './src/components/chatbot/*.tsx',
        './src/app/providers.tsx',
        './src/components/course/*.tsx',
        './src/tests/a11y/*.tsx',
        './src/components/layout/*.tsx'
    ]
    
    fixed_count = 0
    total_files = 0
    
    for pattern in target_patterns:
        for filepath in glob.glob(pattern, recursive=True):
            total_files += 1
            if fix_component_files(filepath):
                fixed_count += 1
                print(f"Fixed: {filepath}")
    
    print(f"Processed {total_files} files, fixed {fixed_count} files with component issues.")

if __name__ == "__main__":
    process_files() 