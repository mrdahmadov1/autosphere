import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

function Profile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser, logout, getUserProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUserData() {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      try {
        const profileData = await getUserProfile();
        setUserData(profileData);
      } catch (error) {
        setError('Failed to load profile data.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [currentUser, getUserProfile, navigate]);

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      setError('Failed to log out.');
      console.error(error);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto my-12 px-4 text-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-12 px-4">
      <div className="bg-white rounded-xl shadow-card p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-dark mb-4 md:mb-0">My Profile</h1>
          <button onClick={handleLogout} className="btn-outline px-6 py-2">
            Log Out
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
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
                  className="btn-primary px-4 py-2 text-sm flex items-center"
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
                    <div key={car.id} className="card group">
                      <div className="relative overflow-hidden h-48">
                        <img
                          src={car.image}
                          alt={`${car.brand} ${car.model}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-bold mb-2 text-neutral-dark">
                          {car.brand} {car.model} ({car.year})
                        </h3>
                        <p className="text-primary font-bold mb-2">${car.price.toLocaleString()}</p>
                        <div className="flex justify-between">
                          <button className="text-neutral-dark hover:text-primary">Edit</button>
                          <button className="text-red-500 hover:text-red-700">Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-neutral-light p-8 rounded-lg text-center">
                  <p className="text-neutral/70 mb-4">You haven't posted any car listings yet.</p>
                  <button onClick={() => navigate('/add-car')} className="btn-primary px-6 py-2">
                    Post Your First Car
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
