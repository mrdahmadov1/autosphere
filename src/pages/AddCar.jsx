import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { useNotification } from '../context/NotificationContext';
import { db, database } from '../firebase/config';
import { collection, addDoc, updateDoc, arrayUnion, doc, getDoc } from 'firebase/firestore';
import { ref, set, get, remove } from 'firebase/database';
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
        // Fetch complete car document from Firestore
        const carRef = doc(db, 'cars', carData.id);
        const carSnap = await getDoc(carRef);

        if (carSnap.exists()) {
          const completeData = carSnap.data();

          // If we have an imagePath, fetch the image from the database
          if (completeData.imagePath) {
            try {
              const imageRef = ref(database, completeData.imagePath);
              const snapshot = await get(imageRef);

              if (snapshot.exists()) {
                const imageData = snapshot.val();
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

          // Return full car data from Firestore
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
        const carRef = doc(db, 'cars', carId);

        // Add timestamp and imagePath to car data
        carData.updatedAt = new Date();
        carData.imagePath = imagePath;

        // Update the car document
        await updateDoc(carRef, carData);

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

        // Get current user document
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          // Get current cars array
          const userData = userDoc.data();
          const currentCars = userData.cars || [];

          // Remove the old car by filtering out the one with the same ID
          const updatedCars = currentCars.filter((car) => car.id !== carId);

          // Add the updated car
          updatedCars.push(carSummary);

          // Update the user document with the new cars array
          await updateDoc(userRef, { cars: updatedCars });

          // Show success notification
          success(`Successfully updated ${formData.brand} ${formData.model}`);
        } else {
          throw new Error('User document not found');
        }
      } else {
        // For new cars, add timestamp
        carData.createdAt = new Date();

        // Create car document without image path first
        const carRef = await addDoc(collection(db, 'cars'), carData);
        carId = carRef.id;

        // Upload image if we have one
        if (image) {
          imagePath = await uploadImageToDatabase(image, carId);

          // Update the car document with the image path
          await updateDoc(carRef, { imagePath });
        }

        // Create car summary for user's profile
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

        // Add car to user's profile
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          cars: arrayUnion(carSummary),
        });

        // Show success notification
        success(`Successfully added ${formData.brand} ${formData.model}`);
      }

      navigate('/profile');
    } catch (error) {
      showError(`Failed to ${isEditMode ? 'update' : 'add'} car listing: ${error.message}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fuel type options for select
  const fuelOptions = useMemo(
    () => [
      { value: 'Gasoline', label: 'Gasoline' },
      { value: 'Diesel', label: 'Diesel' },
      { value: 'Electric', label: 'Electric' },
      { value: 'Hybrid', label: 'Hybrid' },
    ],
    []
  );

  // Transmission options for select
  const transmissionOptions = useMemo(
    () => [
      { value: 'Automatic', label: 'Automatic' },
      { value: 'Manual', label: 'Manual' },
    ],
    []
  );

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  return (
    <div className="max-w-4xl mx-auto my-12 px-4">
      <div className="bg-white rounded-xl shadow-card p-8">
        <h1 className="text-3xl font-bold text-neutral-dark mb-6">
          {isEditMode ? 'Edit Car Listing' : 'Add New Car Listing'}
        </h1>

        <FormError
          error={errors.form}
          onClose={() => setErrors((prev) => ({ ...prev, form: undefined }))}
          className="mb-6"
        />

        <form onSubmit={handleSubmit} noValidate>
          <FormGroup columns={2} className="mb-6">
            <TextField
              id="brand"
              name="brand"
              label="Brand"
              value={formData.brand}
              onChange={handleChange}
              error={errors.brand}
              touched={formTouched.brand}
              required
            />

            <TextField
              id="model"
              name="model"
              label="Model"
              value={formData.model}
              onChange={handleChange}
              error={errors.model}
              touched={formTouched.model}
              required
            />

            <TextField
              id="year"
              name="year"
              label="Year"
              value={formData.year}
              onChange={handleChange}
              error={errors.year}
              touched={formTouched.year}
              required
            />

            <TextField
              id="price"
              name="price"
              label="Price ($)"
              value={formData.price}
              onChange={handleChange}
              error={errors.price}
              touched={formTouched.price}
              required
            />

            <TextField
              id="mileage"
              name="mileage"
              label="Mileage"
              value={formData.mileage}
              onChange={handleChange}
              error={errors.mileage}
              touched={formTouched.mileage}
              required
            />

            <TextField
              id="color"
              name="color"
              label="Color"
              value={formData.color}
              onChange={handleChange}
              error={errors.color}
              touched={formTouched.color}
              required
            />

            <SelectField
              id="fuel"
              name="fuel"
              label="Fuel Type"
              value={formData.fuel}
              onChange={handleChange}
              options={fuelOptions}
              required
            />

            <SelectField
              id="transmission"
              name="transmission"
              label="Transmission"
              value={formData.transmission}
              onChange={handleChange}
              options={transmissionOptions}
              required
            />
          </FormGroup>

          <TextArea
            id="description"
            name="description"
            label="Description"
            value={formData.description}
            onChange={handleChange}
            error={errors.description}
            touched={formTouched.description}
            rows={4}
            className="mb-6"
            required
          />

          <div className="mb-6">
            <label className="block text-neutral-dark mb-2">Features</label>
            {formData.features.map((feature, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => handleFeatureChange(index, e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="E.g., Bluetooth, Navigation, etc."
                />
                {formData.features.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFeatureField(index)}
                    className="ml-2 px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addFeatureField}
              className="mt-2 text-primary hover:text-primary-dark flex items-center transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Feature
            </button>
          </div>

          <div className="mb-8">
            <FileField
              id="image"
              name="image"
              label="Car Image"
              onChange={handleImageChange}
              accept="image/jpeg,image/png,image/webp"
              error={errors.image}
              touched={formTouched.image}
              helpText="Maximum size: 2MB. Formats: JPEG, PNG, WebP."
              required={!isEditMode}
            />

            {imagePreview && (
              <div className="relative mt-4">
                <img
                  src={imagePreview}
                  alt="Car preview"
                  className="w-full max-h-64 object-contain rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview('');
                    setImage(null);
                    setFormTouched((prev) => ({ ...prev, image: true }));
                  }}
                  className="absolute top-2 right-2 bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end mt-8">
            <Button
              variant="outline"
              onClick={() => navigate('/profile')}
              className="mr-4"
              disabled={loading}
            >
              Cancel
            </Button>

            <Button type="submit" variant="primary" isLoading={loading}>
              {isEditMode ? 'Update Car' : 'Add Car'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddCar;
