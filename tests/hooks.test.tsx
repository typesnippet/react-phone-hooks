import {useCallback, useEffect, useRef, useState} from "react";
import {act, renderHook} from "@testing-library/react";

import {cleanInput, displayFormat, getRawValue, parsePhoneNumber, usePhone} from "../src";

const usePhoneTester = ({
                            country = "us",
                            initialValue = "",
                            onlyCountries = [],
                            excludeCountries = [],
                            preferredCountries = [],
                        }) => {
    const initiatedRef = useRef<boolean>(false);
    const [query, setQuery] = useState<string>("");
    const [countryCode, setCountryCode] = useState<string>(country);

    const {
        clean,
        value,
        metadata,
        setValue,
        countriesList,
    } = usePhone({
        query,
        country,
        countryCode,
        initialValue,
        onlyCountries,
        excludeCountries,
        preferredCountries,
    });

    const update = useCallback((value: string) => {
        const formattedNumber = displayFormat(clean(value).join(""));
        const phoneMetadata = parsePhoneNumber(formattedNumber, countriesList);
        setCountryCode(phoneMetadata.isoCode as any);
        setValue(formattedNumber);
    }, [clean, countriesList, setValue]);

    const backspace = useCallback(() => {
        const rawValue = getRawValue(value);
        const formattedNumber = displayFormat(rawValue.slice(0, -1));
        const phoneMetadata = parsePhoneNumber(formattedNumber, countriesList);
        setCountryCode(phoneMetadata.isoCode as any);
        setValue(formattedNumber);
    }, [value, countriesList, setValue]);

    const search = useCallback(setQuery, []);

    const select = useCallback((isoCode: string) => {
        const mask = (countriesList.find(([iso]) => iso === isoCode) as any)[3];
        setValue(displayFormat(cleanInput(mask, mask).join("")));
        setCountryCode(isoCode);
    }, [setValue, countriesList]);

    useEffect(() => {
        if (initiatedRef.current) return;
        initiatedRef.current = true;
        let initialValue = getRawValue(value);
        if (!initialValue.startsWith(metadata?.[2] as string)) {
            initialValue = metadata?.[2] as string;
        }
        const formattedNumber = displayFormat(clean(initialValue).join(""));
        const phoneMetadata = parsePhoneNumber(formattedNumber, countriesList);
        setCountryCode(phoneMetadata.isoCode as any);
        setValue(formattedNumber);
    }, [clean, countriesList, metadata, setValue, value])

    return {update, search, select, value, metadata, backspace, countriesList};
}

describe("Verifying the functionality of hooks", () => {
    it("Check the usePhone hook initiation and updates", () => {
        const {result} = renderHook(usePhoneTester, {
            initialProps: {
                initialValue: "37411111111",
            }
        });
        expect(result.current.value).toBe("+374 (11) 111 111");
        expect((result.current.metadata as any)[0]).toBe("am");

        act(() => result.current.update("1"));
        act(() => result.current.update("1111"));

        expect(result.current.value).toBe("+1 (111)");
        expect((result.current.metadata as any)[0]).toBe("us");
    })

    it("Check usePhone for country code update", () => {
        const {result} = renderHook(usePhoneTester, {
            initialProps: {
                initialValue: "17021234567",
            }
        });
        expect(result.current.value).toBe("+1 (702) 123 4567");
        expect((result.current.metadata as any)[0]).toBe("us");

        act(() => result.current.select("ua"));

        expect(result.current.value).toBe("+380");
        expect((result.current.metadata as any)[0]).toBe("ua");
    })

    it("Check usePhone for searching a country", () => {
        const {result} = renderHook(usePhoneTester, {
            initialProps: {}
        });

        act(() => result.current.search("Armenia"));

        expect(result.current.countriesList).toHaveLength(1);

        act(() => result.current.select(result.current.countriesList[0][0]));

        expect((result.current.metadata as any)[0]).toBe("am");
    })

    it("Check usePhone for country detection", () => {
        const {result} = renderHook(usePhoneTester, {
            initialProps: {}
        });

        act(() => result.current.update("1"));

        expect((result.current.metadata as any)[0]).toBe("us");

        act(() => result.current.update("1204"));

        expect((result.current.metadata as any)[0]).toBe("ca");

        act(() => result.current.backspace());

        expect((result.current.metadata as any)[0]).toBe("us");
    })
})
