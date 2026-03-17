"use client";

import * as phoneLocale from "../phone-hooks/locale";

type Locale = keyof typeof phoneLocale;

export default (lang: Locale) => {
    try {
        const filename = `./${lang.replace(/([a-z])([A-Z])/, "$1_$2")}.js`;
        const locale = (require as any).context("antd/es/locale", false, /\.js$/)(filename).default;
        return {
            ...locale,
            PhoneInput: {
                ...(phoneLocale as any)[lang],
                locale: lang,
            },
        };
    } catch {
        throw new Error(`Locale "${lang}" is not supported by the installed antd version.`);
    }
}
