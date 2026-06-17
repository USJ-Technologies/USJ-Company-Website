import { Helmet } from 'react-helmet-async';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://usjtechnologies.com';
const SITE_NAME = 'USJ Technologies (OPC) Pvt Ltd';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

const BASE_KEYWORDS =
  'IT company Dehradun, technology company Uttarakhand, electronics supplier Dehradun, GeM registered seller, government IT procurement Uttarakhand, networking products Dehradun, B2B electronics North India, USJ Technologies';

export default function SEOHead({
  title,
  titleFull,           // use this to bypass the "| USJ Technologies" suffix
  description,
  keywords = '',
  canonical = '/',
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  noindex = false,
  structuredData,      // object or array — will be JSON.stringify'd
}) {
  const resolvedTitle = titleFull
    ? titleFull
    : title
    ? `${title} | USJ Technologies – IT Company Dehradun`
    : `USJ Technologies | IT Company Dehradun | GeM Electronics Supplier Uttarakhand`;

  const resolvedDesc =
    description ||
    'USJ Technologies – Leading IT company in Dehradun, Uttarakhand. GeM registered electronics supplier, ENTER & TENDA networking products, government & defence technology solutions. B2B supply, tender support, pan-India delivery.';

  const resolvedKeywords = keywords ? `${keywords}, ${BASE_KEYWORDS}` : BASE_KEYWORDS;
  const canonicalUrl = canonical.startsWith('http') ? canonical : `${SITE_URL}${canonical}`;

  return (
    <Helmet>
      {/* Core */}
      <title>{resolvedTitle}</title>
      <meta name="description" content={resolvedDesc} />
      <meta name="keywords" content={resolvedKeywords} />
      <link rel="canonical" href={canonicalUrl} />
      {noindex ? (
        <meta name="robots" content="noindex,nofollow" />
      ) : (
        <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1" />
      )}

      {/* Geo */}
      <meta name="geo.region" content="IN-UT" />
      <meta name="geo.placename" content="Dehradun, Uttarakhand, India" />
      <meta name="geo.position" content="30.3165;78.0322" />
      <meta name="ICBM" content="30.3165, 78.0322" />

      {/* Open Graph */}
      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={resolvedDesc} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={resolvedTitle} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={resolvedTitle} />
      <meta name="twitter:description" content={resolvedDesc} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD structured data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}
