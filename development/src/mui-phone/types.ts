import {ChangeEvent, KeyboardEvent} from "react";
import {TextFieldProps} from "@mui/material/TextField";

import {PhoneNumber} from "../phone-hooks/types";

export interface PhoneInputProps extends Omit<TextFieldProps, "onChange"> {
	value?: PhoneNumber | string;

	variant?: "outlined" | "filled" | "standard";

	searchVariant?: "outlined" | "filled" | "standard";

	country?: string;

	enableSearch?: boolean;

	searchNotFound?: string;

	searchPlaceholder?: string;

	disableDropdown?: boolean;

	onlyCountries?: string[];

	excludeCountries?: string[];

	preferredCountries?: string[];

	onMount?(value: PhoneNumber): void;

	onInput?(event: ChangeEvent<HTMLInputElement>): void;

	onKeyDown?(event: KeyboardEvent<HTMLInputElement>): void;

	/** NOTE: This differs from the antd Input onChange interface */
	onChange?(value: PhoneNumber, event: ChangeEvent<HTMLInputElement>): void;
}
