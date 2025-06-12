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
                    // Convert base64 to Blob
                    const base64Response = await fetch(imageData.data);
                    const blob = await base64Response.blob();
                    // Create a File object from the Blob
                    const file = new File([blob], `image-${Date.now()}.jpg`, { type: blob.type });
                    return file;
                  }
                }
                return null;
              });

              const imageResults = await Promise.all(imagePromises);
              const validImages = imageResults.filter((data) => data !== null);

              // Set both images and previews
              setImages(validImages);
              setImagePreviews(validImages.map((file) => URL.createObjectURL(file)));
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
          fuel: completeCarData.fuel || 'Gasoline',
          transmission: completeCarData.transmission || 'Automatic',
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

    // Cleanup function to revoke object URLs
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [location.state]);

  // Validate form fields
  const validateForm = useCallback(() => {
    // Create form data object with image info
    const formDataWithImage = {
      ...formData,
      images: images.length > 0 ? images : undefined,
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
  }, [formData, images, isEditMode]);

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

  // Handle image updates for existing car
  const handleImageUpdates = async (carId) => {
    if (images.length === 0) return [];

    try {
      const imagePaths = await uploadImagesToDatabase(images, carId);
      if (originalCar.imagePaths?.length > 0) {
        await deleteImagesFromDatabase(originalCar.imagePaths);
      }
      return imagePaths;
    } catch (error) {
      console.error('Error handling images:', error);
      throw new Error('Şəkillərin yüklənməsində xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.');
    }
  };

  // Update existing car
  const updateExistingCar = async (carId, carData, imagePaths) => {
    const carRef = ref(database, `cars/${carId}`);
    const updatedData = {
      ...carData,
      updatedAt: Date.now(),
      imagePaths,
    };

    await update(carRef, updatedData);

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
      imagePaths,
      updatedAt: Date.now(),
    };

    const userRef = ref(database, `users/${currentUser.uid}`);
    const userSnapshot = await get(userRef);

    if (!userSnapshot.exists()) {
      throw new Error('İstifadəçi məlumatları tapılmadı');
    }

    const userData = userSnapshot.val();
    const userCars = userData.cars || {};
    userCars[carId] = carSummary;
    await update(userRef, { cars: userCars });
  };

  // Create new car
  const createNewCar = async (carData) => {
    const carsRef = ref(database, 'cars');
    const newCarRef = push(carsRef);
    const carId = newCarRef.key;

    if (!carId) {
      throw new Error('Failed to generate car ID');
    }

    const imagePaths = images.length > 0 ? await uploadImagesToDatabase(images, carId) : [];
    const newCarData = {
      ...carData,
      createdAt: Date.now(),
      imagePaths,
    };

    await set(newCarRef, newCarData);

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
      imagePaths,
    };

    const userRef = ref(database, `users/${currentUser.uid}`);
    const userSnapshot = await get(userRef);

    if (userSnapshot.exists()) {
      const userData = userSnapshot.val();
      const userCars = userData.cars || {};
      userCars[carId] = carSummary;
      await update(userRef, { cars: userCars });
    } else {
      await set(userRef, {
        name: currentUser.displayName || '',
        email: currentUser.email || '',
        createdAt: Date.now(),
        cars: { [carId]: carSummary },
      });
    }

    return carId;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showError('Zəhmət olmasa formada olan xətaları düzəldin.');
      return;
    }

    if (!currentUser) {
      showError('Avtomobil əlavə etmək üçün daxil olmalısınız.');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);

      const carData = {
        ...formData,
        features: formData.features.filter((feature) => feature.trim() !== ''),
        userId: currentUser.uid,
        price: parseInt(formData.price),
        mileage: parseInt(formData.mileage),
        year: parseInt(formData.year),
      };

      if (isEditMode && originalCar?.id) {
        const imagePaths = await handleImageUpdates(originalCar.id);
        await updateExistingCar(originalCar.id, carData, imagePaths);
        success(`${formData.brand} ${formData.model} uğurla yeniləndi`);
      } else {
        await createNewCar(carData);
        success(`${formData.brand} ${formData.model} uğurla əlavə edildi`);
      }

      navigate('/profile');
    } catch (err) {
      console.error('Error saving car:', err);
      showError(
        err.message ||
          'Avtomobilin yadda saxlanmasında xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.'
      );
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
                  options={makeOptions}
                  placeholder="Marka seçin"
                  required
                />
              </FormGroup>

              <FormGroup label="Model" error={formTouched.model && errors.model} required>
                <SelectField
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  options={modelOptions}
                  placeholder="Model seçin"
                  disabled={!formData.brand}
                  required
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
                  required
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
                  min="0"
                />
              </FormGroup>

              <FormGroup label="Yürüş (km)" error={formTouched.mileage && errors.mileage} required>
                <TextField
                  type="number"
                  name="mileage"
                  value={formData.mileage}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Yürüş daxil edin"
                  required
                  min="0"
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
                  options={fuelOptions}
                  required
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
                  options={transmissionOptions}
                  required
                />
              </FormGroup>

              <FormGroup label="Rəng" error={formTouched.color && errors.color} required>
                <SelectField
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  options={colorOptions}
                  placeholder="Rəng seçin"
                  required
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
                onBlur={handleBlur}
                placeholder="Avtomobil haqqında ətraflı məlumat yazın"
                rows={4}
                required
                minLength={10}
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
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      onBlur={handleBlur}
                      placeholder="Xüsusiyyət daxil edin"
                      required={index === 0}
                    />
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeFeatureField(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Sil
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFeatureField}
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
                required={!isEditMode}
              />
              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={`preview-${index}-${Date.now()}`} className="relative group">
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
                {(() => {
                  if (loading) {
                    return isEditMode ? 'Yadda Saxlanılır...' : 'Əlavə Edilir...';
                  }
                  return isEditMode ? 'Yadda Saxla' : 'Avtomobil Əlavə Et';
                })()}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddCar;
