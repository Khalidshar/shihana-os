import{spawn}from'node:child_process';import fs from'node:fs/promises';import path from'node:path';import{fileURLToPath}from'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');process.chdir(root);
await fs.access('dist/bridge.mjs');
const env={...process.env};
delete env.ELECTRON_RUN_AS_NODE;
if(process.platform==='linux'&&!env.DISPLAY&&!env.WAYLAND_DISPLAY){
 const xvfb=spawn('xvfb-run',['-a','npm','start'],{cwd:root,env,stdio:'inherit'});
 xvfb.on('exit',code=>process.exitCode=code??1);
}else{
 const runner=spawn(process.execPath,['scripts/start.mjs'],{cwd:root,env,stdio:'inherit'});
 runner.on('exit',code=>process.exitCode=code??1);
}
