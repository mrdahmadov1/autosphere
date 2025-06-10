import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { database, ref, get } from '../firebase/config';
import PropTypes from 'prop-types';
import { getPlaceholder } from '../utils/imageUtils';

function Home() {
  const [allCars, setAllCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    brand: '',
    model: '',
    year: '',
    color: '',
    minPrice: '',
    maxPrice: '',
  });

  const uniqueBrands = useMemo(() => {
    const brands = [...new Set(allCars.map((car) => car.brand))];
    return brands.sort();
  }, [allCars]);

  const uniqueModels = useMemo(() => {
    const models = [...new Set(allCars.map((car) => car.model))];
    return models.sort();
  }, [allCars]);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        const carsRef = ref(database, 'cars');
        const snapshot = await get(carsRef);
        if (snapshot.exists()) {
          const carsData = snapshot.val();
          console.log('Fetched cars data:', carsData); // Debug log
          const carsArray = Object.entries(carsData).map(([id, data]) => ({
            id,
            ...data,
          }));
          console.log('Processed cars array:', carsArray); // Debug log
          setAllCars(carsArray);
        } else {
          console.log('No cars found in database'); // Debug log
        }
      } catch (err) {
        console.error('Error fetching cars:', err);
        setError('Failed to load cars.');
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filteredCars = useMemo(() => {
    return allCars.filter((car) => {
      const matchesBrand =
        !filters.brand || car.brand.toLowerCase().includes(filters.brand.toLowerCase());
      const matchesModel =
        !filters.model || car.model.toLowerCase().includes(filters.model.toLowerCase());
      const matchesYear = !filters.year || car.year.toString() === filters.year;
      const matchesColor =
        !filters.color || car.color.toLowerCase() === filters.color.toLowerCase();
      const matchesMinPrice = !filters.minPrice || car.price >= Number(filters.minPrice);
      const matchesMaxPrice = !filters.maxPrice || car.price <= Number(filters.maxPrice);

      return (
        matchesBrand &&
        matchesModel &&
        matchesYear &&
        matchesColor &&
        matchesMinPrice &&
        matchesMaxPrice
      );
    });
  }, [allCars, filters]);

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
          <div className="mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold mb-6 text-white">Find Your Perfect Car</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="relative">
                  <label className="block text-sm font-medium text-white/90 mb-2">Brand</label>
                  <select
                    name="brand"
                    value={filters.brand}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-200"
                  >
                    <option value="" className="bg-neutral-dark">
                      All Brands
                    </option>
                    {uniqueBrands.map((brand) => (
                      <option key={brand} value={brand} className="bg-neutral-dark">
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-white/90 mb-2">Model</label>
                  <select
                    name="model"
                    value={filters.model}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-200"
                  >
                    <option value="" className="bg-neutral-dark">
                      All Models
                    </option>
                    {uniqueModels.map((model) => (
                      <option key={model} value={model} className="bg-neutral-dark">
                        {model}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-white/90 mb-2">Year</label>
                  <input
                    type="number"
                    name="year"
                    value={filters.year}
                    onChange={handleFilterChange}
                    placeholder="Enter year (e.g., 2020)"
                    min="1900"
                    max={new Date().getFullYear()}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-200"
                  />
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-white/90 mb-2">Color</label>
                  <select
                    name="color"
                    value={filters.color}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-200"
                  >
                    <option value="" className="bg-neutral-dark">
                      All Colors
                    </option>
                    <option value="black" className="bg-neutral-dark">
                      Black
                    </option>
                    <option value="white" className="bg-neutral-dark">
                      White
                    </option>
                    <option value="silver" className="bg-neutral-dark">
                      Silver
                    </option>
                    <option value="gray" className="bg-neutral-dark">
                      Gray
                    </option>
                    <option value="red" className="bg-neutral-dark">
                      Red
                    </option>
                    <option value="blue" className="bg-neutral-dark">
                      Blue
                    </option>
                    <option value="green" className="bg-neutral-dark">
                      Green
                    </option>
                    <option value="yellow" className="bg-neutral-dark">
                      Yellow
                    </option>
                    <option value="orange" className="bg-neutral-dark">
                      Orange
                    </option>
                    <option value="brown" className="bg-neutral-dark">
                      Brown
                    </option>
                  </select>
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Min Price ($)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="minPrice"
                      value={filters.minPrice}
                      onChange={handleFilterChange}
                      placeholder="Min price"
                      min="0"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-200"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50">
                      USD
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Max Price ($)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="maxPrice"
                      value={filters.maxPrice}
                      onChange={handleFilterChange}
                      placeholder="Max price"
                      min="0"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-200"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50">
                      USD
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() =>
                    setFilters({
                      brand: '',
                      model: '',
                      year: '',
                      color: '',
                      minPrice: '',
                      maxPrice: '',
                    })
                  }
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-200 flex items-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Clear Filters
                </button>
              </div>
            </div>
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
                    <CarImage car={car} />
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
  const [imageUrl, setImageUrl] = useState(getPlaceholder('loading'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadImage = async () => {
      try {
        setLoading(true);
        // First check for imagePaths array
        if (car.imagePaths && car.imagePaths.length > 0) {
          const imageRef = ref(database, car.imagePaths[0]);
          const snapshot = await get(imageRef);

          if (snapshot.exists()) {
            const imageData = snapshot.val();
            if (imageData && imageData.data) {
              setImageUrl(imageData.data);
            } else {
              setImageUrl(getPlaceholder('default'));
            }
          } else {
            setImageUrl(getPlaceholder('default'));
          }
        }
        // Fallback to imagePath for backward compatibility
        else if (car.imagePath) {
          const imageRef = ref(database, car.imagePath);
          const snapshot = await get(imageRef);

          if (snapshot.exists()) {
            const imageData = snapshot.val();
            if (imageData && imageData.data) {
              setImageUrl(imageData.data);
            } else {
              setImageUrl(getPlaceholder('default'));
            }
          } else {
            setImageUrl(getPlaceholder('default'));
          }
        }
        // Last resort: use car.image if available
        else if (car.image) {
          setImageUrl(car.image);
        } else {
          setImageUrl(getPlaceholder('car'));
        }
      } catch (err) {
        console.error('Error loading image:', err);
        setImageUrl(getPlaceholder('error'));
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [car]);

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
          onError={() => setImageUrl(getPlaceholder('error'))}
        />
      )}
    </>
  );
}

CarImage.propTypes = {
  car: PropTypes.shape({
    imagePaths: PropTypes.arrayOf(PropTypes.string),
    imagePath: PropTypes.string,
    image: PropTypes.string,
    brand: PropTypes.string.isRequired,
    model: PropTypes.string.isRequired,
  }).isRequired,
};

export default Home;
