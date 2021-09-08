const path = require('path');

/**
 * * Pointing to the main (root) directory or folder where the programs running (start)
 * * In this case, it pointing to the folder wheres the app.js file belongs
 */
module.exports = path.dirname(require.main.filename);
