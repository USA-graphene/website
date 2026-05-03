const fs = require('fs');

const file = 'app/(site)/equipment/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const listStart = `<div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">`;
const listEnd = `</dl>\n                    </div>`;

const blockStart = `{/* Pulsed Electrical Reactor Section */}`;
const blockEnd = `</div>\n                    </div>`;

// We need to reliably extract both.
const listStartIdx = content.indexOf(listStart);
const listEndIdx = content.indexOf(listEnd) + listEnd.length;

const listSection = content.slice(listStartIdx, listEndIdx);

const blockStartIdx = content.indexOf(blockStart);
const blockEndIdx = content.indexOf(blockEnd, blockStartIdx) + blockEnd.length;

const blockSection = content.slice(blockStartIdx, blockEndIdx);

// Swap them in the file
content = content.substring(0, listStartIdx) + 
          blockSection.replace('mt-32', 'mt-16 sm:mt-20 lg:mt-24') + 
          '\n\n                    ' + 
          listSection.replace('mt-16', 'mt-32').replace('sm:mt-20 lg:mt-24', '') + 
          content.substring(blockEndIdx);

fs.writeFileSync(file, content);
console.log('Swapped successfully');
