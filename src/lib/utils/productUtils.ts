// Product utility functions
export const formatPrice = (price: string | number | undefined): string => {
  if (!price) return '0.00';
  
  try {
    const priceValue = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(priceValue) ? '0.00' : priceValue.toFixed(2);
  } catch {
    return '0.00';
  }
};

export const truncateText = (text: string, maxLength: number = 50): string => {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const validateSearchInput = (input: string): boolean => {
  // Basic validation - no special characters that could cause issues
  const sanitized = input.trim();
  return sanitized.length >= 1 && sanitized.length <= 100;
};

export const sanitizeSearchInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, ''); // Remove potential HTML tags
};

