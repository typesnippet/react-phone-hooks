import json
import re
from pathlib import Path
from xml.etree import ElementTree

project_root = Path(__file__).parent.parent.parent
metadata_path = project_root / "resources" / "metadata.xml"
patterns_path = project_root / "src" / "metadata" / "validations.json"
countries_path = project_root / "src" / "metadata" / "countries.json"

tree = ElementTree.parse(metadata_path)
territories = tree.find("territories")


def build_mask(pattern, national_prefix, ar_mobile=False):
    groups = re.findall(r"\(\\d(?:\{(\d+)})?\)", pattern)
    sizes = [int(g) if g else 1 for g in groups]

    masks = []
    prefix_chars = list(national_prefix)
    paren_idx = -1

    for i, size in enumerate(sizes):
        if len(prefix_chars) >= size:
            masks.append(''.join(prefix_chars[:size]))
            prefix_chars = prefix_chars[size:]
        elif prefix_chars:
            filled = ''.join(prefix_chars)
            masks.append(filled + "." * (size - len(filled)))
            prefix_chars = []
            paren_idx = i
        else:
            masks.append("." * size)

    if ar_mobile and len(masks) > 1:
        paren_idx = 1
    elif paren_idx == -1 and masks and "." not in masks[0]:
        paren_idx = 0

    if paren_idx >= 0:
        masks[paren_idx] = f"({masks[paren_idx]})"

    return " ".join(masks)


def update_mask(mask, prefix, territory):
    country_code = territory.get("countryCode")
    national_prefix = prefix[len(country_code):]

    if not national_prefix:
        return mask

    available_formats = territory.find("availableFormats")
    if available_formats is None:
        return mask

    for fmt in available_formats.findall("numberFormat"):
        intl_fmt = fmt.find("intlFormat")
        if intl_fmt is not None and intl_fmt.text == "NA":
            continue

        leading = fmt.find("leadingDigits")
        if leading is not None and not re.match(r"^" + leading.text, national_prefix, flags=re.VERBOSE):
            continue

        format_elem = intl_fmt if intl_fmt is not None else fmt.find("format")
        if format_elem is not None and format_elem.text:
            ar_mobile = territory.get("id") == "AR" and prefix.startswith("549")
            return f"+{country_code} {build_mask(fmt.get("pattern"), national_prefix, ar_mobile)}"

    return mask


with open(patterns_path) as fp:
    patterns = json.load(fp)

with open(countries_path) as fp:
    countries = json.load(fp)

for territory in filter(lambda t: t.get("id").isalpha(), territories):
    possible_lengths = territory.find(f"mobile/possibleLengths")
    if possible_lengths is None:
        continue
    possible_lengths = list(map(int, re.findall(r"\d+", possible_lengths.get("national"))))
    min_length, max_length = min(possible_lengths), max(possible_lengths)
    for country in [c for c in countries if c[0] == territory.get("id").lower()]:
        country[3] = update_mask(country[3], country[2], territory)

    general_desc = territory.find("generalDesc")
    national_number_pattern = general_desc.find("nationalNumberPattern").text
    national_number_pattern = re.sub(r"[\s\n]", "", national_number_pattern)
    patterns[territory.get("id").lower()] = [
        f"^\\d{{{min_length},{max_length}}}$" if min_length != max_length else f"^\\d{{{max_length}}}$",
        f"^{national_number_pattern}$"
    ]

with open(patterns_path, "w") as fp:
    json.dump(patterns, fp, indent=2)

with open(countries_path, "w") as fp:
    json.dump(countries, fp, indent=2)
