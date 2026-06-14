-- ============================================================
-- USJ Technologies — Migration 007: Tenda Product URLs
-- Maps each Tenda product category to the official Tenda
-- manufacturer product page so customers can find full specs.
-- Run this in Supabase SQL Editor.
-- ============================================================

UPDATE products SET product_url = 'https://www.tendacn.com/products/OLTandAccessories'
  WHERE brand_name = 'TENDA' AND category_name ILIKE '%OLT%';

UPDATE products SET product_url = 'https://www.tendacn.com/products/xDSL-Modems'
  WHERE brand_name = 'TENDA' AND category_name ILIKE '%xDSL%';

UPDATE products SET product_url = 'https://www.tendacn.com/products/switches'
  WHERE brand_name = 'TENDA' AND category_name ILIKE '%Switch%';

UPDATE products SET product_url = 'https://www.tendacn.com/products/gateway'
  WHERE brand_name = 'TENDA' AND category_name ILIKE '%Gateway%';

UPDATE products SET product_url = 'https://www.tendacn.com/products/EnterpriseWireless'
  WHERE brand_name = 'TENDA' AND category_name ILIKE '%Enterprise%';

UPDATE products SET product_url = 'https://www.tendacn.com/products/cpebasestation'
  WHERE brand_name = 'TENDA' AND (category_name ILIKE '%CPE%' OR category_name ILIKE '%Basestation%' OR category_name ILIKE '%Base Station%');

UPDATE products SET product_url = 'https://www.tendacn.com/products/mesh-wifi-systems'
  WHERE brand_name = 'TENDA' AND (category_name ILIKE '%Mesh%' OR category_name ILIKE '%WiFi System%');

UPDATE products SET product_url = 'https://www.tendacn.com/products/routers'
  WHERE brand_name = 'TENDA' AND category_name ILIKE '%Router%' AND category_name NOT ILIKE '%5G%' AND category_name NOT ILIKE '%4G%';

UPDATE products SET product_url = 'https://www.tendacn.com/products/5G-4GRouters'
  WHERE brand_name = 'TENDA' AND (category_name ILIKE '%5G%' OR category_name ILIKE '%4G%');

UPDATE products SET product_url = 'https://www.tendacn.com/products/mifi'
  WHERE brand_name = 'TENDA' AND category_name ILIKE '%MiFi%';

UPDATE products SET product_url = 'https://www.tendacn.com/products/network-expansion'
  WHERE brand_name = 'TENDA' AND (category_name ILIKE '%Network Expansion%' OR category_name ILIKE '%Repeater%' OR category_name ILIKE '%Extender%');

UPDATE products SET product_url = 'https://www.tendacn.com/products/adapters'
  WHERE brand_name = 'TENDA' AND category_name ILIKE '%Adapter%';

UPDATE products SET product_url = 'https://www.tendacn.com/products/ipcamera'
  WHERE brand_name = 'TENDA' AND (category_name ILIKE '%IP Camera%' OR category_name ILIKE '%Camera%');

UPDATE products SET product_url = 'https://www.tendacn.com/products/nvr'
  WHERE brand_name = 'TENDA' AND category_name ILIKE '%NVR%';

UPDATE products SET product_url = 'https://www.tendacn.com/products/vskit'
  WHERE brand_name = 'TENDA' AND (category_name ILIKE '%Surveillance Kit%' OR category_name ILIKE '%Video Surveillance%');

UPDATE products SET product_url = 'https://www.tendacn.com/products/ONT'
  WHERE brand_name = 'TENDA' AND category_name ILIKE '%ONT%';

-- Fallback: any remaining Tenda products without a URL get the main products page
UPDATE products SET product_url = 'https://www.tendacn.com/products'
  WHERE brand_name = 'TENDA' AND (product_url IS NULL OR product_url = '');

-- Verify
SELECT category_name, product_url, COUNT(*) as count
FROM products
WHERE brand_name = 'TENDA'
GROUP BY category_name, product_url
ORDER BY category_name;
