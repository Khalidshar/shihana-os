import{loadConfig}from'../apps/bridge/src/config.ts';import{engines}from'../apps/bridge/src/engines.ts';
const c=await loadConfig();for(const[id,engine]of Object.entries(engines(c)))console.log(id,JSON.stringify(await engine.detect()));
