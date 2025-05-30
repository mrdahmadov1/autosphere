const { database, ref, set } = require('../firebase/config');

const sampleCars = [
  {
    brand: 'BMW',
    model: 'X5',
    year: 2023,
    price: 65000,
    mileage: 15000,
    fuel: 'Petrol',
    transmission: 'Automatic',
    color: 'Black',
    description: 'Luxury SUV with premium features and excellent performance.',
    image:
      'https://images.unsplash.com/photo-1555215695-300b0ca6ba4d?q=80&w=1000&auto=format&fit=crop',
    createdAt: Date.now(),
  },
  {
    brand: 'Mercedes-Benz',
    model: 'C-Class',
    year: 2022,
    price: 55000,
    mileage: 25000,
    fuel: 'Diesel',
    transmission: 'Automatic',
    color: 'Silver',
    description: 'Elegant sedan with advanced technology and comfort features.',
    image:
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=1000&auto=format&fit=crop',
    createdAt: Date.now(),
  },
  {
    brand: 'Audi',
    model: 'Q7',
    year: 2023,
    price: 70000,
    mileage: 10000,
    fuel: 'Petrol',
    transmission: 'Automatic',
    color: 'White',
    description: 'Premium SUV with quattro all-wheel drive and luxury interior.',
    image:
      'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=1000&auto=format&fit=crop',
    createdAt: Date.now(),
  },
  {
    brand: 'Toyota',
    model: 'Camry',
    year: 2022,
    price: 35000,
    mileage: 30000,
    fuel: 'Hybrid',
    transmission: 'Automatic',
    color: 'Blue',
    description: 'Reliable sedan with excellent fuel efficiency and comfort.',
    image:
      'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=1000&auto=format&fit=crop',
    createdAt: Date.now(),
  },
  {
    brand: 'Honda',
    model: 'CR-V',
    year: 2023,
    price: 32000,
    mileage: 20000,
    fuel: 'Petrol',
    transmission: 'Automatic',
    color: 'Red',
    description: 'Practical SUV with spacious interior and good fuel economy.',
    image:
      'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=1000&auto=format&fit=crop',
    createdAt: Date.now(),
  },
  {
    brand: 'Tesla',
    model: 'Model 3',
    year: 2023,
    price: 45000,
    mileage: 5000,
    fuel: 'Electric',
    transmission: 'Automatic',
    color: 'Gray',
    description: 'Electric sedan with impressive range and advanced autopilot features.',
    image:
      'https://images.unsplash.com/photo-1617704548623-340376564e68?q=80&w=1000&auto=format&fit=crop',
    createdAt: Date.now(),
  },
  {
    brand: 'Lexus',
    model: 'RX',
    year: 2022,
    price: 58000,
    mileage: 18000,
    fuel: 'Hybrid',
    transmission: 'Automatic',
    color: 'Black',
    description: 'Luxury hybrid SUV with smooth ride and premium features.',
    image:
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=1000&auto=format&fit=crop',
    createdAt: Date.now(),
  },
  {
    brand: 'Volvo',
    model: 'XC90',
    year: 2023,
    price: 62000,
    mileage: 12000,
    fuel: 'Hybrid',
    transmission: 'Automatic',
    color: 'White',
    description: 'Safe and luxurious SUV with advanced safety features.',
    image:
      'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=1000&auto=format&fit=crop',
    createdAt: Date.now(),
  },
];

async function addCars() {
  try {
    const carsRef = ref(database, 'cars');

    // Add each car with a unique ID
    for (const car of sampleCars) {
      const newCarRef = ref(
        database,
        `cars/${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      );
      await set(newCarRef, car);
      console.log(`Added car: ${car.brand} ${car.model}`);
    }

    console.log('All cars added successfully!');
  } catch (error) {
    console.error('Error adding cars:', error);
  }
}

// Run the function
addCars();
