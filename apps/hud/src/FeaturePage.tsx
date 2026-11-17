export type API=(p:string,method?:string,data?:any)=>Promise<any>;
export function FeaturePage({page,t,health}:any){return <><h1>{t('مساحة جديدة','A new space')}</h1><p className="muted">{t('غير معدّة بعد','Not set up yet')}</p>{page==='connections'&&<pre>{JSON.stringify(health?.engines,null,2)}</pre>}</>}
