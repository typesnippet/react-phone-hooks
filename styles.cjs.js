"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.injectStyles = exports.jsonToCss = void 0;
const jsonToCss = (stylesheet) => {
    /** Convert the given `stylesheet` object to raw CSS */
    return Object.entries(stylesheet).map(([selector, rules]) => {
        return `${selector} {` + Object.entries(rules).map(([key, value]) => {
            return `${key}: ${value}; `;
        }).join("") + "} ";
    }).join("");
};
exports.jsonToCss = jsonToCss;
const injectStyles = (cssText) => {
    /** Inject the given `cssText` in the document head */
    try {
        const style = document.createElement("style");
        style.setAttribute("type", "text/css");
        if (style.styleSheet) {
            style.styleSheet.cssText = cssText;
        }
        else {
            style.appendChild(document.createTextNode(cssText));
        }
        document.head.appendChild(style);
    }
    catch (err) {
    }
};
exports.injectStyles = injectStyles;
