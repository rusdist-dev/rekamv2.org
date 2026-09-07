/* Served from public/, not imported as a module — Next has no bundler loader
   for arbitrary binary files like a 9MB PDF, only for the image formats
   next/image knows. A plain absolute path also sidesteps AppLink/ButtonLink:
   both prefix "/"-rooted hrefs with the current locale for routed pages,
   which would turn this into "/en/assets/..." and 404 on a file public/
   serves unprefixed.

   Shared between /publication and /tentang, which both show the same Impact
   Report 2025 highlight. */
export const IMPACT_REPORT_PDF = '/assets/publication/impact_rekam2025.pdf';
