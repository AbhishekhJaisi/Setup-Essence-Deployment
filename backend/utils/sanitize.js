const sanitizeHtml = require('sanitize-html');

const plainText = { allowedTags: [], allowedAttributes: {} };
const richText = { allowedTags: ['b', 'i', 'em', 'strong', 'ul', 'ol'], allowedAttributes: {} };

const clean = (val, config = plainText) => val ? sanitizeHtml(String(val), config) : val;


module.exports = { clean, richText };