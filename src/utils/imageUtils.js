/**
 * Maximum image size in bytes (2MB)
 */
export const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

/**
 * Valid image mime types
 */
export const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Compresses an image using HTML Canvas
 * @param {File} imageFile - Original image file
 * @param {Object} options - Compression options
 * @param {number} options.maxWidth - Maximum width (default: 1200)
 * @param {number} options.maxHeight - Maximum height (default: 800)
 * @param {number} options.quality - Compression quality 0-1 (default: 0.7)
 * @returns {Promise<Blob>} - Compressed image blob
 */
export const compressImage = async (
  imageFile,
  { maxWidth = 1200, maxHeight = 800, quality = 0.7 } = {}
) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(imageFile);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        // Create canvas for image compression
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Calculate new dimensions (maintaining aspect ratio)
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        // Set canvas dimensions and draw resized image
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to blob with specified quality
        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          imageFile.type,
          quality
        );
      };

      img.onerror = (error) => {
        reject(new Error('Error loading image for compression: ' + error.message));
      };
    };

    reader.onerror = (error) => {
      reject(new Error('Error reading file for compression: ' + error.message));
    };
  });
};

/**
 * Validates an image file
 * @param {File} file - The image file to validate
 * @returns {Object} - { valid: boolean, error: string | null }
 */
export const validateImage = (file) => {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  // Validate file type
  if (!VALID_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Please upload a valid image file (JPEG, PNG, or WebP)',
    };
  }

  // Validate file size
  if (file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: 'Image size should be less than 2MB',
    };
  }

  return { valid: true, error: null };
};

/**
 * Processes an image for upload (validates and compresses)
 * @param {File} file - Original image file
 * @returns {Promise<Object>} - { processedImage: Blob | File, error: string | null }
 */
export const processImageForUpload = async (file) => {
  try {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return { error: 'File must be an image' };
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { error: 'Image size must be less than 5MB' };
    }

    // Create a promise to handle image processing
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();

        img.onload = () => {
          // Create canvas for image processing
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Calculate new dimensions (max 1200px width/height)
          let width = img.width;
          let height = img.height;
          const maxSize = 1200;

          if (width > height && width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }

          // Set canvas dimensions
          canvas.width = width;
          canvas.height = height;

          // Draw and compress image
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to base64 with quality 0.8
          const base64 = canvas.toDataURL('image/jpeg', 0.8);

          resolve({ processedImage: file, base64 });
        };

        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };

        img.src = e.target.result;
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error('Error processing image:', error);
    return { error: error.message || 'Failed to process image' };
  }
};

/**
 * Converts a file or blob to base64 string
 * @param {File|Blob} file - The file or blob to convert
 * @returns {Promise<string>} - Base64 data URL
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Utility functions for generating and handling placeholder images
 */

// Placeholder images for different states
const PLACEHOLDERS = {
  loading:
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNMTAwIDUwQzcyLjM4NiA1MCA1MCA3Mi4zODYgNTAgMTAwQzUwIDEyNy42MTQgNzIuMzg2IDE1MCAxMDAgMTUwQzEyNy42MTQgMTUwIDE1MCAxMjcuNjE0IDE1MCAxMDBDMTUwIDcyLjM4NiAxMjcuNjE0IDUwIDEwMCA1MFpNMTAwIDEzMEM4OS4wMTkgMTMwIDgwIDEyMC45ODEgODAgMTEwQzgwIDk5LjAxODggODkuMDE5IDkwIDEwMCA5MEMxMTAuOTgxIDkwIDEyMCA5OS4wMTg4IDEyMCAxMTBDMTIwIDEyMC45ODEgMTEwLjk4MSAxMzAgMTAwIDEzMFoiIGZpbGw9IiM2QjcyRkYiLz48L3N2Zz4=',
  error:
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGRkYxRjEiLz48cGF0aCBkPSJNMTAwIDUwQzcyLjM4NiA1MCA1MCA3Mi4zODYgNTAgMTAwQzUwIDEyNy42MTQgNzIuMzg2IDE1MCAxMDAgMTUwQzEyNy42MTQgMTUwIDE1MCAxMjcuNjE0IDE1MCAxMDBDMTUwIDcyLjM4NiAxMjcuNjE0IDUwIDEwMCA1MFpNMTAwIDEzMEM4OS4wMTkgMTMwIDgwIDEyMC45ODEgODAgMTEwQzgwIDk5LjAxODggODkuMDE5IDkwIDEwMCA5MEMxMTAuOTgxIDkwIDEyMCA5OS4wMTg4IDEyMCAxMTBDMTIwIDEyMC45ODEgMTEwLjk4MSAxMzAgMTAwIDEzMFoiIGZpbGw9IiNFRjQ0NDQiLz48L3N2Zz4=',
  car: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNMTYwIDgwSDE0MFY2MEMxNDAgNTUuNTcyIDEzNi40MjggNTIgMTMyIDUySDY4QzYzLjU3MiA1MiA2MCA1NS41NzIgNjAgNjBWODBINDBDNDAgODAgNDAgODAgNDAgODBWMTIwQzQwIDEyMCA0MCAxMjAgNDAgMTIwSDE2MEMxNjAgMTIwIDE2MCAxMjAgMTYwIDEyMFY4MEMxNjAgODAgMTYwIDgwIDE2MCA4MFpNNjggNjBIMTMyVjgwSDY4VjYwWk00MCAxMjBIMTYwVjE0MEg0MFYxMjBaIiBmaWxsPSIjNkI3MkZGIi8+PC9zdmc+',
  default:
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNMTAwIDUwQzcyLjM4NiA1MCA1MCA3Mi4zODYgNTAgMTAwQzUwIDEyNy42MTQgNzIuMzg2IDE1MCAxMDAgMTUwQzEyNy42MTQgMTUwIDE1MCAxMjcuNjE0IDE1MCAxMDBDMTUwIDcyLjM4NiAxMjcuNjE0IDUwIDEwMCA1MFpNMTAwIDEzMEM4OS4wMTkgMTMwIDgwIDEyMC45ODEgODAgMTEwQzgwIDk5LjAxODggODkuMDE5IDkwIDEwMCA5MEMxMTAuOTgxIDkwIDEyMCA5OS4wMTg4IDEyMCAxMTBDMTIwIDEyMC45ODEgMTEwLjk4MSAxMzAgMTAwIDEzMFoiIGZpbGw9IiM2QjcyRkYiLz48L3N2Zz4=',
};

// Get placeholder image based on type
export const getPlaceholder = (type = 'default') => {
  return PLACEHOLDERS[type] || PLACEHOLDERS.default;
};

/**
 * Create a data URL for a custom placeholder with text
 * @param {string} text - Text to display on the placeholder
 * @param {string} bgcolor - Background color
 * @param {string} textcolor - Text color
 * @returns {string} Data URL for the SVG placeholder
 */
export function createCustomPlaceholder(
  text = 'No Image',
  bgcolor = '#eeeeee',
  textcolor = '#999999'
) {
  const svg = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="${bgcolor}"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="18px" text-anchor="middle" fill="${textcolor}">${text}</text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg.trim())}`;
}

export default {
  getPlaceholder,
  createCustomPlaceholder,
  DEFAULT_PLACEHOLDER: PLACEHOLDERS.default,
  LOADING_PLACEHOLDER: PLACEHOLDERS.loading,
  ERROR_PLACEHOLDER: PLACEHOLDERS.error,
  CAR_PLACEHOLDER: PLACEHOLDERS.car,
};
