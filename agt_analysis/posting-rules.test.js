const test=require('node:test');
const assert=require('node:assert/strict');
const R=require('./posting-rules.js');
const offices=[
  {id:'a',name:'RO A',station:'Jaipur',zoneId:'rajasthan',type:'Regional Office',oicCadre:'RPFC-I'},
  {id:'b',name:'RO B',station:'Jodhpur',zoneId:'rajasthan',type:'Regional Office',oicCadre:'RPFC-II'},
  {id:'c',name:'RO C',station:'Patna',zoneId:'bihar',type:'Regional Office',oicCadre:'RPFC-II'},
  {id:'d',name:'RO D',station:'Delhi',zoneId:'delhi',type:'Regional Office'},
  {id:'n',name:'RO Noida',station:'Noida',zoneId:'up',type:'Regional Office'},
  {id:'h',name:'Head Office',station:'Delhi',zoneId:'delhi',type:'Head Office'},
  {id:'p',name:'PDUNASS',station:'Delhi',zoneId:'delhi',type:'PDUNASS'},
  {id:'t',name:'ZTI',station:'Jaipur',zoneId:'rajasthan',type:'Training Institute'},
  {id:'z',name:'ZO Jaipur',station:'Jaipur',zoneId:'rajasthan',type:'Zonal Office'},
  {id:'hard',name:'RO Guwahati',station:'Guwahati',zoneId:'ner',type:'Regional Office',hard:true},
  {id:'do',name:'District Office',station:'Kota',zoneId:'rajasthan',type:'District Office'}
];
const posting=(officeId,start='2023-05-01',end='',extra={})=>({officeId,start,end,cadre:'RPFC-II',role:'other',excluded:false,...extra});
const context=(extra={})=>({cadre:'RPFC-II',year:2026,confirmed:true,history:[posting('a')],...extra});
const assess=(extra={},snapshot)=>R.assess(context(extra),offices,snapshot);
const candidate=(result,id,role='other')=>result.candidates.find(c=>c.office.id===id&&c.role===role);
const has=(c,term)=>c.checks.some(x=>x.text.includes(term));

