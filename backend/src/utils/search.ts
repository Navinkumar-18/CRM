/** Escape special characters for PostgreSQL ILIKE patterns */
export const escapeIlike = (input: string): string => {
  return input.replace(/[%_\\]/g, '\\$&');
};
