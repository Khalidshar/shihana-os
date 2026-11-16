export type EngineId = 'claude' | 'codex' | 'gemini' | 'hermes';
export type Config = { osName:string; assistantName:string; ownerName:string; uiLanguage:'ar'|'en'; vaultPath:string; workspaces:{name:string;path:string}[]; defaultEngine:EngineId; localOnlyMode:boolean; agentLimits:{maxSteps:number;commandTimeoutMs:number}; permissions:{mode:'tiered'|'prompt-all'|'read-only';writableFolders:string[]}; engines:Record<EngineId,{command:string;models:string[];protocol?:string;ollamaUrl?:string}>; [key:string]:unknown };
export type EngineEvent = {type:'text';text:string}|{type:'tool';name:string;args:Record<string,unknown>}|{type:'session';id:string};
export interface RunOptions {prompt:string;cwd:string;model?:string;resumeId?:string;handoffContext?:string;maxSteps:number;signal:AbortSignal}
export interface Engine {id:EngineId;detect():Promise<{installed:boolean;version?:string;reason?:string}>;run(opts:RunOptions):AsyncIterable<EngineEvent>}
export interface Message {role:'user'|'assistant';text:string;engine:EngineId;at:string}
export interface Session {id:string;messages:Message[];engine?:EngineId;touchedFiles:string[];toolOutputs:unknown[]}
export type ClientEvent = {type:'chat.send';sessionId?:string;text:string;engine:EngineId;model?:string;workspacePath?:string;source:'hud'|'obsidian'} | {type:'chat.cancel';sessionId:string} | {type:'permission.reply';requestId:string;approved:boolean};
