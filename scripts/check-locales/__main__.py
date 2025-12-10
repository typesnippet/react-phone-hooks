import json
import os
import re
import subprocess
import sys
from pathlib import Path


project_root = Path(__file__).parent.parent.parent
locale_file = project_root / "src" / "locale.ts"

with open(locale_file, 'r') as f:
    content = f.read()

locale_pattern = r'^export const (\w+) = \{'
existing_locales = set(re.findall(locale_pattern, content, re.MULTILINE))

locale_name_pattern = re.compile(r'^[a-z]{2,3}[A-Z][A-Za-z]{1,3}$')

try:
    result = subprocess.run(
        ['curl', '-s', '-H', 'User-Agent: react-phone-hooks', 
         'https://api.github.com/repos/ant-design/ant-design/contents/components/locale'],
        capture_output=True,
        text=True,
        timeout=30
    )
    if result.returncode == 0 and result.stdout.strip():
        files = json.loads(result.stdout)
        antd_locales = set()
        for file in files:
            name = file['name']
            if name.endswith('.ts') and name != 'index.ts':
                locale_name = name.replace('.ts', '').replace('_', '')
                if locale_name_pattern.match(locale_name):
                    antd_locales.add(locale_name)
    else:
        antd_locales = set()
except:
    antd_locales = set()

try:
    result = subprocess.run(
        ['curl', '-s', '-H', 'User-Agent: react-phone-hooks',
         'https://api.github.com/repos/mui/material-ui/contents/packages/mui-material/src/locale'],
        capture_output=True,
        text=True,
        timeout=30
    )
    if result.returncode == 0 and result.stdout.strip():
        files = json.loads(result.stdout)
        mui_locales = set()
        for file in files:
            name = file['name']
            if name.endswith('.ts') and name != 'index.ts':
                locale_name = name.replace('.ts', '')
                if locale_name_pattern.match(locale_name):
                    mui_locales.add(locale_name)
    else:
        mui_locales = set()
except:
    mui_locales = set()

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
