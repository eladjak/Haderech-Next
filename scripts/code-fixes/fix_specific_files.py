import os
import re

def fix_file(file_path, replacements):
    """מחליף מחרוזות בקובץ על פי מיפוי החלפות"""
    try:
        if not os.path.exists(file_path):
            print(f"File not found: {file_path}")
            return False
            
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        original_content = content
        
        # בצע את כל ההחלפות המוגדרות
        for old_text, new_text in replacements:
            content = content.replace(old_text, new_text)
            
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed file: {file_path}")
            return True
        
        print(f"No changes needed for: {file_path}")
        return False
            
    except Exception as e:
        print(f"Error processing {file_path}: {str(e)}")
        return False

def main():
    # רשימת קבצים ותיקונים ספציפיים
    fixes = [
        # תיקונים לקובץ theme-toggle.tsx
        ("src/components/theme-toggle.tsx", [
            ('export const runtime = "client";', '// client component'),
            ('export {}', ''),
            ('export {});', ''),
        ]),
        
        # תיקונים לקבצי UI
        ("src/components/ui/carousel.tsx", [
            ('import * as React from "react";', 'import React from "react";'),
            ('export {}', ''),
            ('export {});', ''),
        ]),
        
        # תיקון לשגיאות עם import type
        ("src/components/simulator/__tests__/ChatSimulator.test.tsx", [
            ('import type {', 'import {'),
            ('export {}', ''),
            ('export {});', ''),
        ]),
        
        # תיקון לקבצים שיש בהם סוגריים מסולסלים סוגרים ואחריהם from
        ("src/components/course/course-content.tsx", [
            ('Play} from "lucide-react";', 'Play } from "lucide-react";'),
            ('export {}', ''),
            ('export {});', ''),
        ]),
        
        ("src/components/course/course-sidebar.tsx", [
            ('CardTitle} from "@/components/ui/card";', 'CardTitle } from "@/components/ui/card";'),
            ('export {}', ''),
            ('export {});', ''),
        ]),
        
        ("src/components/simulator/FeedbackDisplay.tsx", [
            ('Wrench} from "lucide-react";', 'Wrench } from "lucide-react";'),
            ('export {}', ''),
            ('export {});', ''),
        ]),
        
        # תיקון לקבצים שיש בהם בעיה עם export {}
        ("src/components/layout/user-nav.tsx", [
            ('export {}', '// client component'),
            ('export {});', '// client component'),
        ]),
        
        ("src/components/simulator/chat.tsx", [
            ('export {}', '// client component'),
            ('export {});', '// client component'),
        ]),
    ]
    
    # תיקון כל הקבצים ברשימה
    fixed_count = 0
    for file_path, replacements in fixes:
        if fix_file(file_path, replacements):
            fixed_count += 1
    
    print(f"\nFixed {fixed_count} files with specific issues")
    print("Done!")

if __name__ == "__main__":
    main() 