import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { database, ref, get } from '../firebase/config';
import { carsData } from '../data/cars'; // Keeping as fallback
import PropTypes from 'prop-types';
import { getPlaceholder } from '../utils/imageUtils';

function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    brand: '',
    minPrice: '',
    maxPrice: '',
    minYear: '',
    maxYear: '',
    fuel: '',
    transmission: '',
    minMileage: '',
    maxMileage: '',
    color: '',
  });
  const [sortBy, setSortBy] = useState('newest');
  const [filteredCars, setFilteredCars] = useState([]);
  const [allCars, setAllCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

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
  const uniqueColors = [...new Set(allCars.map((car) => car.color))];
  const uniqueFuels = [...new Set(allCars.map((car) => car.fuel))];
  const uniqueTransmissions = [...new Set(allCars.map((car) => car.transmission))];

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortBy(value);
  };

  const sortCars = (sortType) => {
    let sorted = [...filteredCars];
    switch (sortType) {
      case 'newest':
        sorted.sort((a, b) => b.year - a.year);
        break;
      case 'oldest':
        sorted.sort((a, b) => a.year - b.year);
        break;
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'mileage-low':
        sorted.sort((a, b) => a.mileage - b.mileage);
        break;
      case 'mileage-high':
        sorted.sort((a, b) => b.mileage - a.mileage);
        break;
      default:
        break;
    }
    setFilteredCars(sorted);
  };

  const applyFilters = () => {
    let filtered = allCars;

    // Text search
    if (searchTerm) {
      filtered = filtered.filter(
        (car) =>
          car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          car.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Brand filter
    if (filters.brand) {
      filtered = filtered.filter((car) => car.brand === filters.brand);
    }

    // Price range
    if (filters.minPrice) {
      filtered = filtered.filter((car) => car.price >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter((car) => car.price <= Number(filters.maxPrice));
    }

    // Year range
    if (filters.minYear) {
      filtered = filtered.filter((car) => car.year >= Number(filters.minYear));
    }
    if (filters.maxYear) {
      filtered = filtered.filter((car) => car.year <= Number(filters.maxYear));
    }

    // Fuel type
    if (filters.fuel) {
      filtered = filtered.filter((car) => car.fuel === filters.fuel);
    }

    // Transmission
    if (filters.transmission) {
      filtered = filtered.filter((car) => car.transmission === filters.transmission);
    }

    // Mileage range
    if (filters.minMileage) {
      filtered = filtered.filter((car) => car.mileage >= Number(filters.minMileage));
    }
    if (filters.maxMileage) {
      filtered = filtered.filter((car) => car.mileage <= Number(filters.maxMileage));
    }

    // Color
    if (filters.color) {
      filtered = filtered.filter((car) => car.color === filters.color);
    }

    // Apply current sort
    sortCars(sortBy);
    setFilteredCars(filtered);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilters({
      brand: '',
      minPrice: '',
      maxPrice: '',
      minYear: '',
      maxYear: '',
      fuel: '',
      transmission: '',
      minMileage: '',
      maxMileage: '',
      color: '',
    });
    setSortBy('newest');
    setFilteredCars(allCars);
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
          <div className="flex flex-col gap-6 justify-center max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Search by brand, model, or description..."
                value={searchTerm}
                onChange={handleSearch}
                className="py-4 px-6 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-primary shadow-md w-full"
              />
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="py-4 px-6 pr-10 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-primary shadow-md bg-white w-full md:w-64 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236B7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.5em_1.5em] bg-[right_0.5rem_center] bg-no-repeat"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="mileage-low">Mileage: Low to High</option>
                <option value="mileage-high">Mileage: High to Low</option>
              </select>
            </div>
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="text-white hover:text-primary transition-colors"
            >
              {showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
            </button>
            {showAdvancedFilters && (
              <div className="bg-white/95 backdrop-blur-sm p-8 rounded-xl shadow-xl">
                <h3 className="text-2xl font-bold text-neutral-dark mb-6">Advanced Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-dark">Brand</label>
                    <select
                      name="brand"
                      value={filters.brand}
                      onChange={handleFilterChange}
                      className="w-full py-3 px-4 pr-10 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-primary bg-white text-neutral-dark appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236B7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.5em_1.5em] bg-[right_0.5rem_center] bg-no-repeat"
                    >
                      <option value="">Select Brand</option>
                      {uniqueBrands.map((brand) => (
                        <option key={brand} value={brand}>
                          {brand}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-dark">
                      Price Range
                    </label>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <input
                          type="number"
                          name="minPrice"
                          value={filters.minPrice}
                          onChange={handleFilterChange}
                          placeholder="Min Price ($)"
                          className="w-full py-3 px-4 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-primary bg-white text-neutral-dark"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="number"
                          name="maxPrice"
                          value={filters.maxPrice}
                          onChange={handleFilterChange}
                          placeholder="Max Price ($)"
                          className="w-full py-3 px-4 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-primary bg-white text-neutral-dark"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-dark">
                      Year Range
                    </label>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <input
                          type="number"
                          name="minYear"
                          value={filters.minYear}
                          onChange={handleFilterChange}
                          placeholder="From Year"
                          className="w-full py-3 px-4 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-primary bg-white text-neutral-dark"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="number"
                          name="maxYear"
                          value={filters.maxYear}
                          onChange={handleFilterChange}
                          placeholder="To Year"
                          className="w-full py-3 px-4 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-primary bg-white text-neutral-dark"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-dark">Fuel Type</label>
                    <select
                      name="fuel"
                      value={filters.fuel}
                      onChange={handleFilterChange}
                      className="w-full py-3 px-4 pr-10 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-primary bg-white text-neutral-dark appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236B7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.5em_1.5em] bg-[right_0.5rem_center] bg-no-repeat"
                    >
                      <option value="">Select Fuel Type</option>
                      {uniqueFuels.map((fuel) => (
                        <option key={fuel} value={fuel}>
                          {fuel}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-dark">
                      Transmission
                    </label>
                    <select
                      name="transmission"
                      value={filters.transmission}
                      onChange={handleFilterChange}
                      className="w-full py-3 px-4 pr-10 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-primary bg-white text-neutral-dark appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236B7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.5em_1.5em] bg-[right_0.5rem_center] bg-no-repeat"
                    >
                      <option value="">Select Transmission</option>
                      {uniqueTransmissions.map((transmission) => (
                        <option key={transmission} value={transmission}>
                          {transmission}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-dark">
                      Mileage Range
                    </label>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <input
                          type="number"
                          name="minMileage"
                          value={filters.minMileage}
                          onChange={handleFilterChange}
                          placeholder="Min Mileage"
                          className="w-full py-3 px-4 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-primary bg-white text-neutral-dark"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="number"
                          name="maxMileage"
                          value={filters.maxMileage}
                          onChange={handleFilterChange}
                          placeholder="Max Mileage"
                          className="w-full py-3 px-4 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-primary bg-white text-neutral-dark"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-dark">Color</label>
                    <select
                      name="color"
                      value={filters.color}
                      onChange={handleFilterChange}
                      className="w-full py-3 px-4 pr-10 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-primary bg-white text-neutral-dark appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236B7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.5em_1.5em] bg-[right_0.5rem_center] bg-no-repeat"
                    >
                      <option value="">Select Color</option>
                      {uniqueColors.map((color) => (
                        <option key={color} value={color}>
                          {color}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-4">
                  <button
                    onClick={resetFilters}
                    className="px-6 py-3 text-neutral-dark hover:text-primary border-2 border-gray-200 hover:border-primary rounded-lg transition-colors font-medium"
                  >
                    Reset All Filters
                  </button>
                  <button
                    onClick={applyFilters}
                    className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            )}
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
                <Link
                  key={car.id}
                  to={`/cars/${car.id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-48">
                    {car.imagePath ? (
                      <CarImage car={car} />
                    ) : (
                      <img
                        src={car.image || getPlaceholder('car')}
                        alt={`${car.brand} ${car.model}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = getPlaceholder('error');
                        }}
                      />
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-neutral-dark mb-2">
                      {car.brand} {car.model}
                    </h3>
                    <p className="text-primary font-semibold mb-4">${car.price.toLocaleString()}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm text-neutral/70">
                      <div>
                        <span className="block font-medium">Year</span>
                        <span>{car.year}</span>
                      </div>
                      <div>
                        <span className="block font-medium">Mileage</span>
                        <span>{car.mileage.toLocaleString()} km</span>
                      </div>
                      <div>
                        <span className="block font-medium">Fuel</span>
                        <span>{car.fuel}</span>
                      </div>
                      <div>
                        <span className="block font-medium">Transmission</span>
                        <span>{car.transmission}</span>
                      </div>
                    </div>
                  </div>
                </Link>
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
      if (car.imagePath) {
        try {
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
        } catch (err) {
          console.error('Error loading image:', err);
          setImageUrl(getPlaceholder('error'));
        } finally {
          setLoading(false);
        }
      } else {
        setImageUrl(getPlaceholder('car'));
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
          onError={() => setImageUrl(getPlaceholder('error'))}
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
