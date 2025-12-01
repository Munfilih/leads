// Case-insensitive utilities for dashboard content
export const normalizeText = (text: string): string => {
  return text.toLowerCase().trim();
};

export const groupByCaseInsensitive = <T>(
  items: T[],
  keyExtractor: (item: T) => string
): Record<string, T[]> => {
  return items.reduce((acc, item) => {
    const key = keyExtractor(item);
    const normalizedKey = normalizeText(key);
    
    // Find existing key with same normalized value
    const existingKey = Object.keys(acc).find(k => normalizeText(k) === normalizedKey);
    const finalKey = existingKey || key;
    
    if (!acc[finalKey]) {
      acc[finalKey] = [];
    }
    acc[finalKey].push(item);
    return acc;
  }, {} as Record<string, T[]>);
};

export const countByCaseInsensitive = <T>(
  items: T[],
  keyExtractor: (item: T) => string
): Record<string, number> => {
  const grouped = groupByCaseInsensitive(items, keyExtractor);
  return Object.entries(grouped).reduce((acc, [key, items]) => {
    acc[key] = items.length;
    return acc;
  }, {} as Record<string, number>);
};