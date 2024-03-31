fs = require('fs');

// Extract version from version.go file (this is updated whenever 'go generate' is run)
const data = fs.readFileSync('../oracles-randomizer-ng/randomizer/version.go', 'utf-8');
const openQuote = data.indexOf('"');
const closeQuote = data.lastIndexOf('"');
const version = data.substring(openQuote+1, closeQuote);

module.exports = version;
