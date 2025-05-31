import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { database, ref, get } from '../firebase/config';
import PropTypes from 'prop-types';
import { calculatePriceMetrics, formatPrice } from '../utils/priceUtils';
import { useTranslation } from 'react-i18next';
import { FaSearch, FaCar, FaShieldAlt, FaMoneyBillWave, FaBolt } from 'react-icons/fa';
import CarImage from '../components/CarImage';

const categories = [
  { id: 'new', icon: FaCar },
  { id: 'used', icon: FaCar },
  { id: 'luxury', icon: FaCar },
  { id: 'sports', icon: FaCar },
  { id: 'suv', icon: FaCar },
  { id: 'electric', icon: FaCar },
];

// CarCard component to display individual car information
const CarCard = ({ car, similarCars }) => {
  const { t, i18n } = useTranslation();
  const priceMetrics = calculatePriceMetrics(car, similarCars);

  return (
    <Link to={`/cars/${car.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-lg transition-shadow">
        <div className="relative h-48">
          <CarImage imageRef={car.imagePath} alt={`${car.brand} ${car.model}`} />
          <div className="absolute top-2 right-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${priceMetrics.color}`}
            >
              {priceMetrics.label[i18n.language]}
            </span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {car.brand} {car.model}
          </h3>
          <div className="flex justify-between items-center mb-2">
            <span className="text-blue-600 font-bold">{formatPrice(car.price)}</span>
            <span className="text-gray-600">{car.year}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500 mb-3">
            <span>
              {car.mileage?.toLocaleString()} {t('carDetails.mileage')}
            </span>
            <span>{t(`carDetails.transmissionTypes.${car.transmission?.toLowerCase()}`)}</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>
                {t('carDetails.medianPrice')}: {formatPrice(priceMetrics.medianPrice)}
              </span>
              <span>
                {Math.round(priceMetrics.percentile)}% {t('carDetails.percentile')}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${priceMetrics.color}`}
                style={{ width: `${Math.min(100, Math.max(0, priceMetrics.percentile))}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

CarCard.propTypes = {
  car: PropTypes.shape({
    id: PropTypes.string.isRequired,
    brand: PropTypes.string.isRequired,
    model: PropTypes.string.isRequired,
    price: PropTypes.number,
    year: PropTypes.number,
    mileage: PropTypes.number,
    transmission: PropTypes.string,
    imagePath: PropTypes.string,
  }).isRequired,
  similarCars: PropTypes.arrayOf(
    PropTypes.shape({
      price: PropTypes.number.isRequired,
    })
  ),
};

const Home = () => {
  const { t } = useTranslation();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Fetch cars data from Firebase
    const fetchCars = async () => {
      try {
        setLoading(true);
        const carsRef = ref(database, 'cars');
        const snapshot = await get(carsRef);

        if (snapshot.exists()) {
          const carsData = snapshot.val();
          // Convert object to array and add id
          const carsArray = Object.entries(carsData).map(([id, data]) => ({
            id,
            ...data,
          }));
          setCars(carsArray);
        } else {
          setCars([]);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching cars:', err);
        setError(t('home.featured.error'));
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [t]);

  const filteredCars = cars.filter(
    (car) =>
      car.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.model?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group cars by brand and model for price comparison
  const getSimilarCars = (car) => {
    return cars.filter((c) => c.brand === car.brand && c.model === car.model && c.id !== car.id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('home.hero.title')}</h1>
            <p className="text-xl mb-8">{t('home.hero.subtitle')}</p>
            <div className="relative max-w-2xl mx-auto">
              <input
                type="text"
                placeholder={t('home.hero.searchPlaceholder')}
                className="w-full px-6 py-4 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors">
                <FaSearch className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{t('home.categories.title')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <FaCar className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800">
                  {t(`home.categories.${category.id}`)}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cars Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold">{t('home.featured.title')}</h2>
            <Link to="/cars" className="text-blue-600 hover:text-blue-800 font-semibold">
              {t('home.featured.viewAll')}
            </Link>
          </div>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : filteredCars.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-2">{t('home.featured.noCarsFound')}</p>
              <p className="text-gray-500">{t('home.featured.tryAdjusting')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCars.map((car) => (
                <CarCard key={car.id} car={car} similarCars={getSimilarCars(car)} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{t('home.whyChoose.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <FaShieldAlt className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{t('home.whyChoose.qualityAssurance')}</h3>
              <p className="text-gray-600">{t('home.whyChoose.qualityAssuranceDescription')}</p>
            </div>
            <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <FaMoneyBillWave className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{t('home.whyChoose.fairPrices')}</h3>
              <p className="text-gray-600">{t('home.whyChoose.fairPricesDescription')}</p>
            </div>
            <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <FaBolt className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{t('home.whyChoose.fastEasy')}</h3>
              <p className="text-gray-600">{t('home.whyChoose.fastEasyDescription')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
