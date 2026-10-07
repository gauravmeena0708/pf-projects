const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const R=require('./posting-rules');

test('existing application supplies officers to the advisor without external network requests',async()=>{
  let boot,payload;const errors=[],requests=[];
  const sandbox={
    window:{location:{pathname:'/agt_analysis/posting-advisor.html',search:'',hash:''},addEventListener(){},PostingAdvisor:{async mount(data){payload=data;}}},
    document:{readyState:'loading',addEventListener(name,fn){if(name==='DOMContentLoaded')boot=fn;},getElementById(){return null;},querySelectorAll(){return [];}},
    console:{log(){},warn(){},error(...args){errors.push(args);}},URLSearchParams,
    async fetch(url){requests.push(url);return{ok:true,json:async()=>JSON.parse(fs.readFileSync(path.join(__dirname,url),'utf8'))};}
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(__dirname,'app.js'),'utf8'),sandbox);
  await boot();
  assert.deepEqual(errors,[]);assert.deepEqual(requests,['data.json']);
  assert.equal(payload.officers.length,673);
  assert(payload.officers.every(o=>o.eid&&Array.isArray(o.postings)));

  // Run the actual catalogue builder with the existing application's directory.
  const planner={window:{PostingRules:R},document:{},console,URLSearchParams};
  vm.createContext(planner);
  vm.runInContext(fs.readFileSync(path.join(__dirname,'posting-advisor.js'),'utf8'),planner);
  const catalogue=JSON.parse(fs.readFileSync(path.join(__dirname,'oic-catalogue.json'),'utf8'));
  const offices=planner.window.PostingAdvisor.createCatalogue(payload.officeDictionary,catalogue);
  assert.equal(offices.filter(o=>o.sourcePage).length,150);
  assert.equal(new Set(offices.map(o=>o.id)).size,offices.length);
  assert.equal(offices.filter(o=>o.oicCadre==='RPFC-I').length,107);
  assert.equal(offices.filter(o=>o.oicCadre==='RPFC-II').length,43);
  assert(offices.some(o=>o.name==='Regional Office Kukatpally'&&o.sourceDate==='2025-07-03'));
  assert(offices.some(o=>o.name==='Regional Office Hyderabad-Banjara Hills'));
  assert(offices.filter(o=>o.type==='Training Institute').every(o=>R.zoneKey(o)===null));
  assert(offices.filter(o=>o.type==='PDUNASS').every(o=>R.zoneKey(o)==='HO-PDUNASS'));
});

test('advisor navigation, dependencies and PDF source links resolve inside the project',()=>{
  for(const name of ['index.html','officer-profile.html','office-profile.html','zone-profile.html','as-on-date.html','mobility.html','spatial-analytics.html'])assert(fs.readFileSync(path.join(__dirname,name),'utf8').includes('posting-advisor.html'),name);
  const html=fs.readFileSync(path.join(__dirname,'posting-advisor.html'),'utf8');
  for(const [,ref]of html.matchAll(/(?:href|src)="([^"]+)"/g))if(!ref.startsWith('https:'))assert(fs.existsSync(path.join(__dirname,ref)),ref);
  const js=fs.readFileSync(path.join(__dirname,'posting-advisor.js'),'utf8');
  for(const [,ref]of js.matchAll(/(research\/sources\/[a-zA-Z0-9_\-.]+\.pdf)/g))assert(fs.existsSync(path.join(__dirname,ref)),ref);
});
