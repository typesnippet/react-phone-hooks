"use client";

import {injectStyles, jsonToCss} from "../phone-hooks/styles";
import commonStyles from "../phone-hooks/resources/stylesheet.json";

import customStyles from "./resources/stylesheet.json";

export const injectMergedStyles = () => injectStyles(jsonToCss(Object.assign(commonStyles, customStyles)));
