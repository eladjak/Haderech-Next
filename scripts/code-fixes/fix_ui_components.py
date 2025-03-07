#!/usr/bin/env python3
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

def fix_ui_component(content, file_path):
    # Add "use client" directive if not present
    if not content.strip().startswith('"use client"') and not content.strip().startswith("'use client'"):
        content = '"use client"\n\n' + content

    # Fix 'const' exports in UI components
    if "Identifier expected. 'const' is a reserved word" in content or re.search(r"export const [A-Za-z]+ =", content):
        content = re.sub(r"export const ([A-Za-z]+) =", r"export const \1 =", content)
        
    # Fix accordion, aspect-ratio and other radix-ui based components
    if "accordion.tsx" in file_path or "aspect-ratio.tsx" in file_path or any(x in file_path for x in ["collapsible.tsx", "command.tsx", "context-menu.tsx", "dialog.tsx", "drawer.tsx", "dropdown-menu.tsx", "hover-card.tsx", "menubar.tsx", "navigation-menu.tsx", "popover.tsx", "radio-group.tsx", "resizable.tsx", "scroll-area.tsx", "select.tsx", "separator.tsx", "sheet.tsx", "slider.tsx", "switch.tsx", "tabs.tsx", "toast.tsx", "tooltip.tsx"]):
        # Fix for the Radix UI components missing proper export format
        content = re.sub(r"export const ([A-Za-z]+) =", r"export const \1 =", content)
        content = re.sub(r"(export const [A-Za-z]+) = React\.forwardRef\(\(\{", r"\1 = React.forwardRef(({", content)
        content = re.sub(r"(export const [A-Za-z]+) = React\.forwardRef\(\(", r"\1 = React.forwardRef((", content)
        
        # Fix missing braces and parentheses
        content = re.sub(r"\}\),\s*$", r"})),", content)
        content = re.sub(r"\}\)$", r"}))", content)
        
        # Fix missing commas in JSX props
        content = re.sub(r"(\w+)=\{([^}]+)\}(\w+)", r"\1={\2}\3", content)
        
    # Fix checkbox and progress components
    if "checkbox.tsx" in file_path or "progress.tsx" in file_path:
        # Fix missing commas in JSX props
        content = re.sub(r'className=\{([^}]+)\}(\w+)', r'className={\1},\2', content)

    # Fix carousels and other specialized UI components
    components_needing_parentheses = ["breadcrumbs.tsx", "carousel-3d.tsx", "confetti.tsx", "glow.tsx", "gradient.tsx", "marquee.tsx", "noise.tsx", "parallax.tsx", "particles.tsx", "reveal.tsx", "scroll-to-top.tsx", "sparkles.tsx", "Spinner.tsx", "spotlight.tsx", "typewriter.tsx", "waves.tsx"]
    
    if any(component in file_path for component in components_needing_parentheses):
        # Add missing closing parentheses
        if not content.strip().endswith(')'):
            content = content.rstrip() + "\n)"
            
    # Fix user-profile, user-card, social-recommendations components
    components_needing_parentheses_2 = ["user-profile.tsx", "user-card.tsx", "social-recommendations.tsx", "recommended-courses-preview.tsx", "referral-management.tsx", "shared/error-boundary.tsx", "shared/social-recommendations.tsx", "course-rating.tsx", "latest-forum-posts.tsx", "providers/index.tsx", "providers/translations-provider.tsx"]
    
    if any(component in file_path for component in components_needing_parentheses_2):
        # Add missing closing parentheses
        if not content.strip().endswith(')'):
            content = content.rstrip() + "\n)"
    
    # Fix missing closing tags in JSX
    if "layout/footer.tsx" in file_path:
        content = re.sub(r'<Link([^>]+)>([^<]*)', r'<Link\1>\2</Link>', content)
    
    if "layout/header.tsx" in file_path:
        content = re.sub(r'<Link([^>]+)>([^<]*)', r'<Link\1>\2</Link>', content)
    
    if "layout/main-nav.tsx" in file_path:
        content = re.sub(r'<Link([^>]+)>([^<]*)', r'<Link\1>\2</Link>', content)
    
    if "layout/site-footer.tsx" in file_path:
        content = re.sub(r'<nav([^>]+)>([^<]*)<div', r'<nav\1>\2</nav><div', content)
    
    if "simulator/ErrorDisplay.tsx" in file_path:
        content = re.sub(r'<Alert([^>]+)>([^<]*)<AlertTitle', r'<Alert\1>\2</Alert><AlertTitle', content)
    
    if "course/course-progress.tsx" in file_path:
        content = re.sub(r'<CardHeader([^>]+)>([^<]*)<CardTitle', r'<CardHeader\1>\2</CardHeader><CardTitle', content)
    
    if "simulator/ScenarioSelector.tsx" in file_path:
        content = re.sub(r'<div([^>]+)>([^<]*)<Select', r'<div\1>\2</div><Select', content)
    
    # Fix course components with expected brackets
    if "course/course-header.tsx" in file_path or "simulator/ChatHeader.tsx" in file_path or "simulator/MessageDisplay.tsx" in file_path or "layout/layout.tsx" in file_path or "layout/site-layout.tsx" in file_path:
        if not re.search(r'\}\s*\)\s*$', content):
            content = content.rstrip() + "\n})"
    
    return content

