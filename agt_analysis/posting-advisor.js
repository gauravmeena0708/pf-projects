(function () {
  'use strict';
  const R=window.PostingRules;
  const state={officers:[],offices:[],selected:null,history:[],snapshot:null,shortlist:[],result:null,limit:12};
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const title=s=>String(s).toLowerCase().replace(/\b\w/g,c=>c.toUpperCase());
  const option=(value,label,selected)=>`<option value="${esc(value)}" ${value===selected?'selected':''}>${esc(label)}</option>`;
  const iso=s=>{ const m=/^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s||'');return m?`${m[3]}-${m[2]}-${m[1]}`:''; };
  const displayDate=s=>s?new Date(s+'T00:00:00Z').toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}):'Unknown';
  const fitLabel={fit:'Potential policy fit',review:'Needs review',exclude:'Not a normal option'};
  const zoneMappings=[
    ['ANDHRAPRADESH','zo-andhra-pradesh-vijayawada'],['BENGALURU','zo-bengaluru-bengaluru'],['BIHAR','zo-bihar-jharkhand-patna'],
    ['CHENNAI','zo-chennai-puducherry-chennai'],['DELHI','zo-delhi-uttarakhand-jammu-kashmir-and-ladakh'],['GUJARAT','zo-gujarat-ahmedabad'],
    ['HARYANA','zo-haryana'],['JAMMU','zo-jammu-kashmir-ladakh'],['KARNATAKA','zo-karnataka-other-than-bengaluru-goa-hubli'],
    ['KERALA','zo-kerala-lakshadweep-thiruvananthapuram'],['MADHYA','zo-madhya-pradesh-chattisgarh-bhopal'],['MAHARASHTRA','zo-maharashtra-excluding-mumbai-pune'],
    ['MUMBAI1','zo-bandra'],['MUMBAI2','zo-thane'],['NORTHEASTERN','zo-ner-guwahati'],['ORISSA','zo-orissa-bhubaneswar'],
    ['PUNJAB','zo-punjab-himachal-pradesh'],['RAJASTHAN','zo-rajasthan'],['TAMIL','zo-tamil-nadu-excluding-chennai'],['TELANGANA','zo-telangana-hyderabad'],
    ['UTTARPRADESH','zo-uttar-pradesh'],['WB','zo-wb-a-n-islands-sikkim-kolkata']
  ];
  function makeOffices(dictionary,catalogue) {
    const map=new Map();
    Object.values(dictionary).forEach(o=>map.set(o.id,{...o,type:o.cat,sourcePage:null,oicCadre:null}));
    const aliases={KUKATPALLY:'ro-kukatpalli',VASHI:'ro-vashi',MUMBAIBANDRA:'ro-bandra',HYDERABADBARKATPURA:'ro-hyderabad-barkatpura'};
    // All matches are exact normalized names or explicit aliases. Do not fuzzy
    // match a station to an office, because many stations contain several ROs.
    catalogue.offices.forEach(row=>{
      const n=R.normal(row.name), old=[...map.values()].find(o=>R.normal(o.name)===n || (aliases[n] && o.id===aliases[n]));
      const zn=R.normal(row.zone), zoneId=zoneMappings.find(([prefix])=>zn.startsWith(prefix))?.[1] || `source-zone-${zn.toLowerCase()}`;
      let station=old?.station || title(row.name.replace(/^RO /,'').split('(')[0].trim());
      for(const [pattern,value] of [[/^DELHI/,'Delhi'],[/^MUMBAI/,'Mumbai'],[/^CHENNAI/,'Chennai'],[/^BENGALURU/,'Bengaluru'],[/^HYDERABAD/,'Hyderabad'],[/^PUNE|^ROPUNE/,'Pune'],[/^GURUGRAM/,'Gurugram']]) if(pattern.test(n)) station=value;
      if(row.serial===22) station='Hyderabad';
      const id=old?.id || `agt-ro-${row.serial}`;
      map.set(id,{...old,id,name:`Regional Office ${title(row.name.replace(/^RO /,''))}`,type:'Regional Office',station,zone:title(row.zone),zoneId,
        sourcePage:row.source_page,oicCadre:row.oic_cadre,sourceDate:row.effective_date,originalName:row.original_name});
    });
    for(const o of map.values()) {
      if(o.zoneId==='zo-north-eastern-region-guwahati') o.zoneId='zo-ner-guwahati';
      if(/PDUNASS|NATRSS/i.test(o.name)) o.type='PDUNASS';
      o.hard=o.zoneId==='zo-ner-guwahati' || /JAMMU|SRINAGAR|LADAKH|LEH|PORTBLAIR/.test(R.normal(o.station));
      o.state=null; // Parent-state checks remain unknown until an authoritative crosswalk is supplied.
    }
    // Use one zone label per ID in selectors, preferring the official annexure label.
    const names=new Map([...map.values()].filter(o=>o.sourcePage).map(o=>[o.zoneId,o.zone]));
    for(const o of map.values()) if(names.has(o.zoneId)) o.zone=names.get(o.zoneId);
    return [...map.values()].sort((a,b)=>a.name.localeCompare(b.name));
  }
  function zoneOptions(selected='',empty='All zones') {
    const zones=new Map(state.offices.map(o=>[o.zoneId,o.zone]));
    return option('',empty,selected)+[...zones].sort((a,b)=>a[1].localeCompare(b[1])).map(([id,label])=>option(id,label,selected)).join('');
  }
  function officeOptions(selected) {return option('','Select office',selected)+state.offices.map(o=>option(o.id,o.name,selected)).join('');}
  function say(message) {$('advisorLive').textContent=message;}
  function saveShortlist(){try{localStorage.setItem(`agt-shortlist-${state.selected.eid}`,JSON.stringify({year:Number($('advisorYear').value),cadre:$('advisorCadre').value,keys:state.shortlist}));}catch{say('Browser storage is unavailable. The shortlist will last for this session.');}}
  function download(name,value) {
    const a=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));
    a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  async function mount(data) {
    if(state.mounted) return;
    state.mounted=true;
    const response=await fetch('oic-catalogue.json');
    if(!response.ok) throw new Error('The OIC office catalogue could not be loaded.');
    state.officers=data.officers;
    state.offices=makeOffices(data.officeDictionary,await response.json());
    // Keep unresolved historical labels editable without making them candidate
    // posting units. They are not part of the verified office catalogue.
    for(const officer of state.officers)for(const p of officer.postings)if(!state.offices.some(o=>o.id===p.officeId))state.offices.push({id:p.officeId,name:p.officeName,station:p.station,zone:p.zone,zoneId:p.zoneId||p.zone,type:p.category,hard:false,historyOnly:true});
    state.offices.sort((a,b)=>a.name.localeCompare(b.name));
    $('mainContent').innerHTML=`
      <section class="advisor-heading"><div><div class="advisor-kicker">An informed next move</div><h1>Where could you serve next?</h1><p>Choose an officer. Review their service history. Explore postings with an explanation of the AGT rules and the vacancy evidence behind each option.</p></div></section>
      <section class="advisor-step"><div class="advisor-step-header"><span class="advisor-step-number">1</span><h2>Find an officer</h2></div>
        <div class="advisor-search-row"><label>Search the historical roster<input id="advisorSearch" type="search" placeholder="Initials, officer ID or historical office" autocomplete="off" aria-controls="advisorPeople"></label>
        <label>Assess in cadre<select id="advisorCadre">${R.CADRES.map(c=>option(c,c,'APFC')).join('')}</select></label>
        <label>AGT cycle<select id="advisorYear">${[2025,2026,2027].map(y=>option(String(y),String(y),'2026')).join('')}</select></label></div>
        <p class="advisor-muted">${state.officers.length} anonymized officer profiles. Names appear as initials; office and cadre labels are inferred from historical records.</p>
        <div id="advisorPeople" class="advisor-search-results"></div><div id="advisorPerson"></div>
      </section>
      <section id="advisorReview" hidden class="advisor-step"></section>
      <div id="advisorLive" class="advisor-live" role="status" aria-live="polite"></div>
      <section id="advisorAssessment"></section>
      <details class="advisor-source-panel"><summary>Sources, coverage and how to read the results</summary><ul>
        <li><a href="${R.POLICY}" target="_blank" rel="noopener">TP-CC 2025</a>: tenure, cooling-off, rotation and request routes. Record date is 1 May of the selected AGT year (§6.2). Applicable later instructions still need review.</li>
        <li><a href="research/sources/Order_RedistributionOfCommissionerCadre.pdf" target="_blank" rel="noopener">April 2025 OIC catalogue</a>: 150 ROs, with <a href="research/sources/Final_ModificationOrder-3.pdf" target="_blank" rel="noopener">July 2025 name amendments</a>. Other offices come from the existing historical directory; their post counts and classifications need confirmation.</li>
        <li><a href="research/sources/Circular_sanctioned_strength_23092022.pdf" target="_blank" rel="noopener">2022 sanctioned strengths</a> are available for reference. They have not been turned into current vacancies. OIC rank is not sanctioned strength.</li>
        <li><a href="https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2025-2026/Circular_AGT_31122025_Final.pdf" target="_blank" rel="noopener">Indexed AGT 2026 circular</a>: APFC-headed DO blocking is flagged for that cycle only. The January 2026 addendum and February 2026 redistribution remain unverified.</li>
        <li>Sorting is a planning aid: policy fit, reported selectable status, your preferred zone, then lower recorded zone exposure. It is not CTPC priority ranking or a prediction of selection. All seats require cadre/role and availability confirmation.</li>
        <li>Station and zone classifications come from a historical directory. Reorganisations, boundaries, additional-charge service, sensitive-post restrictions and individual exemptions need HRM checks.</li>
      </ul><div class="advisor-toolbar"><a href="posting-advisor-data.md">Data import guide</a><button class="advisor-secondary" id="advisorTemplate">Download vacancy template</button><label class="advisor-secondary">Load vacancy snapshot<input id="advisorVacancy" type="file" accept=".json,application/json"></label><button class="advisor-secondary" id="advisorClearSnapshot">Clear supplied snapshot</button></div><p id="advisorSnapshotStatus" class="advisor-muted">No office-wise vacancy snapshot loaded. Nothing is labelled as a confirmed vacancy.</p></details>`;
    $('advisorSearch').addEventListener('input',renderSearch);
    $('advisorSearch').addEventListener('keydown',e=>{if(e.key==='ArrowDown'||e.key==='Enter'){const first=$('advisorPeople').querySelector('button');if(first){e.preventDefault();if(e.key==='Enter')first.click();else first.focus();}}});
    $('advisorPeople').addEventListener('click',e=>{const b=e.target.closest('[data-officer]');if(b)select(b.dataset.officer);});
    $('advisorCadre').addEventListener('change',()=>{state.shortlist=[];if(state.selected){saveShortlist();calculate();}});
    $('advisorYear').addEventListener('change',()=>{if(state.selected){$('advisorConfirmed').checked=false;state.shortlist=[];saveShortlist();calculate();}});
    $('advisorTemplate').addEventListener('click',()=>download('agt-vacancy-template.json',{schema_version:1,agt_year:Number($('advisorYear').value),as_of:'2026-01-01',source_url:'https://www.epfindia.gov.in/',positions:[],office_directory:state.offices.map(o=>({office_id:o.id,name:o.name,station:o.station,zone:o.zone}))}));
    $('advisorVacancy').addEventListener('change',loadSnapshot);
    $('advisorClearSnapshot').addEventListener('click',()=>{state.snapshot=null;$('advisorSnapshotStatus').textContent='No office-wise vacancy snapshot loaded.';if(state.selected)calculate();});
    renderSearch();
    const eid=new URLSearchParams(location.search).get('eid');
    if(eid){if(state.officers.some(o=>o.eid===eid))select(eid);else say('That officer ID was not found. Select an officer from the roster.');}
    else $('advisorAssessment').innerHTML='<div class="advisor-empty">Start with an officer above.<br>Their posting history will shape the options shown here.</div>';
  }
  function renderSearch() {
    const q=$('advisorSearch').value.trim().toLowerCase();
    const matches=state.officers.filter(o=>`${o.name} ${o.eid} ${o.currentOffice} ${o.currentDesignation}`.toLowerCase().includes(q));
    $('advisorPeople').innerHTML=matches.slice(0,8).map(o=>`<button class="advisor-person" data-officer="${esc(o.eid)}" aria-pressed="${state.selected?.eid===o.eid}"><strong>${esc(o.name)} <small>· ${esc(o.eid)}</small></strong><span class="advisor-muted">${esc(o.currentDesignation)} · ${esc(o.currentOffice)} (historical)</span></button>`).join('') || '<p class="advisor-muted">No matching officers. Try initials or an officer ID.</p>';
    if(matches.length>8)$('advisorPeople').insertAdjacentHTML('beforeend',`<p class="advisor-muted">Showing 8 of ${matches.length} matches. Refine your search.</p>`);
  }
  function select(eid) {
    if(state.selected?.eid===eid)return;
    state.selected=state.officers.find(o=>o.eid===eid); if(!state.selected)return;
    const o=state.selected;
    $('advisorCadre').value=R.CADRES.includes(o.currentDesignation)?o.currentDesignation:'APFC';
    state.history=o.postings.map(p=>({officeId:state.offices.some(x=>x.id===p.officeId)?p.officeId:'',start:iso(p.fromDate),end:iso(p.toDate),cadre:p.designation,role:'unknown',excluded:/deputation|foreign service|study leave/i.test(p.event)}));
    // Blank end means the posting continues to the record date. Historical
    // dates remain visibly unconfirmed until the user corrects every row.
    try{const saved=JSON.parse(localStorage.getItem(`agt-shortlist-${eid}`)||'null');state.shortlist=saved?.year===Number($('advisorYear').value)&&saved?.cadre===$('advisorCadre').value&&Array.isArray(saved.keys)?saved.keys.filter(s=>typeof s==='string').slice(0,5):[];}catch{state.shortlist=[];}
    history.replaceState(null,'',`posting-advisor.html?eid=${encodeURIComponent(eid)}`);
    $('advisorPerson').innerHTML=`<div class="advisor-selected"><div><strong>${esc(o.name)}</strong><p>${esc(o.eid)} · Historical profile selected</p></div><a href="officer-profile.html?eid=${encodeURIComponent(eid)}">Open full officer profile ↗</a></div>`;
    renderSearch();renderReview();calculate();
  }
  function renderReview() {
    const section=$('advisorReview');section.hidden=false;
    section.innerHTML=`<div class="advisor-step-header"><span class="advisor-step-number">2</span><h2>Review the officer’s service</h2></div>
      <div class="advisor-notice">These bundled records end in 2023 and contain randomized dates. Correct the joining dates, duty offices, grades and OIC assignments before confirming this history. Unconfirmed results are illustrative. Export your edited history before switching officers or leaving this page.</div>
      <details id="advisorHistoryDetails"><summary>Review and edit ${state.history.length} historical posting(s)</summary><p class="advisor-muted">Use actual joining dates. End dates are exclusive; leave the current posting’s end blank. Include every substantive posting and mark excluded service explicitly.</p><div id="advisorHistory" class="advisor-history"></div><button id="advisorAddHistory" class="advisor-secondary">Add posting</button></details>
      <div class="advisor-grid"><label class="check-label"><input type="checkbox" id="advisorRequest">Officer is requesting a transfer</label><label class="check-label"><input type="checkbox" id="advisorPromotionDue">Promotion expected within one year</label><label class="check-label"><input type="checkbox" id="advisorPromoted">Recently promoted / posting on promotion</label><label class="check-label"><input type="checkbox" id="advisorGroupB">Initial promotion from Group B to A</label><label class="check-label"><input type="checkbox" id="advisorSpecial">Spouse, disability or caregiver consideration</label><label>Actual retirement date, if known<input type="date" id="advisorRetirement"></label><label>Preferred next zone (optional)<select id="advisorPreferred">${zoneOptions('','No zone preference')}</select></label></div>
      <p class="advisor-muted">Group B → A parent-state boundaries and individual DoPT concessions are flagged for review; they are not automatically cleared.</p>
      <label class="check-label"><input type="checkbox" id="advisorConfirmed">I have corrected and confirmed the complete substantive service history, including the posting on 1 May of the selected year.</label>
      <div class="advisor-toolbar" style="margin-top:16px"><button class="advisor-primary" id="advisorCalculate">Review possible postings</button><button class="advisor-secondary" id="advisorExportHistory">Export edited history</button><label class="advisor-secondary">Load corrected history<input type="file" id="advisorImportHistory" accept=".json,application/json"></label></div>`;
    renderHistory();
    section.onchange=onReviewChange;
    $('advisorAddHistory').onclick=()=>{state.history.push({officeId:'',start:'',end:'',cadre:$('advisorCadre').value,role:'unknown',excluded:false});$('advisorConfirmed').checked=false;renderHistory();calculate();};
    $('advisorCalculate').onclick=calculate;
    $('advisorExportHistory').onclick=()=>download(`officer-history-${state.selected.eid}.json`,{eid:state.selected.eid,history:state.history});
    $('advisorImportHistory').onchange=loadHistory;
  }
  function renderHistory() {
    $('advisorHistory').innerHTML=`<table><thead><tr><th>Duty office</th><th>Joined</th><th>End (exclusive)</th><th>Cadre</th><th>Role</th><th>Excluded service</th><th>Remove</th></tr></thead><tbody>${state.history.map((h,i)=>`<tr data-row="${i}"><td><select data-field="officeId" aria-label="Posting ${i+1} office">${officeOptions(h.officeId)}</select></td><td><input data-field="start" type="date" value="${esc(h.start)}" aria-label="Posting ${i+1} joining date"></td><td><input data-field="end" type="date" value="${esc(h.end)}" aria-label="Posting ${i+1} end date"></td><td><select data-field="cadre" aria-label="Posting ${i+1} cadre">${R.CADRES.map(c=>option(c,c,h.cadre)).join('')}</select></td><td><select data-field="role" aria-label="Posting ${i+1} role">${[['unknown','Not confirmed'],['oic','OIC'],['other','Non-OIC']].map(([v,l])=>option(v,l,h.role)).join('')}</select></td><td><input type="checkbox" data-field="excluded" ${h.excluded?'checked':''} aria-label="Posting ${i+1} is deputation, foreign assignment or study leave"></td><td><button class="advisor-delete" data-remove="${i}" aria-label="Remove posting ${i+1}">×</button></td></tr>`).join('')}</tbody></table>`;
    $('advisorHistory').onclick=e=>{const b=e.target.closest('[data-remove]');if(b){state.history.splice(Number(b.dataset.remove),1);$('advisorConfirmed').checked=false;renderHistory();calculate();}};
  }
  function onReviewChange(e) {
    if(e.target.dataset.field){const row=Number(e.target.closest('[data-row]').dataset.row);state.history[row][e.target.dataset.field]=e.target.type==='checkbox'?e.target.checked:e.target.value;$('advisorConfirmed').checked=false;}
    if(e.target.type!=='file')calculate();
  }
  function context() {
    return {year:Number($('advisorYear').value),cadre:$('advisorCadre').value,history:state.history,confirmed:$('advisorConfirmed').checked,
      request:$('advisorRequest').checked,promotionDue:$('advisorPromotionDue').checked,promoted:$('advisorPromoted').checked,groupBPromotion:$('advisorGroupB').checked,
      special:$('advisorSpecial').checked,retirementDate:$('advisorRetirement').value,preferredZone:$('advisorPreferred').value};
  }
  function calculate() {
    if(!state.selected)return;
    const prev={search:$('advisorOfficeFilter')?.value||'',fit:$('advisorFitFilter')?.value||'normal',role:$('advisorRoleFilter')?.value||''};
    state.result=R.assess(context(),state.offices,state.snapshot);state.limit=12;
    const r=state.result;
    if(r.errors.length){$('advisorAssessment').innerHTML=`<div class="advisor-error" role="alert"><strong>Review the service history to continue.</strong><ul>${r.errors.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`;return;}
    // Remove saved choices invalidated by an officer/cadre/year/history change.
    state.shortlist=state.shortlist.filter(k=>r.candidates.some(c=>c.key===k&&c.fit!=='exclude'));saveShortlist();
    $('advisorAssessment').innerHTML=`<div class="advisor-step-header"><span class="advisor-step-number">3</span><h2>Explore next postings</h2></div>
      <div class="advisor-notice ${r.confirmed?'neutral':''}"><strong>${r.confirmed?'Using user-confirmed service history':'Illustrative results · historical data'}</strong><br>${r.confirmed?'Policy checks use the facts you confirmed. Post strength, vacancies, later amendments and individual exceptions still require confirmation.':esc(r.warnings[0])}</div>
      ${r.warnings.slice(r.confirmed?0:1).map(w=>`<p class="advisor-muted">${esc(w)}</p>`).join('')}
      ${state.snapshot && state.snapshot.agt_year!==Number($('advisorYear').value)?'<p class="advisor-error">The supplied vacancy snapshot is for another AGT year and is not used.</p>':''}
      <div class="advisor-summary"><div class="advisor-stat"><span class="advisor-muted">Officer’s transfer route</span><b>${esc(r.release)}</b><span class="advisor-muted">${r.tenure.toFixed(1)} years in current duty-office segment · ${r.fieldStreak} continuous field posting(s) in selected grade</span></div><div class="advisor-stat"><span class="advisor-muted">AGT record date · §6.2</span><b>1 May ${esc($('advisorYear').value)}</b><span class="advisor-muted">The joining date determines tenure.</span></div><div class="advisor-stat"><span class="advisor-muted">Vacancy evidence</span><b>${state.snapshot?.agt_year===Number($('advisorYear').value)?displayDate(state.snapshot.as_of):'Not verified'}</b><span class="advisor-muted">${state.snapshot?'Supplied snapshot date; not a live vacancy feed.':'Unknown counts are never treated as zero.'}</span></div></div>
      <div class="advisor-layout"><div><div class="advisor-filters"><label>Find an office or zone<input type="search" id="advisorOfficeFilter" value="${esc(prev.search)}" placeholder="Office, station or zone"></label><label>Policy result<select id="advisorFitFilter">${[['normal','Possible / review'],['fit','Potential policy fit'],['review','Needs review'],['exclude','Not a normal option'],['all','All results']].map(([v,l])=>option(v,l,prev.fit)).join('')}</select></label><label>Target role<select id="advisorRoleFilter">${[['','All roles'],['oic','OIC'],['other','Non-OIC']].map(([v,l])=>option(v,l,prev.role)).join('')}</select></label></div><p id="advisorResultCount" class="advisor-muted" aria-live="polite"></p><div id="advisorResults" class="advisor-results"></div><button class="advisor-secondary" id="advisorMore" style="margin-top:14px">Show more postings</button></div><aside id="advisorShortlist" class="advisor-shortlist" aria-label="Five-station shortlist"></aside></div>`;
    ['advisorOfficeFilter','advisorFitFilter','advisorRoleFilter'].forEach(id=>$(id).addEventListener(id==='advisorOfficeFilter'?'input':'change',()=>{state.limit=12;renderCandidates();}));
    $('advisorMore').onclick=()=>{state.limit+=12;renderCandidates();};
    $('advisorResults').onclick=e=>{const b=e.target.closest('[data-add]');if(b)addShortlist(b.dataset.add);};
    renderCandidates();renderShortlist();
  }
  function sourceLink(c,check) {
    if(check.rule==='OIC order')return `research/sources/Order_RedistributionOfCommissionerCadre.pdf#page=${c.office.sourcePage}`;
    if(check.rule==='2026 blocked-post circular')return 'https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2025-2026/Circular_AGT_31122025_Final.pdf';
    return `${R.POLICY}#page=${check.page}`;
  }
  function renderCandidates() {
    const q=$('advisorOfficeFilter').value.toLowerCase(),fit=$('advisorFitFilter').value,role=$('advisorRoleFilter').value;
    const candidates=state.result.candidates.filter(c=>(fit==='all'||(fit==='normal'?c.fit!=='exclude':c.fit===fit))&&(!role||c.role===role)&&`${c.office.name} ${c.office.station} ${c.office.zone}`.toLowerCase().includes(q));
    $('advisorResultCount').textContent=`${candidates.length} office/role options · ${state.result.confirmed?'Assessment of supplied facts':'Illustrative assessment'} · order is not a selection probability`;
    $('advisorResults').innerHTML=candidates.slice(0,state.limit).map(c=>{
      const reason=c.checks.find(x=>x.level==='exclude')||c.checks.find(x=>x.level==='review')||c.checks.find(x=>x.level==='fit');
      const taken=state.shortlist.includes(c.key);
      return `<article class="posting-card"><div class="posting-card-top"><div><h3>${esc(c.office.name)}</h3><p class="advisor-muted">${esc(c.office.station)} · ${esc(c.office.zone)}</p><p class="advisor-muted">${c.role==='oic'?'Officer-in-charge':'Non-OIC role'} · ${R.field(c.office,$('advisorCadre').value,c.role)?'Field':'Non-field'}${c.office.hard?' · Hard station':''}</p></div><span class="advisor-tag ${c.fit}">${fitLabel[c.fit]}</span></div><p class="posting-reason">${esc(reason?.text||'No conflict found in the implemented checks; confirm remaining conditions.')}</p><p class="advisor-muted"><strong>${esc(c.availability)}</strong></p><dl class="posting-facts">${[['sanctioned','Sanctioned'],['blocked','Blocked'],['clear','Clear vacancy'],['probable','Probable vacancy']].map(([k,l])=>`<div><dt>${l}</dt><dd>${c.vacancy?.[k]??'—'}</dd></div>`).join('')}</dl><p class="advisor-muted">${c.office.oicCadre?`OIC rank: ${esc(c.office.oicCadre)} · historical order ${displayDate(c.office.sourceDate)}. `:'Role strength not established by the loaded catalogue. '}Confirm the post’s current cadre and role before applying.</p><details><summary>Why this result · ${c.checks.length} policy checks</summary><ul class="advisor-checks">${c.checks.map(check=>`<li>${esc(check.text)} <a href="${esc(sourceLink(c,check))}" target="_blank" rel="noopener">§ ${esc(check.rule)} ↗</a></li>`).join('')}</ul></details><div class="advisor-toolbar"><button class="advisor-secondary" data-add="${esc(c.key)}" ${c.fit==='exclude'||taken?'disabled':''}>${taken?'In shortlist':'Add to shortlist'}</button>${c.office.sourcePage?`<a class="advisor-muted" href="research/sources/Order_RedistributionOfCommissionerCadre.pdf#page=${c.office.sourcePage}" target="_blank" rel="noopener">Office source ↗</a>`:''}</div></article>`;
    }).join('')||'<div class="advisor-empty">No postings match these filters.<br>Try “Needs review” or “All results” to see the rule explanations.</div>';
    $('advisorMore').hidden=candidates.length<=state.limit;
  }
  function addShortlist(key) {
    const c=state.result.candidates.find(x=>x.key===key);if(!c||c.fit==='exclude')return;
    const existing=state.shortlist.map(k=>state.result.candidates.find(x=>x.key===k)).filter(Boolean);
    // HR options are stations, not one choice per office. HO/PDUNASS uses its
    // separate policy entity; the chosen office/role remains explicit.
    if(existing.some(x=>R.normal(x.office.station)===R.normal(c.office.station))){say('This station is already shortlisted. Remove its existing office choice to choose another office or role there.');return;}
    if(state.shortlist.length>=5){say('Five stations are already shortlisted. Remove one before adding another.');return;}
    state.shortlist.push(key);saveShortlist();renderCandidates();renderShortlist();say('Added to your planning shortlist.');
  }
  function renderShortlist() {
    const choices=state.shortlist.map(k=>state.result.candidates.find(c=>c.key===k)).filter(Boolean);
    $('advisorShortlist').innerHTML=`<div class="advisor-kicker">Your preferences</div><h3>Five-station shortlist</h3><p class="advisor-muted">${choices.length} of 5 stations · saved on this browser for this officer. This does not submit an application.</p>${choices.length?`<ol>${choices.map((c,i)=>`<li><strong>${esc(c.office.station)}</strong><div class="advisor-muted">${esc(c.office.name)} · ${c.role==='oic'?'OIC':'Non-OIC'}<br>${fitLabel[c.fit]} · ${esc(c.availability)}</div><button class="advisor-secondary" data-move="${i}" ${i===0?'disabled':''} aria-label="Move ${esc(c.office.station)} up">Move up</button><button class="advisor-secondary" data-drop="${i}" aria-label="Remove ${esc(c.office.station)}">Remove</button></li>`).join('')}</ol>`:'<p class="advisor-muted">Add a posting to compare your preferred stations here. Each choice retains its rule and vacancy caveats.</p>'}<button class="advisor-primary" id="advisorExport" ${!choices.length?'disabled':''}>Export shortlist</button><p class="advisor-muted">Confirm post availability, the final circular and your applicable concessions in HR-Soft before filing options.</p>`;
    $('advisorShortlist').onclick=e=>{
      const drop=e.target.closest('[data-drop]'),move=e.target.closest('[data-move]');
      if(drop)state.shortlist.splice(Number(drop.dataset.drop),1);
      if(move){const i=Number(move.dataset.move);if(i>0)[state.shortlist[i-1],state.shortlist[i]]=[state.shortlist[i],state.shortlist[i-1]];}
      if(drop||move){saveShortlist();renderCandidates();renderShortlist();}
    };
    $('advisorExport').onclick=()=>download(`agt-${$('advisorYear').value}-shortlist-${state.selected.eid}.json`,{officer_id:state.selected.eid,agt_year:Number($('advisorYear').value),cadre:$('advisorCadre').value,record_date:`${$('advisorYear').value}-05-01`,history_user_confirmed:state.result.confirmed,policy:'TP-CC 2025; later amendments not fully verified',vacancy_snapshot:state.snapshot?{as_of:state.snapshot.as_of,source_url:state.snapshot.source_url}:null,not_an_application:true,choices:choices.map(c=>({office_id:c.office.id,office:c.office.name,station:c.office.station,role:c.role,result:fitLabel[c.fit],availability:c.availability,checks:c.checks}))});
  }
  async function loadSnapshot(e) {
    const file=e.target.files[0];if(!file)return;
    try{if(file.size>2e6)throw new Error('Use a JSON file smaller than 2 MB.');const parsed=JSON.parse(await file.text());const snapshot=R.validateSnapshot(parsed,state.offices);state.snapshot=snapshot;$('advisorSnapshotStatus').textContent=`${snapshot.positions.length} supplied office/cadre/role rows · AGT ${snapshot.agt_year} · as of ${displayDate(snapshot.as_of)} · ${snapshot.source_url}`;if(state.selected)calculate();say('Snapshot loaded in this session. Figures are labelled as supplied, not independently certified.');}catch(err){say(`Snapshot not loaded: ${err.message}`);}finally{e.target.value='';}
  }
  async function loadHistory(e) {
    const file=e.target.files[0];if(!file)return;const eid=state.selected.eid;
    try{if(file.size>2e6)throw new Error('Use a JSON file smaller than 2 MB.');const parsed=JSON.parse(await file.text());if(state.selected.eid!==eid)throw new Error('Officer changed while reading the file. Load it again.');if(parsed.eid!==eid)throw new Error('The history officer ID does not match the selected officer.');if(!Array.isArray(parsed.history)||parsed.history.length>150)throw new Error('Supply at most 150 postings.');const check=R.validateHistory(parsed.history,state.offices,R.date(`${$('advisorYear').value}-05-01`));if(check.errors.length)throw new Error(check.errors.join(' '));state.history=parsed.history.map(h=>({officeId:h.officeId,start:h.start,end:h.end||'',cadre:h.cadre,role:h.role,excluded:h.excluded===true}));$('advisorConfirmed').checked=false;renderHistory();calculate();say('Corrected history loaded. Review it and confirm completeness before relying on results.');}catch(err){say(`History not loaded: ${err.message}`);}finally{e.target.value='';}
  }
  window.PostingAdvisor={mount,createCatalogue:makeOffices};
})();
