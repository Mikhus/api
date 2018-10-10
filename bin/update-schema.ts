import * as fs from 'fs';
import * as path from 'path';

import { schema } from '../src';
import { printSchema } from 'graphql';

const schemaPath = path.resolve(
    __dirname,
    '../src/schema.graphql'
);

fs.writeFileSync(schemaPath, printSchema(schema));

console.log('Done!');