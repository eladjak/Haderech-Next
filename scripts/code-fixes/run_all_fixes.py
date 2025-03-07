#!/usr/bin/env python3
"""
סקריפט זה מריץ את כל סקריפטי תיקון הקוד בסדר הנכון
לכל סקריפט יש תפקיד ספציפי:
1. fix_type_files.py - תיקון קבצי טיפוסים
2. fix_component_files.py - תיקון קבצי רכיבים
3. fix_test_files.py - תיקון קבצי בדיקות
4. fix_ui_components.py - תיקון רכיבי ממשק משתמש
5. fix_api_and_models.py - תיקון קבצי API ומודלים
6. fix_forum_and_store.py - תיקון רכיבי פורום ו-store
"""

import os
import subprocess
import time

# נתיב לתיקיית הסקריפטים
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# רשימת הסקריפטים לפי סדר ההרצה
scripts = [
    "fix_type_files.py",
    "fix_component_files.py",
    "fix_test_files.py",
    "fix_ui_components.py",
    "fix_api_and_models.py",
    "fix_forum_and_store.py"
]

def run_script(script_name):
    """הרץ סקריפט ספציפי והחזר את סטטוס הסיום"""
    script_path = os.path.join(SCRIPT_DIR, script_name)
    print(f"\n{'='*50}")
    print(f"הרצת סקריפט: {script_name}")
    print(f"{'='*50}")
    
    start_time = time.time()
    result = subprocess.run(["python", script_path], capture_output=True, text=True)
    end_time = time.time()
    
    print(result.stdout)
    if result.stderr:
        print(f"שגיאות:\n{result.stderr}")
    
    elapsed_time = end_time - start_time
    print(f"זמן ריצה: {elapsed_time:.2f} שניות")
    print(f"קוד סיום: {result.returncode}")
    
    return result.returncode == 0

def main():
    """פונקציה ראשית לריצת כל הסקריפטים"""
    print("מתחיל לתקן קבצים בפרויקט HaDerech")
    print("====================================")
    
    start_time = time.time()
    success_count = 0
    
    for script in scripts:
        if run_script(script):
            success_count += 1
        else:
            print(f"אזהרה: הסקריפט {script} נכשל!")
    
    end_time = time.time()
    total_time = end_time - start_time
    
    print("\n====================================")
    print(f"סיכום: {success_count}/{len(scripts)} סקריפטים הסתיימו בהצלחה")
    print(f"זמן כולל: {total_time:.2f} שניות")
    print("====================================")

if __name__ == "__main__":
    main() 