const{contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('desktop',{bootstrap:()=>ipcRenderer.invoke('bootstrap'),control:action=>ipcRenderer.send('window-control',action),onAction:callback=>{const handler=(_,action)=>callback(action);ipcRenderer.on('action',handler);return()=>ipcRenderer.removeListener('action',handler)}});
