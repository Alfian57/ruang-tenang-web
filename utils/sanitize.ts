import DOMPurify from "isomorphic-dompurify";

/**
 * Allowed HTML tags for rich text content (articles, journals, stories).
 * Matches the TipTap editor output tags.
 */
const ALLOWED_TAGS = [
    // Text structure
    "h1", "h2", "h3", "h4", "h5", "h6",
    "p", "br", "hr",
    // Formatting
    "b", "i", "u", "s", "em", "strong", "mark", "sub", "sup",
    "code", "pre", "blockquote",
    // Lists
    "ul", "ol", "li",
    // Links & Media
    "a", "img",
    // Tables
    "table", "thead", "tbody", "tr", "th", "td",
    // Misc
    "div", "span", "figure", "figcaption",
];

const ALLOWED_ATTR = [
    // Links
    "href", "target", "rel",
    // Images
    "src", "alt", "width", "height", "loading",
    // Tables
    "colspan", "rowspan",
];

let hooksInstalled = false;

function installSanitizeHooks() {
    if (hooksInstalled) return;

    DOMPurify.addHook("afterSanitizeAttributes", (node) => {
        const element = node as Element;
        if (!element || typeof element.tagName !== "string") return;

        if (element.tagName === "A") {
            const href = element.getAttribute("href") ?? "";
            const isExternal = /^https?:\/\//i.test(href);

            if (isExternal || element.getAttribute("target") === "_blank") {
                element.setAttribute("target", "_blank");
                element.setAttribute("rel", "noopener noreferrer");
            }
        }

        if (element.tagName === "IMG" && !element.getAttribute("loading")) {
            element.setAttribute("loading", "lazy");
        }
    });

    hooksInstalled = true;
}

/**
 * Sanitize HTML content to prevent XSS attacks.
 * Use this for ALL `dangerouslySetInnerHTML` usages.
 */
export function sanitizeHtml(html: string): string {
    if (!html) return "";
    installSanitizeHooks();

    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS,
        ALLOWED_ATTR,
        ALLOW_DATA_ATTR: false,
        ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|\/(?!\/)|#)/i,
    });
}
