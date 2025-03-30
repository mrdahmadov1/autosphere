import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { useNotification } from '../context/NotificationContext';
import { database, ref, set, get, remove, push, update } from '../firebase/config';
import { processImageForUpload } from '../utils/imageUtils';
import { validateCarForm, hasErrors } from '../utils/validationUtils';
import {
  FormGroup,
  TextField,
  TextArea,
  SelectField,
  FileField,
  Button,
  FormError,
} from '../components/ui/FormElements';

function AddCar() {
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    price: '',
    mileage: '',
    fuel: 'Gasoline',
    transmission: 'Automatic',
    color: '',
    description: '',
    features: [''],
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalCar, setOriginalCar] = useState(null);
  const [formTouched, setFormTouched] = useState({});

  const { currentUser } = useAuth();
  const { success, error: showError } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're in edit mode
  useEffect(() => {
    const fetchCompleteCarData = async (carData) => {
      if (!carData.id) return carData;

      try {
        // Fetch complete car document from Realtime Database
        const carRef = ref(database, `cars/${carData.id}`);
        const snapshot = await get(carRef);

        if (snapshot.exists()) {
          const completeData = snapshot.val();

          // If we have an imagePath, fetch the image from the database
          if (completeData.imagePath) {
            try {
              const imageRef = ref(database, completeData.imagePath);
              const imageSnapshot = await get(imageRef);

              if (imageSnapshot.exists()) {
                const imageData = imageSnapshot.val();
                if (imageData && imageData.data) {
                  // Use the base64 data directly for the preview
                  setImagePreview(imageData.data);
                }
              }
            } catch (err) {
              console.error('Error fetching image from database:', err);
            }
          } else if (completeData.image) {
            // For backward compatibility
            setImagePreview(completeData.image);
          }

          // Return full car data
          return {
            id: carData.id,
            ...completeData,
            // Make sure we have the correct image property
            imagePath: completeData.imagePath || null,
          };
        }

        return carData;
      } catch (err) {
        console.error('Error fetching complete car data:', err);
        return carData;
      }
    };

    const init = async () => {
      if (location.state && location.state.editMode && location.state.carData) {
        const carData = location.state.carData;

        // Set edit mode
        setIsEditMode(true);
        setOriginalCar(carData);

        // Get complete car data with all fields
        const completeCarData = await fetchCompleteCarData(carData);
        setOriginalCar(completeCarData);

        // Populate form with car data
        setFormData({
          brand: completeCarData.brand || '',
          model: completeCarData.model || '',
          year: completeCarData.year || new Date().getFullYear(),
          price: completeCarData.price ? completeCarData.price.toString() : '',
          mileage: completeCarData.mileage ? completeCarData.mileage.toString() : '',
          fuel: completeCarData.fuel || 'Gasoline',
          transmission: completeCarData.transmission || 'Automatic',
          color: completeCarData.color || '',
          description: completeCarData.description || '',
          features:
            completeCarData.features && completeCarData.features.length > 0
              ? completeCarData.features
              : [''],
        });

        // Set image preview if available
        if (completeCarData.imagePath) {
          setImagePreview(completeCarData.imagePath);
        }
      }
    };

    init();
  }, [location.state]);

  // Validate form fields
  const validateForm = useCallback(() => {
    // Create form data object with image info
    const formDataWithImage = {
      ...formData,
      image,
      imagePreview,
    };

    // Validate using utility function
    const validationErrors = validateCarForm(formDataWithImage, !isEditMode);
    setErrors(validationErrors);

    return !hasErrors(validationErrors);
  }, [formData, image, imagePreview, isEditMode]);

  // Handle form changes
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    // Mark field as touched
    setFormTouched((prev) => ({ ...prev, [name]: true }));

    if (name === 'price' || name === 'mileage' || name === 'year') {
      // Only allow numbers
      const numValue = value.replace(/\D/g, '');
      setFormData((prev) => ({ ...prev, [name]: numValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }, []);

  // Upload image to Firebase Realtime Database
  const uploadImageToDatabase = async (imageFile, carId) => {
    if (!imageFile) return null;

    try {
      // Convert image to base64
      const base64Image = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(imageFile);
      });

      // Create a unique path for the image
      const imagePath = `car-images/${currentUser.uid}/${carId || 'temp'}-${Date.now()}`;
      const databaseRef = ref(database, imagePath);

      // Store the image data and metadata
      await set(databaseRef, {
        data: base64Image,
        contentType: imageFile.type,
        createdAt: Date.now(),
        userId: currentUser.uid,
      });

      // Return the path reference (not the actual data)
      return imagePath;
    } catch (error) {
      console.error('Error uploading image to database:', error);
      throw new Error('Failed to upload image. Please try again.');
    }
  };

  // Delete an image from database
  const deleteImageFromDatabase = async (imagePath) => {
    if (!imagePath) return;

    try {
      const databaseRef = ref(database, imagePath);
      await remove(databaseRef);
    } catch (error) {
      console.warn('Could not delete old image:', error);
    }
  };

  // Handle image selection
  const handleImageChange = useCallback(async (e) => {
    const file = e.target.files[0];
    setFormTouched((prev) => ({ ...prev, image: true }));

    if (!file) return;

    try {
      // Process image using utility
      const { processedImage, error } = await processImageForUpload(file);

      if (error) {
        setErrors((prev) => ({ ...prev, image: error }));
        return;
      }

      // Store the processed image for upload
      setImage(processedImage);

      // Create a base64 preview directly
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Image = e.target.result;
        setImagePreview(base64Image);
      };
      reader.readAsDataURL(processedImage);

      // Clear any previous errors
      setErrors((prev) => ({ ...prev, image: undefined }));
    } catch (error) {
      console.error('Error processing image:', error);
      setErrors((prev) => ({ ...prev, image: 'Error processing image' }));
    }
  }, []);

  // Handle feature field changes
  const handleFeatureChange = useCallback((index, value) => {
    setFormData((prevData) => {
      const updatedFeatures = [...prevData.features];
      updatedFeatures[index] = value;
      return { ...prevData, features: updatedFeatures };
    });
  }, []);

  // Add new feature field
  const addFeatureField = useCallback(() => {
    setFormData((prevData) => ({
      ...prevData,
      features: [...prevData.features, ''],
    }));
  }, []);

  // Remove feature field
  const removeFeatureField = useCallback((index) => {
    setFormData((prevData) => {
      const updatedFeatures = prevData.features.filter((_, i) => i !== index);
      return { ...prevData, features: updatedFeatures };
    });
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate entire form
    const isValid = validateForm();
    if (!isValid) return;

    try {
      setLoading(true);

      // Create basic car data without image first
      const carData = {
        ...formData,
        features: formData.features.filter((feature) => feature.trim() !== ''),
        userId: currentUser.uid,
        price: parseInt(formData.price),
        mileage: parseInt(formData.mileage),
        year: parseInt(formData.year),
      };

      let carId;
      let imagePath = null;

      if (isEditMode && originalCar && originalCar.id) {
        // If editing, use existing car ID
        carId = originalCar.id;

        // Handle image update
        if (image) {
          // Upload new image to database
          imagePath = await uploadImageToDatabase(image, carId);

          // If there was an old image, delete it
          if (originalCar.imagePath) {
            await deleteImageFromDatabase(originalCar.imagePath);
          }
        } else if (imagePreview && originalCar.imagePath) {
          // Keep existing image path if no new image
          imagePath = originalCar.imagePath;
        }

        // Update car with imagePath
        const carRef = ref(database, `cars/${carId}`);

        // Add timestamp and imagePath to car data
        carData.updatedAt = Date.now();
        carData.imagePath = imagePath;

        // Update the car in Realtime Database
        await update(carRef, carData);

        // Create updated car summary for user's array
        const carSummary = {
          id: carId,
          brand: formData.brand,
          model: formData.model,
          year: parseInt(formData.year),
          price: parseInt(formData.price),
          mileage: parseInt(formData.mileage),
          color: formData.color,
          transmission: formData.transmission,
          fuel: formData.fuel,
          imagePath: imagePath,
        };

        // Get current user data
        const userRef = ref(database, `users/${currentUser.uid}`);
        const userSnapshot = await get(userRef);

        if (userSnapshot.exists()) {
          // Get current cars object
          const userData = userSnapshot.val();
          const userCars = userData.cars || {};

          // Update the car in the user's cars object
          userCars[carId] = carSummary;

          // Update the user document with the updated cars
          await update(userRef, { cars: userCars });

          // Show success notification
          success(`Successfully updated ${formData.brand} ${formData.model}`);
        } else {
          showError('Could not find user data. Please try again.');
        }
      } else {
        // Adding a new car
        // Generate a new car ID
        const carsRef = ref(database, 'cars');
        const newCarRef = push(carsRef);
        carId = newCarRef.key;

        // Add timestamp
        carData.createdAt = Date.now();

        // Upload image if provided
        if (image) {
          imagePath = await uploadImageToDatabase(image, carId);
          carData.imagePath = imagePath;
        }

        // Save car data to database
        await set(newCarRef, carData);

        // Create car summary for user's cars
        const carSummary = {
          id: carId,
          brand: formData.brand,
          model: formData.model,
          year: parseInt(formData.year),
          price: parseInt(formData.price),
          mileage: parseInt(formData.mileage),
          color: formData.color,
          transmission: formData.transmission,
          fuel: formData.fuel,
          imagePath: imagePath,
        };

        // Add the car to user's cars in Realtime Database
        const userRef = ref(database, `users/${currentUser.uid}`);
        const userSnapshot = await get(userRef);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.val();
          const userCars = userData.cars || {};

          // Add new car to user's cars
          userCars[carId] = carSummary;

          // Update user data
          await update(userRef, { cars: userCars });
        } else {
          // If user document doesn't exist, create it
          await set(userRef, {
            name: currentUser.displayName || '',
            email: currentUser.email || '',
            createdAt: Date.now(),
            cars: { [carId]: carSummary },
          });
        }

        // Show success message
        success(`Successfully added ${formData.brand} ${formData.model}`);
      }

      // Redirect back to profile page
      navigate('/profile');
    } catch (err) {
      console.error('Error saving car:', err);
      showError(err.message || 'Error saving car. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Form elements configuration
  const transmissionOptions = useMemo(
    () => [
      { value: 'Automatic', label: 'Automatic' },
      { value: 'Manual', label: 'Manual' },
      { value: 'Semi-Automatic', label: 'Semi-Automatic' },
      { value: 'CVT', label: 'CVT' },
    ],
    []
  );

  const fuelOptions = useMemo(
    () => [
      { value: 'Gasoline', label: 'Gasoline' },
      { value: 'Diesel', label: 'Diesel' },
      { value: 'Electric', label: 'Electric' },
      { value: 'Hybrid', label: 'Hybrid' },
      { value: 'Plugin Hybrid', label: 'Plugin Hybrid' },
      { value: 'CNG', label: 'CNG' },
      { value: 'LPG', label: 'LPG' },
    ],
    []
  );

  // Flag to check if form has been touched
  const hasBeenTouched = useMemo(() => Object.keys(formTouched).length > 0, [formTouched]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">{isEditMode ? 'Edit Car' : 'Add New Car'}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormGroup label="Brand" error={formTouched.brand && errors.brand}>
            <TextField
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="e.g. Toyota"
              required
            />
          </FormGroup>

          <FormGroup label="Model" error={formTouched.model && errors.model}>
            <TextField
              name="model"
              value={formData.model}
              onChange={handleChange}
              placeholder="e.g. Camry"
              required
            />
          </FormGroup>

          <FormGroup label="Year" error={formTouched.year && errors.year}>
            <TextField
              name="year"
              type="text"
              value={formData.year}
              onChange={handleChange}
              placeholder="e.g. 2022"
              required
            />
          </FormGroup>

          <FormGroup label="Price" error={formTouched.price && errors.price}>
            <TextField
              name="price"
              type="text"
              value={formData.price}
              onChange={handleChange}
              placeholder="e.g. 25000"
              required
              leftAddon="$"
            />
          </FormGroup>

          <FormGroup label="Mileage" error={formTouched.mileage && errors.mileage}>
            <TextField
              name="mileage"
              type="text"
              value={formData.mileage}
              onChange={handleChange}
              placeholder="e.g. 15000"
              required
              rightAddon="miles"
            />
          </FormGroup>

          <FormGroup label="Color" error={formTouched.color && errors.color}>
            <TextField
              name="color"
              value={formData.color}
              onChange={handleChange}
              placeholder="e.g. Silver"
              required
            />
          </FormGroup>

          <FormGroup label="Transmission" error={formTouched.transmission && errors.transmission}>
            <SelectField
              name="transmission"
              value={formData.transmission}
              onChange={handleChange}
              options={transmissionOptions}
              required
            />
          </FormGroup>

          <FormGroup label="Fuel Type" error={formTouched.fuel && errors.fuel}>
            <SelectField
              name="fuel"
              value={formData.fuel}
              onChange={handleChange}
              options={fuelOptions}
              required
            />
          </FormGroup>
        </div>

        <FormGroup label="Car Image" error={formTouched.image && errors.image}>
          <FileField
            name="image"
            onChange={handleImageChange}
            accept="image/jpeg, image/png, image/webp"
          />
          {imagePreview && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 mb-2">Preview:</p>
              <img
                src={imagePreview}
                alt="Car preview"
                className="w-full max-w-md h-auto rounded-lg border border-gray-300"
              />
            </div>
          )}
        </FormGroup>

        <FormGroup label="Description" error={formTouched.description && errors.description}>
          <TextArea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Tell us about your car"
            rows={4}
            required
          />
        </FormGroup>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
          {formData.features.map((feature, index) => (
            <div key={index} className="flex items-center mb-2">
              <TextField
                value={feature}
                onChange={(e) => handleFeatureChange(index, e.target.value)}
                placeholder={`Feature ${index + 1}`}
                className="flex-grow"
              />
              <button
                type="button"
                onClick={() => removeFeatureField(index)}
                className="ml-2 p-2 text-red-500 hover:text-red-700"
                disabled={formData.features.length === 1}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addFeatureField}
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add Feature
          </button>
        </div>

        {hasBeenTouched && hasErrors(errors) && (
          <FormError message="Please fix the errors in the form before submitting." />
        )}

        <div className="flex justify-between">
          <Button
            type="button"
            onClick={() => navigate('/profile')}
            variant="outline"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : isEditMode ? 'Update Car' : 'Add Car'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default AddCar;
