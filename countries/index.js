import { readdirSync } from 'fs';

// read the contents of the directory
const files = readdirSync('./countrycities');

// filter the array of files to only include JSON files
const jsonFiles = files.filter(file => file.endsWith('.json'));

// export the JSON files
export default jsonFiles;