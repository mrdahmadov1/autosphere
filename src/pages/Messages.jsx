import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { database, ref, get } from '../firebase/config';
import Messages from '../components/Messages';
import Conversations from '../components/Conversations';

function MessagesPage() {
  const { carId } = useParams();
  const { currentUser } = useAuth();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (!carId) {
      setLoading(false);
      return;
    }

    const fetchCarDetails = async () => {
      try {
        const carRef = ref(database, `cars/${carId}`);
        const carSnapshot = await get(carRef);

        if (carSnapshot.exists()) {
          const carData = carSnapshot.val();
          // Don't allow messaging if the user is the seller
          if (carData.sellerId === currentUser.uid) {
            setError('Öz avtomobilinizlə əlaqə saxlaya bilməzsiniz');
            setLoading(false);
            return;
          }
          setCar(carData);
        } else {
          setError('Avtomobil tapılmadı');
        }
      } catch (error) {
        console.error('Error fetching car details:', error);
        setError('Məlumatları yükləyərkən xəta baş verdi');
      } finally {
        setLoading(false);
      }
    };

    fetchCarDetails();
  }, [carId, currentUser, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-card p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="text-primary hover:text-primary-dark transition-colors"
          >
            Geri qayıt
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Conversations />
        </div>
        <div className="lg:col-span-2">
          {car ? (
            <Messages carId={carId} sellerId={car.sellerId} />
          ) : (
            <div className="bg-white rounded-xl shadow-card p-4 text-center">
              <p className="text-neutral/70">Avtomobil tapılmadı</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MessagesPage;
