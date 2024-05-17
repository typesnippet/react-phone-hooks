"use client";

export const jsonToCss = (stylesheet: object) => {
    /** Convert the given `stylesheet` object to raw CSS */
    return Object.entries(stylesheet).map(([selector, rules]) => {
        return `${selector} {` + Object.entries(rules).map(([key, value]) => {
            return `${key}: ${value}; `;
        }).join("") + "} ";
    }).join("");
}

export const injectStyles = (cssText: string) => {
    /** Inject the given `cssText` in the document head */
    const style = document.createElement("style");
    style.setAttribute("type", "text/css");

    if ((style as any).styleSheet) {
        (style as any).styleSheet.cssText = cssText;
    } else {
        style.appendChild(document.createTextNode(cssText));
    }

    document.head.appendChild(style);
}
