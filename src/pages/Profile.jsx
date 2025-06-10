import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { useNotification } from '../context/NotificationContext';
import { database, ref, get, remove, update } from '../firebase/config';
import { getPlaceholder } from '../utils/imageUtils';

// Memoized car card component to prevent unnecessary re-renders
const CarCard = memo(({ car, onEdit, onDelete }) => {
  const [imageUrl, setImageUrl] = useState(getPlaceholder('car'));
  const [loading, setLoading] = useState(false);

  // Fetch image from the Realtime Database if we have a path
  useEffect(() => {
    const fetchCarImage = async () => {
      if (car.imagePaths && car.imagePaths.length > 0) {
        try {
          setLoading(true);
          // Use the first image path as the cover photo
          const imageRef = ref(database, car.imagePaths[0]);
          const snapshot = await get(imageRef);

          if (snapshot.exists()) {
            const imageData = snapshot.val();
            if (imageData && imageData.data) {
              // Base64 data is stored in the 'data' field
              setImageUrl(imageData.data);
            } else {
              setImageUrl(getPlaceholder('car'));
            }
          } else {
            setImageUrl(getPlaceholder('car'));
          }
        } catch (err) {
          console.error('Error fetching car image:', err);
          setImageUrl(getPlaceholder('error'));
        } finally {
          setLoading(false);
        }
      } else if (car.imagePath) {
        // For backward compatibility with old format
        try {
          setLoading(true);
          const imageRef = ref(database, car.imagePath);
          const snapshot = await get(imageRef);

          if (snapshot.exists()) {
            const imageData = snapshot.val();
            if (imageData && imageData.data) {
              setImageUrl(imageData.data);
            } else {
              setImageUrl(getPlaceholder('car'));
            }
          } else {
            setImageUrl(getPlaceholder('car'));
          }
        } catch (err) {
          console.error('Error fetching car image:', err);
          setImageUrl(getPlaceholder('error'));
        } finally {
          setLoading(false);
        }
      } else if (car.image) {
        // For backward compatibility with old format
        setImageUrl(car.image);
      }
    };

    fetchCarImage();
  }, [car]);

  return (
    <div className="card group">
      <div className="relative overflow-hidden h-48">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center bg-neutral-100">
            <div className="w-8 h-8 border-t-2 border-primary border-solid rounded-full animate-spin"></div>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={`${car.brand} ${car.model}`}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImageUrl(getPlaceholder('error'))}
          />
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold mb-2 text-neutral-dark">
          {car.brand} {car.model} ({car.year})
        </h3>
        <p className="text-primary font-bold mb-2">${car.price.toLocaleString()}</p>
        <div className="flex justify-between">
          <button
            className="text-neutral-dark hover:text-primary transition-colors"
            onClick={() => onEdit(car)}
          >
            Düzəliş Et
          </button>
          <button
            className="text-red-500 hover:text-red-700 transition-colors"
            onClick={() => onDelete(car)}
          >
            Sil
          </button>
        </div>
      </div>
    </div>
  );
});

