// Loads the built package through its "exports" map with Node's CJS resolver (GH-147).
const assert = require("assert");

const {getFormattedNumber, parsePhoneNumber} = require("react-phone-hooks");
const {enUS} = require("react-phone-hooks/locale");
const {jsonToCss} = require("react-phone-hooks/styles");
const types = require("react-phone-hooks/types");

assert.strictEqual(getFormattedNumber("440201111111"), "+44 (02) 0111 1111");
assert.strictEqual(parsePhoneNumber("+1 (702) 123 4567").isoCode, "us");
assert.ok(enUS.countries);
assert.strictEqual(typeof jsonToCss, "function");
assert.ok(types);

console.log("CJS entry points: OK");