test('calendar dates and leap-day anniversaries are strict',()=>{
  assert.equal(R.date('2025-02-29'),null);assert.equal(R.date('2026-13-01'),null);
  assert.equal(new Date(R.anniversary(R.date('2024-02-29'),1)).toISOString().slice(0,10),'2025-02-28');
});
test('normal tenure completes on 1 May joining anniversary, not one day earlier',()=>{
  assert.equal(assess().release,'Normal duty-office tenure completed');
  assert.equal(assess({history:[posting('a','2023-05-02')]}).release,'Minimum duty-office tenure still running');
});
test('hard posting is a two-year tenure',()=>assert.equal(assess({history:[posting('hard','2024-05-01')]}).release,'Normal duty-office tenure completed'));
test('two-year request is considered at par; shorter request needs review',()=>{
  assert.equal(assess({request:true,history:[posting('a','2024-05-01')]}).release,'Two-year request route');
  const r=assess({request:true,history:[posting('a','2024-05-02')]});assert.equal(candidate(r,'c').fit,'review');
  assert(has(candidate(r,'c'),'Premature request'));
});
test('RPFC-I field to field needs exception; field to non-field fits',()=>{
  const r=assess({cadre:'RPFC-I',history:[posting('a',undefined,undefined,{cadre:'RPFC-I'})]});
  assert.equal(candidate(r,'c').fit,'review');assert.equal(candidate(r,'h').fit,'fit');
});
test('RPFC-II third consecutive field posting needs exception',()=>{
  const r=assess({history:[posting('a','2020-05-01','2023-05-01'),posting('b')]});
  assert.equal(candidate(r,'c').fit,'review');assert.equal(candidate(r,'h').fit,'fit');
});
test('adjacent administrative segments do not count as two field terms',()=>{
  const r=assess({history:[posting('a','2020-05-01','2023-05-01'),posting('a')]});
  assert.equal(r.fieldStreak,1);assert.equal(candidate(r,'c').fit,'fit');
});
test('consecutive RPFC-II OIC terms are excluded',()=>{
  const r=assess({history:[posting('b',undefined,undefined,{role:'oic'})]});
  assert.equal(candidate(r,'c','oic').fit,'exclude');assert(has(candidate(r,'c','oic'),'Consecutive OIC'));
});
test('consecutive APFC OIC terms are excluded',()=>{
  const r=assess({year:2027,cadre:'APFC',history:[posting('do','2023-05-01','',{cadre:'APFC',role:'oic'})]});
  assert(has(candidate(r,'b','oic'),'Consecutive OIC'));
});
test('previous OIC tenure at target office disallows repeat even after non-field',()=>{
  const r=assess({history:[posting('c','2018-05-01','2021-05-01',{role:'oic'}),posting('h','2021-05-01')]});
  assert(has(candidate(r,'c','oic'),'already served as OIC'));
});
test('unknown OIC history cannot clear OIC options',()=>assert.equal(candidate(assess({history:[posting('a',undefined,undefined,{role:'unknown'})]}),'c','oic').fit,'review'));
test('ACC zonal OIC is field; ordinary zonal assignment is non-field',()=>{
  assert.equal(R.field(offices.find(o=>o.id==='z'),'ACC','oic'),true);
  assert.equal(R.field(offices.find(o=>o.id==='z'),'RPFC-I','other'),false);
});
test('ACC HQ tenure and rotation clauses 3–6 are not applied',()=>{
  const r=assess({cadre:'ACC (HQ)',history:[posting('z','2025-05-01','',{cadre:'ACC (HQ)',role:'oic'})]});
  assert.equal(r.release,'Administrative assessment');assert(has(candidate(r,'h'),'exempt'));
  assert(!has(candidate(r,'h'),'Normal tenure is incomplete'));
});
test('nine continuous zone years require cooldown',()=>{
  const r=assess({history:[posting('a','2017-05-01','2020-05-01'),posting('b','2020-05-01')]});
  assert(has(candidate(r,'a'),'cooling-off'));assert(!has(candidate(r,'c'),'cooling-off'));
});
test('cooldown clears exactly after three evidenced years outside zone',()=>{
  const r=assess({history:[posting('a','2014-05-01','2023-05-01'),posting('h','2023-05-01')]});
  assert(!has(candidate(r,'b'),'cooling-off'));
  const before=assess({history:[posting('a','2014-05-02','2023-05-02'),posting('h','2023-05-02')]});
  assert(has(candidate(before,'b'),'cooling-off'));
});
test('missing history does not prove completed cooling-off',()=>{
  const r=assess({history:[posting('a','2013-05-01','2022-05-01'),posting('h','2025-05-01')]});
  assert(has(candidate(r,'b'),'cooling-off'));assert(r.warnings.some(w=>w.includes('gaps')));
});
test('returning before three outside years does not satisfy a prior cooldown',()=>{
  const r=assess({history:[posting('a','2014-05-01','2023-05-01'),posting('h','2023-05-01','2024-05-01'),posting('b','2024-05-01')]});
  assert(has(candidate(r,'a'),'cooling-off'));
});
test('a later full outside spell can satisfy cooldown after an early return',()=>{
  const r=assess({history:[posting('a','2009-05-01','2018-05-01'),posting('h','2018-05-01','2019-05-01'),posting('b','2019-05-01','2020-05-01'),posting('h','2020-05-01')]});
  assert(!has(candidate(r,'a'),'cooling-off'));
});
test('ZTI zone exemption alone does not prove three years outside a zone',()=>{
  const r=assess({history:[posting('a','2014-05-01','2023-05-01'),posting('t','2023-05-01')]});
  assert(has(candidate(r,'b'),'cooling-off'));
});
test('twelve cumulative years remain excluded after a cooldown',()=>{
  const r=assess({history:[posting('a','2008-05-01','2017-05-01'),posting('h','2017-05-01','2020-05-01'),posting('b','2020-05-01','2023-05-01'),posting('h')]});
  assert(has(candidate(r,'a'),'12-year cumulative'));
});
test('Delhi NCR is combined for tenure, HO/PDUNASS is separate',()=>{
  assert.equal(R.stationKey(offices[3]),R.stationKey(offices[4]));
  assert.notEqual(R.stationKey(offices[3]),R.stationKey(offices[5]));
  assert.equal(R.zoneKey(offices[5]),R.zoneKey(offices[6]));
  assert.equal(R.zoneKey(offices[7]),null);
});
test('minimum duty-office tenure is not overridden by a zonal limit',()=>{
  const r=assess({history:[posting('a','2015-05-01','2025-05-01'),posting('b','2025-05-01')]});
  assert.equal(r.release,'Minimum duty-office tenure still running');assert.equal(candidate(r,'c').fit,'review');
});
test('excluded service contributes no counted tenure and triggers continuity review',()=>{
  const r=assess({history:[posting('a','2010-05-01','2020-05-01',{excluded:true}),posting('h','2020-05-01')]});
  assert.equal(candidate(r,'b').zoneYears,0);assert.equal(candidate(r,'b').fit,'review');
});
test('overlaps, invalid dates and missing active record are rejected',()=>{
  assert(assess({history:[posting('a','2020-05-01','2024-01-01'),posting('b','2023-01-01')]}).errors.length);
  assert(assess({history:[posting('a','2025-02-29')]}).errors.length);
  assert(assess({history:[posting('a','2020-05-01','2026-05-01')]}).errors.length);
  assert(assess({history:[null]}).errors.length);
  assert(assess({history:[posting('a',undefined,undefined,{excluded:'true'})]}).errors.length);
});
test('joining on record date identifies the new duty office with zero tenure',()=>{
  const r=assess({history:[posting('a','2020-05-01','2026-05-01'),posting('b','2026-05-01')]});
  assert.deepEqual(r.errors,[]);assert.equal(r.current.officeId,'b');assert.equal(r.tenure,0);
});
test('future posting rows do not replace current record-date posting',()=>{
  const r=assess({history:[posting('a','2020-05-01','2026-06-01'),posting('b','2026-06-01','2029-06-01')]});
  assert.equal(r.current.officeId,'a');
});
test('APFC district block is limited to 2026 and OIC role',()=>{
  const r=assess({cadre:'APFC',history:[posting('h',undefined,undefined,{cadre:'APFC'})]});
  assert(has(candidate(r,'do','oic'),'blocked'));assert(!has(candidate(r,'do','other'),'blocked'));
  assert(!has(candidate(assess({cadre:'APFC',year:2027,history:[posting('h',undefined,undefined,{cadre:'APFC'})]}),'do','oic'),'blocked'));
});
test('promotion, special cases and impending retirement route to review',()=>{
  for(const extra of [{promotionDue:true},{promoted:true},{special:true},{retirementDate:'2027-01-31'},{groupBPromotion:true}])assert.equal(candidate(assess(extra),'c').fit,'review');
});
test('retired officer is not recommended a next posting',()=>assert.equal(candidate(assess({retirementDate:'2026-04-30'}),'c').fit,'exclude'));
test('draft assessment never becomes user-confirmed on its own',()=>{
  const r=assess({confirmed:false});assert.equal(r.confirmed,false);assert(r.warnings.some(w=>w.includes('Illustrative')));
});
const snapshot=(positions=[])=>({schema_version:1,agt_year:2026,as_of:'2026-01-01',source_url:'https://example.gov.in/circular.pdf',positions});
const vacancy=(extra={})=>({office_id:'c',cadre:'RPFC-II',role:'other',sanctioned:3,blocked:0,clear:1,probable:0,selectable:true,...extra});
test('unknown counts remain null; no vacancy is manufactured',()=>{
  const s=R.validateSnapshot(snapshot([vacancy({sanctioned:null,blocked:null,clear:null,probable:null,selectable:null})]),offices);
  assert.equal(candidate(assess({},s),'c').vacancy.clear,null);assert.equal(candidate(assess({},s),'c').availability,'Vacancy not verified');
});
test('incompatible year snapshot is ignored',()=>{
  const s=snapshot([vacancy()]);s.agt_year=2025;assert.equal(candidate(assess({},s),'c').vacancy,null);
});
test('blocked and explicitly unavailable targets are excluded',()=>{
  for(const extra of [{selectable:false},{sanctioned:3,blocked:3,selectable:null}])assert.equal(candidate(assess({},R.validateSnapshot(snapshot([vacancy(extra)]),offices)),'c').fit,'exclude');
});
test('a probable-only vacancy remains conditional',()=>{
  const r=assess({},R.validateSnapshot(snapshot([vacancy({clear:0,probable:2,selectable:null})]),offices));
  assert.equal(candidate(r,'c').availability,'Probable vacancy only');
});
test('invalid snapshots are rejected atomically',()=>{
  for(const rows of [[vacancy(),vacancy()],[vacancy({office_id:'city-total'})],[vacancy({clear:-1})],[vacancy({clear:'1'})],[vacancy({blocked:4})],[vacancy({sanctioned:0})],[vacancy({selectable:'yes'})]])assert.throws(()=>R.validateSnapshot(snapshot(rows),offices));
  assert.throws(()=>R.validateSnapshot({...snapshot(),source_url:'javascript:alert(1)'},offices));
});
test('current duty office and incompatible OIC ranks are explicit exclusions',()=>{
  assert.equal(candidate(assess(),'a').fit,'exclude');assert(has(candidate(assess(),'a','oic'),'does not match'));
});
test('role and vacancy availability remain separate from policy fit',()=>{
  assert.equal(candidate(assess(),'c').fit,'fit');assert.equal(candidate(assess(),'c').availability,'Vacancy not verified');
});
