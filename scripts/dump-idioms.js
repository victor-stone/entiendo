import IdiomModel from '../src/server/models/IdiomModel.js'

async function dumpIdioms() {
  try {
    const model = new IdiomModel();
    const idioms = await model.findAll();
    console.log( 'export default { "idioms": ')
    console.log(JSON.stringify(idioms, null, 2));
    console.log( '};')
    process.exit(0);
  } catch (err) {
    console.error('Error fetching idioms:', err);
    process.exit(1);
  }
}

dumpIdioms();

