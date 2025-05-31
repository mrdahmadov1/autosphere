// Price ranges for different emotions (in USD)
const PRICE_RANGES = {
  excellent: { min: 0, max: 0.85 }, // 0-85% of median
  good: { min: 0.85, max: 0.95 }, // 85-95% of median
  fair: { min: 0.95, max: 1.05 }, // 95-105% of median
  high: { min: 1.05, max: 1.15 }, // 105-115% of median
  expensive: { min: 1.15, max: Infinity }, // >115% of median
};

// Color gradients for different price ranges
const PRICE_COLORS = {
  excellent: 'from-green-500 to-green-400',
  good: 'from-green-400 to-green-300',
  fair: 'from-yellow-400 to-yellow-300',
  high: 'from-orange-400 to-orange-300',
  expensive: 'from-red-500 to-red-400',
};

// Emotion labels for different price ranges
const PRICE_EMOTIONS = {
  excellent: {
    en: 'Excellent Deal',
    ru: 'Отличная сделка',
    az: 'Əla təklif',
  },
  good: {
    en: 'Good Deal',
    ru: 'Хорошая сделка',
    az: 'Yaxşı təklif',
  },
  fair: {
    en: 'Fair Price',
    ru: 'Справедливая цена',
    az: 'Ədalətli qiymət',
  },
  high: {
    en: 'High Price',
    ru: 'Высокая цена',
    az: 'Yüksək qiymət',
  },
  expensive: {
    en: 'Expensive',
    ru: 'Дорого',
    az: 'Bahalı',
  },
};

// Calculate price metrics for a car
export const calculatePriceMetrics = (car, similarCars) => {
  if (!similarCars || similarCars.length === 0) {
    return {
      priceRatio: 1,
      emotion: 'fair',
      color: PRICE_COLORS.fair,
      label: PRICE_EMOTIONS.fair,
      medianPrice: car.price,
      percentile: 50,
    };
  }

  // Calculate median price
  const prices = similarCars.map((c) => c.price).sort((a, b) => a - b);
  const medianPrice =
    prices.length % 2 === 0
      ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2
      : prices[Math.floor(prices.length / 2)];

  // Calculate price ratio
  const priceRatio = car.price / medianPrice;

  // Determine emotion and color based on price ratio
  let emotion = 'fair';
  for (const [key, range] of Object.entries(PRICE_RANGES)) {
    if (priceRatio >= range.min && priceRatio < range.max) {
      emotion = key;
      break;
    }
  }

  // Calculate percentile
  const percentile = (prices.filter((p) => p <= car.price).length / prices.length) * 100;

  return {
    priceRatio,
    emotion,
    color: PRICE_COLORS[emotion],
    label: PRICE_EMOTIONS[emotion],
    medianPrice,
    percentile,
  };
};

// Format price with proper precision
export const formatPrice = (price) => {
  if (price >= 1000000) {
    return `$${(price / 1000000).toFixed(1)}M`;
  }
  if (price >= 1000) {
    return `$${(price / 1000).toFixed(1)}K`;
  }
  return `$${price.toLocaleString()}`;
};
