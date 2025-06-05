import { ProgressModel } from '../src/server/models/index.js';

async function dumpProgress() {
  const progressModel = new ProgressModel();
  const allProgress   = await progressModel.findAll();

  console.log( 'export default { "progress" : [')
  console.log( JSON.stringify(allProgress, null, 2) );
  console.log(']}');
}

dumpProgress().catch(err => {
  console.error('Failed to dump progress:', err);
  process.exit(1);
})
