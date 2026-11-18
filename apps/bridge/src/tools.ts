import fs from'node:fs/promises';import path from'node:path';import net from'node:net';import dns from'node:dns/promises';import type{Config}from'../../../packages/shared/src/index.js';import{Vault,HttpError}from'./vault.js';import{runProcess}from'./process.js';
export type Approve=(tool:string,pathOrCommand:string)=>Promise<boolean>;
export class Tools{
 constructor(public vault:Vault,public config:Config){}
 list(){return[{name:'vault_graph',available:true,description:'Read, list, search or write Markdown in the sandboxed vault',schema:{action:'read|list|write',path:'string',content:'string'}},{name:'safe_shell',available:true,description:'Run executable and argument array with approval and timeout',schema:{command:'string',args:'string[]'}},{name:'artifact_verifier',available:true,description:'Verify a non-empty Markdown, HTML, SVG or media file',schema:{path:'string'}},{name:'doc_converter',available:false,description:'Not set up · speech/MarkItDown is phase 5',schema:{path:'string'}},{name:'web_reader',available:true,description:'Fetch public HTTP(S) pages and return a bounded plain-text extraction',schema:{url:'string'}}]}
 async verify(rel:string){const target=await this.vault.resolve(rel),stat=await fs.stat(target);if(!stat.isFile()||stat.size===0)throw new Error('Artifact missing or empty: '+rel);const ext=path.extname(rel).toLowerCase();if(!['.md','.html','.svg','.png','.jpg','.jpeg','.wav','.mp4','.webm','.json'].includes(ext))throw new Error('Unsupported artifact type');const data=await fs.readFile(target);if(ext==='.html'&&!/<(?:html|body|div|main|svg|canvas|!doctype)/i.test(data.toString('utf8')))throw new Error('Invalid HTML artifact');if(ext==='.svg'&&!/<svg[\s>]/.test(data.toString('utf8')))throw new Error('Invalid SVG artifact');if(ext==='.json')JSON.parse(data.toString('utf8'));if(ext==='.md'&&!data.toString('utf8').trim())throw new Error('Empty Markdown');if(ext==='.png'&&data.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw new Error('Invalid PNG');if(['.jpg','.jpeg'].includes(ext)&&data.subarray(0,2).toString('hex')!=='ffd8')throw new Error('Invalid JPEG');if(ext==='.wav'&&(data.toString('ascii',0,4)!=='RIFF'||data.toString('ascii',8,12)!=='WAVE'))throw new Error('Invalid WAV');if(ext==='.mp4'&&data.toString('ascii',4,8)!=='ftyp')throw new Error('Invalid MP4');if(ext==='.webm'&&data.subarray(0,4).toString('hex')!=='1a45dfa3')throw new Error('Invalid WebM');return{passed:true,path:rel,bytes:stat.size}}
 async execute(name:string,args:Record<string,any>,approve:Approve,signal:AbortSignal,cwd=this.config.vaultPath,forceApproval=false){signal.throwIfAborted();if(name==='vault_graph'){if(args.action==='list')return this.vault.files();if(args.action==='read')return this.vault.file(args.path);if(args.action==='write'){if(typeof args.content!=='string')throw new HttpError(400,'content required');await this.vault.resolve(args.path);const needs=forceApproval||!this.vault.writable(args.path)||this.config.permissions.mode==='prompt-all';if(needs&&!await approve(name,`WRITE ${args.path}`))throw new HttpError(403,'Write denied');await this.vault.write(args.path,args.content,needs);return{path:args.path,written:true}}throw new HttpError(400,'Unknown vault action')}
 if(name==='artifact_verifier')return this.verify(args.path);
 if(name==='web_reader'){
  if(typeof args.url!=='string')throw new HttpError(400,'url required');
  let url:URL;try{url=new URL(args.url)}catch{throw new HttpError(400,'Invalid URL')}
  if(!['http:','https:'].includes(url.protocol))throw new HttpError(400,'Only HTTP(S) URLs are allowed');
  const publicAddress=(ip:string)=>{
   if(ip.startsWith('::ffff:'))ip=ip.slice(7);
   if(net.isIPv4(ip)){
    const p=ip.split('.').map(Number);
    return !(p[0]===10||p[0]===127||p[0]===0||(p[0]===169&&p[1]===254)||(p[0]===172&&p[1]>=16&&p[1]<=31)||(p[0]===192&&p[1]===168)||(p[0]===100&&(p[1]>=64&&p[1]<=127))||p[0]>=224);
   }
   const lower=ip.toLowerCase();
   return !(lower==='::'||lower==='::1'||lower.startsWith('fc')||lower.startsWith('fd')||lower.startsWith('fe8')||lower.startsWith('fe9')||lower.startsWith('fea')||lower.startsWith('feb')||lower.startsWith('ff'));
  };
  let response:Response|undefined;
  for(let hop=0;hop<5;hop++){
   if(!['http:','https:'].includes(url.protocol))throw new HttpError(403,'Redirect target must use HTTP(S)');
   if(url.username||url.password)throw new HttpError(403,'URL credentials are blocked');
   if(['localhost','127.0.0.1','::1','0.0.0.0'].includes(url.hostname.toLowerCase()))throw new HttpError(403,'Private-network URLs are blocked');
   const addresses=await dns.lookup(url.hostname,{all:true,verbatim:true});
   if(!addresses.length||addresses.some(a=>!publicAddress(a.address)))throw new HttpError(403,'URL resolved to a private or link-local address');
   response=await fetch(url,{headers:{accept:'text/html,text/plain;q=0.9'},redirect:'manual',signal:AbortSignal.timeout(15000)});
   if(response.status>=300&&response.status<400&&response.headers.get('location')){
    url=new URL(response.headers.get('location')!,url);continue;
   }
   break;
  }
  if(!response)throw new HttpError(502,'Web read did not return a response');
  if(response.status>=300&&response.status<400)throw new HttpError(508,'Too many redirects');
  if(!response.ok)throw new HttpError(response.status,'Web read failed: '+response.statusText);
  const contentType=response.headers.get('content-type')||'text/plain';
  const raw=(await response.text()).slice(0,2_000_000);
  if(!/(text\/html|text\/plain|application\/xhtml)/i.test(contentType))throw new HttpError(415,'Unsupported content type');
  const text=contentType.includes('html')?raw.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/\s+/g,' ').trim():raw.trim();
  if(!text)throw new HttpError(422,'Page has no readable text');
  return{url:url.toString(),title:text.slice(0,120),text:text.slice(0,30000),bytes:raw.length};
 }
 if(name==='safe_shell'){if(this.config.permissions.mode==='read-only')throw new HttpError(403,'Read-only mode');if(typeof args.command!=='string'||!Array.isArray(args.args)||args.args.some((x:any)=>typeof x!=='string'))throw new HttpError(400,'Use command + string args array');const roots=[this.config.vaultPath,...this.config.workspaces.map(w=>path.resolve(w.path))];if(!roots.includes(path.resolve(cwd)))throw new HttpError(403,'Unconfigured workspace'); const gitArgs=JSON.stringify(args.args);
 const safe=args.command==='git'&&[
  JSON.stringify(['status','--short','--branch']),
  JSON.stringify(['status','--short']),
  JSON.stringify(['diff','--stat']),
  JSON.stringify(['diff','--no-ext-diff','--unified=3']),
  JSON.stringify(['log','--oneline','-12'])
 ].includes(gitArgs);
 if(!safe||this.config.permissions.mode==='prompt-all'){if(!await approve(name,JSON.stringify([args.command,...args.args])))throw new HttpError(403,'Shell denied')}let stdout='';for await(const line of runProcess(args.command,args.args,'',{cwd,signal,timeout:this.config.agentLimits.commandTimeoutMs})){stdout+=line+'\n';if(stdout.length>1e6)throw new Error('Shell output limit exceeded')}return{stdout,stderr:'',exitCode:0}}
 throw new HttpError(501,'Not set up: '+name);
 }
}
