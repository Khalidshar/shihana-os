import {build} from 'esbuild';import fs from 'node:fs/promises';
await build({entryPoints:['apps/bridge/src/index.ts'],bundle:true,platform:'node',format:'esm',packages:'external',outfile:'dist/bridge.mjs',sourcemap:true});
await fs.mkdir('apps/hud/dist',{recursive:true});
await build({entryPoints:['apps/hud/src/main.tsx'],bundle:true,format:'esm',minify:true,jsx:'automatic',outdir:'apps/hud/dist',loader:{'.woff2':'file','.woff':'file'},sourcemap:true});
let html=await fs.readFile('apps/hud/index.html','utf8');html=html.replace('/src/main.tsx','/main.js').replace('</head>','<link rel="stylesheet" href="/main.css"></head>');await fs.writeFile('apps/hud/dist/index.html',html);console.log('Bridge + HUD build succeeded');
