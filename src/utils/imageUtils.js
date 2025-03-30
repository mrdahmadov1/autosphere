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
    // Validate the image first
    const validation = validateImage(file);
    if (!validation.valid) {
      return { processedImage: null, error: validation.error };
    }

    // Compress image if it's larger than threshold (500KB)
    const processedImage = file.size > 500 * 1024 ? await compressImage(file) : file;

    return { processedImage, error: null };
  } catch (error) {
    console.error('Error processing image:', error);
    return {
      processedImage: null,
      error: 'Error processing image: ' + error.message,
    };
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
