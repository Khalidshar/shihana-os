import esbuild from 'esbuild';
await esbuild.build({
  entryPoints:['main.ts'],
  outfile:'main.js',
  bundle:true,
  format:'cjs',
  platform:'browser',
  external:['obsidian']
});
