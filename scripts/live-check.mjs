import{build}from'esbuild';import{spawn}from'node:child_process';import fs from'node:fs/promises';
await build({entryPoints:['scripts/live-check.ts'],bundle:true,platform:'node',format:'esm',packages:'external',outfile:'.tmp/live-check.mjs'});const p=spawn(process.execPath,['.tmp/live-check.mjs'],{stdio:'inherit'});p.on('exit',code=>process.exitCode=code??1);
