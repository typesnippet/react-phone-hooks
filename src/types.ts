"use client";

export interface PhoneNumber {
    countryCode?: number | null;
    areaCode?: string | null;
    phoneNumber?: string | null;
    isoCode?: string;

    valid?(strict?: boolean): boolean;
}

export interface usePhoneOptions {
    query?: string;
    locale?: string;
    country?: string;
    distinct?: boolean;
    countryCode?: string;
    onlyCountries?: string[];
    excludeCountries?: string[];
    preferredCountries?: string[];
    disableParentheses?: boolean;
    initialValue?: PhoneNumber | string;
}

type PhoneNumberType = PhoneNumber;
type usePhoneOptionsType = usePhoneOptions;

/**
 * Keeps `import types from "react-phone-hooks/types"` (then `types.PhoneNumber`) compiling. It used to rely on a
 * synthetic default import, which TypeScript disallows now that the declarations are ES modules.
 */
declare namespace types {
    export type PhoneNumber = PhoneNumberType;
    export type usePhoneOptions = usePhoneOptionsType;
}

export default types;
