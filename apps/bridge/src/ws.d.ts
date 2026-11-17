declare module 'ws' {
 import{EventEmitter}from'node:events';import type{IncomingMessage}from'node:http';import type{Duplex}from'node:stream';
 export class WebSocket extends EventEmitter{static OPEN:number;readyState:number;constructor(url:string,protocols?:string[]);send(data:string):void;close():void;terminate():void;on(event:'message',listener:(data:Buffer)=>void):this;on(event:string,listener:(...args:any[])=>void):this}
 export class WebSocketServer extends EventEmitter{clients:Set<WebSocket>;constructor(options:{noServer:boolean;maxPayload:number});handleUpgrade(request:IncomingMessage,socket:Duplex,head:Buffer,callback:(socket:WebSocket)=>void):void;on(event:'connection',listener:(socket:WebSocket)=>void):this;close(callback:()=>void):void}
}
