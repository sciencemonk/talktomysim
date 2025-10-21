/**
 * Properly formats avatar URLs to ensure they can be loaded correctly
 * Handles various URL formats from the database
 */
export const getAvatarUrl = (avatarUrl: string | null | undefined): string | undefined => {
  if (!avatarUrl) return undefined;

  // If it's already a full URL (http or https), return as-is
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return avatarUrl;
  }

  // Handle paths that include 'public/' prefix
  // Convert 'public/lovable-uploads/...' to '/lovable-uploads/...'
  if (avatarUrl.includes('public/lovable-uploads/')) {
    const path = avatarUrl.substring(avatarUrl.indexOf('lovable-uploads/'));
    return `/${path}`;
  }

  // Handle paths that include '/public/' prefix
  // Convert '/public/lovable-uploads/...' to '/lovable-uploads/...'
  if (avatarUrl.includes('/public/lovable-uploads/')) {
    const path = avatarUrl.substring(avatarUrl.indexOf('lovable-uploads/'));
    return `/${path}`;
  }

  // If it starts with '/', it's already a proper absolute path
  if (avatarUrl.startsWith('/')) {
    return avatarUrl;
  }

  // If it starts with 'lovable-uploads/', add leading slash
  if (avatarUrl.startsWith('lovable-uploads/')) {
    return `/${avatarUrl}`;
  }

  // For any other case, ensure it starts with '/'
  return `/${avatarUrl}`;
};
