import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { useNotification } from '../context/NotificationContext';
import { database, ref, get, remove, update } from '../firebase/config';

// Default car image placeholder
const DEFAULT_CAR_IMAGE = 'https://via.placeholder.com/400x300?text=Car+Image';

// Memoized car card component to prevent unnecessary re-renders
const CarCard = memo(({ car, onEdit, onDelete }) => {
  const [imageUrl, setImageUrl] = useState(DEFAULT_CAR_IMAGE);
  const [loading, setLoading] = useState(false);

  // Fetch image from the Realtime Database if we have a path
  useEffect(() => {
    const fetchCarImage = async () => {
      if (car.imagePath) {
        try {
          setLoading(true);
          const imageRef = ref(database, car.imagePath);
          const snapshot = await get(imageRef);

          if (snapshot.exists()) {
            const imageData = snapshot.val();
            if (imageData && imageData.data) {
              // Base64 data is stored in the 'data' field
              setImageUrl(imageData.data);
            } else {
              setImageUrl(DEFAULT_CAR_IMAGE);
            }
          } else {
            setImageUrl(DEFAULT_CAR_IMAGE);
          }
        } catch (err) {
          console.error('Error fetching car image:', err);
          setImageUrl(DEFAULT_CAR_IMAGE);
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
            onError={() => setImageUrl(DEFAULT_CAR_IMAGE)}
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
            Edit
          </button>
          <button
            className="text-red-500 hover:text-red-700 transition-colors"
            onClick={() => onDelete(car)}
          >
            Delete
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
      setErrorMessage('Failed to load profile data.');
      error('Failed to load profile data.');
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
      setErrorMessage('Failed to log out.');
      error('Failed to log out.');
      console.error(err);
    }
  };

  // Function to handle editing a car - memoized to avoid recreation on each render
  const handleEditCar = useCallback(
    async (car) => {
      try {
        // If we're editing from a user profile car summary, make sure we have the full car data
        if (car.id) {
          // Always navigate to edit form, but let AddCar handle fetching complete data
          navigate(`/add-car`, { state: { editMode: true, carData: car } });
        } else {
          // If somehow we don't have an ID, show an error
          setErrorMessage('Cannot edit this car listing - missing ID.');
          error('Cannot edit this car listing - missing ID.');
        }
      } catch (err) {
        setErrorMessage('Failed to prepare car data for editing.');
        error('Failed to prepare car data for editing.');
        console.error(err);
      }
    },
    [navigate, error]
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
      success('Car successfully deleted.');
      setShowDeleteConfirm(false);
      setCarToDelete(null);
    } catch (err) {
      setErrorMessage('Failed to delete car.');
      error('Failed to delete car: ' + err.message);
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

  // Convert cars object to array for rendering
  const carsArray = useMemo(() => {
    if (!userData || !userData.cars) return [];
    return Object.values(userData.cars);
  }, [userData]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
          {userData && (
            <div className="mb-4">
              <p className="text-lg">
                <span className="font-medium">Name:</span> {userData.name}
              </p>
              <p className="text-lg">
                <span className="font-medium">Email:</span> {userData.email}
              </p>
              {userData.phone && (
                <p className="text-lg">
                  <span className="font-medium">Phone:</span> {userData.phone}
                </p>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col space-y-2 mt-4 md:mt-0">
          <button
            onClick={() => navigate('/add-car')}
            className="bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-lg transition-colors"
          >
            Add New Car
          </button>
          <button
            onClick={handleLogout}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          <span className="block sm:inline">{errorMessage}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setErrorMessage('')}
          >
            <span className="text-xl">&times;</span>
          </button>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-6">Your Cars</h2>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
        </div>
      ) : carsArray.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {carsArray.map((car) => (
            <CarCard key={car.id} car={car} onEdit={handleEditCar} onDelete={initiateDeleteCar} />
          ))}
        </div>
      ) : (
        <div className="bg-blue-50 text-blue-800 p-6 rounded-lg">
          <p className="text-lg mb-4">You don't have any cars listed yet.</p>
          <button
            onClick={() => navigate('/add-car')}
            className="bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-lg transition-colors"
          >
            Add Your First Car
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to delete {carToDelete?.brand} {carToDelete?.model} (
              {carToDelete?.year})? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelDeleteCar}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteCar}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
