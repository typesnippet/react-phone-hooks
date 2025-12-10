import { ChangeEvent, KeyboardEvent } from "react";
import { PhoneNumber, usePhoneOptions } from "./types";
import countries from "./metadata/countries.json";
export declare const getMetadata: (rawValue: string, countriesList?: typeof countries, country?: any) => string[] | undefined;
export declare const getCountry: (countryCode: keyof typeof countries) => string[] | undefined;
export declare const getRawValue: (value: PhoneNumber | string) => string;
export declare const displayFormat: (value: string) => string;
export declare const cleanInput: (input: any, pattern: string) => any[];
export declare const getFormattedNumber: (rawValue: any, pattern?: string) => string;
export declare const checkValidity: (metadata: PhoneNumber, strict?: boolean) => boolean;
export declare const getDefaultISO2Code: () => string;
export declare const parsePhoneNumber: (formattedNumber: string, countriesList?: typeof countries, country?: any) => PhoneNumber;
export declare const useMask: (pattern: string) => {
    onInput: ({ target }: ChangeEvent<HTMLInputElement>) => void;
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
};
export declare const usePhone: ({ query, locale, country, distinct, countryCode, initialValue, onlyCountries, excludeCountries, preferredCountries, disableParentheses, }: usePhoneOptions) => {
    value: string;
    pattern: string;
    metadata: string[] | undefined;
    setValue: import("react").Dispatch<import("react").SetStateAction<string>>;
    countriesList: string[][];
};
