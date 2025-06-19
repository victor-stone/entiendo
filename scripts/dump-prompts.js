import PromptModel from '../src/server/models/PromptModel.js'

async function dumpPrompts() {
  try {
    const model = new PromptModel();
    const idioms = await model.findAll();
    console.log( 'export default { "prompts": ')
    console.log(JSON.stringify(idioms, null, 2));
    console.log( '};')
    process.exit(0);
  } catch (err) {
    console.error('Error fetching prompts:', err);
    process.exit(1);
  }
}

dumpPrompts();