function Profile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [carToDelete, setCarToDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { currentUser, logout, getUserProfile } = useAuth();
  const { success, error } = useNotification();
  const navigate = useNavigate();

  // Memoize fetch function to prevent unnecessary re-renders
  const fetchUserData = useCallback(async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const profileData = await getUserProfile();
      setUserData(profileData);
    } catch (err) {
      setErrorMessage('Profil məlumatları yüklənə bilmədi.');
      error('Profil məlumatları yüklənə bilmədi.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentUser, getUserProfile, navigate, error]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      setErrorMessage('Çıxış edilə bilmədi.');
      error('Çıxış edilə bilmədi.');
      console.error(err);
    }
  };

  // Function to handle editing a car
  const handleEditCar = useCallback(
    (car) => {
      navigate('/add-car', {
        state: {
          editMode: true,
          carData: {
            id: car.id,
            brand: car.brand,
            model: car.model,
            year: car.year,
            price: car.price,
            mileage: car.mileage,
            color: car.color,
            transmission: car.transmission,
            fuel: car.fuel,
            description: car.description,
            features: car.features || [],
            imagePaths: car.imagePaths || [],
          },
        },
      });
    },
    [navigate]
  );

  // Function to initiate car deletion with confirmation
  const initiateDeleteCar = useCallback((car) => {
    setCarToDelete(car);
    setShowDeleteConfirm(true);
  }, []);

  // Function to handle deleting a car after confirmation
  const confirmDeleteCar = useCallback(async () => {
    if (!carToDelete) return;

    try {
      setIsDeleting(true);

      // If the car has an image path, delete it from the database
      if (carToDelete.imagePath) {
        try {
          // Delete from Firebase Realtime Database
          const imageRef = ref(database, carToDelete.imagePath);
          await remove(imageRef);
        } catch (err) {
          console.warn('Could not delete car image from database:', err);
        }
      }

      // Remove the car from the user's cars object in Realtime Database
      const userRef = ref(database, `users/${currentUser.uid}`);
      const userSnapshot = await get(userRef);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.val();
        const userCars = userData.cars || {};

        // Remove the car by its ID
        if (userCars[carToDelete.id]) {
          delete userCars[carToDelete.id];

          // Update the user data with the updated cars object
          await update(userRef, { cars: userCars });
        }
      }

      // Delete the car document if it exists
      if (carToDelete.id) {
        const carRef = ref(database, `cars/${carToDelete.id}`);
        await remove(carRef);
      }

      // Refresh user data
      await fetchUserData();

      // Show success message and reset the delete state
      success('Avtomobil uğurla silindi.');
      setShowDeleteConfirm(false);
      setCarToDelete(null);
    } catch (err) {
      setErrorMessage('Avtomobil silinə bilmədi.');
      error('Avtomobil silinə bilmədi: ' + err.message);
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  }, [carToDelete, currentUser, fetchUserData, success, error]);

  // Cancel delete action
  const cancelDeleteCar = useCallback(() => {
    setShowDeleteConfirm(false);
    setCarToDelete(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-t-2 border-primary border-solid rounded-full animate-spin"></div>
          </div>
        ) : errorMessage ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{errorMessage}</p>
            <button
              onClick={fetchUserData}
              className="text-primary hover:text-primary-dark transition-colors"
            >
              Yenidən cəhd edin
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Profile Header */}
            <div className="bg-white rounded-xl shadow-card p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-neutral-dark mb-2">Profil</h1>
                  <div className="space-y-2">
                    <p className="text-neutral/70 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-primary"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      {userData?.email}
                    </p>
                    {userData?.name && (
                      <p className="text-neutral/70 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2 text-primary"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {userData.name}
                      </p>
                    )}
                    {userData?.phone && (
                      <p className="text-neutral/70 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2 text-primary"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        {userData.phone}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => navigate('/add-car')}
                    className="btn-primary flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Yeni Avtomobil Əlavə Et
                  </button>
                  <button
                    onClick={handleLogout}
                    className="btn-outline flex items-center gap-2 px-6 py-3 border-2 border-neutral-300 hover:border-neutral-400 text-neutral-700 hover:text-neutral-900 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zm7 8a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L12 14.586V11z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Çıxış
                  </button>
                </div>
              </div>
            </div>

            {/* User's Cars */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-neutral-dark">Mənim Avtomobillərim</h2>
                <span className="text-neutral/70">
                  {userData?.cars ? Object.keys(userData.cars).length : 0} avtomobil
                </span>
              </div>
              {userData?.cars && Object.keys(userData.cars).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.values(userData.cars).map((car) => (
                    <CarCard
                      key={car.id}
                      car={car}
                      onEdit={handleEditCar}
                      onDelete={initiateDeleteCar}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-xl shadow-card">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-primary"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h3.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1v-6a1 1 0 00-.293-.707l-2-2A1 1 0 0017 4H3z" />
                    </svg>
                  </div>
                  <p className="text-neutral/70 mb-4">Hələ heç bir avtomobil əlavə etməmisiniz.</p>
                  <button
                    onClick={() => navigate('/add-car')}
                    className="btn-primary flex items-center gap-2 mx-auto"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    İlk Avtomobilinizi Əlavə Edin
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-dark mb-4 text-center">
                Avtomobili Sil
              </h3>
              <p className="text-neutral/70 mb-6 text-center">
                Bu avtomobili silmək istədiyinizə əminsiniz? Bu əməliyyat geri alına bilməz.
              </p>
              <div className="flex justify-center gap-4">
                <button onClick={cancelDeleteCar} className="btn-outline" disabled={isDeleting}>
                  Ləğv Et
                </button>
                <button onClick={confirmDeleteCar} className="btn-danger" disabled={isDeleting}>
                  {isDeleting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Silinir...
                    </div>
                  ) : (
                    'Sil'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
