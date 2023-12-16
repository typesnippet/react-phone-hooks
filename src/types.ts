export interface PhoneNumber {
    countryCode?: number | null;
    areaCode?: string | null;
    phoneNumber?: string | null;
    isoCode?: string;

    valid?(strict?: boolean): boolean;
}

export interface usePhoneOptions {
    query?: string;
    country?: string;
    countryCode?: string;
    onlyCountries?: string[];
    excludeCountries?: string[];
    preferredCountries?: string[];
    initialValue?: PhoneNumber | string;
}
