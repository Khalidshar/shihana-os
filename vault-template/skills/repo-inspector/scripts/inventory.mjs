import fs from 'node:fs/promises';
console.log(JSON.stringify({cwd:process.cwd(),files:await fs.readdir(process.cwd())},null,2));
