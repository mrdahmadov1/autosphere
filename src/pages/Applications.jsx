import { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { useNotification } from '../context/NotificationContext';
import { database, ref, get, update } from '../firebase/config';
import { Link } from 'react-router-dom';

function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const { success, error: showError } = useNotification();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);

        // Get all applications
        const applicationsRef = ref(database, 'applications');
        const applicationsSnapshot = await get(applicationsRef);

        if (applicationsSnapshot.exists()) {
          const applicationsData = applicationsSnapshot.val();
          const applicationsArray = Object.entries(applicationsData).map(([id, data]) => ({
            id,
            ...data,
          }));

          // Get car details for each application
          const applicationsWithCars = await Promise.all(
            applicationsArray.map(async (application) => {
              const carRef = ref(database, `cars/${application.carId}`);
              const carSnapshot = await get(carRef);
              if (carSnapshot.exists()) {
                const carData = carSnapshot.val();
                return {
                  ...application,
                  car: carData,
                };
              }
              return application;
            })
          );

          // Filter applications for the current user's cars
          const userApplications = applicationsWithCars.filter(
            (application) => application.car?.userId === currentUser?.uid
          );

          setApplications(userApplications);
        }
      } catch (err) {
        console.error('Error fetching applications:', err);
        showError('Müraciətlər yüklənə bilmədi');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchApplications();
    }
  }, [currentUser, showError]);

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      const applicationRef = ref(database, `applications/${applicationId}`);
      await update(applicationRef, { status: newStatus });

      setApplications((prev) =>
        prev.map((app) => (app.id === applicationId ? { ...app, status: newStatus } : app))
      );

      success('Müraciətin statusu yeniləndi');
    } catch (err) {
      console.error('Error updating application status:', err);
      showError('Status yenilənərkən xəta baş verdi');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-t-2 border-primary border-solid rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-neutral-dark mb-8">Müraciətlər</h1>

        {applications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-card p-8 text-center">
            <p className="text-neutral-dark/70">Hazırda müraciət yoxdur</p>
          </div>
        ) : (
          <div className="space-y-6">
            {applications.map((application) => (
              <div key={application.id} className="bg-white rounded-xl shadow-card p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-neutral-dark">
                      {application.car?.brand} {application.car?.model}
                    </h2>
                    <p className="text-neutral/70">
                      {new Date(application.createdAt).toLocaleDateString('az-AZ')}
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        application.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : application.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {application.status === 'pending'
                        ? 'Gözləyir'
                        : application.status === 'approved'
                        ? 'Təsdiqləndi'
                        : 'Rədd edildi'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-medium text-neutral-dark mb-2">Müraciətçi</h3>
                    <p className="text-neutral/70">{application.name}</p>
                    <p className="text-neutral/70">{application.email}</p>
                    <p className="text-neutral/70">{application.phone}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-dark mb-2">Mesaj</h3>
                    <p className="text-neutral/70 whitespace-pre-line">{application.message}</p>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Link to={`/cars/${application.carId}`} className="text-primary hover:underline">
                    Avtomobilə bax
                  </Link>
                  {application.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(application.id, 'approved')}
                        className="text-green-600 hover:text-green-700"
                      >
                        Təsdiqlə
                      </button>
                      <button
                        onClick={() => handleStatusChange(application.id, 'rejected')}
                        className="text-red-600 hover:text-red-700"
                      >
                        Rədd et
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Applications;
