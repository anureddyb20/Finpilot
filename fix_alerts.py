import os
import re

def process_file(filepath):
    if not os.path.exists(filepath): return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add toast import if missing
    if "import toast" not in content and ('alert(' in content or 'toast' in content):
        content = re.sub(r"(import React.*?;\n)", r"\1import toast from 'react-hot-toast';\n", content, count=1)

    # Add ConfirmModal import if confirm is used
    if "window.confirm" in content and "ConfirmModal" not in content:
        content = re.sub(r"(import React.*?;\n)", r"\1import { ConfirmModal } from '../components/ui/ConfirmModal';\n", content, count=1)
        # Also need ConfirmModal for deeply nested (like pages/settings) but settings doesn't use confirm.

    # Replace alert("...") with toast.success or toast.error
    content = re.sub(r'window\.alert\((.*?)\)', r'toast(\1)', content)
    content = re.sub(r'alert\("Failed(.*)" \+ \((.*?)\)\)', r'toast.error("Failed\1" + (\2))', content)
    content = re.sub(r'alert\(`Failed(.*)` \+ \((.*?)\)\)', r'toast.error(`Failed\1` + (\2))', content)
    content = re.sub(r'alert\("Error(.*)"\)', r'toast.error("Error\1")', content)
    content = re.sub(r'alert\("Success!(.*?)"\)', r'toast.success("Success!\1")', content)
    content = re.sub(r'alert\(`Success!(.*?)`\)', r'toast.success(`Success!\1`)', content)
    content = re.sub(r'alert\("(.*?) successfully"\)', r'toast.success("\1 successfully")', content)
    content = re.sub(r'alert\((.*?)\)', r'toast.error(\1)', content) # Fallback for remaining alerts as errors unless it says success

    # Fix any double toast issues if re-run
    content = content.replace("toast.error(toast.error(", "toast.error(")

    # For confirm, it's harder to automate with python due to state logic.
    # We will do those via replace_file_content separately, or write custom replacements for the 3 files.

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

base_dir = "frontend/src/pages"
files_to_process = [
    "Dashboard.tsx",
    "Budgets.tsx",
    "Goals.tsx",
    "RecurringPayments.tsx",
    "settings/GeneralTab.tsx",
    "settings/PreferencesTab.tsx"
]

for file in files_to_process:
    process_file(os.path.join(base_dir, file))

print("Automated toast replacements done.")
