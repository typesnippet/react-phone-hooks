import {useCallback, useEffect, useRef, useState} from "react";
import {act, renderHook} from "@testing-library/react";

import {displayFormat, getRawValue, parsePhoneNumber, usePhone} from "../src";

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

	const select = useCallback(setCountryCode, []);

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
})
