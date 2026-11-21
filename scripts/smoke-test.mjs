// Loads the built package through its "exports" map with Node's ESM resolver (GH-147).
import assert from "assert";

import {getFormattedNumber, parsePhoneNumber} from "react-phone-hooks";
import {enUS} from "react-phone-hooks/locale";
import {jsonToCss} from "react-phone-hooks/styles";
import * as types from "react-phone-hooks/types";

assert.strictEqual(getFormattedNumber("440201111111"), "+44 (02) 0111 1111");
assert.strictEqual(parsePhoneNumber("+1 (702) 123 4567").isoCode, "us");
assert.ok(enUS.countries);
assert.strictEqual(typeof jsonToCss, "function");
assert.ok(types);

console.log("ESM entry points: OK");
