const { query } = require('./database.js');
async function run() {
  try {
    await query('TRUNCATE TABLE olympiad_mock_results');
    console.log('Successfully cleared all Selection Test attempt data.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
