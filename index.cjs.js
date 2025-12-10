"use client";
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePhone = exports.useMask = exports.parsePhoneNumber = exports.getDefaultISO2Code = exports.checkValidity = exports.getFormattedNumber = exports.cleanInput = exports.displayFormat = exports.getRawValue = exports.getCountry = exports.getMetadata = void 0;
const react_1 = require("react");
const phoneLocale = __importStar(require("./locale"));
const countries_json_1 = __importDefault(require("./metadata/countries.json"));
const timezones_json_1 = __importDefault(require("./metadata/timezones.json"));
const validations_json_1 = __importDefault(require("./metadata/validations.json"));
const slots = new Set(".");
const getMetadata = (rawValue, countriesList = countries_json_1.default, country = null) => {
    country = country == null && rawValue.startsWith("44") ? "gb" : country;
    if (country != null)
        countriesList = countriesList.filter((c) => c[0] === country);
    return [...countriesList].sort((a, b) => b[2].length - a[2].length).find((c) => rawValue.startsWith(c[2]));
};
exports.getMetadata = getMetadata;
const getCountry = (countryCode) => {
    return countries_json_1.default.find(([iso]) => iso === countryCode);
};
exports.getCountry = getCountry;
const getRawValue = (value) => {
    if (typeof value === "string")
        return value.replaceAll(/\D/g, "");
    return [value === null || value === void 0 ? void 0 : value.countryCode, value === null || value === void 0 ? void 0 : value.areaCode, value === null || value === void 0 ? void 0 : value.phoneNumber].filter(Boolean).join("");
};
exports.getRawValue = getRawValue;
const displayFormat = (value) => {
    /** Returns the formatted value that can be displayed as an actual input value */
    return value.replace(/[.\s\D]+$/, "").replace(/(\(\d+)$/, "$1)");
};
exports.displayFormat = displayFormat;
const cleanInput = (input, pattern) => {
    input = input.match(/\d/g) || [];
    return Array.from(pattern, c => input[0] === c || slots.has(c) ? input.shift() || c : c);
};
exports.cleanInput = cleanInput;
const getFormattedNumber = (rawValue, pattern) => {
    var _a;
    /** Returns the reformatted input value based on the given pattern */
    if (/^\+\D*?$/.test(rawValue))
        return "+";
    pattern = pattern || ((_a = (0, exports.getMetadata)(rawValue)) === null || _a === void 0 ? void 0 : _a[3]) || "";
    return (0, exports.displayFormat)((0, exports.cleanInput)(rawValue, pattern.replaceAll(/\d/g, ".")).join(""));
};
exports.getFormattedNumber = getFormattedNumber;
const checkValidity = (metadata, strict = false) => {
    /** Checks if both the area code and phone number match the validation pattern */
    const pattern = validations_json_1.default[metadata.isoCode][Number(strict)];
    return new RegExp(pattern).test([metadata.areaCode, metadata.phoneNumber].filter(Boolean).join(""));
};
exports.checkValidity = checkValidity;
const getDefaultISO2Code = () => {
    /** Returns the default ISO2 code, based on the user's timezone */
    return (timezones_json_1.default[Intl.DateTimeFormat().resolvedOptions().timeZone] || "") || "us";
};
exports.getDefaultISO2Code = getDefaultISO2Code;
const parsePhoneNumber = (formattedNumber, countriesList = countries_json_1.default, country = null) => {
    var _a;
    const value = (0, exports.getRawValue)(formattedNumber);
    const isoCode = ((_a = (0, exports.getMetadata)(value, countriesList, country)) === null || _a === void 0 ? void 0 : _a[0]) || (0, exports.getDefaultISO2Code)();
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
exports.parsePhoneNumber = parsePhoneNumber;
const useMask = (pattern) => {
    const backRef = (0, react_1.useRef)(false);
    const clean = (0, react_1.useCallback)((input) => {
        return (0, exports.cleanInput)(input, pattern.replaceAll(/\d/g, "."));
    }, [pattern]);
    const first = (0, react_1.useMemo)(() => {
        return [...pattern].findIndex(c => slots.has(c));
    }, [pattern]);
    const prev = (0, react_1.useMemo)((j = 0) => {
        return Array.from(pattern.replaceAll(/\d/g, "."), (c, i) => {
            return slots.has(c) ? j = i + 1 : j;
        });
    }, [pattern]);
    const onKeyDown = (0, react_1.useCallback)((event) => {
        backRef.current = event.key === "Backspace";
    }, []);
    const onInput = (0, react_1.useCallback)(({ target }) => {
        const [i, j] = [target.selectionStart, target.selectionEnd].map((i) => {
            i = clean(target.value.slice(0, i)).findIndex(c => slots.has(c));
            return i < 0 ? prev[prev.length - 1] : backRef.current ? prev[i - 1] || first : i;
        });
        target.value = (0, exports.getFormattedNumber)(target.value, pattern);
        target.setSelectionRange(i, j);
        backRef.current = false;
    }, [clean, first, pattern, prev]);
    return {
        onInput,
        onKeyDown,
    };
};
exports.useMask = useMask;
const usePhone = ({ query = "", locale = "", country = "", distinct = false, countryCode = "", initialValue = "", onlyCountries = [], excludeCountries = [], preferredCountries = [], disableParentheses = false, }) => {
    var _a;
    const defaultValue = (0, exports.getRawValue)(initialValue);
    const defaultMetadata = (0, exports.getMetadata)(defaultValue) || countries_json_1.default.find(([iso]) => iso === country);
    const defaultValueState = defaultValue || ((_a = countries_json_1.default.find(([iso]) => iso === (defaultMetadata === null || defaultMetadata === void 0 ? void 0 : defaultMetadata[0]))) === null || _a === void 0 ? void 0 : _a[2]);
    const [value, setValue] = (0, react_1.useState)(defaultValueState);
    const countriesOnly = (0, react_1.useMemo)(() => {
        const allowList = onlyCountries.length > 0 ? onlyCountries : countries_json_1.default.map(([iso]) => iso);
        return countries_json_1.default.filter(([iso, _1, dial]) => {
            return (allowList.includes(iso) || allowList.includes(dial)) && !excludeCountries.includes(iso) && !excludeCountries.includes(dial);
        });
    }, [onlyCountries, excludeCountries]);
    const countriesList = (0, react_1.useMemo)(() => {
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
    const metadata = (0, react_1.useMemo)(() => {
        const calculatedMetadata = (0, exports.getMetadata)((0, exports.getRawValue)(value), countriesList, countryCode);
        if (countriesList.find(([iso]) => iso === (calculatedMetadata === null || calculatedMetadata === void 0 ? void 0 : calculatedMetadata[0]) || iso === (defaultMetadata === null || defaultMetadata === void 0 ? void 0 : defaultMetadata[0]))) {
            return calculatedMetadata || defaultMetadata;
        }
        return countriesList[0];
    }, [countriesList, countryCode, defaultMetadata, value]);
    const pattern = (0, react_1.useMemo)(() => {
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
exports.usePhone = usePhone;
