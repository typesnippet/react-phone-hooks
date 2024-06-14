"use client";

import {ChangeEvent, KeyboardEvent, useCallback, useMemo, useRef, useState} from "react";

import {PhoneNumber, usePhoneOptions} from "./types";

import countries from "./metadata/countries.json";
import timezones from "./metadata/timezones.json";
import validations from "./metadata/validations.json";

const slots = new Set(".");

export const getMetadata = (rawValue: string, countriesList: typeof countries = countries, country: any = null) => {
    country = country == null && rawValue.startsWith("44") ? "gb" : country;
    if (country != null) countriesList = countriesList.filter((c) => c[0] === country);
    return [...countriesList].sort((a, b) => b[2].length - a[2].length).find((c) => rawValue.startsWith(c[2]));
}

export const getCountry = (countryCode: keyof typeof countries) => {
    return countries.find(([iso]) => iso === countryCode);
}

export const getRawValue = (value: PhoneNumber | string) => {
    if (typeof value === "string") return value.replaceAll(/\D/g, "");
    return [value?.countryCode, value?.areaCode, value?.phoneNumber].filter(Boolean).join("");
}

export const displayFormat = (value: string) => {
    /** Returns the formatted value that can be displayed as an actual input value */
    return value.replace(/[.\s\D]+$/, "").replace(/(\(\d+)$/, "$1)");
}

export const cleanInput = (input: any, pattern: string) => {
    input = input.match(/\d/g) || [];
    return Array.from(pattern, c => input[0] === c || slots.has(c) ? input.shift() || c : c);
}

export const getFormattedNumber = (rawValue: any, pattern?: string) => {
    /** Returns the reformatted input value based on the given pattern */
    pattern = pattern || getMetadata(rawValue)?.[3] || "";
    return displayFormat(cleanInput(rawValue, pattern.replaceAll(/\d/g, ".")).join(""));
}

export const checkValidity = (metadata: PhoneNumber, strict: boolean = false) => {
    /** Checks if both the area code and phone number match the validation pattern */
    const pattern = (validations as any)[metadata.isoCode as keyof typeof validations][Number(strict)];
    return new RegExp(pattern).test([metadata.areaCode, metadata.phoneNumber].filter(Boolean).join(""));
}

export const getDefaultISO2Code = () => {
    /** Returns the default ISO2 code, based on the user's timezone */
    return (timezones[Intl.DateTimeFormat().resolvedOptions().timeZone as keyof typeof timezones] || "") || "us";
}

export const parsePhoneNumber = (formattedNumber: string, countriesList: typeof countries = countries, country: any = null): PhoneNumber => {
    const value = getRawValue(formattedNumber);
    const isoCode = getMetadata(value, countriesList, country)?.[0] || getDefaultISO2Code();
    const countryCodePattern = /\+\d+/;
    const areaCodePattern = /\((\d+)\)/;

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

    return {countryCode, areaCode, phoneNumber, isoCode};
}

export const useMask = (pattern: string) => {
    const backRef = useRef<boolean>(false);

    const clean = useCallback((input: any) => {
        return cleanInput(input, pattern.replaceAll(/\d/g, "."));
    }, [pattern])

    const first = useMemo(() => {
        return [...pattern].findIndex(c => slots.has(c));
    }, [pattern])

    const prev = useMemo((j = 0) => {
        return Array.from(pattern.replaceAll(/\d/g, "."), (c, i) => {
            return slots.has(c) ? j = i + 1 : j;
        });
    }, [pattern])

    const onKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
        backRef.current = event.key === "Backspace";
    }, [])

    const onInput = useCallback(({target}: ChangeEvent<HTMLInputElement>) => {
        const [i, j] = [target.selectionStart, target.selectionEnd].map((i: any) => {
            i = clean(target.value.slice(0, i)).findIndex(c => slots.has(c));
            return i < 0 ? prev[prev.length - 1] : backRef.current ? prev[i - 1] || first : i;
        });
        target.value = getFormattedNumber(target.value, pattern);
        target.setSelectionRange(i, j);
        backRef.current = false;
    }, [clean, first, pattern, prev])

    return {
        onInput,
        onKeyDown,
    }
}

export const usePhone = ({
                             query = "",
                             country = "",
                             countryCode = "",
                             initialValue = "",
                             onlyCountries = [],
                             excludeCountries = [],
                             preferredCountries = [],
                             disableParentheses = false,
                         }: usePhoneOptions) => {
    const defaultValue = getRawValue(initialValue);
    const defaultMetadata = getMetadata(defaultValue) || countries.find(([iso]) => iso === country);
    const defaultValueState = defaultValue || countries.find(([iso]) => iso === defaultMetadata?.[0])?.[2] as string;

    const [value, setValue] = useState<string>(defaultValueState);

    const countriesOnly = useMemo(() => {
        const allowList = onlyCountries.length > 0 ? onlyCountries : countries.map(([iso]) => iso);
        return countries.map(([iso]) => iso).filter((iso) => {
            return allowList.includes(iso) && !excludeCountries.includes(iso);
        });
    }, [onlyCountries, excludeCountries])

    const countriesList = useMemo(() => {
        const filteredCountries = countries.filter(([iso, name, _1, dial]) => {
            return countriesOnly.includes(iso) && (
                name.toLowerCase().startsWith(query.toLowerCase()) || dial.includes(query)
            );
        });
        return [
            ...filteredCountries.filter(([iso]) => preferredCountries.includes(iso)),
            ...filteredCountries.filter(([iso]) => !preferredCountries.includes(iso)),
        ];
    }, [countriesOnly, preferredCountries, query])

    const metadata = useMemo(() => {
        const calculatedMetadata = getMetadata(getRawValue(value), countriesList, countryCode);
        if (countriesList.find(([iso]) => iso === calculatedMetadata?.[0] || iso === defaultMetadata?.[0])) {
            return calculatedMetadata || defaultMetadata;
        }
        return countriesList[0];
    }, [countriesList, countryCode, defaultMetadata, value])

    const pattern = useMemo(() => {
        const mask = metadata?.[3] || defaultMetadata?.[3] || "";
        return disableParentheses ? mask.replace(/[()]/g, "") : mask;
    }, [disableParentheses, defaultMetadata, metadata])

    return {
        value,
        pattern,
        metadata,
        setValue,
        countriesList,
    }
}
