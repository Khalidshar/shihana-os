import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const electronBuilder=path.join(root,'node_modules/electron-builder');
if(!fs.existsSync(electronBuilder)){
 console.error('Windows installer is not set up: electron-builder is not installed in this environment.');
 process.exit(1);
}
