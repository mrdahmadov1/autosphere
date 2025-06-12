import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { database, ref, get } from '../firebase/config';
import PropTypes from 'prop-types';
import { getPlaceholder } from '../utils/imageUtils';
import { useNotification } from '../context/NotificationContext';
import { ImageSlider } from '../components/ui/ImageSlider';
import { useAuth } from '../context/useAuth';
import ApplicationForm from '../components/ApplicationForm';
import {
  calculateAveragePrice,
  getPriceStatus,
  getPriceColorClass,
  getPriceStatusText,
} from '../utils/priceUtils';

function CarDetails() {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [similarCars, setSimilarCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [images, setImages] = useState([]);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const { error: showError } = useNotification();
  const { currentUser } = useAuth();
  const [priceStatus, setPriceStatus] = useState('normal');

  useEffect(() => {
    const fetchCarData = async () => {
      try {
        setLoading(true);
        const carRef = ref(database, `cars/${id}`);
        const snapshot = await get(carRef);

        if (snapshot.exists()) {
          const carData = snapshot.val();
          setCar(carData);

          // Fetch all images for the car
          if (carData.imagePaths && carData.imagePaths.length > 0) {
            const imagePromises = carData.imagePaths.map(async (imagePath) => {
              const imageRef = ref(database, imagePath);
              const imageSnapshot = await get(imageRef);
              if (imageSnapshot.exists()) {
                const imageData = imageSnapshot.val();
                return imageData.data;
              }
              return null;
            });

            const imageResults = await Promise.all(imagePromises);
            const validImages = imageResults.filter((img) => img !== null);
            setImages(validImages);
          } else {
            // If no images, use placeholder
            setImages([getPlaceholder('car')]);
          }

          // Fetch similar cars (cars with the same brand)
          if (carData.brand) {
            try {
              const carsRef = ref(database, 'cars');
              const carsSnapshot = await get(carsRef);

              if (carsSnapshot.exists()) {
                const carsData = carsSnapshot.val();
                const similarCarsArray = Object.keys(carsData)
                  .filter((key) => key !== id && carsData[key].brand === carData.brand)
                  .map((key) => ({
                    id: key,
                    ...carsData[key],
                  }));

                setSimilarCars(similarCarsArray);

                // Calculate price status
                const averagePrice = calculateAveragePrice(carData, similarCarsArray);
                if (averagePrice) {
                  const status = getPriceStatus(carData.price, averagePrice);
                  setPriceStatus(status);
                }
              }
            } catch (similarError) {
              console.error('Error fetching similar cars:', similarError);
            }
          }
        } else {
          setError('Avtomobil tapılmadı');
        }
      } catch (err) {
        console.error('Error fetching car:', err);
        setError('Avtomobil məlumatları yüklənə bilmədi');
      } finally {
        setLoading(false);
      }
    };

    fetchCarData();
  }, [id, showError]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-t-2 border-primary border-solid rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">{error || 'Avtomobil tapılmadı'}</h1>
          <Link to="/" className="text-primary hover:underline">
            Ana Səhifəyə Qayıt
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Image Slider */}
      <section className="relative bg-neutral-dark">
        <div className="max-w-7xl mx-auto">
          <ImageSlider images={images} className="w-full" />
        </div>
      </section>

      {/* Car Details Section */}
      <section className="py-16 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-card overflow-hidden mb-10">
                <div className="p-8">
                  <h2 className="text-2xl font-bold mb-6 text-neutral-dark">Təsvir</h2>
                  <p className="text-neutral-dark/80 mb-8 whitespace-pre-line">
                    {car.description ||
                      `${car.year} ${car.brand} ${car.model} avtomobilinin gücünü və zərifliyini yaşayın. Bu avtomobil üstün performansı lüks rahatlıqla birləşdirərək, hər sürüşü unudulmaz edir.`}
                  </p>

                  {car.features && car.features.length > 0 && (
                    <>
                      <h3 className="text-xl font-bold mb-4 text-neutral-dark">
                        Əsas Xüsusiyyətlər
                      </h3>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                        {car.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-neutral-dark/80">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-primary mr-2 flex-shrink-0"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-xl font-bold mb-4 text-neutral-dark">
                      Avtomobil Məlumatları
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-neutral/70 mb-1">Marka</p>
                        <p className="font-medium">{car.brand}</p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral/70 mb-1">Model</p>
                        <p className="font-medium">{car.model}</p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral/70 mb-1">İl</p>
                        <p className="font-medium">{car.year}</p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral/70 mb-1">Yürüş</p>
                        <p className="font-medium">{car.mileage} km</p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral/70 mb-1">Yanacaq Növü</p>
                        <p className="font-medium">{car.fuel}</p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral/70 mb-1">Sürət Qutusu</p>
                        <p className="font-medium">{car.transmission}</p>
                      </div>
                      {car.color && (
                        <div>
                          <p className="text-sm text-neutral/70 mb-1">Rəng</p>
                          <p className="font-medium">{car.color}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-card p-6 sticky top-6">
                <h2 className="text-2xl font-bold mb-4 text-neutral-dark">
                  {car.brand} {car.model}
                </h2>
                <div className="mb-4">
                  <p className={`text-3xl font-bold ${getPriceColorClass(priceStatus)}`}>
                    ₼{car.price.toLocaleString()}
                  </p>
                  <p className={`text-sm ${getPriceColorClass(priceStatus)}`}>
                    {getPriceStatusText(priceStatus)}
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center text-neutral/70">
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {car.mileage} km
                  </div>
                  <div className="flex items-center text-neutral/70">
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
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    {car.fuel}
                  </div>
                  <div className="flex items-center text-neutral/70">
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
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                      />
                    </svg>
                    {car.transmission}
                  </div>
                </div>

                {/* Apply to Buy Button */}
                <div className="mt-6">
                  {currentUser && currentUser.uid === car.userId ? (
                    <Link
                      to={`/edit-car/${id}`}
                      className="block w-full text-center bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      Düzəliş Et
                    </Link>
                  ) : (
                    <button
                      onClick={() => setShowApplicationForm(true)}
                      className="w-full bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      Almaq üçün Müraciət Et
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Application Form Modal */}
      {showApplicationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
          <div className="max-w-lg w-full bg-white rounded-xl shadow-lg">
            <ApplicationForm carId={id} onClose={() => setShowApplicationForm(false)} />
          </div>
        </div>
      )}

      {/* Similar Cars Section */}
      {similarCars.length > 0 && (
        <section className="py-16 px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-neutral-dark">Oxşar Avtomobillər</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarCars.map((car) => (
                <SimilarCarCard key={car.id} car={car} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

// Component for displaying similar cars with image handling
function SimilarCarCard({ car }) {
  const [image, setImage] = useState(null);
  const [priceStatus, setPriceStatus] = useState('normal');

  useEffect(() => {
    const loadImage = async () => {
      try {
        if (car.imagePaths && car.imagePaths.length > 0) {
          const imageRef = ref(database, car.imagePaths[0]);
          const imageSnapshot = await get(imageRef);
          if (imageSnapshot.exists()) {
            const imageData = imageSnapshot.val();
            setImage(imageData.data);
          }
        } else {
          setImage(getPlaceholder('car'));
        }
      } catch (err) {
        console.error('Error loading similar car image:', err);
        setImage(getPlaceholder('car'));
      }
    };

    const fetchSimilarCars = async () => {
      try {
        const carsRef = ref(database, 'cars');
        const carsSnapshot = await get(carsRef);

        if (carsSnapshot.exists()) {
          const carsData = carsSnapshot.val();
          const similarCarsArray = Object.keys(carsData)
            .filter((key) => key !== car.id && carsData[key].brand === car.brand)
            .map((key) => ({
              id: key,
              ...carsData[key],
            }));

          // Calculate price status
          const averagePrice = calculateAveragePrice(car, similarCarsArray);
          if (averagePrice) {
            const status = getPriceStatus(car.price, averagePrice);
            setPriceStatus(status);
          }
        }
      } catch (err) {
        console.error('Error fetching similar cars for comparison:', err);
      }
    };

    loadImage();
    fetchSimilarCars();
  }, [car]);

  return (
    <Link
      to={`/car/${car.id}`}
      className="bg-white rounded-xl shadow-card overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="aspect-w-16 aspect-h-9">
        <img
          src={image || getPlaceholder('car')}
          alt={`${car.brand} ${car.model}`}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-neutral-dark mb-2">
          {car.brand} {car.model}
        </h3>
        <div className="mb-2">
          <p className={`text-primary font-bold ${getPriceColorClass(priceStatus)}`}>
            ₼{car.price.toLocaleString()}
          </p>
          <p className={`text-xs ${getPriceColorClass(priceStatus)}`}>
            {getPriceStatusText(priceStatus)}
          </p>
        </div>
        <div className="flex items-center text-sm text-neutral/70">
          <span className="mr-4">{car.year}</span>
          <span>{car.mileage} km</span>
        </div>
      </div>
    </Link>
  );
}

SimilarCarCard.propTypes = {
  car: PropTypes.shape({
    id: PropTypes.string.isRequired,
    imagePaths: PropTypes.array,
    brand: PropTypes.string.isRequired,
    model: PropTypes.string.isRequired,
    year: PropTypes.number.isRequired,
    price: PropTypes.number.isRequired,
    mileage: PropTypes.number.isRequired,
    transmission: PropTypes.string.isRequired,
    fuel: PropTypes.string.isRequired,
  }).isRequired,
};

export default CarDetails;
