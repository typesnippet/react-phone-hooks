import * as locale from "@mui/material/locale";
import * as phoneLocale from "../phone-hooks/locale";

type Locale = keyof typeof locale;

export default (lang: Locale) => ({
    components: {
        ...locale[lang].components,
        MuiPhoneInput: {
            defaultProps: (phoneLocale as any)[lang],
        }
    }
})
