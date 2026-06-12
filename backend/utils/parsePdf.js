/**
 * utils/parsePdf.js
 * Heuristic PDF product-catalogue parser built on top of pdf-parse.
 * Attempts to extract structured product data (name, SKU, price, specs)
 * from raw PDF text. Returns partial Product objects for admin review.
 */

import { PDFParse } from 'pdf-parse';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Match prices like ₹1,234, Rs. 999, or bare numbers like 1234.00 */
const PRICE_REGEX = /(?:₹|Rs\.?\s*)(\d[\d,]*(?:\.\d{1,2})?)/i;

/** Match a bare numeric-ish price without currency symbol */
const BARE_PRICE_REGEX = /^\d[\d,]*(?:\.\d{1,2})?$/;

/** Match key: value pairs for specs (e.g. "Voltage: 220V") */
const SPEC_REGEX = /^([A-Za-z][A-Za-z\s]{1,30})\s*:\s*(.+)$/;

/** Match SKU patterns like SKU123, USJ-001, PROD/2024 */
const SKU_REGEX = /\b([A-Z]{2,6}[-/]?\d{3,8})\b/;

/**
 * Heuristic check: does this line look like a product name?
 * - Title-case or all-caps, length 3–120 chars, not just punctuation
 */
const looksLikeProductName = (line) => {
  if (line.length < 3 || line.length > 120) return false;
  if (/^\d+$/.test(line)) return false; // pure number
  // Must have at least one letter
  return /[a-zA-Z]/.test(line) && /[A-Z]/.test(line);
};

// ─── Main Parser ──────────────────────────────────────────────────────────────

/**
 * Parses a PDF buffer and attempts to extract product data.
 *
 * @param {Buffer} buffer - Raw PDF file buffer
 * @returns {Promise<{
 *   success: boolean,
 *   products: Array<Object>,
 *   rawText: string,
 *   error?: string
 * }>}
 */
export const parsePdfCatalog = async (buffer) => {
  let rawText = '';
  let parser = null;

  try {
    parser = new PDFParse({ data: buffer });
    const data = await parser.getText();
    rawText = data.text || '';

    const lines = rawText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const products = [];
    let current = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // ── Price detection ─────────────────────────────────────────────────
      const priceMatch = line.match(PRICE_REGEX);
      if (priceMatch) {
        const priceStr = priceMatch[1].replace(/,/g, '');
        const price = parseFloat(priceStr);

        if (current) {
          current.price = price;
        } else {
          // Price before name — start a new product with a placeholder name
          // from the previous non-empty line
          const prevLine = lines[i - 1] || '';
          current = {
            name: prevLine || `Product ${products.length + 1}`,
            price,
            specifications: [],
          };
        }
        continue;
      }

      // ── Spec key:value line ─────────────────────────────────────────────
      const specMatch = line.match(SPEC_REGEX);
      if (specMatch && current) {
        current.specifications = current.specifications || [];
        current.specifications.push({ key: specMatch[1].trim(), value: specMatch[2].trim() });
        continue;
      }

      // ── SKU detection ───────────────────────────────────────────────────
      const skuMatch = line.match(SKU_REGEX);
      if (skuMatch && current && !current.sku) {
        current.sku = skuMatch[1];
        continue;
      }

      // ── Possible product name ───────────────────────────────────────────
      if (looksLikeProductName(line)) {
        // Push the previous product if it has a price
        if (current && current.price !== undefined) {
          products.push(finalize(current));
        }
        current = {
          name: line,
          specifications: [],
          catalogSource: 'pdf_import',
        };
        continue;
      }

      // ── Short description heuristic ─────────────────────────────────────
      // Lines that are long sentences probably describe the current product
      if (current && line.length > 30 && !current.shortDescription) {
        current.shortDescription = line.substring(0, 500);
      }
    }

    // Push the last accumulated product
    if (current && current.price !== undefined) {
      products.push(finalize(current));
    }

    if (products.length < 2) {
      // Not enough structured data — return raw text for admin inspection
      return {
        success: true,
        products,
        rawText,
        warning: 'Fewer than 2 products detected. Raw text is included for manual review.',
      };
    }

    return { success: true, products, rawText };
  } catch (error) {
    console.error('PDF parse error:', error.message);
    return {
      success: false,
      products: [],
      rawText,
      error: error.message,
    };
  } finally {
    if (parser) {
      await parser.destroy();
    }
  }
};

// ─── Finaliser ────────────────────────────────────────────────────────────────

/** Cleans up a product object before it is returned */
const finalize = (product) => ({
  name: product.name?.trim(),
  sku: product.sku || undefined,
  price: product.price,
  shortDescription: product.shortDescription || undefined,
  specifications: product.specifications?.length ? product.specifications : undefined,
  catalogSource: 'pdf_import',
});
