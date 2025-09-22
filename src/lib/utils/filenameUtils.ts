/**
 * Utility functions for cleaning and formatting filenames
 */

/**
 * Cleans a name for use in filenames by removing special characters and replacing spaces
 * @param name - The name to clean
 * @returns Cleaned name suitable for filenames
 */
export const cleanNameForFilename = (name: string): string => {
  if (!name) return 'unknown';
  
  return name
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .toLowerCase()
    .trim();
};

/**
 * Generates a filename with user name prefix
 * @param userName - The user's name
 * @param fileType - The type of file (e.g., 'resume', 'cover_letter', 'performance')
 * @param extension - The file extension (e.g., 'pdf', 'json')
 * @returns Formatted filename
 */
export const generateUserFilename = (
  userName: string, 
  fileType: string, 
  extension: string
): string => {
  const cleanName = cleanNameForFilename(userName);
  const timestamp = Date.now();
  return `${cleanName}_${fileType}_${timestamp}.${extension}`;
};

/**
 * Generates a filename with user name prefix (without timestamp)
 * @param userName - The user's name
 * @param fileType - The type of file (e.g., 'resume', 'cover_letter')
 * @param extension - The file extension (e.g., 'pdf', 'json')
 * @returns Formatted filename
 */
export const generateSimpleUserFilename = (
  userName: string, 
  fileType: string, 
  extension: string
): string => {
  const cleanName = cleanNameForFilename(userName);
  return `${cleanName}_${fileType}.${extension}`;
};
