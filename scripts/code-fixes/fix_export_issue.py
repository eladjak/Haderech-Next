import os
import re
import glob

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as file:
        content = file.read()

    # Flag to track if we made changes
    changes_made = False
    original_content = content

    # Add "use client" directive if it's not already there and it's a component file
    if (not content.startswith('"use client"') and 
        not content.startswith("'use client'") and 
        ('import React' in content or 'function ' in content or 'const ' in content and ' = (' in content) and
        not '/api/' in filepath):
        content = '"use client";\n\n' + content
        changes_made = True

    # Fix export issues - remove wrapping parentheses
    if content.startswith('("use client"'):
        content = content.replace('("use client"', '"use client"')
        changes_made = True

    # Fix any instances of $1$2$1 in import paths
    if '$1$2$1' in content:
        content = re.sub(r'from\s+[\'"]?\$1\$2\$1[\'"]?', 'from "@/lib/utils"', content)
        changes_made = True

    # Fix UI component imports
    ui_components = {
        "Avatar": "@/components/ui/avatar",
        "AvatarFallback": "@/components/ui/avatar",
        "AvatarImage": "@/components/ui/avatar",
        "Badge": "@/components/ui/badge", 
        "Button": "@/components/ui/button",
        "buttonVariants": "@/components/ui/button",
        "Card": "@/components/ui/card",
        "CardContent": "@/components/ui/card",
        "CardDescription": "@/components/ui/card",
        "CardFooter": "@/components/ui/card",
        "CardHeader": "@/components/ui/card",
        "CardTitle": "@/components/ui/card",
        "Form": "@/components/ui/form",
        "FormControl": "@/components/ui/form",
        "FormDescription": "@/components/ui/form",
        "FormField": "@/components/ui/form",
        "FormItem": "@/components/ui/form",
        "FormLabel": "@/components/ui/form",
        "FormMessage": "@/components/ui/form",
        "Input": "@/components/ui/input",
        "Label": "@/components/ui/label",
        "Separator": "@/components/ui/separator",
        "Skeleton": "@/components/ui/skeleton",
        "Textarea": "@/components/ui/textarea",
        "Toaster": "@/components/ui/toaster"
    }

    # Fix specific imports from @/lib/utils
    for component, path in ui_components.items():
        # Pattern to match import { Component } from "@/lib/utils"
        pattern = rf'import\s+{{\s*(?:[^}}]*,\s*)?({component})(?:\s*,\s*[^}}]*)?\s*}}\s+from\s+[\'"]@/lib/utils[\'"]'
        
        if re.search(pattern, content):
            # Replace the import with the correct path
            content = re.sub(
                rf'import\s+{{\s*(?:([^}}]*),\s*)?{component}(?:\s*,\s*([^}}]*))?\s*}}\s+from\s+[\'"]@/lib/utils[\'"]',
                lambda m: fix_import_statement(m, component, path),
                content
            )
            changes_made = True

    # Fix utility imports
    utils = {"cn": "@/lib/utils", "formatDate": "@/lib/utils"}
    for util, path in utils.items():
        pattern = rf'import\s+{{\s*(?:[^}}]*,\s*)?({util})(?:\s*,\s*[^}}]*)?\s*}}\s+from\s+[\'"]@/lib/utils[\'"]'
        
        if re.search(pattern, content):
            content = re.sub(
                rf'import\s+{{\s*(?:([^}}]*),\s*)?{util}(?:\s*,\s*([^}}]*))?\s*}}\s+from\s+[\'"]@/lib/utils[\'"]',
                lambda m: fix_import_statement(m, util, path),
                content
            )
            changes_made = True

    # Fix lucide-react imports
    lucide_icons = [
        "Lightbulb", "Target", "HeartHandshake", "BookOpen", "MessageCircle", 
        "Users", "ArrowLeft", "ArrowRight", "Check", "ChevronLeft", "ChevronRight", 
        "ChevronsUpDown", "Circle", "Copy", "CreditCard", "Disc", "Download", 
        "Edit", "ExternalLink", "Eye", "EyeOff", "File", "FileText", "Flame", 
        "Heart", "HelpCircle", "Image", "Info", "Laptop", "Loader2", "Lock", 
        "LogOut", "Mail", "Menu", "MessageSquare", "Moon", "MoreHorizontal", 
        "MoreVertical", "Package", "Plus", "PlusCircle", "Rocket", "Search", 
        "Settings", "Share", "ShoppingBag", "ShoppingCart", "Slash", "Star", 
        "SunMedium", "Trash", "Twitter", "Upload", "User", "UserPlus", "X"
    ]
    
    for icon in lucide_icons:
        pattern = rf'import\s+{{\s*(?:[^}}]*,\s*)?({icon})(?:\s*,\s*[^}}]*)?\s*}}\s+from\s+[\'"]@/lib/utils[\'"]'
        
        if re.search(pattern, content):
            content = re.sub(
                rf'import\s+{{\s*(?:([^}}]*),\s*)?{icon}(?:\s*,\s*([^}}]*))?\s*}}\s+from\s+[\'"]@/lib/utils[\'"]',
                lambda m: fix_import_statement(m, icon, "lucide-react"),
                content
            )
            changes_made = True

    # Fix next/navigation imports
    next_imports = {
        "useRouter": "next/navigation",
        "usePathname": "next/navigation",
        "useSearchParams": "next/navigation",
        "redirect": "next/navigation",
        "notFound": "next/navigation"
    }
    
    for next_import, path in next_imports.items():
        pattern = rf'import\s+{{\s*(?:[^}}]*,\s*)?({next_import})(?:\s*,\s*[^}}]*)?\s*}}\s+from\s+[\'"]@/lib/utils[\'"]'
        
        if re.search(pattern, content):
            content = re.sub(
                rf'import\s+{{\s*(?:([^}}]*),\s*)?{next_import}(?:\s*,\s*([^}}]*))?\s*}}\s+from\s+[\'"]@/lib/utils[\'"]',
                lambda m: fix_import_statement(m, next_import, path),
                content
            )
            changes_made = True

    # Fix Supabase imports
    supabase_imports = {
        "createClientComponentClient": "@supabase/auth-helpers-nextjs",
        "createServerComponentClient": "@supabase/auth-helpers-nextjs",
        "createRouteHandlerClient": "@supabase/auth-helpers-nextjs",
        "supabase": "@/lib/supabase"
    }
    
    for supabase_import, path in supabase_imports.items():
        pattern = rf'import\s+{{\s*(?:[^}}]*,\s*)?({supabase_import})(?:\s*,\s*[^}}]*)?\s*}}\s+from\s+[\'"]@/lib/utils[\'"]'
        
        if re.search(pattern, content):
            content = re.sub(
                rf'import\s+{{\s*(?:([^}}]*),\s*)?{supabase_import}(?:\s*,\s*([^}}]*))?\s*}}\s+from\s+[\'"]@/lib/utils[\'"]',
                lambda m: fix_import_statement(m, supabase_import, path),
                content
            )
            changes_made = True

    # Fix React-Hook-Form imports
    hook_form_imports = {
        "useForm": "react-hook-form", 
        "FormProvider": "react-hook-form",
        "Controller": "react-hook-form",
        "useFormContext": "react-hook-form"
    }
    
    for hook_import, path in hook_form_imports.items():
        pattern = rf'import\s+{{\s*(?:[^}}]*,\s*)?({hook_import})(?:\s*,\s*[^}}]*)?\s*}}\s+from\s+[\'"]@/lib/utils[\'"]'
        
        if re.search(pattern, content):
            content = re.sub(
                rf'import\s+{{\s*(?:([^}}]*),\s*)?{hook_import}(?:\s*,\s*([^}}]*))?\s*}}\s+from\s+[\'"]@/lib/utils[\'"]',
                lambda m: fix_import_statement(m, hook_import, path),
                content
            )
            changes_made = True

    # Fix Zod imports
    zod_imports = {
        "z": "zod",
        "zodResolver": "@hookform/resolvers/zod"
    }
    
    for zod_import, path in zod_imports.items():
        pattern = rf'import\s+{{\s*(?:[^}}]*,\s*)?({zod_import})(?:\s*,\s*[^}}]*)?\s*}}\s+from\s+[\'"]@/lib/utils[\'"]'
        
        if re.search(pattern, content):
            content = re.sub(
                rf'import\s+{{\s*(?:([^}}]*),\s*)?{zod_import}(?:\s*,\s*([^}}]*))?\s*}}\s+from\s+[\'"]@/lib/utils[\'"]',
                lambda m: fix_import_statement(m, zod_import, path),
                content
            )
            changes_made = True

    # Fix class-variance-authority imports
    cva_imports = {
        "cva": "class-variance-authority",
        "VariantProps": "class-variance-authority"
    }
    
    for cva_import, path in cva_imports.items():
        pattern = rf'import\s+{{\s*(?:[^}}]*,\s*)?({cva_import})(?:\s*,\s*[^}}]*)?\s*}}\s+from\s+[\'"]@/lib/utils[\'"]'
        
        if re.search(pattern, content):
            content = re.sub(
                rf'import\s+{{\s*(?:([^}}]*),\s*)?{cva_import}(?:\s*,\s*([^}}]*))?\s*}}\s+from\s+[\'"]@/lib/utils[\'"]',
                lambda m: fix_import_statement(m, cva_import, path),
                content
            )
            changes_made = True
    
    # Fix Radix UI imports
    radix_imports = {
        "Slot": "@radix-ui/react-slot"
    }
    
    for radix_import, path in radix_imports.items():
        pattern = rf'import\s+{{\s*(?:[^}}]*,\s*)?({radix_import})(?:\s*,\s*[^}}]*)?\s*}}\s+from\s+[\'"]@/lib/utils[\'"]'
        
        if re.search(pattern, content):
            content = re.sub(
                rf'import\s+{{\s*(?:([^}}]*),\s*)?{radix_import}(?:\s*,\s*([^}}]*))?\s*}}\s+from\s+[\'"]@/lib/utils[\'"]',
                lambda m: fix_import_statement(m, radix_import, path),
                content
            )
            changes_made = True

    # Fix tailwind-merge imports
    tailwind_imports = {
        "twMerge": "tailwind-merge",
        "clsx": "clsx"
    }
    
    for tw_import, path in tailwind_imports.items():
        pattern = rf'import\s+{{\s*(?:[^}}]*,\s*)?({tw_import})(?:\s*,\s*[^}}]*)?\s*}}\s+from\s+[\'"]@/lib/utils[\'"]'
        
        if re.search(pattern, content):
            content = re.sub(
                rf'import\s+{{\s*(?:([^}}]*),\s*)?{tw_import}(?:\s*,\s*([^}}]*))?\s*}}\s+from\s+[\'"]@/lib/utils[\'"]',
                lambda m: fix_import_statement(m, tw_import, path),
                content
            )
            changes_made = True

    # Fix date-fns imports
    date_imports = {
        "format": "date-fns",
        "formatDistanceToNow": "date-fns"
    }
    
    for date_import, path in date_imports.items():
        pattern = rf'import\s+{{\s*(?:[^}}]*,\s*)?({date_import})(?:\s*,\s*[^}}]*)?\s*}}\s+from\s+[\'"]@/lib/utils[\'"]'
        
        if re.search(pattern, content):
            content = re.sub(
                rf'import\s+{{\s*(?:([^}}]*),\s*)?{date_import}(?:\s*,\s*([^}}]*))?\s*}}\s+from\s+[\'"]@/lib/utils[\'"]',
                lambda m: fix_import_statement(m, date_import, path),
                content
            )
            changes_made = True

    # Fix internationalization imports
    i18n_imports = {
        "he": "i18next"
    }
    
    for i18n_import, path in i18n_imports.items():
        pattern = rf'import\s+{{\s*(?:[^}}]*,\s*)?({i18n_import})(?:\s*,\s*[^}}]*)?\s*}}\s+from\s+[\'"]@/lib/utils[\'"]'
        
        if re.search(pattern, content):
            content = re.sub(
                rf'import\s+{{\s*(?:([^}}]*),\s*)?{i18n_import}(?:\s*,\s*([^}}]*))?\s*}}\s+from\s+[\'"]@/lib/utils[\'"]',
                lambda m: fix_import_statement(m, i18n_import, path),
                content
            )
            changes_made = True

    # Fix custom component imports
    custom_components = {
        "Forum": "@/components/forum/Forum",
        "CreatePost": "@/components/forum/CreatePost",
        "ForumPost": "@/components/forum/ForumPost",
        "ForumComment": "@/components/forum/ForumComment",
        "UserProfile": "@/components/profile/UserProfile",
        "LoginForm": "@/components/auth/LoginForm",
        "RegisterContent": "@/components/auth/RegisterContent",
        "CourseHeader": "@/components/courses/CourseHeader",
        "CourseContent": "@/components/courses/CourseContent",
        "CourseRatings": "@/components/courses/CourseRatings",
        "CourseComments": "@/components/courses/CourseComments",
        "CourseSidebar": "@/components/courses/CourseSidebar",
        "CourseProgress": "@/components/courses/CourseProgress",
        "LessonContent": "@/components/lessons/LessonContent",
        "LessonSidebar": "@/components/lessons/LessonSidebar",
        "CourseCard": "@/components/courses/CourseCard",
        "Analytics": "@/components/Analytics",
        "Providers": "@/components/Providers"
    }
    
    for component, path in custom_components.items():
        pattern = rf'import\s+{{\s*(?:[^}}]*,\s*)?({component})(?:\s*,\s*[^}}]*)?\s*}}\s+from\s+[\'"]@/lib/utils[\'"]'
        
        if re.search(pattern, content):
            content = re.sub(
                rf'import\s+{{\s*(?:([^}}]*),\s*)?{component}(?:\s*,\s*([^}}]*))?\s*}}\s+from\s+[\'"]@/lib/utils[\'"]',
                lambda m: fix_import_statement(m, component, path),
                content
            )
            changes_made = True

    # Fix simulator imports
    simulator_imports = {
        "getScenarioById": "@/lib/services/simulator",
        "startSimulation": "@/lib/services/simulator",
        "processUserMessage": "@/lib/services/simulator",
        "saveSimulationResults": "@/lib/services/simulator",
        "createForumPost": "@/lib/services/forum",
        "createForumComment": "@/lib/services/forum",
        "mockPosts": "@/lib/data/mock-posts"
    }
    
    for sim_import, path in simulator_imports.items():
        pattern = rf'import\s+{{\s*(?:[^}}]*,\s*)?({sim_import})(?:\s*,\s*[^}}]*)?\s*}}\s+from\s+[\'"]@/lib/utils[\'"]'
        
        if re.search(pattern, content):
            content = re.sub(
                rf'import\s+{{\s*(?:([^}}]*),\s*)?{sim_import}(?:\s*,\s*([^}}]*))?\s*}}\s+from\s+[\'"]@/lib/utils[\'"]',
                lambda m: fix_import_statement(m, sim_import, path),
                content
            )
            changes_made = True
    
    # Fix wrong constant names
    content = content.replace('_FEEDBACK_CRITERIA', 'FEEDBACK_CRITERIA')
    content = content.replace('_SCENARIO_TYPES', 'SCENARIO_TYPES')
    
    # Fix any remaining /* @client-directive */ lines
    content = content.replace('/* @client-directive */', '')
    
    # Remove potentially problematic wrapping parentheses
    if '()' in content and not '"use client"' in content[:20]:
        content = content.replace('()', '', 1)
        changes_made = True
    
    # If we've made changes, write them back to the file
    if changes_made:
        with open(filepath, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f"Fixed: {filepath}")
        return True
    return False

