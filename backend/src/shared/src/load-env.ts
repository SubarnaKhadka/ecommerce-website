import path from 'path';
import dotenv from 'dotenv';

const envPath = path.resolve(__dirname, '../../../.env.local');
dotenv.config({ path: envPath, debug: false, quiet: true });
