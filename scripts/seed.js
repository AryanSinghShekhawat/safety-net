import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load .env.local variables
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const BASE_LAT = 26.9124;
const BASE_LNG = 75.7873;

async function seedDatabase() {
  console.log('Generating 40 fake reports...');
  
  const reports = Array.from({ length: 40 }).map(() => ({
    category: faker.helpers.arrayElement(['Power Cut', 'Water Issue', 'Theft', 'Stray Animals', 'Road Hazard']),
    lat: BASE_LAT + faker.location.latitude({ max: 0.05, min: -0.05 }),
    lng: BASE_LNG + faker.location.longitude({ max: 0.05, min: -0.05 }),
    resolved: faker.datatype.boolean(),
    upvotes: faker.number.int({ min: 0, max: 20 })
  }));

  const { error } = await supabase.from('incidents').insert(reports);
  
  if (error) {
    console.error('Error seeding data:', error.message);
  } else {
    console.log('Successfully inserted 40 reports into Supabase!');
  }
}

seedDatabase();