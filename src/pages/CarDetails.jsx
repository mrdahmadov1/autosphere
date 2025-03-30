import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { database, ref, get } from '../firebase/config';
import { carsData } from '../data/cars'; // Keeping as fallback

function CarDetails() {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [similarCars, setSimilarCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [carImage, setCarImage] = useState(null);

  useEffect(() => {
    async function fetchCarData() {
      try {
        // First try to fetch from Realtime Database
        const carRef = ref(database, `cars/${id}`);
        const snapshot = await get(carRef);

        let carData;

        if (snapshot.exists()) {
          carData = {
            id,
            ...snapshot.val(),
          };
          setCar(carData);

          // Fetch car image if there's an imagePath
          if (carData.imagePath) {
            try {
              const imageRef = ref(database, carData.imagePath);
              const imageSnapshot = await get(imageRef);

              if (imageSnapshot.exists()) {
                const imageData = imageSnapshot.val();
                if (imageData && imageData.data) {
                  setCarImage(imageData.data);
                }
              }
            } catch (imageError) {
              console.error('Error fetching car image:', imageError);
            }
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
                  }))
                  .slice(0, 3);

                setSimilarCars(similarCarsArray);
              } else {
                // Fallback to static data for similar cars
                const staticSimilarCars = carsData
                  .filter((c) => c.id !== parseInt(id) && c.brand === carData.brand)
                  .slice(0, 3);
                setSimilarCars(staticSimilarCars);
              }
            } catch (similarError) {
              console.error('Error fetching similar cars:', similarError);

              // Fallback to static data for similar cars
              const staticSimilarCars = carsData
                .filter((c) => c.id !== parseInt(id) && c.brand === carData.brand)
                .slice(0, 3);
              setSimilarCars(staticSimilarCars);
            }
          }
        } else {
          // Try to find car in static data
          const staticCar = carsData.find((c) => c.id === parseInt(id));
          if (staticCar) {
            setCar(staticCar);
            // Get similar cars from static data
            const staticSimilarCars = carsData
              .filter((c) => c.id !== parseInt(id) && c.brand === staticCar.brand)
              .slice(0, 3);
            setSimilarCars(staticSimilarCars);
          } else {
            setError('Car not found');
          }
        }
      } catch (error) {
        console.error('Error fetching car:', error);
        setError('Failed to load car details');

        // Try to find car in static data as fallback
        const staticCar = carsData.find((c) => c.id === parseInt(id));
        if (staticCar) {
          setCar(staticCar);
          // Get similar cars from static data
          const staticSimilarCars = carsData
            .filter((c) => c.id !== parseInt(id) && c.brand === staticCar.brand)
            .slice(0, 3);
          setSimilarCars(staticSimilarCars);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchCarData();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-20 text-center">
        <p className="text-xl">Loading car details...</p>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-20 text-center">
        <h1 className="text-4xl font-bold mb-6 text-neutral-dark">Car Not Found</h1>
        <p className="mb-8 text-neutral/70">
          {error || "The car you're looking for doesn't exist or has been removed."}
        </p>
        <Link to="/" className="btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-neutral-dark py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-dark to-black opacity-70"></div>
        <div className="relative max-w-7xl mx-auto px-8">
          <div className="flex flex-col items-start">
            <Link
              to="/"
              className="inline-flex items-center text-white mb-8 transition-colors hover:text-accent"
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to listings
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              {car.brand} {car.model}
            </h1>
            <div className="flex flex-wrap items-center mb-6">
              <span className="bg-primary text-white rounded-full px-4 py-1 text-sm font-medium mr-3 mb-2">
                {car.year}
              </span>
              <span className="text-white/80 mr-4 mb-2 flex items-center">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {car.mileage} miles
              </span>
              <span className="text-white/80 mr-4 mb-2 flex items-center">
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
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                {car.fuel}
              </span>
              <span className="text-white/80 mb-2 flex items-center">
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
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
                {car.transmission}
              </span>
            </div>
            <p className="text-3xl font-bold text-primary mb-8">${car.price.toLocaleString()}</p>
          </div>
        </div>
      </section>

      {/* Car Details Section */}
      <section className="py-16 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-card overflow-hidden mb-10">
                <div className="relative aspect-[16/9]">
                  <img
                    src={
                      carImage || car.image || 'https://via.placeholder.com/1200x800?text=No+Image'
                    }
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-8">
                  <h2 className="text-2xl font-bold mb-6 text-neutral-dark">Description</h2>
                  <p className="text-neutral-dark/80 mb-8 whitespace-pre-line">
                    {car.description ||
                      `Experience the power and elegance of this ${car.year} ${car.brand} ${car.model}. This vehicle combines superior performance with luxurious comfort, making every drive unforgettable.`}
                  </p>

                  {car.features && car.features.length > 0 && (
                    <>
                      <h3 className="text-xl font-bold mb-4 text-neutral-dark">Key Features</h3>
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
                    <h3 className="text-xl font-bold mb-4 text-neutral-dark">Vehicle Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-neutral/70 mb-1">Brand</p>
                        <p className="font-medium">{car.brand}</p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral/70 mb-1">Model</p>
                        <p className="font-medium">{car.model}</p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral/70 mb-1">Year</p>
                        <p className="font-medium">{car.year}</p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral/70 mb-1">Mileage</p>
                        <p className="font-medium">{car.mileage} miles</p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral/70 mb-1">Fuel Type</p>
                        <p className="font-medium">{car.fuel}</p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral/70 mb-1">Transmission</p>
                        <p className="font-medium">{car.transmission}</p>
                      </div>
                      {car.color && (
                        <div>
                          <p className="text-sm text-neutral/70 mb-1">Color</p>
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
              <div className="bg-white rounded-xl shadow-card p-8 mb-8 sticky top-8">
                <h3 className="text-xl font-bold mb-6 text-neutral-dark">Contact Seller</h3>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-dark mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-dark mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-dark mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="(123) 456-7890"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-dark mb-1">
                      Message
                    </label>
                    <textarea
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                      rows="4"
                      placeholder="I'm interested in this car and would like more information."
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary-dark text-white py-3 px-6 rounded-lg transition-colors"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Similar Cars Section */}
      {similarCars.length > 0 && (
        <section className="py-16 px-8 bg-neutral-light">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-10 text-neutral-dark">Similar Cars</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {similarCars.map((similarCar) => (
                <SimilarCarCard key={similarCar.id} car={similarCar} />
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
  const [imageUrl, setImageUrl] = useState('https://via.placeholder.com/400x300?text=Loading...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadImage = async () => {
      if (car.imagePath) {
        try {
          const imageRef = ref(database, car.imagePath);
          const snapshot = await get(imageRef);

          if (snapshot.exists()) {
            const imageData = snapshot.val();
            if (imageData && imageData.data) {
              setImageUrl(imageData.data);
            } else {
              setImageUrl('https://via.placeholder.com/400x300?text=No+Image');
            }
          } else {
            setImageUrl('https://via.placeholder.com/400x300?text=No+Image');
          }
        } catch (err) {
          console.error('Error loading image:', err);
          setImageUrl('https://via.placeholder.com/400x300?text=Error');
        } finally {
          setLoading(false);
        }
      } else if (car.image) {
        setImageUrl(car.image);
        setLoading(false);
      } else {
        setImageUrl('https://via.placeholder.com/400x300?text=No+Image');
        setLoading(false);
      }
    };

    loadImage();
  }, [car]);

  return (
    <Link to={`/cars/${car.id}`} className="card group">
      <div className="relative overflow-hidden h-48">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="w-8 h-8 border-t-2 border-primary border-solid rounded-full animate-spin"></div>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={`${car.brand} ${car.model}`}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
            onError={() => setImageUrl('https://via.placeholder.com/400x300?text=Error')}
          />
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold mb-2 text-neutral-dark">
          {car.brand} {car.model} ({car.year})
        </h3>
        <p className="text-primary font-bold mb-2">${car.price.toLocaleString()}</p>
        <div className="flex flex-wrap gap-2 text-sm text-neutral/70">
          <span>{car.mileage} miles</span>
          <span>•</span>
          <span>{car.transmission}</span>
          <span>•</span>
          <span>{car.fuel}</span>
        </div>
      </div>
    </Link>
  );
}

export default CarDetails;
