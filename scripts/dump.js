
export default async function dump(model, name) {
  try {
    const data = await model.findAll();
    console.log( `export default { "${name}": ` )
    console.log(JSON.stringify(data, null, 2));
    console.log( '};')
    process.exit(0);
  } catch (err) {
    console.error(`Error fetching ${name}:`, err);
    process.exit(1);
  }
}
