import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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

        // DO NOT set imagePath as imagePreview - it's already set in fetchCompleteCarData
        // The imagePreview variable already contains the base64 data
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
  const handleAddFeature = useCallback(() => {
    setFormData((prevData) => ({
      ...prevData,
      features: [...prevData.features, ''],
    }));
  }, []);

  // Remove feature field
  const handleRemoveFeature = useCallback((index) => {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        {isEditMode ? t('addCar.editTitle') : t('addCar.title')}
      </h1>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormGroup>
            <TextField
              label={t('addCar.form.brand')}
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              error={errors.brand}
              touched={formTouched.brand}
              required
            />
          </FormGroup>

          <FormGroup>
            <TextField
              label={t('addCar.form.model')}
              name="model"
              value={formData.model}
              onChange={handleChange}
              error={errors.model}
              touched={formTouched.model}
              required
            />
          </FormGroup>

          <FormGroup>
            <TextField
              label={t('addCar.form.year')}
              name="year"
              type="number"
              value={formData.year}
              onChange={handleChange}
              error={errors.year}
              touched={formTouched.year}
              required
            />
          </FormGroup>

          <FormGroup>
            <TextField
              label={t('addCar.form.price')}
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              error={errors.price}
              touched={formTouched.price}
              required
            />
          </FormGroup>

          <FormGroup>
            <TextField
              label={t('addCar.form.mileage')}
              name="mileage"
              type="number"
              value={formData.mileage}
              onChange={handleChange}
              error={errors.mileage}
              touched={formTouched.mileage}
              required
            />
          </FormGroup>

          <FormGroup>
            <SelectField
              label={t('addCar.form.fuel')}
              name="fuel"
              value={formData.fuel}
              onChange={handleChange}
              error={errors.fuel}
              touched={formTouched.fuel}
              required
            >
              <option value="Gasoline">{t('carDetails.fuelTypes.gasoline')}</option>
              <option value="Diesel">{t('carDetails.fuelTypes.diesel')}</option>
              <option value="Electric">{t('carDetails.fuelTypes.electric')}</option>
              <option value="Hybrid">{t('carDetails.fuelTypes.hybrid')}</option>
            </SelectField>
          </FormGroup>

          <FormGroup>
            <SelectField
              label={t('addCar.form.transmission')}
              name="transmission"
              value={formData.transmission}
              onChange={handleChange}
              error={errors.transmission}
              touched={formTouched.transmission}
              required
            >
              <option value="Automatic">{t('carDetails.transmissionTypes.automatic')}</option>
              <option value="Manual">{t('carDetails.transmissionTypes.manual')}</option>
              <option value="CVT">{t('carDetails.transmissionTypes.cvt')}</option>
            </SelectField>
          </FormGroup>

          <FormGroup>
            <TextField
              label={t('addCar.form.color')}
              name="color"
              value={formData.color}
              onChange={handleChange}
              error={errors.color}
              touched={formTouched.color}
              required
            />
          </FormGroup>

          <FormGroup className="md:col-span-2">
            <TextArea
              label={t('addCar.form.description')}
              name="description"
              value={formData.description}
              onChange={handleChange}
              error={errors.description}
              touched={formTouched.description}
              required
            />
          </FormGroup>

          <FormGroup className="md:col-span-2">
            <FileField
              label={t('addCar.form.images')}
              name="image"
              onChange={handleImageChange}
              error={errors.image}
              touched={formTouched.image}
              required={!isEditMode}
              accept="image/*"
            />
            {imagePreview && (
              <div className="mt-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg"
                />
              </div>
            )}
          </FormGroup>

          <FormGroup className="md:col-span-2">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                {t('addCar.form.features')}
              </label>
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <TextField
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    placeholder={t('addCar.form.featurePlaceholder')}
                  />
                  <Button
                    type="button"
                    onClick={() => handleRemoveFeature(index)}
                    variant="danger"
                    className="px-3"
                  >
                    {t('common.delete')}
                  </Button>
                </div>
              ))}
              <Button type="button" onClick={handleAddFeature} variant="secondary" className="mt-2">
                {t('addCar.form.addFeature')}
              </Button>
            </div>
          </FormGroup>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <Button type="button" onClick={() => navigate(-1)} variant="secondary">
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {isEditMode ? t('common.save') : t('addCar.form.submit')}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default AddCar;
