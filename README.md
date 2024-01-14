# react-phone-hooks <img src="https://github.com/typesnippet.png" align="right" height="64" />

[![npm](https://img.shields.io/npm/v/react-phone-hooks)](https://www.npmjs.com/package/react-phone-hooks)
[![React](https://img.shields.io/badge/react-%E2%89%A516-blue)](https://www.npmjs.com/package/react-phone-hooks)
[![types](https://img.shields.io/npm/types/react-phone-hooks)](https://www.npmjs.com/package/react-phone-hooks)
[![License](https://img.shields.io/npm/l/react-phone-hooks)](https://github.com/typesnippet/react-phone-hooks/blob/master/LICENSE)
[![Tests](https://github.com/typesnippet/react-phone-hooks/actions/workflows/tests.yml/badge.svg)](https://github.com/typesnippet/react-phone-hooks/actions/workflows/tests.yml)

This comprehensive toolkit features custom hooks and utility functions tailored for phone number formatting, parsing,
and validation. It supports international standards, making it suitable for phone number processing applications across
different countries and regions.

## Usage

This library can be used to build a phone number input component with a country selector for React applications. As well
as to parse the phone metadata, validate phone numbers, format raw phone numbers into a more readable format and the
opposite. You can use the [development](./development) to test and develop your own components.

```jsx
import {getFormattedNumber, getMetadata, parsePhoneNumber, useMask} from "react-phone-hooks";

getMetadata("440201111111"); // ["gb", "United Kingdom", "44", "+44 (..) ... ....."]
getFormattedNumber("440201111111", "+44 (..) ... ....."); // +44 (02) 011 11111
parsePhoneNumber("+44 (02) 011 11111"); // {countryCode: 44, areaCode: "02", phoneNumber: "01111111", isoCode: "gb"}

const PhoneInput = (props) => {
    return <input {...useMask("+1 (...) ... ....")} {...props}/>
}
```

## Contribute

Any contribution is welcome. Don't hesitate to open an issue or discussion if you have questions about your project's
usage and integration. For ideas or suggestions, please open a pull request. Your name will shine on our contributors'
list. Be proud of what you build!

## License

Copyright (C) 2023 Artyom Vancyan. [MIT](https://github.com/typesnippet/react-phone-hooks/blob/master/LICENSE)
