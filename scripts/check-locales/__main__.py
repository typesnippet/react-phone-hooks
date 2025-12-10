import os
import re
import subprocess
import sys
from pathlib import Path


project_root = Path(__file__).parent.parent.parent
locale_file = project_root / "src" / "locale.ts"
ant_locale_file = project_root / "development" / "src" / "ant-phone" / "locale.ts"


with open(locale_file, 'r') as f:
    content = f.read()

locale_pattern = r'^export const (\w+) = \{'
existing_locales = set(re.findall(locale_pattern, content, re.MULTILINE))

with open(ant_locale_file, 'r') as f:
    content = f.read()

import_pattern = r'^import (\w+) from "antd/es/locale/'
antd_locales = set(re.findall(import_pattern, content, re.MULTILINE))

try:
    result = subprocess.run(
        ['node', '-e', 'const locale = require("@mui/material/locale"); console.log(Object.keys(locale).join(","))'],
        cwd=project_root / "development",
        capture_output=True,
        text=True,
        timeout=10
    )
    if result.returncode == 0 and result.stdout.strip():
        mui_locales = set(result.stdout.strip().split(','))
    else:
        mui_locales = existing_locales
except:
    mui_locales = existing_locales

missing_from_antd = antd_locales - existing_locales
missing_from_mui = mui_locales - existing_locales
all_missing = missing_from_antd | missing_from_mui

if all_missing:
    locale_sources = {}
    for locale in all_missing:
        sources = []
        if locale in missing_from_antd:
            sources.append('antd')
        if locale in missing_from_mui:
            sources.append('mui')
        locale_sources[locale] = sources
    
    issue_body = "Update the translations, adding the following language keys:\n\n"
    for locale in sorted(locale_sources.keys()):
        sources_str = ', '.join(f'`{s}`' for s in locale_sources[locale])
        issue_body += f" - `{locale}` ({sources_str})\n"
    
    output_file = Path("/tmp/missing_locales_issue.md")
    with open(output_file, 'w') as f:
        f.write(issue_body)
    
    if os.getenv('GITHUB_OUTPUT'):
        with open(os.getenv('GITHUB_OUTPUT'), 'a') as f:
            f.write(f"has_missing=true\n")
            f.write(f"count={len(all_missing)}\n")
    
    sys.exit(1)
else:
    if os.getenv('GITHUB_OUTPUT'):
        with open(os.getenv('GITHUB_OUTPUT'), 'a') as f:
            f.write(f"has_missing=false\n")
            f.write(f"count=0\n")
    
    sys.exit(0)
