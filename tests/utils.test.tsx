import assert from "assert";

import {checkValidity, getFormattedNumber, getMetadata, getRawValue, parsePhoneNumber} from "../src";

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
})
