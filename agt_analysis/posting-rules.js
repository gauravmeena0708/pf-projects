/* TP-CC 2025 decision support. Pure functions shared by the UI and tests.
 * Dates are UTC, joining-inclusive and end-exclusive. No selection probabilities.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PostingRules = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const CADRES = ['APFC', 'RPFC-II', 'RPFC-I', 'ACC', 'ACC (HQ)'];
  const POLICY = 'research/sources/TransferPolicy_CommissionerCadreFinal-1.pdf';
  const DAY = 86400000;
  const normal = s => String(s || '').toUpperCase().replace(/REGIONAL OFFICE|DISTRICT OFFICE|ZONAL OFFICE|\bRO\b|\bZO\b|\bDO\b/g, '').replace(/[^A-Z0-9]/g, '');
  function date(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null;
    const d = new Date(value + 'T00:00:00Z');
    return Number.isFinite(+d) && d.toISOString().slice(0, 10) === value ? +d : null;
  }
  function anniversary(start, years) {
    const d = new Date(start), month = d.getUTCMonth();
    d.setUTCFullYear(d.getUTCFullYear() + years);
    if (d.getUTCMonth() !== month) d.setUTCDate(0);
    return +d;
  }
  function yearsBetween(start, end) {
    if(end<=start)return 0;
    let whole=new Date(end).getUTCFullYear()-new Date(start).getUTCFullYear();
    if(anniversary(start,whole)>end)whole--;
    const base=anniversary(start,whole), next=anniversary(start,whole+1);
    return whole+(end-base)/(next-base);
  }
  function field(office, cadre, role) {
    if (office.type === 'Zonal Office') return cadre === 'ACC' && role === 'oic';
    return ['Regional Office', 'District Office', 'Special State Office'].includes(office.type);
  }
  function zoneKey(office) {
    if (['Head Office', 'PDUNASS'].includes(office.type)) return 'HO-PDUNASS';
    if (office.type === 'Training Institute') return null;
    return office.zoneId || office.zone;
  }
  function stationKey(office) {
    if (['Head Office', 'PDUNASS'].includes(office.type)) return 'HO-PDUNASS';
    const s = normal(office.station);
    if (['DELHI','NEWDELHI','NOIDA','GREATERNOIDA','FARIDABAD','GHAZIABAD','GURGAON','GURUGRAM'].includes(s)) return 'DELHI-NCR';
    const aliases = { BANGALORE:'BENGALURU', BOMBAY:'MUMBAI', CALCUTTA:'KOLKATA' };
    return aliases[s] || s;
  }
  const METROS = new Set(['DELHI-NCR','MUMBAI','CHENNAI','BENGALURU','KOLKATA','HYDERABAD','PUNE','AHMEDABAD']);

  function validateHistory(history, offices, cutoff) {
    const errors = [], rows = [];
    if (!Array.isArray(history) || !history.length) return { errors:['Add at least one posting.'], rows:[] };
    history.forEach((h, i) => {
      if(!h || typeof h!=='object') {errors.push(`Posting ${i+1}: expected a posting record.`);return;}
      if(h.excluded!==undefined && typeof h.excluded!=='boolean') errors.push(`Posting ${i+1}: excluded service must be true or false.`);
      const office = offices.find(o => o.id === h.officeId);
      const start = date(h.start), end = h.end ? date(h.end) : cutoff;
      if (!office) errors.push(`Posting ${i+1}: select a known office.`);
      const zeroCurrent=!h.end && start===cutoff;
      if (start === null || end === null || (end <= start && !zeroCurrent)) errors.push(`Posting ${i+1}: enter valid joining and end dates, with end after joining.`);
      if (!CADRES.includes(h.cadre)) errors.push(`Posting ${i+1}: select a cadre.`);
      if (!['oic','other','unknown'].includes(h.role)) errors.push(`Posting ${i+1}: select an OIC status.`);
      if (office && start !== null && end !== null && (end > start || zeroCurrent)) rows.push({...h, office, start, end:Math.min(end, cutoff), originalEnd:end, activeAtCutoff:start<=cutoff&&(!h.end||end>cutoff)});
    });
    rows.sort((a,b) => a.start-b.start);
    for (let i=1; i<rows.length; i++) {
      if (rows[i].start < rows[i-1].originalEnd) errors.push('Posting dates overlap. Split additional-charge assignments from substantive postings.');
    }
    return {errors:[...new Set(errors)], rows:rows.filter(r => r.start <= cutoff && r.end >= r.start)};
  }

  // Consecutive duty-office segments at the same grade form a single posting;
  // leave/deputation rows remain explicit and are not silently merged.
  function mergeRows(rows) {
    const merged = [];
    rows.forEach(r => {
      const last = merged.at(-1);
      if (last && !r.excluded && !last.excluded && last.officeId===r.officeId && last.cadre===r.cadre && last.role===r.role && last.end===r.start) { last.end=r.end; last.activeAtCutoff=r.activeAtCutoff; }
      else merged.push({...r});
    });
    return merged;
  }
  function exposure(rows, keyFn, target, cutoff) {
    if (!target) return {total:0, run:0, cooling:false, incomplete:false};
    let total=0, cooling=false;
    const runs=[];
    const excluded = rows.some(r => r.excluded);
    rows.filter(r => !r.excluded && keyFn(r.office)===target).forEach(r => {
      total += yearsBetween(r.start,r.end);
      const run=runs.at(-1);
      if(run && run.end===r.start)run.end=r.end;
      else runs.push({start:r.start,end:r.end});
    });
    // A completed cooldown must be evidenced by continuous substantive postings
    // outside this entity. Missing history or excluded service is not proof.
    for(const run of runs.filter(r=>r.end>=anniversary(r.start,9))) {
      const outside=rows.filter(r => !r.excluded && keyFn(r.office)!==null && keyFn(r.office)!==target && r.end>run.end);
      let outsideStart=null, outsideEnd=null, satisfied=false;
      for (const r of outside) {
        if(outsideEnd===r.start)outsideEnd=r.end;
        else {outsideStart=Math.max(run.end,r.start);outsideEnd=r.end;}
        if(outsideEnd>=anniversary(outsideStart,3))satisfied=true;
      }
      if(!satisfied)cooling=true;
    }
    const last=runs.at(-1);
    return {total, run:last?.end===cutoff ? yearsBetween(last.start,cutoff) : 0, cooling, incomplete:excluded};
  }
  function assess(context, offices, snapshot) {
    const cutoff = date(`${context.year}-05-01`);
    if (!cutoff || context.year<2025 || context.year>2100 || !CADRES.includes(context.cadre)) return {errors:['Select a valid AGT year and cadre.'], candidates:[]};
    const validation=validateHistory(context.history,offices,cutoff);
    if (validation.errors.length) return {errors:validation.errors,candidates:[]};
    const rows=mergeRows(validation.rows), current=rows.at(-1);
    if (!current || !current.activeAtCutoff) return {errors:['The service history must identify the active posting on the 1 May record date.'], candidates:[]};
    const evidence=context.confirmed===true;
    const warnings=[];
    if (!evidence) warnings.push('Illustrative assessment: bundled dates, inferred offices and cadres are unverified. Review and confirm the complete history.');
    if(rows.some(r=>r.excluded)) warnings.push('Excluded service is omitted from tenure. Its effect on continuity and cooling-off needs HRM review.');
    if(rows.some((r,i)=>i && r.start>rows[i-1].end)) warnings.push('The history has gaps. Cooling-off and cumulative-tenure checks need complete service records.');
    if(current.cadre!==context.cadre) warnings.push('Selected cadre differs from the last posting. Promotion/grade transition needs review.');
    const tenure=yearsBetween(current.start,cutoff), exempt=context.cadre==='ACC (HQ)';
    const normalYears=current.office.hard ? 2 : 3;
    const tenureComplete=cutoff>=anniversary(current.start,normalYears);
    const requestParity=context.request && cutoff>=anniversary(current.start,2);
    let release=exempt ? 'Administrative assessment' : tenureComplete ? 'Normal duty-office tenure completed' : requestParity ? 'Two-year request route' : context.request ? 'Premature request: discretionary review' : 'Minimum duty-office tenure still running';
    if(current.excluded) release='Return from excluded service: separate posting review';
    let fieldStreak=0;
    for(let i=rows.length-1;i>=0;i--) {
      const r=rows[i];
      if(r.cadre!==context.cadre || r.excluded || !field(r.office,r.cadre,r.role)) break;
      fieldStreak++;
    }
    const retiring=context.retirementDate ? date(context.retirementDate) : null;
    if(context.retirementDate && retiring===null) return {errors:['Enter a valid retirement date.'],candidates:[]};
    const candidates=[];
    for(const office of offices) {
      if(office.historyOnly) continue;
      for(const role of ['other','oic']) {
        if(role==='oic' && !['Regional Office','District Office','Special State Office','Zonal Office'].includes(office.type)) continue;
        const checks=[];
        const add=(level,text,rule,page)=>checks.push({level,text,rule,page});
        const key=`${office.id}|${context.cadre}|${role}`;
        const vacancy=snapshot && snapshot.agt_year===context.year ? snapshot.positions.find(v=>`${v.office_id}|${v.cadre}|${v.role}`===key) : null;
        if(office.id===current.officeId) add('exclude','This is the current duty office, not a next posting.','3.1',5);
        if(office.type==='Regional Office' && ['ACC','ACC (HQ)'].includes(context.cadre)) add('exclude','This RO catalogue does not establish a post for this cadre.','1.6',2);
        if(role==='oic' && office.type==='Zonal Office' && context.cadre!=='ACC') add('exclude','Zonal field OIC role is treated as ACC in this assessment.','1.9',3);
        if(role==='oic' && office.oicCadre && context.cadre!==office.oicCadre) add('exclude',`Historical OIC rank is ${office.oicCadre}; selected cadre does not match. Recheck any later reclassification.`,'OIC order',office.sourcePage);
        if(office.sourceDate && date(office.sourceDate)>cutoff) add('review','This office catalogue amendment postdates the selected record date. Confirm the office identity for that cycle.','OIC order',office.sourcePage);
        if(vacancy?.selectable===false || (vacancy?.sanctioned===0)) add('exclude','This post is not available in the supplied snapshot.','7.2',10);
        if(vacancy && vacancy.sanctioned!==null && vacancy.blocked!==null && vacancy.sanctioned>0 && vacancy.blocked>=vacancy.sanctioned) add('exclude','All sanctioned posts for this role are blocked in the supplied snapshot.','7.2',10);
        if(context.year===2026 && office.type==='District Office' && context.cadre==='APFC' && role==='oic') add('exclude','APFC-headed DOs are blocked in the indexed AGT 2026 circular; later amendments remain to be checked.','2026 blocked-post circular',1);
        if(!exempt) {
          if(!tenureComplete && !requestParity) add('review',context.request ? 'Premature request can be considered by the competent authority.' : 'Normal tenure is incomplete; request or administrative review is needed.','4.1 / 6.3 / 6.6.2',8);
          else add('fit',requestParity&&!tenureComplete ? 'At least two years completed: request can be considered with AGT cases.' : `${normalYears}-year duty-office tenure completed on the record date.`,'4 / 4.1',5);
          const targetField=field(office,context.cadre,role);
          if(targetField && ['RPFC-I','ACC'].includes(context.cadre) && fieldStreak>=1) add('review','Another consecutive field posting requires the CTPC exception; non-field rotation is the normal route.','6.4(i)',7);
          if(targetField && context.cadre==='RPFC-II' && fieldStreak>=2) add('review','A third consecutive field posting needs the policy exception; consider non-field options first.','6.4(ii)',7);
          if(role==='oic' && ['APFC','RPFC-II'].includes(context.cadre) && current.role==='oic') add('exclude','Consecutive OIC terms are restricted for this cadre.','6.4(ii–iii)',8);
          if(role==='oic' && rows.some(r=>r.officeId===office.id && r.role==='oic' && !r.excluded)) add('exclude','The officer has already served as OIC at this duty office; a second OIC tenure is not allowed under the normal rule.','6.4(v)',8);
          if(role==='oic' && rows.some(r=>r.role==='unknown' && !r.excluded)) add('review','OIC history is incomplete; confirm previous OIC assignments.','6.4',8);
          if(!targetField && fieldStreak>0) add('fit','A non-field posting supports rotation from the current field assignment.','6.4',7);
          const z=exposure(rows,zoneKey,zoneKey(office),cutoff), sk=stationKey(office), s=exposure(rows,stationKey,sk,cutoff);
          for(const [label,x,applies] of [['zone',z,!!zoneKey(office)],['station',s,METROS.has(sk)]]) {
            if(!applies) continue;
            if(x.total>=12) add('exclude',`The ${label} has reached the 12-year cumulative limit.`,'4',5);
            else if(x.cooling) add('exclude',`The ${label} needs a completed three-year cooling-off period after nine continuous years.`,'4',5);
            else if(x.total>9) add('review',`Less than three years remain before the cumulative ${label} limit; verify the proposed tenure.`,'4 / 4.2',5);
          }
          if(context.promotionDue) add('review','Promotion is expected within one year; policy advises avoiding transfer where feasible.','6.5.1',8);
          if(context.promoted) add('review','Promotion requires a duty-office change; confirm whether the four-month AGT route applies.','6.5.2',8);
          if(context.groupBPromotion) {
            if(!context.parentZone || !context.parentState || !office.state) add('review','Initial Group B to A transfer needs verified parent zone and state boundaries.','6.5.3',8);
            else if(context.parentZone===office.zoneId || context.parentState===office.state) add('exclude','Initial Group B to A posting must leave the parent zone/state, whichever is larger.','6.5.3',8);
          }
          if(context.special || (retiring!==null && retiring<=anniversary(cutoff,2))) add('review','Spouse, disability/caregiver or retirement considerations require the applicable DoPT/HRM review.','6.6.3',8);
        } else add('review','ACC (HQ) is exempt from clauses 3–6; postings depend on administrative requirements.','1.11',3);
        if(current.excluded) add('review','Return from deputation/study leave uses the separate reporting and posting route.','6.9',9);
        if(context.cadre==='ACC' && rows.some(r=>r.cadre==='ACC' && r.office.type==='Zonal Office' && r.role==='unknown')) add('review','ACC zonal OIC history is unconfirmed; field/non-field classification needs review.','1.9 / 6.4',3);
        if(warnings.some(w=>w.startsWith('The history has gaps') || w.startsWith('Excluded service') || w.startsWith('Selected cadre'))) add('review','Resolve service-history gaps, excluded periods or grade transitions before relying on this assessment.','4.4 / 6.2',6);
        if(retiring!==null && retiring<=cutoff) add('exclude','The entered retirement date is on or before the record date.','6.2',7);
        const fit=checks.some(c=>c.level==='exclude')?'exclude':checks.some(c=>c.level==='review')?'review':'fit';
        const availability=vacancy?.selectable===true ? 'Reported selectable' : vacancy?.clear>0 ? 'Clear vacancy reported; selectable status unconfirmed' : vacancy?.probable>0 ? 'Probable vacancy only' : vacancy?.clear===0 ? 'No clear vacancy reported' : 'Vacancy not verified';
        candidates.push({key,office,role,fit,checks,availability,vacancy,confirmed:evidence,zoneYears:exposure(rows,zoneKey,zoneKey(office),cutoff).total});
      }
    }
    const fitOrder={fit:0,review:1,exclude:2};
    candidates.sort((a,b)=>fitOrder[a.fit]-fitOrder[b.fit] || Number(b.vacancy?.selectable===true)-Number(a.vacancy?.selectable===true) || Number(b.office.zoneId===context.preferredZone)-Number(a.office.zoneId===context.preferredZone) || a.zoneYears-b.zoneYears || a.office.name.localeCompare(b.office.name) || a.role.localeCompare(b.role));
    return {errors:[],warnings,cutoff,release,tenure,normalYears,current,fieldStreak,candidates,confirmed:evidence};
  }
  function validateSnapshot(input,offices) {
    if(!input || input.schema_version!==1 || !Number.isInteger(input.agt_year) || input.agt_year<2025 || input.agt_year>2100 || date(input.as_of)===null) throw new Error('Snapshot needs schema_version 1, a valid agt_year and an ISO as_of date.');
    if(!/^https:\/\//.test(input.source_url||'')) throw new Error('Provide an HTTPS source_url for the vacancy snapshot.');
    if(!Array.isArray(input.positions) || input.positions.length>5000) throw new Error('positions must be an array of at most 5,000 office/cadre/role rows.');
    const seen=new Set();
    const positions=input.positions.map((r,i)=>{
      if(!offices.some(o=>o.id===r.office_id) || !CADRES.includes(r.cadre) || !['oic','other'].includes(r.role)) throw new Error(`Row ${i+1}: unknown office, cadre or role. Station totals cannot be assigned to an office.`);
      const key=`${r.office_id}|${r.cadre}|${r.role}`;
      if(seen.has(key)) throw new Error(`Row ${i+1}: duplicate office/cadre/role.`); seen.add(key);
      const result={office_id:r.office_id,cadre:r.cadre,role:r.role};
      for(const k of ['sanctioned','blocked','clear','probable']) {
        const v=r[k]??null;
        if(v!==null && (!Number.isInteger(v)||v<0)) throw new Error(`Row ${i+1}: ${k} must be a nonnegative integer or null.`);
        result[k]=v;
      }
      if(result.blocked!==null && result.sanctioned!==null && result.blocked>result.sanctioned) throw new Error(`Row ${i+1}: blocked exceeds sanctioned strength.`);
      result.selectable=r.selectable??null;
      if(![true,false,null].includes(result.selectable)) throw new Error(`Row ${i+1}: selectable must be true, false or null.`);
      if(result.selectable===true && (result.sanctioned===0 || (result.sanctioned!==null && result.blocked!==null && result.blocked===result.sanctioned))) throw new Error(`Row ${i+1}: selectable conflicts with zero permitted strength.`);
      return result;
    });
    return {schema_version:1,agt_year:input.agt_year,as_of:input.as_of,source_url:input.source_url,positions};
  }
  return {CADRES,POLICY,normal,date,anniversary,field,zoneKey,stationKey,validateHistory,exposure,assess,validateSnapshot};
});
