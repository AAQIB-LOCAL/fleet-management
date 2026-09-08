import fs from 'fs';

const API_URL = 'https://fleet-management-api-arwq.onrender.com/api/v1/vehicles';
const API_KEY = 'secret-api-key';

const makes = ['Tesla', 'Rivian', 'Volkswagen', 'Ford', 'Chevrolet', 'Polestar', 'Lucid'];
const models = {
  'Tesla': ['Model S', 'Model 3', 'Model X', 'Model Y', 'Cybertruck'],
  'Rivian': ['R1T', 'R1S'],
  'Volkswagen': ['ID.3', 'ID.4', 'ID.Buzz'],
  'Ford': ['Mustang Mach-E', 'F-150 Lightning'],
  'Chevrolet': ['Bolt EV', 'Blazer EV', 'Silverado EV'],
  'Polestar': ['Polestar 2', 'Polestar 3'],
  'Lucid': ['Air Pure', 'Air Grand Touring']
};
const colors = ['White', 'Black', 'Silver', 'Blue', 'Red', 'Midnight', 'Forest Green'];

function generateVIN() {
  const chars = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789';
  let vin = '';
  for (let i = 0; i < 17; i++) {
    vin += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return vin;
}

const vehiclesToCreate = Array.from({ length: 30 }, () => {
  const make = makes[Math.floor(Math.random() * makes.length)];
  const model = models[make][Math.floor(Math.random() * models[make].length)];
  return {
    vin: generateVIN(),
    make: make,
    model: model,
    year: Math.floor(Math.random() * (2025 - 2020 + 1)) + 2020,
    color: colors[Math.floor(Math.random() * colors.length)]
  };
});

// Write to mock_vehicles.json for Postman format
fs.writeFileSync('mock_vehicles.json', JSON.stringify(vehiclesToCreate, null, 2));
console.log('Created mock_vehicles.json for Postman Data Runner.');

async function seedDatabase() {
  console.log(`Starting to seed ${vehiclesToCreate.length} vehicles to ${API_URL}...`);
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < vehiclesToCreate.length; i++) {
    const vehicle = vehiclesToCreate[i];
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'Idempotency-Key': `seed-key-${Date.now()}-${i}`
        },
        body: JSON.stringify(vehicle)
      });

      if (response.status === 201) {
        successCount++;
        console.log(`[${i + 1}/${vehiclesToCreate.length}] ✅ Created: ${vehicle.make} ${vehicle.model} (${vehicle.vin})`);
      } else {
        failCount++;
        const error = await response.json();
        console.error(`[${i + 1}/${vehiclesToCreate.length}] ❌ Failed:`, error.detail || error.message || error);
      }
    } catch (err) {
      failCount++;
      console.error(`[${i + 1}/${vehiclesToCreate.length}] ❌ Network error:`, err.message);
    }

    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log('\n--- Seeding Complete ---');
  console.log(`Successfully added: ${successCount}`);
  console.log(`Failed to add: ${failCount}`);
}

seedDatabase();
