import fs from 'node:fs/promises';import {loadConfig,initializeVault} from '../apps/bridge/src/config.js';
await fs.mkdir('.tmp',{recursive:true});const c=await loadConfig();await initializeVault(c);console.log('Vault initialized:',c.vaultPath);
