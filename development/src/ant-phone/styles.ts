import {jsonToCss,} from "../phone-hooks/styles";
import phoneStyles from "./resources/stylesheet.json";
import flagsStyles from "../phone-hooks/resources/stylesheet.json";

export const mergedStyles = () => jsonToCss(Object.assign(phoneStyles, flagsStyles));
