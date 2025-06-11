import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { useNotification } from '../context/NotificationContext';
import { database, ref, set, get, remove, push, update } from '../firebase/config';
import { processImageForUpload } from '../utils/imageUtils';
import { validateCarForm } from '../utils/validationUtils';
import { carMakesAndModels, carMakes } from '../data/carMakesAndModels';
import {
  FormGroup,
  TextField,
  TextArea,
  SelectField,
  FileField,
  Button,
  Input,
} from '../components/ui/FormElements';

function AddCar() {
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    price: '',
    mileage: '',
    fuel: 'Benzin',
    transmission: 'Avtomatik',
    color: '',
    description: '',
    features: [''],
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalCar, setOriginalCar] = useState(null);
  const [formTouched, setFormTouched] = useState({});

  const { currentUser } = useAuth();
  const { success, error: showError } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  // Get available models based on selected brand
  const availableModels = useMemo(() => {
    return formData.brand ? carMakesAndModels[formData.brand] || [] : [];
  }, [formData.brand]);

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

          // If we have imagePaths, fetch the images from the database
          if (completeData.imagePaths && completeData.imagePaths.length > 0) {
            try {
              const imagePromises = completeData.imagePaths.map(async (imagePath) => {
                const imageRef = ref(database, imagePath);
                const imageSnapshot = await get(imageRef);
                if (imageSnapshot.exists()) {
                  const imageData = imageSnapshot.val();
                  if (imageData && imageData.data) {
                    return imageData.data;
                  }
                }
                return null;
              });

              const imageResults = await Promise.all(imagePromises);
              const validImages = imageResults.filter((data) => data !== null);
              setImagePreviews(validImages);
            } catch (err) {
              console.error('Error fetching images from database:', err);
            }
          }

          // Return full car data
          return {
            id: carData.id,
            ...completeData,
            imagePaths: completeData.imagePaths || [],
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
          fuel: completeCarData.fuel || 'Benzin',
          transmission: completeCarData.transmission || 'Avtomatik',
          color: completeCarData.color || '',
          description: completeCarData.description || '',
          features:
            completeCarData.features && completeCarData.features.length > 0
              ? completeCarData.features
              : [''],
        });
      }
    };

    init();
  }, [location.state]);

  // Validate form fields
  const validateForm = useCallback(() => {
    // Create form data object with image info
    const formDataWithImage = {
      ...formData,
      images,
      imagePreviews,
    };

    // Validate using utility function
    const validationErrors = validateCarForm(formDataWithImage, !isEditMode);
    setErrors(validationErrors);

    // Mark all fields as touched when submitting
    const allFields = {
      brand: true,
      model: true,
      year: true,
      price: true,
      mileage: true,
      color: true,
      transmission: true,
      fuel: true,
      description: true,
      image: true,
    };
    setFormTouched(allFields);

    // Check if there are any errors
    return Object.keys(validationErrors).length === 0;
  }, [formData, images, imagePreviews, isEditMode]);

  // Generate year options (last 30 years)
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 30 }, (_, i) => ({
      value: (currentYear - i).toString(),
      label: (currentYear - i).toString(),
    }));
  }, []);

  // Color options
  const colorOptions = useMemo(
    () => [
      { value: 'Black', label: 'Qara' },
      { value: 'White', label: 'Ağ' },
      { value: 'Silver', label: 'Gümüş' },
      { value: 'Gray', label: 'Boz' },
      { value: 'Red', label: 'Qırmızı' },
      { value: 'Blue', label: 'Mavi' },
      { value: 'Green', label: 'Yaşıl' },
      { value: 'Yellow', label: 'Sarı' },
      { value: 'Orange', label: 'Narıncı' },
      { value: 'Brown', label: 'Qəhvəyi' },
      { value: 'Beige', label: 'Bej' },
      { value: 'Gold', label: 'Qızılı' },
      { value: 'Purple', label: 'Bənövşəyi' },
    ],
    []
  );

  // Handle form changes
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    // Mark field as touched
    setFormTouched((prev) => ({ ...prev, [name]: true }));

    if (name === 'brand') {
      // When brand changes, reset model
      setFormData((prev) => ({ ...prev, brand: value, model: '' }));
    } else if (name === 'price' || name === 'mileage' || name === 'year') {
      // Only allow numbers
      const numValue = value.replace(/\D/g, '');
      setFormData((prev) => ({ ...prev, [name]: numValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }, []);

  // Handle image selection
  const handleImageChange = useCallback(async (e) => {
    const files = Array.from(e.target.files);
    setFormTouched((prev) => ({ ...prev, image: true }));

    if (files.length === 0) return;

    try {
      const processedImages = [];
      const newPreviews = [];

      for (const file of files) {
        // Process image using utility
        const { processedImage, error } = await processImageForUpload(file);

        if (error) {
          setErrors((prev) => ({ ...prev, image: error }));
          return;
        }

        // Store the processed image
        processedImages.push(processedImage);

        // Create a base64 preview
        const preview = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(processedImage);
        });
        newPreviews.push(preview);
      }

      // Add new images and previews
      setImages((prev) => [...prev, ...processedImages]);
      setImagePreviews((prev) => [...prev, ...newPreviews]);

      // Clear any previous errors
      setErrors((prev) => ({ ...prev, image: undefined }));
    } catch (error) {
      console.error('Error processing images:', error);
      setErrors((prev) => ({ ...prev, image: 'Error processing images' }));
    }
  }, []);

  // Remove an image
  const removeImage = useCallback((index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Upload images to Firebase Realtime Database
  const uploadImagesToDatabase = async (imageFiles, carId) => {
    if (!imageFiles.length) return [];

    try {
      const imagePaths = [];

      for (const imageFile of imageFiles) {
        // Convert image to base64
        const base64Image = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(imageFile);
        });

        // Create a unique path for the image
        const imagePath = `car-images/${currentUser.uid}/${carId || 'temp'}-${Date.now()}-${
          imagePaths.length
        }`;
        const databaseRef = ref(database, imagePath);

        // Store the image data and metadata
        await set(databaseRef, {
          data: base64Image,
          contentType: imageFile.type,
          createdAt: Date.now(),
          userId: currentUser.uid,
        });

        // Add path to array
        imagePaths.push(imagePath);
      }

      return imagePaths;
    } catch (error) {
      console.error('Error uploading images to database:', error);
      throw new Error('Failed to upload images. Please try again.');
    }
  };

  // Delete images from database
  const deleteImagesFromDatabase = async (imagePaths) => {
    if (!imagePaths.length) return;

    try {
      // Delete each image and verify deletion
      await Promise.all(
        imagePaths.map(async (imagePath) => {
          if (!imagePath) return;
          const databaseRef = ref(database, imagePath);

          // Delete the image
          await remove(databaseRef);

          // Verify deletion
          const verifyRef = ref(database, imagePath);
          const verifySnapshot = await get(verifyRef);

          if (verifySnapshot.exists()) {
            throw new Error(`Failed to delete image at path: ${imagePath}`);
          }
        })
      );
    } catch (error) {
      console.error('Error deleting images:', error);
      throw new Error('Failed to delete images. Please try again.');
    }
  };

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
    if (!isValid) {
      showError('Please fix the errors in the form before submitting.');
      return;
    }

    try {
      setLoading(true);

      // Check if user is authenticated
      if (!currentUser) {
        showError('You must be logged in to add a car.');
        navigate('/login');
        return;
      }

      // Create basic car data without images first
      const carData = {
        ...formData,
        features: formData.features.filter((feature) => feature.trim() !== ''),
        userId: currentUser.uid,
        price: parseInt(formData.price),
        mileage: parseInt(formData.mileage),
        year: parseInt(formData.year),
      };

      let carId;
      let imagePaths = [];

      if (isEditMode && originalCar && originalCar.id) {
        // If editing, use existing car ID
        carId = originalCar.id;

        // Handle image updates
        if (images.length > 0) {
          // Upload new images to database
          imagePaths = await uploadImagesToDatabase(images, carId);

          // If there were old images, delete them
          if (originalCar.imagePaths && originalCar.imagePaths.length > 0) {
            await deleteImagesFromDatabase(originalCar.imagePaths);
          }
        } else {
          // If no new images are uploaded, check if we should keep or delete existing images
          if (imagePreviews.length === 0) {
            // If all images were removed, delete the old images
            if (originalCar.imagePaths && originalCar.imagePaths.length > 0) {
              await deleteImagesFromDatabase(originalCar.imagePaths);
            }
            imagePaths = []; // Set empty array since all images were removed
          } else {
            // Keep only the images that are still in imagePreviews
            const remainingImagePaths = originalCar.imagePaths.filter(
              (_, index) => imagePreviews[index] !== undefined
            );

            // Delete the removed images
            const removedImagePaths = originalCar.imagePaths.filter(
              (_, index) => imagePreviews[index] === undefined
            );

            if (removedImagePaths.length > 0) {
              await deleteImagesFromDatabase(removedImagePaths);
            }

            imagePaths = remainingImagePaths;
          }
        }

        // Update car with imagePaths
        const carRef = ref(database, `cars/${carId}`);

        // Add timestamp and imagePaths to car data
        carData.updatedAt = Date.now();
        carData.imagePaths = imagePaths;

        // First, update the car in Realtime Database
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
          imagePaths: imagePaths,
          updatedAt: Date.now(),
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

          // Verify the update was successful
          const verifyRef = ref(database, `cars/${carId}`);
          const verifySnapshot = await get(verifyRef);

          if (!verifySnapshot.exists()) {
            throw new Error('Failed to verify car update');
          }

          const updatedCar = verifySnapshot.val();
          if (!updatedCar.imagePaths || updatedCar.imagePaths.length !== imagePaths.length) {
            throw new Error('Image paths not properly updated');
          }

          // Show success notification
          success(`Successfully updated ${formData.brand} ${formData.model}`);
        } else {
          showError('Could not find user data. Please try again.');
        }
      } else {
        try {
          // Adding a new car
          // Generate a new car ID
          const carsRef = ref(database, 'cars');
          const newCarRef = push(carsRef);
          carId = newCarRef.key;

          if (!carId) {
            throw new Error('Failed to generate car ID');
          }

          // Add timestamp
          carData.createdAt = Date.now();

          // Upload images if provided
          if (images.length > 0) {
            try {
              imagePaths = await uploadImagesToDatabase(images, carId);
              carData.imagePaths = imagePaths;
            } catch (imageError) {
              console.error('Error uploading images:', imageError);
              showError('Failed to upload images. Please try again.');
              return;
            }
          }

          // Save car data to database
          try {
            await set(newCarRef, carData);
          } catch (dbError) {
            console.error('Error saving car data:', dbError);
            showError('Failed to save car data. Please try again.');
            return;
          }

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
            imagePaths: imagePaths,
          };

          // Add the car to user's cars in Realtime Database
          try {
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
          } catch (userError) {
            console.error('Error updating user data:', userError);
            showError('Failed to update user profile. Please try again.');
            return;
          }

          // Show success message
          success(`Successfully added ${formData.brand} ${formData.model}`);
          navigate('/profile');
        } catch (error) {
          console.error('Error in car creation process:', error);
          showError('Failed to create car listing. Please try again.');
        }
      }
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

  const makeOptions = useMemo(() => carMakes.map((make) => ({ value: make, label: make })), []);

  const modelOptions = useMemo(
    () => availableModels.map((model) => ({ value: model, label: model })),
    [availableModels]
  );

  // Flag to check if form has been touched
  const hasBeenTouched = useMemo(() => Object.keys(formTouched).length > 0, [formTouched]);

  const handleBlur = (e) => {
    setFormTouched((prev) => ({
      ...prev,
      [e.target.name]: true,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-card p-8">
          <h1 className="text-3xl font-bold text-neutral-dark mb-8">
            {isEditMode ? 'Avtomobil Məlumatlarını Düzəliş Et' : 'Yeni Avtomobil Əlavə Et'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Brand and Model */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormGroup label="Marka" error={formTouched.brand && errors.brand} required>
                <SelectField
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  options={carMakes.map((make) => ({ value: make, label: make }))}
                  placeholder="Marka seçin"
                />
              </FormGroup>

              <FormGroup label="Model" error={formTouched.model && errors.model} required>
                <SelectField
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  options={availableModels.map((model) => ({ value: model, label: model }))}
                  placeholder="Model seçin"
                  disabled={!formData.brand}
                />
              </FormGroup>
            </div>

            {/* Year, Price, and Mileage */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormGroup label="İl" error={formTouched.year && errors.year} required>
                <SelectField
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  options={yearOptions}
                  placeholder="İl seçin"
                />
              </FormGroup>

              <FormGroup label="Qiymət (₼)" error={formTouched.price && errors.price} required>
                <TextField
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Qiymət"
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral/60">AZN</div>
              </FormGroup>

              <FormGroup label="Yürüş (km)" error={formTouched.mileage && errors.mileage} required>
                <TextField
                  type="text"
                  name="mileage"
                  value={formData.mileage}
                  onChange={handleChange}
                  placeholder="Yürüş daxil edin"
                />
              </FormGroup>
            </div>

            {/* Fuel Type, Transmission, and Color */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormGroup label="Yanacaq Növü" error={formTouched.fuel && errors.fuel} required>
                <SelectField
                  name="fuel"
                  value={formData.fuel}
                  onChange={handleChange}
                  options={[
                    { value: 'Benzin', label: 'Benzin' },
                    { value: 'Dizel', label: 'Dizel' },
                    { value: 'Elektrik', label: 'Elektrik' },
                    { value: 'Hibrid', label: 'Hibrid' },
                  ]}
                />
              </FormGroup>

              <FormGroup
                label="Sürət Qutusu"
                error={formTouched.transmission && errors.transmission}
                required
              >
                <SelectField
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleChange}
                  options={[
                    { value: 'Avtomatik', label: 'Avtomatik' },
                    { value: 'Mexaniki', label: 'Mexaniki' },
                  ]}
                />
              </FormGroup>

              <FormGroup label="Rəng" error={formTouched.color && errors.color} required>
                <SelectField
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  options={colorOptions}
                  placeholder="Rəng seçin"
                />
              </FormGroup>
            </div>

            {/* Description */}
            <FormGroup
              label="Təsvir"
              error={formTouched.description && errors.description}
              required
            >
              <TextArea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Avtomobil haqqında ətraflı məlumat yazın"
                rows={4}
              />
            </FormGroup>

            {/* Features */}
            <FormGroup
              label="Xüsusiyyətlər"
              error={formTouched.features && errors.features}
              required
            >
              <div className="space-y-3">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex gap-3">
                    <TextField
                      type="text"
                      value={feature}
                      onChange={(e) => {
                        const newFeatures = [...formData.features];
                        newFeatures[index] = e.target.value;
                        setFormData((prev) => ({ ...prev, features: newFeatures }));
                        setFormTouched((prev) => ({ ...prev, features: true }));
                      }}
                      placeholder="Xüsusiyyət daxil edin"
                    />
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newFeatures = formData.features.filter((_, i) => i !== index);
                          setFormData((prev) => ({ ...prev, features: newFeatures }));
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        Sil
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      features: [...prev.features, ''],
                    }));
                  }}
                  className="text-primary hover:text-primary-dark"
                >
                  + Xüsusiyyət Əlavə Et
                </button>
              </div>
            </FormGroup>

            {/* Images */}
            <FormGroup
              label="Şəkillər"
              error={formTouched.image && errors.image}
              required={!isEditMode}
            >
              <FileField
                name="images"
                onChange={handleImageChange}
                accept="image/*"
                multiple
                label="Şəkillər Seçin"
              />
              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </FormGroup>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={loading} className="w-full md:w-auto">
                {loading
                  ? isEditMode
                    ? 'Yadda Saxlanılır...'
                    : 'Əlavə Edilir...'
                  : isEditMode
                  ? 'Yadda Saxla'
                  : 'Avtomobil Əlavə Et'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddCar;
