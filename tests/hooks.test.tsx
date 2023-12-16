import assert from "assert";

import {useCallback, useEffect, useRef, useState} from "react";
import {act, render, renderHook, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {cleanInput, displayFormat, getFormattedNumber, getRawValue, parsePhoneNumber, useMask, usePhone} from "../src";

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
        value,
        pattern,
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
        const formattedNumber = getFormattedNumber(value, pattern);
        const phoneMetadata = parsePhoneNumber(formattedNumber, countriesList);
        setCountryCode(phoneMetadata.isoCode as any);
        setValue(formattedNumber);
    }, [countriesList, pattern, setValue]);

    const backspace = useCallback(() => {
        const formattedNumber = displayFormat(getRawValue(value).slice(0, -1));
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
        const formattedNumber = getFormattedNumber(initialValue, pattern);
        const phoneMetadata = parsePhoneNumber(formattedNumber, countriesList);
        setCountryCode(phoneMetadata.isoCode as any);
        setValue(formattedNumber);
    }, [countriesList, pattern, metadata, setValue, value])

    return {update, search, select, value, metadata, backspace, countriesList};
}

const UseMaskTester = ({pattern = "", ...props}: any) => {
    return <input data-testid="input" {...useMask(pattern)} {...props}/>;
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

    it("Check useMask for basic use case", async () => {
        render(<UseMaskTester
            pattern="+... (..) ... ....."
            onChange={(e: any) => {
                const isValid = "+380 (11) 222 34567".startsWith(e.target.value);
                assert(isValid || "+380 (1)" === e.target.value);
            }}
        />);

        await userEvent.type(screen.getByTestId("input"), "3801122234567");
    })
})
