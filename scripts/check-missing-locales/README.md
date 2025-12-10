# Check Missing Locales Script

This script detects missing locale files in `react-phone-hooks` by comparing against locales available in dependent packages (antd and MUI).

## Purpose

The `react-phone-hooks` library provides locale translations for phone input components. Since the library is used by packages like `antd-phone-input` and `mui-phone-input`, it should ideally support all locales that these packages support.

This script helps maintain locale coverage by:
1. Checking all locale keys used by antd (via `development/src/ant-phone/locale.ts`)
2. Checking all locale keys supported by MUI Material
3. Comparing them against existing locales in `react-phone-hooks` (`src/locale.ts`)
4. Identifying any missing locales

## Usage

### Manual Execution

Run the script manually from the project root:

```bash
python scripts/check-missing-locales
```

### Automated Execution

The script runs automatically via GitHub Actions:
- **Schedule**: Every Sunday at midnight UTC
- **Workflow**: `.github/workflows/check-missing-locales.yml`

When missing locales are detected, the workflow will:
1. Create a GitHub issue with the list of missing locales
2. Tag it with labels: `missing-locales`, `translation`, `enhancement`
3. Update existing open issues if they already exist

## Output

The script outputs:
- Console log showing the check results
- Exit code 1 if missing locales are found
- Exit code 0 if all locales are present
- Issue body saved to `/tmp/missing_locales_issue.md` for GitHub Actions

## How It Works

1. **Extract existing locales**: Parses `src/locale.ts` to find all exported locale constants
2. **Get antd locales**: Reads locale imports from `development/src/ant-phone/locale.ts`
3. **Get MUI locales**: Uses a predefined list of MUI Material supported locales
4. **Compare**: Identifies locales present in antd/MUI but missing from react-phone-hooks
5. **Report**: Generates a formatted issue body with missing locale details

## Adding Missing Locales

When locales are identified as missing, they should be added to `src/locale.ts` following this structure:

```typescript
export const enUS = {
    searchNotFound: "Country not found",
    searchPlaceholder: "Search country",
    countries: {
        "Gibraltar": "Gibraltar",
        "Gambia": "Gambia",
        // ... all other countries
    },
}
```

Each locale requires:
- `searchNotFound`: Translation for "Country not found"
- `searchPlaceholder`: Translation for "Search country"  
- `countries`: Object mapping English country names to their translations in the target language
