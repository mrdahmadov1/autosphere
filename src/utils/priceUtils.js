// Calculate average price for similar cars based on brand and model
export const calculateAveragePrice = (currentCar, similarCars) => {
  if (!similarCars || similarCars.length === 0) return null;

  // Filter cars with the same brand and model
  const relevantCars = similarCars.filter(
    (car) => car.brand === currentCar.brand && car.model === currentCar.model
  );

  if (relevantCars.length === 0) return null;

  // Calculate weighted average based on year difference
  const currentYear = new Date().getFullYear();
  const totalWeight = relevantCars.reduce((sum, car) => {
    const yearDiff = Math.abs(currentYear - car.year);
    return sum + 1 / (yearDiff + 1); // Add 1 to avoid division by zero
  }, 0);

  const weightedSum = relevantCars.reduce((sum, car) => {
    const yearDiff = Math.abs(currentYear - car.year);
    const weight = 1 / (yearDiff + 1);
    return sum + car.price * weight;
  }, 0);

  return weightedSum / totalWeight;
};

// Determine price status (expensive, normal, cheap)
export const getPriceStatus = (currentPrice, averagePrice) => {
  if (!averagePrice) return 'normal';

  const difference = ((currentPrice - averagePrice) / averagePrice) * 100;

  if (difference > 15) return 'expensive';
  if (difference < -15) return 'cheap';
  return 'normal';
};

// Get color class based on price status
export const getPriceColorClass = (status) => {
  switch (status) {
    case 'expensive':
      return 'text-red-600';
    case 'cheap':
      return 'text-green-600';
    default:
      return 'text-yellow-600';
  }
};

// Get price status text
export const getPriceStatusText = (status) => {
  switch (status) {
    case 'expensive':
      return 'Orta qiymətdən bahalı';
    case 'cheap':
      return 'Orta qiymətdən ucuz';
    default:
      return 'Normal qiymət';
  }
};
