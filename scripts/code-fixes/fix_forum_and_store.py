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

def fix_forum_component(content, file_path):
    # Fix ForumPost, ForumComment, and CreatePost components
    if "forum/ForumPost.tsx" in file_path:
        # Add "use client" directive if not present
        if not content.strip().startswith('"use client"') and not content.strip().startswith("'use client'"):
            content = '"use client"\n\n' + content
            
        # Fix "Identifier expected" issues
        content = re.sub(r"export\s+default\s+function\s+ForumPost", 
                         r"export default function ForumPost", content)
        
        # Ensure proper export
        if "export default function ForumPost" not in content:
            content = re.sub(r"function\s+ForumPost", 
                             r"export default function ForumPost", content)
                             
    if "forum/ForumComment.tsx" in file_path:
        # Add "use client" directive if not present
        if not content.strip().startswith('"use client"') and not content.strip().startswith("'use client'"):
            content = '"use client"\n\n' + content
            
        # Fix "Identifier expected" issues
        content = re.sub(r"export\s+default\s+function\s+ForumComment", 
                         r"export default function ForumComment", content)
        
        # Ensure proper export
        if "export default function ForumComment" not in content:
            content = re.sub(r"function\s+ForumComment", 
                             r"export default function ForumComment", content)
        
    if "forum/CreatePost.tsx" in file_path:
        # Add "use client" directive if not present
        if not content.strip().startswith('"use client"') and not content.strip().startswith("'use client'"):
            content = '"use client"\n\n' + content
            
        # Fix "Identifier expected. 'const' is a reserved word" issues
        if re.search(r"const\s+CreatePost\s*=", content):
            content = re.sub(r"const\s+CreatePost\s*=\s*\(\s*\{\s*([^}]+)\s*\}\s*\)\s*=>", 
                             r"export default function CreatePost({ \1 })", content)
    
    return content

def fix_store_slices(content, file_path):
    # Fix store slice files, particularly forumSlice.ts
    if "store/slices/forumSlice.ts" in file_path:
        # Fix declaration or statement expected
        if re.search(r'export\s+type\s+[A-Za-z]+\s*=\s*{', content):
            # Ensure there's a semicolon after each type declaration
            content = re.sub(r'(export\s+type\s+[A-Za-z]+\s*=\s*{[^}]+})\s*(?!\s*;)', r'\1;', content)
        
        # Fix interface declarations
        if re.search(r'export\s+interface\s+[A-Za-z]+\s*{', content):
            # Ensure there's a semicolon after each interface declaration
            content = re.sub(r'(export\s+interface\s+[A-Za-z]+\s*{[^}]+})\s*(?!\s*;)', r'\1;', content)
        
        # Make sure the createSlice is properly exported
        if "export const forumSlice = createSlice" in content:
            # Ensure we keep the export but fix the format
            content = re.sub(r'export\s+const\s+forumSlice\s*=\s*createSlice\(\{',
                             r'const forumSlice = createSlice({', content)
            
            # Add proper export at the end
            if not re.search(r'export\s+const\s+\{\s*[^}]+\s*\}\s*=\s*forumSlice.actions', content):
                if not content.strip().endswith(';'):
                    content = content.rstrip() + ";\n\n"
                content += "export const { setCategoryFilter, clearCategoryFilter, setTagFilter, clearTagFilter, setSortOption, setSearchTerm, clearAllFilters } = forumSlice.actions;\n"
                content += "export default forumSlice.reducer;\n"
    
    # Fix simulator.ts slice
    if "store/slices/simulator.ts" in file_path:
        # Add "use client" directive or fix imports if needed
        if not content.strip().startswith('"use client"') and not content.strip().startswith("'use client'"):
            content = '"use client"\n\n' + content
            
        # Fix identifier expected issues
        if "export const simulator" in content:
            content = re.sub(r'export\s+const\s+simulator\s*=\s*createSlice\(\{',
                             r'const simulator = createSlice({', content)
            
            # Add proper export at the end if missing
            if not re.search(r'export\s+const\s+\{\s*[^}]+\s*\}\s*=\s*simulator.actions', content):
                if not content.strip().endswith(';'):
                    content = content.rstrip() + ";\n\n"
                content += "export const { setScenario, setMessage, addMessage, clearMessages, setFeedback, clearFeedback, setError, clearError } = simulator.actions;\n"
                content += "export default simulator.reducer;\n"
    
    return content

def fix_test_files(content, file_path):
    # Fix test files for forum components
    if "/tests/unit/components/forum/" in file_path and file_path.endswith(".test.tsx"):
        # Fix "Argument expression expected" issues in test files
        # This is often with test function calls missing parentheses
        content = re.sub(r'(describe|it|test|beforeEach|afterEach|beforeAll|afterAll)\s*[\'"]([^\'"]+)[\'"]', 
                         r'\1("\2", () => ', content)
        
        # Ensure there's a closing parenthesis and bracket at the end of each test block
        if not content.strip().endswith(';') and not content.strip().endswith('}'):
            content = content.rstrip() + "\n});"
            
        # Fix missing commas in CreatePost.test.tsx
        if "CreatePost.test.tsx" in file_path:
            content = re.sub(r'(\s+)(\w+):\s*([\'"][^\'"]+[\'"])', r'\1\2: \3,', content)
    
    return content

def process_forum_and_store():
    # Define patterns to match forum and store files
    patterns = [
        "./src/components/forum/*.tsx",
        "./src/store/slices/*.ts",
        "./src/tests/unit/components/forum/*.test.tsx"
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
        content = fix_forum_component(content, file_path)
        content = fix_store_slices(content, file_path)
        content = fix_test_files(content, file_path)
        
        if content != original_content:
            if write_file(file_path, content):
                fixed_files_count += 1
                print(f"Fixed: {file_path}")
            else:
                print(f"Failed to write: {file_path}")
    
    print(f"Processed {processed_files_count} files, fixed {fixed_files_count} files.")

if __name__ == "__main__":
    process_forum_and_store() 