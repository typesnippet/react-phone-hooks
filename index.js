"use client";
import { useCallback, useMemo, useRef, useState } from "react";
import * as phoneLocale from "./locale";
import countries from "./metadata/countries.json";
import timezones from "./metadata/timezones.json";
import validations from "./metadata/validations.json";
const slots = new Set(".");
export const getMetadata = (rawValue, countriesList = countries, country = null) => {
    country = country == null && rawValue.startsWith("44") ? "gb" : country;
    if (country != null)
        countriesList = countriesList.filter((c) => c[0] === country);
    return [...countriesList].sort((a, b) => b[2].length - a[2].length).find((c) => rawValue.startsWith(c[2]));
};
export const getCountry = (countryCode) => {
    return countries.find(([iso]) => iso === countryCode);
};
export const getRawValue = (value) => {
    if (typeof value === "string")
        return value.replaceAll(/\D/g, "");
    return [value === null || value === void 0 ? void 0 : value.countryCode, value === null || value === void 0 ? void 0 : value.areaCode, value === null || value === void 0 ? void 0 : value.phoneNumber].filter(Boolean).join("");
};
export const displayFormat = (value) => {
    /** Returns the formatted value that can be displayed as an actual input value */
    return value.replace(/[.\s\D]+$/, "").replace(/(\(\d+)$/, "$1)");
};
export const cleanInput = (input, pattern) => {
    input = input.match(/\d/g) || [];
    return Array.from(pattern, c => input[0] === c || slots.has(c) ? input.shift() || c : c);
};
export const getFormattedNumber = (rawValue, pattern) => {
    var _a;
    /** Returns the reformatted input value based on the given pattern */
    if (/^\+\D*?$/.test(rawValue))
        return "+";
    pattern = pattern || ((_a = getMetadata(rawValue)) === null || _a === void 0 ? void 0 : _a[3]) || "";
    return displayFormat(cleanInput(rawValue, pattern.replaceAll(/\d/g, ".")).join(""));
};
export const checkValidity = (metadata, strict = false) => {
    /** Checks if both the area code and phone number match the validation pattern */
    const pattern = validations[metadata.isoCode][Number(strict)];
    return new RegExp(pattern).test([metadata.areaCode, metadata.phoneNumber].filter(Boolean).join(""));
};
export const getDefaultISO2Code = () => {
    /** Returns the default ISO2 code, based on the user's timezone */
    return (timezones[Intl.DateTimeFormat().resolvedOptions().timeZone] || "") || "us";
};
export const parsePhoneNumber = (formattedNumber, countriesList = countries, country = null) => {
    var _a;
    const value = getRawValue(formattedNumber);
    const isoCode = ((_a = getMetadata(value, countriesList, country)) === null || _a === void 0 ? void 0 : _a[0]) || getDefaultISO2Code();
    const countryCodePattern = /\+\d+/;
    const areaCodePattern = /^\+\d+\s\(?(\d+)/;
    /** Parses the matching partials of the phone number by predefined regex patterns */
    const countryCodeMatch = formattedNumber ? (formattedNumber.match(countryCodePattern) || []) : [];
    const areaCodeMatch = formattedNumber ? (formattedNumber.match(areaCodePattern) || []) : [];
    /** Converts the parsed values of the country and area codes to integers if values present */
    const countryCode = countryCodeMatch.length > 0 ? parseInt(countryCodeMatch[0]) : null;
    const areaCode = areaCodeMatch.length > 1 ? areaCodeMatch[1] : null;
    /** Parses the phone number by removing the country and area codes from the formatted value */
    const phoneNumberPattern = new RegExp(`^${countryCode}${(areaCode || "")}(\\d+)`);
    const phoneNumberMatch = value ? (value.match(phoneNumberPattern) || []) : [];
    const phoneNumber = phoneNumberMatch.length > 1 ? phoneNumberMatch[1] : null;
    return { countryCode, areaCode, phoneNumber, isoCode };
};
export const useMask = (pattern) => {
    const backRef = useRef(false);
    const clean = useCallback((input) => {
        return cleanInput(input, pattern.replaceAll(/\d/g, "."));
    }, [pattern]);
    const first = useMemo(() => {
        return [...pattern].findIndex(c => slots.has(c));
    }, [pattern]);
    const prev = useMemo((j = 0) => {
        return Array.from(pattern.replaceAll(/\d/g, "."), (c, i) => {
            return slots.has(c) ? j = i + 1 : j;
        });
    }, [pattern]);
    const onKeyDown = useCallback((event) => {
        backRef.current = event.key === "Backspace";
    }, []);
    const onInput = useCallback(({ target }) => {
        const [i, j] = [target.selectionStart, target.selectionEnd].map((i) => {
            i = clean(target.value.slice(0, i)).findIndex(c => slots.has(c));
            return i < 0 ? prev[prev.length - 1] : backRef.current ? prev[i - 1] || first : i;
        });
        target.value = getFormattedNumber(target.value, pattern);
        target.setSelectionRange(i, j);
        backRef.current = false;
    }, [clean, first, pattern, prev]);
    return {
        onInput,
        onKeyDown,
    };
};
export const usePhone = ({ query = "", locale = "", country = "", distinct = false, countryCode = "", initialValue = "", onlyCountries = [], excludeCountries = [], preferredCountries = [], disableParentheses = false, }) => {
    var _a;
    const defaultValue = getRawValue(initialValue);
    const defaultMetadata = getMetadata(defaultValue) || countries.find(([iso]) => iso === country);
    const defaultValueState = defaultValue || ((_a = countries.find(([iso]) => iso === (defaultMetadata === null || defaultMetadata === void 0 ? void 0 : defaultMetadata[0]))) === null || _a === void 0 ? void 0 : _a[2]);
    const [value, setValue] = useState(defaultValueState);
    const countriesOnly = useMemo(() => {
        const allowList = onlyCountries.length > 0 ? onlyCountries : countries.map(([iso]) => iso);
        return countries.filter(([iso, _1, dial]) => {
            return (allowList.includes(iso) || allowList.includes(dial)) && !excludeCountries.includes(iso) && !excludeCountries.includes(dial);
        });
    }, [onlyCountries, excludeCountries]);
    const countriesList = useMemo(() => {
        const filteredCountries = countriesOnly.filter(([_1, name, dial, mask]) => {
            var _a;
            const q = query.toLowerCase();
            const countries = locale && ((_a = (phoneLocale[locale])) === null || _a === void 0 ? void 0 : _a.countries);
            const localized = countries && (countries[name] || "").toLowerCase();
            return [localized, name.toLowerCase(), dial, mask].some(component => component.includes(q));
        });
        const seen = new Set();
        const whitelistCountries = [
            ...filteredCountries.filter(([iso]) => preferredCountries.includes(iso)),
            ...filteredCountries.filter(([iso]) => !preferredCountries.includes(iso)),
        ];
        if (!distinct)
            return whitelistCountries;
        return whitelistCountries.filter(([iso]) => !seen.has(iso) && seen.add(iso));
    }, [countriesOnly, preferredCountries, distinct, locale, query]);
    const metadata = useMemo(() => {
        const calculatedMetadata = getMetadata(getRawValue(value), countriesList, countryCode);
        if (countriesList.find(([iso]) => iso === (calculatedMetadata === null || calculatedMetadata === void 0 ? void 0 : calculatedMetadata[0]) || iso === (defaultMetadata === null || defaultMetadata === void 0 ? void 0 : defaultMetadata[0]))) {
            return calculatedMetadata || defaultMetadata;
        }
        return countriesList[0];
    }, [countriesList, countryCode, defaultMetadata, value]);
    const pattern = useMemo(() => {
        const mask = (metadata === null || metadata === void 0 ? void 0 : metadata[3]) || (defaultMetadata === null || defaultMetadata === void 0 ? void 0 : defaultMetadata[3]) || "";
        return disableParentheses ? mask.replace(/[()]/g, "") : mask;
    }, [disableParentheses, defaultMetadata, metadata]);
    return {
        value,
        pattern,
        metadata,
        setValue,
        countriesList,
    };
};
