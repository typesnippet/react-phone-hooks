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
