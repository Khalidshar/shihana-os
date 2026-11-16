import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import type {Config} from '../../../packages/shared/src/index.js';
export const ROOT=path.resolve(process.env.SHIHANA_ROOT || process.cwd());
export async function loadConfig(root=ROOT):Promise<Config>{
 const file=path.join(root,'os.config.json');
 try {await fs.access(file)} catch {await fs.copyFile(path.join(root,'os.config.example.json'),file,fs.constants.COPYFILE_EXCL)}
 const config=JSON.parse(await fs.readFile(file,'utf8')) as Config;
 if(!config.osName||!config.vaultPath||!Array.isArray(config.permissions?.writableFolders)) throw new Error('Invalid configuration');
 config.vaultPath=path.resolve(root,config.vaultPath); return config;
}
export async function initializeVault(config:Config,root=ROOT){
 const vault=config.vaultPath;
 // Add missing seed files only; never overwrite existing content, including first-run retries.
 await fs.mkdir(vault,{recursive:true});
 async function seed(dir:string,relative=''):Promise<void>{for(const item of await fs.readdir(dir,{withFileTypes:true})){const rel=path.join(relative,item.name), target=path.join(vault,rel);if(item.isDirectory()){await fs.mkdir(target,{recursive:true});await seed(path.join(dir,item.name),rel)}else{try{await fs.copyFile(path.join(dir,item.name),target,fs.constants.COPYFILE_EXCL)}catch(e:any){if(e.code!=='EEXIST')throw e}}}}
 await seed(path.join(root,'vault-template'));
 await fs.mkdir(path.join(vault,'.os/logs'),{recursive:true});
 const defaults:Record<string,unknown>={'state.json':{foundations:{writing:'chat','os-guide':'chat'},pinned:[]},'facts.json':[]};
 for(const [file,data] of Object.entries(defaults)){try{await fs.writeFile(path.join(vault,'.os',file),JSON.stringify(data,null,2),{flag:'wx'})}catch(e:any){if(e.code!=='EEXIST')throw e}}
 const tokenFile=path.join(vault,'.os/token');try{await fs.writeFile(tokenFile,crypto.randomBytes(32).toString('hex'),{flag:'wx',mode:0o600})}catch(e:any){if(e.code!=='EEXIST')throw e}
 return (await fs.readFile(tokenFile,'utf8')).trim();
}
