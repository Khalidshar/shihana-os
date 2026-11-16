import {loadConfig,initializeVault} from './config.js';
const config=await loadConfig();
await initializeVault(config);
console.log(`${config.osName}: vault ready at ${config.vaultPath}`);
