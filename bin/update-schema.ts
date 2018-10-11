import * as fs from 'fs';
import * as path from 'path';
import { printSchema } from 'graphql';
import { schema } from '../src';

const schemaPath = path.resolve(__dirname, '../src/schema.graphql');

fs.writeFileSync(schemaPath, printSchema(schema));
console.log('Done!');
