import ProgressQuery from '../src/shared/lib/query/ProgressQuery.js';
import progress from '../staging/query/progress.js';
import ExampleQuery from '../src/shared/lib/query/ExampleQuery.js';
import examples from '../staging/query/examples.js';
import IdiomQuery from '../src/shared/lib/query/IdiomQuery.js';
import idioms from '../staging/query/idioms.js';

export const progressQuery = new ProgressQuery(progress);
export const exampleQuery = new ExampleQuery(examples);
export const idiomQuery = new IdiomQuery(idioms);
