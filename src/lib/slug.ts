export function generateSlug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Replace ordinal indicators with their letter equivalents
    .replace(/\u00aa/g, 'a')
    .replace(/\u00ba/g, 'o')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-');
}
