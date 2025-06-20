import * as models from '../../models/index.js';

export function resetCaches() {
    models.ExampleModelQuery.reset();
    models.ProgressModelQuery.reset();
    models.IdiomModelQuery.reset();
    return { ok: true };
}