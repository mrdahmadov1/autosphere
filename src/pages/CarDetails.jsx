import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase/config';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { carsData } from '../data/cars'; // Keeping as fallback

function CarDetails() {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [similarCars, setSimilarCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchCarData() {
      try {
        // First try to fetch from Firestore
        const carDocRef = doc(db, 'cars', id);
        const carDoc = await getDoc(carDocRef);

        let carData;

        if (carDoc.exists()) {
          carData = {
            id: carDoc.id,
            ...carDoc.data(),
            createdAt: carDoc.data().createdAt ? carDoc.data().createdAt.toDate() : new Date(),
          };
          setCar(carData);

          // Fetch similar cars
          if (carData) {
            const similarCarsQuery = query(
              collection(db, 'cars'),
              where('brand', '==', carData.brand),
              where('id', '!=', id),
              limit(3)
            );

            const similarCarsSnapshot = await getDocs(similarCarsQuery);

            if (!similarCarsSnapshot.empty) {
              const similarCarsData = similarCarsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));
              setSimilarCars(similarCarsData);
            } else {
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
            <p className="text-3xl md:text-4xl font-bold text-accent">
              ${car.price.toLocaleString()}
            </p>
          </div>
        </div>
      </section>

      {/* Car Details */}
      <section className="py-16 px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Left Column - Image */}
            <div className="lg:col-span-3">
              <div className="bg-neutral-light p-1 rounded-xl shadow-card mb-8">
                <img
                  src={car.image}
                  alt={`${car.brand} ${car.model}`}
                  className="w-full rounded-lg object-cover h-[400px] md:h-[500px]"
                />
              </div>

              <div className="bg-white rounded-xl shadow-card p-8 mb-8">
                <h2 className="text-2xl font-bold mb-4 text-neutral-dark">Description</h2>
                <p className="text-neutral/80 mb-6">{car.description}</p>
                <h3 className="text-xl font-bold mb-4 text-neutral-dark">Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {car.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-primary mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Details and Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-card p-8 mb-8 sticky top-8">
                <h2 className="text-2xl font-bold mb-6 text-neutral-dark">Vehicle Details</h2>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-neutral-dark font-medium">Brand</span>
                    <span className="font-bold text-neutral">{car.brand}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-neutral-dark font-medium">Model</span>
                    <span className="font-bold text-neutral">{car.model}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-neutral-dark font-medium">Year</span>
                    <span className="font-bold text-neutral">{car.year}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-neutral-dark font-medium">Color</span>
                    <span className="font-bold text-neutral">{car.color}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-neutral-dark font-medium">Mileage</span>
                    <span className="font-bold text-neutral">{car.mileage} miles</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-neutral-dark font-medium">Fuel Type</span>
                    <span className="font-bold text-neutral">{car.fuel}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-neutral-dark font-medium">Transmission</span>
                    <span className="font-bold text-neutral">{car.transmission}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <button className="btn-primary w-full flex items-center justify-center">
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
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    Call Dealer
                  </button>
                  <Link
                    to="/contact"
                    className="btn-outline w-full flex items-center justify-center"
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
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    Message Dealer
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Similar Cars */}
      <section className="py-16 px-8 bg-neutral-light">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-10 text-neutral-dark">Similar Vehicles</h2>
          {similarCars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {similarCars.map((similarCar) => (
                <div key={similarCar.id} className="card group">
                  <div className="relative overflow-hidden h-48">
                    <img
                      src={similarCar.image}
                      alt={`${similarCar.brand} ${similarCar.model}`}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-neutral-dark">
                      {similarCar.brand} {similarCar.model}
                    </h3>
                    <div className="flex justify-between items-end">
                      <span className="text-xl font-bold text-primary">
                        ${similarCar.price.toLocaleString()}
                      </span>
                      <Link
                        to={`/cars/${similarCar.id}`}
                        className="text-sm text-accent hover:underline"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-neutral/70">No similar vehicles found.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default CarDetails;
