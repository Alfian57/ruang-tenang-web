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
    // General
    "class", "id", "style",
    // Tables
    "colspan", "rowspan",
];

/**
 * Sanitize HTML content to prevent XSS attacks.
 * Use this for ALL `dangerouslySetInnerHTML` usages.
 */
export function sanitizeHtml(html: string): string {
    if (!html) return "";

    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS,
        ALLOWED_ATTR,
        ALLOW_DATA_ATTR: false,
        ADD_ATTR: ["target"],
    });
}
