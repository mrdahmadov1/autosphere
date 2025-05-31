import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { calculatePriceMetrics, getPriceTrend, getPriceRange } from '../utils/priceAnalysis';

function PriceAnalysis({ car, similarCars }) {
  const { t, i18n } = useTranslation();
  const priceMetrics = calculatePriceMetrics(car, similarCars);
  const priceTrend = getPriceTrend(car, similarCars);
  const priceRange = getPriceRange(similarCars);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4 text-neutral-dark">{t('carDetails.priceAnalysis')}</h3>

      {/* Price Status */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-neutral/70">{t('carDetails.priceStatus')}</span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r ${priceMetrics.color}`}
          >
            {priceMetrics.label[i18n.language]}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${priceMetrics.color}`}
            style={{ width: `${Math.min(100, Math.max(0, priceMetrics.percentile))}%` }}
          />
        </div>
      </div>

      {/* Price Comparison */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-neutral/70 mb-1">{t('carDetails.medianPrice')}</p>
          <p className="text-lg font-bold text-neutral-dark">
            ${priceMetrics.medianPrice.toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-neutral/70 mb-1">{t('carDetails.marketTrend')}</p>
          <div className="flex items-center">
            <span
              className={`text-lg font-bold ${
                priceTrend.trend === 'increasing'
                  ? 'text-red-500'
                  : priceTrend.trend === 'decreasing'
                  ? 'text-green-500'
                  : 'text-blue-500'
              }`}
            >
              {priceTrend.label[i18n.language]}
            </span>
            {priceTrend.trend !== 'stable' && (
              <span className="ml-2 text-sm text-neutral/70">
                ({priceTrend.percentage.toFixed(1)}%)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Price Range */}
      <div>
        <p className="text-sm text-neutral/70 mb-2">{t('carDetails.priceRange')}</p>
        <div className="relative h-2 bg-gray-200 rounded-full">
          <div
            className="absolute h-full bg-primary rounded-full"
            style={{
              left: `${
                ((priceRange.min - priceRange.min) / (priceRange.max - priceRange.min)) * 100
              }%`,
              right: `${
                100 - ((priceRange.max - priceRange.min) / (priceRange.max - priceRange.min)) * 100
              }%`,
            }}
          />
          <div
            className="absolute w-2 h-4 bg-primary -top-1 transform -translate-x-1/2"
            style={{
              left: `${((car.price - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%`,
            }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm text-neutral/70">
          <span>${priceRange.min.toLocaleString()}</span>
          <span>${priceRange.max.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

PriceAnalysis.propTypes = {
  car: PropTypes.shape({
    price: PropTypes.number.isRequired,
  }).isRequired,
  similarCars: PropTypes.arrayOf(
    PropTypes.shape({
      price: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default PriceAnalysis;
