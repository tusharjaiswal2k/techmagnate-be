import 'dotenv/config';
import mongoose from 'mongoose';
import { LANGUAGES } from '../common/constants/languages';
import { LOCATIONS } from '../common/constants/locations';
import { TaskSchema } from '../tasks/schemas/task.schema';

const KEYWORDS = [
  'react developer',
  'seo tools',
  'digital marketing',
  'best laptops 2026',
  'nodejs tutorial',
  'ecommerce platform',
  'project management software',
  'content marketing agency',
  'wordpress hosting',
  'ai chatbot',
  'crm software',
  'freelance web design',
  'cloud storage',
  'video editing app',
  'email marketing service',
];

const SEED_COUNT = 150;

async function seed() {
  const uri =
    process.env.MONGODB_URI ?? 'mongodb://localhost:27017/techmagnate';
  await mongoose.connect(uri);

  const TaskModel = mongoose.model('Task', TaskSchema);
  await TaskModel.deleteMany({ created_by: 'seed-script' });

  const docs = Array.from({ length: SEED_COUNT }, (_, i) => {
    const keyword = KEYWORDS[i % KEYWORDS.length];
    const location = LOCATIONS[i % LOCATIONS.length];
    const language = LANGUAGES[i % LANGUAGES.length];
    const priority = (i % 2) + 1;
    const isError = i % 11 === 0;
    const daysAgo = i % 30;

    return {
      task_id: `seed-${Date.now()}-${i}`,
      status_code: isError ? 40501 : 20000,
      status_message: isError ? 'Error. Invalid Field.' : 'Ok.',
      cost: Number((Math.random() * 0.01).toFixed(4)),
      time: `${(Math.random() * 2).toFixed(4)} sec.`,
      keyword: `${keyword} ${i}`,
      location_code: location.location_code,
      language_code: language.language_code,
      priority,
      created_by: 'seed-script',
      source: i % 3 === 0 ? 'bulk' : 'single',
      created_at: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
    };
  });

  await TaskModel.insertMany(docs, { timestamps: false });
  console.log(`Seeded ${docs.length} tasks.`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
