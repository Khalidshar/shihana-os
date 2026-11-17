import type{Engine,EngineEvent,EngineId,RunOptions,Config}from'../../../packages/shared/src/index.js';import{capture,runProcess}from'./process.js';
export function healJSON(raw:string):Record<string,unknown>{const cleaned=raw.trim().replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,'').replace(/,\s*([}\]])/g,'$1');try{const parsed=JSON.parse(cleaned);if(!parsed||Array.isArray(parsed)||typeof parsed!=='object')throw 0;return parsed}catch{throw new Error('Invalid tool JSON: ambiguous arguments rejected; ask engine to regenerate valid JSON')}}
export function normalize(id:EngineId,data:any):EngineEvent[]{const events:EngineEvent[]=[];if(data.type==='thread.started'&&data.thread_id)events.push({type:'session',id:data.thread_id});if(id==='codex'&&data.type==='item.completed'&&data.item?.type==='agent_message')events.push({type:'text',text:data.item.text});if(id==='claude'&&data.type==='assistant')for(const c of data.message?.content||[]){if(c.type==='text')events.push({type:'text',text:c.text})}if(id==='gemini'&&data.type==='message'&&data.role==='assistant'&&data.content)events.push({type:'text',text:data.content});if(data.type==='error'||data.type==='turn.failed'||data.is_error)throw new Error(data.error?.message||data.result||data.message||'Engine failed');return events}
export class CLIEngine implements Engine{
 constructor(public id:EngineId,public config:Config){}
 async detect(){try{const version=(await capture(this.config.engines[this.id].command,['--version'])).trim();return{installed:true,version}}catch(e:any){return{installed:false,reason:e.message}}}
 async *run(opts:RunOptions):AsyncGenerator<EngineEvent>{
 if(this.config.localOnlyMode&&this.id!=='hermes')throw new Error('Cloud engines blocked by localOnlyMode');
 const command=this.config.engines[this.id].command;const help=await capture(command,['--help']);let args:string[];
 if(this.id==='codex'){const execHelp=await capture(command,['exec','--help']);if(!execHelp.includes('--json'))throw new Error('Unsupported Codex version');args=['exec','--json','--sandbox','read-only','--ephemeral','--skip-git-repo-check','-']}
 else if(this.id==='claude'){if(!help.includes('stream-json'))throw new Error('Unsupported Claude version');args=['-p','--output-format','stream-json','--verbose','--tools','', '--permission-mode','plan']}
 else if(this.id==='gemini'){if(!help.includes('stream-json')||!help.includes('--approval-mode'))throw new Error('Gemini headless read-only mode not available');args=['--output-format','stream-json','--approval-mode','plan']}
 else throw new Error('Not set up: Hermes CLI/ACP version must be verified locally before enabling; install Hermes and configure a local Ollama provider');
 if(opts.model)args.push('--model',opts.model);
 const prompt=`${opts.handoffContext||''}\n${opts.prompt}\n\nYou have no direct write or shell authority. Use only the bridge tool adapter: return one JSON object {"tool":"vault_graph|safe_shell|artifact_verifier","args":{...}} when a tool is needed; otherwise return text. Tool requests are subject to permissions and a ${opts.maxSteps} step limit.`;
 for await(const line of runProcess(command,args,prompt,{cwd:opts.cwd,signal:opts.signal,timeout:this.config.agentLimits.commandTimeoutMs})){let data:any;try{data=JSON.parse(line)}catch{continue}for(const e of normalize(this.id,data))yield e}
 }
}
export class ClaudeEngine extends CLIEngine{constructor(c:Config){super('claude',c)}}
export class CodexEngine extends CLIEngine{constructor(c:Config){super('codex',c)}}
export class GeminiEngine extends CLIEngine{constructor(c:Config){super('gemini',c)}}
export class HermesEngine extends CLIEngine{constructor(c:Config){super('hermes',c)}}
export class FakeEngine implements Engine{constructor(public id:EngineId='codex',public respond:(o:RunOptions)=>EngineEvent[]=o=>[{type:'text',text:o.prompt}]){}async detect(){return{installed:false,reason:'TEST ONLY'}}async *run(o:RunOptions){o.signal.throwIfAborted();for(const e of this.respond(o))yield e}}
export function engines(c:Config):Record<EngineId,Engine>{return{claude:new ClaudeEngine(c),codex:new CodexEngine(c),gemini:new GeminiEngine(c),hermes:new HermesEngine(c)}}
