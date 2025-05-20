/**
 * Utility functions for handling document and image URLs
 */

/**
 * Get a properly formatted document URL for use with Nginx
 * @param {Object} document - Document object with url property
 * @param {Number} propertyId - Current property ID (optional)
 * @returns {String} Formatted URL
 */
export const getDocumentUrl = (document, propertyId = null) => {
  if (!document || !document.url) return null;
  
  // If it's already a full URL, return it as is
  if (document.url.startsWith('http')) {
    return document.url;
  }
  
  // Check if this is a property photo or document
  const isPropertyPhoto = 
    document.category === 'property_photo' || 
    document.title === 'Home Exterior' ||
    (document.description && document.description.toLowerCase().includes('property photo'));
  
  // Get property ID from document or passed propertyId
  const docPropertyId = document.property_id || propertyId;
  
  // Extract just the filename
  const fileName = document.url
    .replace(/^\/+/, '')                               // Remove leading slashes
    .replace(/^uploads\//, '')                        // Remove uploads/ prefix
    .replace(/^documents\/files\/property_\d+\//, '') // Remove property path
    .replace(/^documents\/photos\/property_\d+\//, ''); // Remove photo property path
  
  if (isPropertyPhoto) {
    // For property photos
    return `/uploads/documents/photos/property_${docPropertyId}/${fileName}`;
  } else {
    // For regular documents
    return `/uploads/documents/files/property_${docPropertyId}/${fileName}`;
  }
};

/**
 * Get formatted image URL (for property photos, etc.)
 * @param {String} imageUrl - Image URL
 * @returns {String} Formatted URL
 */
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  // If it's already a full URL, return it as is
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // Ensure URL starts with a slash
  return imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
};