def fix_import_statement(match, component, path):
    """Helper function to rewrite import statements"""
    before = match.group(1) if match.group(1) else ""
    after = match.group(2) if match.group(2) else ""
    
    # If there are other items in the import, keep them
    if before or after:
        # Remove component from the original import
        other_imports = []
        if before:
            other_imports.extend([i.strip() for i in before.split(',') if i.strip()])
        if after:
            other_imports.extend([i.strip() for i in after.split(',') if i.strip()])
        
        other_imports = [i for i in other_imports if i != component]
        
        # Create the new import statement for the component
        component_import = f'import {{ {component} }} from "{path}";'
        
        # If there are still other imports, create a statement for them
        if other_imports:
            other_import = f'import {{ {", ".join(other_imports)} }} from "@/lib/utils";'
            return f'{component_import}\n{other_import}'
        else:
            return component_import
    else:
        # Simple replacement with no other imports
        return f'import {{ {component} }} from "{path}";'

def process_files():
    # Recursive glob to find all TypeScript/JavaScript files
    files = glob.glob("./src/**/*.ts*", recursive=True)
    fixed_count = 0
    total_files = 0
    
    for file in files:
        total_files += 1
        if fix_file(file):
            fixed_count += 1
    
    print(f"Processed {total_files} files, fixed {fixed_count} files with export issues.")

if __name__ == "__main__":
    process_files() 