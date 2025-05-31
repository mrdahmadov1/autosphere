import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ref, get } from 'firebase/database';
import { database } from '../firebase/config';
import { getPlaceholder } from '../utils/imageUtils';

const CarImage = ({ imageRef, alt = 'Car image', className = '' }) => {
  const [imageUrl, setImageUrl] = useState(getPlaceholder('loading'));
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadImage = async () => {
      if (!imageRef) {
        setImageUrl(getPlaceholder('car'));
        return;
      }

      try {
        const imageRefObj = ref(database, imageRef);
        const snapshot = await get(imageRefObj);

        if (snapshot.exists()) {
          const imageData = snapshot.val();
          if (imageData?.data) {
            // Check if the image data is a valid base64 string
            if (imageData.data.startsWith('data:image')) {
              if (isMounted) {
                setImageUrl(imageData.data);
                setError(false);
              }
            } else {
              console.error('Invalid image data format');
              if (isMounted) {
                setImageUrl(getPlaceholder('error'));
                setError(true);
              }
            }
          } else {
            console.error('No image data found');
            if (isMounted) {
              setImageUrl(getPlaceholder('error'));
              setError(true);
            }
          }
        } else {
          console.error('Image reference not found');
          if (isMounted) {
            setImageUrl(getPlaceholder('error'));
            setError(true);
          }
        }
      } catch (err) {
        console.error('Error loading image:', err);
        if (isMounted) {
          setImageUrl(getPlaceholder('error'));
          setError(true);
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [imageRef]);

  const handleImageError = () => {
    setImageUrl(getPlaceholder('error'));
    setError(true);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={imageUrl}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          error ? 'opacity-75' : 'opacity-100'
        }`}
        onError={handleImageError}
      />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
          <span className="text-sm text-gray-500">Failed to load image</span>
        </div>
      )}
    </div>
  );
};

CarImage.propTypes = {
  imageRef: PropTypes.string,
  alt: PropTypes.string,
  className: PropTypes.string,
};

export default CarImage;
