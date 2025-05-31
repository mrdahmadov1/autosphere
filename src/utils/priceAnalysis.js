import { createError } from './errorHandler';

export const calculatePriceMetrics = (car, similarCars) => {
  if (!car || !similarCars || similarCars.length === 0) {
    return {
      medianPrice: car?.price || 0,
      percentile: 50,
      color: 'from-blue-500 to-blue-600',
      label: {
        en: 'Market Price',
        ru: 'Рыночная цена',
        az: 'Bazar qiyməti',
      },
    };
  }

  try {
    // Sort prices
    const prices = [car.price, ...similarCars.map((c) => c.price)].sort((a, b) => a - b);
    const medianPrice = prices[Math.floor(prices.length / 2)];

    // Calculate percentile
    const lowerPrices = prices.filter((price) => price < car.price).length;
    const percentile = Math.round((lowerPrices / prices.length) * 100);

    // Determine color based on percentile
    let color;
    if (percentile < 25) {
      color = 'from-green-500 to-green-600';
    } else if (percentile < 75) {
      color = 'from-blue-500 to-blue-600';
    } else {
      color = 'from-red-500 to-red-600';
    }

    // Determine label based on percentile
    let label;
    if (percentile < 25) {
      label = {
        en: 'Great Deal',
        ru: 'Отличная цена',
        az: 'Əla qiymət',
      };
    } else if (percentile < 75) {
      label = {
        en: 'Market Price',
        ru: 'Рыночная цена',
        az: 'Bazar qiyməti',
      };
    } else {
      label = {
        en: 'Above Market',
        ru: 'Выше рынка',
        az: 'Bazardan yuxarı',
      };
    }

    return {
      medianPrice,
      percentile,
      color,
      label,
    };
  } catch (error) {
    console.error('Error calculating price metrics:', error);
    throw createError('Failed to calculate price metrics', 'PRICE_ANALYSIS_ERROR');
  }
};

export const getPriceTrend = (car, similarCars) => {
  if (!car || !similarCars || similarCars.length === 0) {
    return {
      trend: 'stable',
      percentage: 0,
      label: {
        en: 'No data',
        ru: 'Нет данных',
        az: 'Məlumat yoxdur',
      },
    };
  }

  try {
    // Calculate average price of similar cars
    const avgPrice = similarCars.reduce((sum, c) => sum + c.price, 0) / similarCars.length;
    const priceDiff = ((car.price - avgPrice) / avgPrice) * 100;

    let trend, label;
    if (priceDiff < -10) {
      trend = 'decreasing';
      label = {
        en: 'Decreasing',
        ru: 'Снижается',
        az: 'Azalır',
      };
    } else if (priceDiff > 10) {
      trend = 'increasing';
      label = {
        en: 'Increasing',
        ru: 'Растет',
        az: 'Artır',
      };
    } else {
      trend = 'stable';
      label = {
        en: 'Stable',
        ru: 'Стабильная',
        az: 'Sabit',
      };
    }

    return {
      trend,
      percentage: Math.abs(priceDiff),
      label,
    };
  } catch (error) {
    console.error('Error calculating price trend:', error);
    throw createError('Failed to calculate price trend', 'PRICE_ANALYSIS_ERROR');
  }
};

export const getPriceRange = (similarCars) => {
  if (!similarCars || similarCars.length === 0) {
    return {
      min: 0,
      max: 0,
      avg: 0,
    };
  }

  try {
    const prices = similarCars.map((car) => car.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: prices.reduce((sum, price) => sum + price, 0) / prices.length,
    };
  } catch (error) {
    console.error('Error calculating price range:', error);
    throw createError('Failed to calculate price range', 'PRICE_ANALYSIS_ERROR');
  }
};
