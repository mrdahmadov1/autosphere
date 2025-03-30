import { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { useNotification } from '../context/NotificationContext';
import { db, database } from '../firebase/config';
import { doc, updateDoc, arrayRemove, deleteDoc } from 'firebase/firestore';
import { ref, get, remove } from 'firebase/database';

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

      // Remove the car from the user's cars array
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        cars: arrayRemove(carToDelete),
      });

      // Delete the car document if it exists
      if (carToDelete.id) {
        const carRef = doc(db, 'cars', carToDelete.id);
        await deleteDoc(carRef);
      }

      // Refresh user data
      await fetchUserData();

      // Show success message
      success(`Successfully deleted ${carToDelete.brand} ${carToDelete.model}`);

      // Reset state
      setShowDeleteConfirm(false);
      setCarToDelete(null);
    } catch (err) {
      setErrorMessage('Failed to delete car. Please try again.');
      error('Failed to delete car. Please try again.');
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  }, [carToDelete, currentUser, fetchUserData, success, error]);

  // Function to cancel delete operation
  const cancelDelete = useCallback(() => {
    setShowDeleteConfirm(false);
    setCarToDelete(null);
  }, []);

  if (loading && !userData) {
    return (
      <div className="max-w-4xl mx-auto my-12 px-4 text-center">
        <div className="w-8 h-8 border-t-2 border-primary border-solid rounded-full animate-spin mx-auto mb-4"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-12 px-4">
      <div className="bg-white rounded-xl shadow-card p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-dark mb-4 md:mb-0">My Profile</h1>
          <button
            onClick={handleLogout}
            className="btn-outline px-6 py-2 transition-colors"
            disabled={isDeleting}
          >
            Log Out
          </button>
        </div>

        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex justify-between items-center">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage('')}
              className="text-red-700 hover:text-red-900 focus:outline-none"
            >
              ✕
            </button>
          </div>
        )}

        {userData && (
          <div>
            <div className="mb-8">
              <h2 className="text-xl font-bold text-neutral-dark mb-4">Account Information</h2>
              <div className="bg-neutral-light p-6 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-neutral/70 text-sm mb-1">Name</p>
                    <p className="font-medium">{currentUser.displayName}</p>
                  </div>
                  <div>
                    <p className="text-neutral/70 text-sm mb-1">Email</p>
                    <p className="font-medium">{currentUser.email}</p>
                  </div>
                  <div>
                    <p className="text-neutral/70 text-sm mb-1">Account Created</p>
                    <p className="font-medium">
                      {userData.createdAt
                        ? new Date(userData.createdAt.toDate()).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-neutral-dark">My Car Listings</h2>
                <button
                  onClick={() => navigate('/add-car')}
                  className="btn-primary px-4 py-2 text-sm flex items-center transition-colors"
                  disabled={isDeleting}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
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
                  Add New Car
                </button>
              </div>

              {userData.cars && userData.cars.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userData.cars.map((car) => (
                    <CarCard
                      key={car.id || `${car.brand}-${car.model}-${car.year}`}
                      car={car}
                      onEdit={handleEditCar}
                      onDelete={initiateDeleteCar}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-neutral-light p-8 rounded-lg text-center">
                  <p className="text-neutral/70 mb-4">You haven't posted any car listings yet.</p>
                  <button
                    onClick={() => navigate('/add-car')}
                    className="btn-primary px-6 py-2 transition-colors"
                    disabled={isDeleting}
                  >
                    Post Your First Car
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delete confirmation modal */}
        {showDeleteConfirm && carToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
              <p className="mb-6">
                Are you sure you want to delete {carToDelete.brand} {carToDelete.model} (
                {carToDelete.year})? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={cancelDelete}
                  className="btn-outline px-4 py-2"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteCar}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
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
