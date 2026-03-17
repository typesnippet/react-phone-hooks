"use client";

import enUS from "antd/es/locale/en_US";
import * as phoneLocale from "../phone-hooks/locale";

type Locale = keyof typeof phoneLocale;

/**
 * @deprecated The localization is handled automatically - use the official way.
 * This function will be removed in the next major version.
 */
export default (lang: Locale) => {
    const filename = lang.replace(/([a-z])([A-Z])/, "$1_$2");
    console.error(`Import the locale directly from "antd/es/locale/${filename}" and pass it to the ConfigProvider.`);
    return enUS;
}
