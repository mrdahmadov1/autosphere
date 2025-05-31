import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase/config';
import { IMAGE_CONFIG } from '../config/constants';
import { validateImage } from './validation';
import { createError } from './errorHandler';

export const compressImage = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Calculate new dimensions
        let width = img.width;
        let height = img.height;
        const maxDimension = IMAGE_CONFIG.maxDimension;

        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob with specified quality
        canvas.toBlob(
          (blob) => {
            resolve(new File([blob], file.name, { type: file.type }));
          },
          file.type,
          IMAGE_CONFIG.compressionQuality
        );
      };

      img.onerror = () => {
        reject(createError('Failed to load image for compression', 'IMAGE_ERROR'));
      };
    };

    reader.onerror = () => {
      reject(createError('Failed to read file', 'IMAGE_ERROR'));
    };
  });
};

export const uploadImage = async (file, path) => {
  try {
    // Validate image
    validateImage(file);

    // Compress image
    const compressedFile = await compressImage(file);

    // Create storage reference
    const storageRef = ref(storage, path);

    // Upload file
    const snapshot = await uploadBytes(storageRef, compressedFile);

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return {
      url: downloadURL,
      path: snapshot.ref.fullPath,
    };
  } catch (error) {
    throw createError(
      error.message || 'Failed to upload image',
      error.code || 'IMAGE_ERROR',
      error.details
    );
  }
};

export const deleteImage = async (path) => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    throw createError(
      error.message || 'Failed to delete image',
      error.code || 'IMAGE_ERROR',
      error.details
    );
  }
};

export const getImageUrl = async (path) => {
  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error) {
    throw createError(
      error.message || 'Failed to get image URL',
      error.code || 'IMAGE_ERROR',
      error.details
    );
  }
};

export const generateImagePath = (userId, fileName) => {
  const timestamp = Date.now();
  const extension = fileName.split('.').pop();
  return `car-images/${userId}/${timestamp}.${extension}`;
};
