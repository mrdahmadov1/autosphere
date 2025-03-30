import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { database, ref, get } from '../firebase/config';
import { carsData } from '../data/cars'; // Keeping as fallback
import PropTypes from 'prop-types';

function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filteredCars, setFilteredCars] = useState([]);
  const [allCars, setAllCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchCars() {
      try {
        const carsRef = ref(database, 'cars');
        const snapshot = await get(carsRef);

        if (snapshot.exists()) {
          const carsData = snapshot.val();
          const carsArray = Object.keys(carsData).map((key) => ({
            id: key,
            ...carsData[key],
          }));

          // Sort by createdAt timestamp (newest first)
          const sortedCars = carsArray.sort((a, b) => b.createdAt - a.createdAt);

          setAllCars(sortedCars);
          setFilteredCars(sortedCars);
        } else {
          // Fallback to static data if no cars in database
          setAllCars(carsData);
          setFilteredCars(carsData);
        }
      } catch (error) {
        console.error('Error fetching cars:', error);
        setError('Failed to load cars. Using default data.');
        // Fallback to static data on error
        setAllCars(carsData);
        setFilteredCars(carsData);
      } finally {
        setLoading(false);
      }
    }

    fetchCars();
  }, []);

  const uniqueBrands = [...new Set(allCars.map((car) => car.brand))];

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    filterCars(term, filterBrand);
  };

  const handleBrandFilter = (e) => {
    const brand = e.target.value;
    setFilterBrand(brand);
    filterCars(searchTerm, brand);
  };

  const filterCars = (term, brand) => {
    let filtered = allCars;

    if (term) {
      filtered = filtered.filter(
        (car) =>
          car.brand.toLowerCase().includes(term.toLowerCase()) ||
          car.model.toLowerCase().includes(term.toLowerCase())
      );
    }

    if (brand) {
      filtered = filtered.filter((car) => car.brand === brand);
    }

    setFilteredCars(filtered);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-neutral-dark to-neutral py-32 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat mix-blend-overlay"></div>
        <div className="relative max-w-7xl mx-auto px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Find Your Dream Car Today
          </h1>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Discover our extensive collection of premium vehicles. Quality, reliability, and style
            all in one place.
          </p>
          <div className="flex flex-col md:flex-row gap-6 justify-center max-w-3xl mx-auto">
            <input
              type="text"
              placeholder="Search by brand or model..."
              value={searchTerm}
              onChange={handleSearch}
              className="py-4 px-6 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-primary shadow-md w-full"
            />
            <select
              value={filterBrand}
              onChange={handleBrandFilter}
              className="py-4 px-6 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-primary shadow-md bg-white w-full md:w-64"
            >
              <option value="">All Brands</option>
              {uniqueBrands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Featured Cars Section */}
      <section className="py-20 px-8 bg-neutral-light">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-dark">Featured Vehicles</h2>
            <span className="text-lg text-primary">{filteredCars.length} cars found</span>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <p className="text-xl text-neutral">Loading cars...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-xl text-red-500">{error}</p>
            </div>
          ) : filteredCars.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-2xl font-bold text-neutral">
                No cars found matching your criteria
              </h3>
              <p className="mt-4 text-neutral/70">Try adjusting your search or filter settings</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCars.map((car) => (
                <div key={car.id} className="card group">
                  <div className="relative overflow-hidden h-60">
                    {car.imagePath ? (
                      <CarImage car={car} />
                    ) : (
                      <img
                        src={car.image || 'https://via.placeholder.com/400x300?text=No+Image'}
                        alt={`${car.brand} ${car.model}`}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute top-4 right-4 bg-accent text-neutral-dark font-bold py-1 px-3 rounded-full">
                      {car.year}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-neutral-dark">
                      {car.brand} {car.model}
                    </h3>
                    <div className="flex gap-3 mb-4">
                      <span className="text-neutral/70 text-sm flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
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
                      <span className="text-neutral/70 text-sm flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                        {car.transmission}
                      </span>
                      <span className="text-neutral/70 text-sm flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        {car.fuel}
                      </span>
                    </div>
                    <p className="text-sm text-neutral/70 mb-4 line-clamp-2">{car.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-primary">
                        ${car.price.toLocaleString()}
                      </span>
                      <Link
                        to={`/cars/${car.id}`}
                        className="btn-primary py-2 px-4 rounded-lg inline-block"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-neutral-dark mb-16">
            Why Choose AutoSphere
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center">
              <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-neutral-dark">Quality Assurance</h3>
              <p className="text-neutral/70">
                All our vehicles undergo rigorous inspection to ensure the highest quality
                standards.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-neutral-dark">Fair Prices</h3>
              <p className="text-neutral/70">
                Competitive pricing with no hidden fees. Get the best value for your money.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-primary"
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
              </div>
              <h3 className="text-xl font-bold mb-4 text-neutral-dark">Fast & Easy</h3>
              <p className="text-neutral/70">
                Simple and straightforward process to help you find and purchase your dream car
                without hassle.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Component to handle loading car images from database
function CarImage({ car }) {
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
      } else {
        setImageUrl('https://via.placeholder.com/400x300?text=No+Image');
        setLoading(false);
      }
    };

    loadImage();
  }, [car.imagePath]);

  return (
    <>
      {loading ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <img
          src={imageUrl}
          alt={`${car.brand} ${car.model}`}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          onError={() => setImageUrl('https://via.placeholder.com/400x300?text=Error')}
        />
      )}
    </>
  );
}

CarImage.propTypes = {
  car: PropTypes.shape({
    imagePath: PropTypes.string,
    brand: PropTypes.string.isRequired,
    model: PropTypes.string.isRequired,
  }).isRequired,
};

export default Home;
