import {useCallback, useMemo, useState} from "react";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {Button, Container, CssBaseline, TextField} from "@mui/material";

import PhoneInput from "./mui-phone";
import BasePhoneInput from "./mui-phone/base";
import locale from "./mui-phone/locale";

const Demo = () => {
    const [value, setValue] = useState({});
    const [mode, setMode] = useState("dark");

    const error = useMemo(() => (value as any).valid && !(value as any).valid(), [value]);

    const theme = useMemo(() => createTheme({palette: {mode: mode as any}}, locale("frFR")), [mode]);

    const handleThemeChange = useCallback(() => setMode(mode === "dark" ? "light" : "dark"), [mode]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <Container>
                <div style={{margin: 20, maxWidth: 400}}>
                    {value && (
                        <pre style={{
                            background: mode === "light" ? "#efefef" : "#1f1f1f",
                            color: mode === "light" ? "#1f1f1f" : "#efefef",
                            padding: 10, marginBottom: 24,
                        }}>
                            {JSON.stringify(value, null, 2)}
                        </pre>
                    )}
                    <form noValidate autoComplete="off" onSubmit={e => e.preventDefault()}>
                        <PhoneInput
                            enableSearch
                            error={error}
                            variant="filled"
                            searchVariant="standard"
                            onChange={(e) => setValue(e as any)}
                        />
                        <TextField variant="filled" style={{marginTop: "1.5rem"}}/>
                        <BasePhoneInput
                            error={error}
                            style={{marginTop: "1.5rem"}}
                            onChange={(e) => setValue(e as any)}
                        />
                        <div style={{display: "flex", gap: 24, marginTop: "1rem"}}>
                            <Button type="reset">Reset Value</Button>
                            <Button onClick={handleThemeChange}>Change Theme</Button>
                        </div>
                    </form>
                </div>
            </Container>
        </ThemeProvider>
    );
}

export default Demo;
