import {ItemView,Plugin,WorkspaceLeaf}from'obsidian';
const VIEW_TYPE='shihana-hud';
class ShihanaView extends ItemView{
 constructor(leaf:WorkspaceLeaf){super(leaf)}
 getViewType(){return VIEW_TYPE}
 getDisplayText(){return 'الشيهانة'}
 getIcon(){return 'sparkles'}
 async onOpen(){
  const el=this.contentEl;el.empty();el.addClass('shihana-obsidian');
  const frame=document.createElement('iframe');
  frame.src='http://127.0.0.1:4317';
  frame.title='الشيهانة';
  frame.style.cssText='width:100%;height:100%;border:0;';
  el.appendChild(frame);
 }
 async onClose(){}
}
export default class ShihanaPlugin extends Plugin{
 async onload(){
  this.registerView(VIEW_TYPE,leaf=>new ShihanaView(leaf));
  this.addRibbonIcon('sparkles','فتح شيهانة',()=>this.activateView());
  await this.activateView();
 }
 async activateView(){
  const leaves=this.app.workspace.getLeavesOfType(VIEW_TYPE);
  if(!leaves.length){const leaf=this.app.workspace.getLeaf('tab');await leaf.setViewState({type:VIEW_TYPE,active:true});this.app.workspace.revealLeaf(leaf)}
 }
 onunload(){this.app.workspace.detachLeavesOfType(VIEW_TYPE)}
}
