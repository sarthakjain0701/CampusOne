const fs = require('fs');
const file = 'c:/Users/jnsid/Downloads/CampusOne/js/views/timetableView.js';
let txt = fs.readFileSync(file, 'utf8');
txt = txt.replace(/\\`/g, '`');
txt = txt.replace(/\\\$/g, '$');
fs.writeFileSync(file, txt);
console.log('Fixed backticks and dollar signs');
