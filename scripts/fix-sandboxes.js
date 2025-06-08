import ProgressModel from "../src/server/models/ProgressModel.js";

async function fixSandboxes() {
  const progressModel = new ProgressModel();
  const allRecords = await progressModel.findAll();
  let updatedCount = 0;

  for (const record of allRecords) {
    if (!record.isSandbox || !Array.isArray(record.history)) continue;
    const sandbox = record.progressId;
    for (const entry of record.history) {
      entry.sandbox = sandbox;
    }
    await progressModel.update(record.progressId, { history: record.history });
    updatedCount++;
  }
  console.log(`Updated ${updatedCount} sandbox records.`);
}

fixSandboxes().catch(err => {
  console.error('Error fixing sandboxes:', err);
  process.exit(1);
});

