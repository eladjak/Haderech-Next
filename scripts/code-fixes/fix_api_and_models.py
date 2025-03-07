import os
import re
import glob

def read_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return None

def write_file(file_path, content):
    try:
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(content)
        return True
    except Exception as e:
        print(f"Error writing {file_path}: {e}")
        return False

def fix_api_file(content, file_path):
    # Common issues in API.ts files
    if "api.ts" in file_path:
        # Fix declaration or statement expected
        if re.search(r'export\s+type\s+[A-Za-z]+\s*=\s*{', content):
            # Ensure there's a semicolon after each type declaration
            content = re.sub(r'(export\s+type\s+[A-Za-z]+\s*=\s*{[^}]+})\s*(?!\s*;)', r'\1;', content)
        
        # Fix interface declarations
        if re.search(r'export\s+interface\s+[A-Za-z]+\s*{', content):
            # Ensure there's a semicolon after each interface declaration
            content = re.sub(r'(export\s+interface\s+[A-Za-z]+\s*{[^}]+})\s*(?!\s*;)', r'\1;', content)
    
    return content

def fix_models_file(content, file_path):
    # Specific fixes for models.ts
    if "models.ts" in file_path:
        # Fix declaration or statement expected at line 13, column 10
        # Look for patterns like `export type X = {` and ensure they end with semicolons
        # and are properly separated
        
        # Replace any potentially problematic blocks without semicolons
        content = re.sub(r'(export\s+type\s+[A-Za-z]+\s*=\s*{[^}]+})\s*(?!\s*;)', r'\1;', content)
        content = re.sub(r'(export\s+interface\s+[A-Za-z]+\s*{[^}]+})\s*(?!\s*;)', r'\1;', content)
        
        # Ensure proper spacing between type/interface declarations
        content = re.sub(r'(;\s*)(?=export\s+(type|interface))', r';\n\n', content)
    
    return content

def fix_api_tests(content, file_path):
    # Fix issues in API test files
    if "api/__tests__" in file_path and ".test.ts" in file_path:
        # Fix "Argument expression expected" issues in test files
        # This is often with test function calls missing parentheses
        content = re.sub(r'(describe|it|test|beforeEach|afterEach|beforeAll|afterAll)\s*[\'"]([^\'"]+)[\'"]', 
                         r'\1("\2", () => ', content)
        
        # Ensure there's a closing parenthesis and bracket at the end of each test block
        if not content.strip().endswith(';') and not content.strip().endswith('}'):
            content = content.rstrip() + "\n});"
    
    return content

def process_api_and_models():
    # Define patterns to match API and model files
    patterns = [
        "./src/types/api.ts",
        "./src/types/models.ts", 
        "./src/types/*.ts",
        "./src/app/api/__tests__/*.test.ts"
    ]
    
    all_files = []
    for pattern in patterns:
        all_files.extend(glob.glob(pattern))
    
    fixed_files_count = 0
    processed_files_count = 0
    
    for file_path in all_files:
        processed_files_count += 1
        content = read_file(file_path)
        if content is None:
            continue
        
        # Apply all fixing functions
        original_content = content
        content = fix_api_file(content, file_path)
        content = fix_models_file(content, file_path)
        content = fix_api_tests(content, file_path)
        
        if content != original_content:
            if write_file(file_path, content):
                fixed_files_count += 1
                print(f"Fixed: {file_path}")
            else:
                print(f"Failed to write: {file_path}")
    
    print(f"Processed {processed_files_count} files, fixed {fixed_files_count} files.")

if __name__ == "__main__":
    process_api_and_models() 