def fix_chatbot_components(content, file_path):
    # Fix chatbot components specifically
    if "chatbot/ChatbotContainer.tsx" in file_path or "chatbot/ChatbotProvider.tsx" in file_path:
        # Add missing closing parentheses
        if not content.strip().endswith(')'):
            content = content.rstrip() + "\n)"
    
    if "chatbot/ChatbotWindow.tsx" in file_path:
        # Fix missing commas
        content = re.sub(r'(className="[^"]+")(\s+)(onClick)', r'\1,\2\3', content)
    
    return content

def fix_course_components(content, file_path):
    # Fix course components specifically
    if "course/course-comments.tsx" in file_path or "course/course-ratings.tsx" in file_path:
        # Add missing closing parentheses
        if not content.strip().endswith(')'):
            content = content.rstrip() + "\n)"
    
    # Fix course-content and course-sidebar
    if "course/course-content.tsx" in file_path or "course/course-sidebar.tsx" in file_path:
        # Fix expression expected errors
        content = re.sub(r"import\s+\{\s*([^}]+)\s*\}\s+from\s+('[^']+'|\"[^\"]+\")\s*;?", r"import { \1 } from \2;", content)
    
    return content

def fix_simulator_components(content, file_path):
    if "simulator/MessageItem.tsx" in file_path:
        # Fix identifier expected errors
        content = re.sub(r"(const\s+\w+)\s*=\s*\(([^)]*)\)", r"\1 = (\2) =>", content)
    
    if "simulator/MessageList.tsx" in file_path:
        # Fix declaration or statement expected
        content = re.sub(r"{\s*messages\s*\?\s*messages\.map", r"{ messages ? messages.map", content)
    
    if "simulator/MessageInput.tsx" in file_path:
        # Fix type expected
        content = re.sub(r"(onChange=\{)([^}]+)(\})", r"\1(e) => \2\3", content)
    
    return content

def process_ui_components():
    # Define patterns to match UI component files
    patterns = [
        "./src/components/ui/*.tsx",
        "./src/components/chatbot/*.tsx",
        "./src/components/course/*.tsx",
        "./src/components/simulator/*.tsx",
        "./src/components/layout/*.tsx",
        "./src/components/shared/*.tsx",
        "./src/components/*.tsx",
        "./src/components/auth/*.tsx",
        "./src/app/providers.tsx"
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
        content = fix_ui_component(content, file_path)
        content = fix_chatbot_components(content, file_path)
        content = fix_course_components(content, file_path)
        content = fix_simulator_components(content, file_path)
        
        if content != original_content:
            if write_file(file_path, content):
                fixed_files_count += 1
                print(f"Fixed: {file_path}")
            else:
                print(f"Failed to write: {file_path}")
    
    print(f"Processed {processed_files_count} files, fixed {fixed_files_count} files.")

if __name__ == "__main__":
    process_ui_components() 