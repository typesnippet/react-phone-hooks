import assert from "assert";

import {checkValidity, getFormattedNumber, getMetadata, getRawValue, hasFixedAreaCode, parsePhoneNumber} from "../src";

describe("Verifying the basic functionality", () => {
    it("Check the basic back-forward utilities", () => {
        const rawValue = "17021234567";
        const metadata = getMetadata(rawValue);

        const formattedNumber = getFormattedNumber(rawValue, (metadata as any)[3]);
        const formattedNumberWithoutParentheses = formattedNumber.replace(/[()]/g, "");
        const formattedNumberOverloaded = getFormattedNumber(rawValue);
        const parsedPhoneNumber = parsePhoneNumber(formattedNumber);
        const parsedPhoneNumberWithoutParentheses = parsePhoneNumber(formattedNumberWithoutParentheses);
        const rawPhoneNumber1 = getRawValue(formattedNumber);
        const rawPhoneNumber2 = getRawValue(formattedNumberWithoutParentheses);

        assert(formattedNumber === formattedNumberOverloaded);
        assert(formattedNumber !== null && formattedNumber === "+1 (702) 123 4567");
        assert(parsedPhoneNumber !== null && parsedPhoneNumber.countryCode === 1);
        assert(parsedPhoneNumber.areaCode === "702" && parsedPhoneNumber.phoneNumber === "1234567");
        assert(parsedPhoneNumberWithoutParentheses !== null && parsedPhoneNumberWithoutParentheses.countryCode === 1);
        assert(parsedPhoneNumberWithoutParentheses.areaCode === "702" && parsedPhoneNumberWithoutParentheses.phoneNumber === "1234567");
        assert(rawPhoneNumber1 === rawValue);
        assert(rawPhoneNumber2 === rawValue);
        assert(getFormattedNumber("+") === "+");
        assert(getFormattedNumber("++") === "+");
        assert(getFormattedNumber("+a") === "+");
    })

    it("Check the phone number validity", () => {
        assert(checkValidity(parsePhoneNumber("+1 702 123 4567")) === true);
        assert(checkValidity(parsePhoneNumber("+1 702 123 456")) === false);

        assert(checkValidity(parsePhoneNumber("+1 (702) 123 4567")) === true);
        assert(checkValidity(parsePhoneNumber("+1 (702) 123 456")) === false);

        assert(checkValidity(parsePhoneNumber("+1 (702) 123 4567"), true) === true);
        assert(checkValidity(parsePhoneNumber("+1 (100) 123 4567"), true) === false);
    })

    it("Check the order accuracy of getMetadata result", () => {
        const bqMetadata = getMetadata("5990651111");
        const cwMetadata = getMetadata("5997171111", undefined, "cw");
        assert(bqMetadata !== null && (bqMetadata as any)[0] === "bq");
        assert(cwMetadata !== null && (cwMetadata as any)[0] === "cw");

        const gbMetadata = getMetadata("440201111111");
        const jeMetadata = getMetadata("447797111111", undefined, "je");
        assert(gbMetadata !== null && (gbMetadata as any)[0] === "gb");
        assert(jeMetadata !== null && (jeMetadata as any)[0] === "je");

        const itMetadata = getMetadata("39310111111111");
        const vaMetadata = getMetadata("39066981111111", undefined, "va");
        assert(itMetadata !== null && (itMetadata as any)[0] === "it");
        assert(vaMetadata !== null && (vaMetadata as any)[0] === "va");
    })

    it("Check parsePhoneNumber for countries without fixed area codes", () => {
        /** Czechia: format pattern +420 (...) ... ... ... has no fixed area code */
        const czNumber = parsePhoneNumber("+420 123 456 789");
        assert(czNumber.countryCode === 420);
        assert(czNumber.areaCode === null);
        assert(czNumber.phoneNumber === "123456789");
        assert(czNumber.isoCode === "cz");

        /** Belgium: format pattern +32 (...) ... ... has no fixed area code */
        const beNumber = parsePhoneNumber("+32 412 345 678");
        assert(beNumber.countryCode === 32);
        assert(beNumber.areaCode === null);
        assert(beNumber.phoneNumber === "412345678");
        assert(beNumber.isoCode === "be");

        /** Austria: format pattern +43 (...) ... ... .... has no fixed area code */
        const atNumber = parsePhoneNumber("+43 123 456 7890");
        assert(atNumber.countryCode === 43);
        assert(atNumber.areaCode === null);
        assert(atNumber.phoneNumber === "1234567890");
        assert(atNumber.isoCode === "at");

        /** US: format pattern +1 (702) ... .... has a fixed area code */
        const usNumber = parsePhoneNumber("+1 (702) 123 4567");
        assert(usNumber.countryCode === 1);
        assert(usNumber.areaCode === "702");
        assert(usNumber.phoneNumber === "1234567");
        assert(usNumber.isoCode === "us");

        /** Australia: format pattern +61 (2) .... .... ... has a fixed area code */
        const auNumber = parsePhoneNumber("+61 (2) 1234 5678");
        assert(auNumber.countryCode === 61);
        assert(auNumber.areaCode === "2");
        assert(auNumber.phoneNumber === "12345678");
        assert(auNumber.isoCode === "au");
    })

    it("Check hasFixedAreaCode helper", () => {
        /** Patterns with fixed area codes (digits in parentheses) */
        assert(hasFixedAreaCode("+1 (702) ... ....") === true);
        assert(hasFixedAreaCode("+61 (2) .... .... ...") === true);

        /** Patterns without fixed area codes (only dots in parentheses) */
        assert(hasFixedAreaCode("+420 (...) ... ... ...") === false);
        assert(hasFixedAreaCode("+32 (...) ... ...") === false);
        assert(hasFixedAreaCode("+43 (...) ... ... ....") === false);
        assert(hasFixedAreaCode("+44 (..) .... ....") === false);

        /** Edge cases */
        assert(hasFixedAreaCode("") === false);
    })
})
