(function () {
    'use strict';

    const pageId = location.pathname.split('/').pop().replace(/\.html$/i, '') || 'prototype';
    const manifests = {
        analysis_graph: ['Synthetic network fixture v1', 'Connected components + shared-attribute rules', 'Network review leads; not fraud findings'],
        analysis_member: ['Aggregate demographic fixture v1', 'Descriptive cohort aggregation', 'Aggregated planning view; no individual records'],
        analysis_sna: ['Synthetic integrity-network fixture v1', 'Deterministic network signal rules', 'Investigator leads; human disposition required'],
        analysis_temporal: ['Monthly operations fixture v1', 'Seasonal baseline + deterministic anomaly rules', 'Illustrative workload forecasting'],
        automated_kyc: ['Synthetic KYC document fixture v1', 'Field comparison + validation rules', 'Officer-assisted validation; no auto-decision'],
        claim_risk: ['Synthetic claim cases v1', 'Explainable scrutiny rules', 'Review support; no automatic rejection'],
        default_prediction: ['Synthetic ECR/payment history v1', 'Contribution compliance rules', 'Follow-up prioritisation; no enforcement automation'],
        establishment_risk: ['Synthetic establishment fixture v1', 'Transparent compliance-priority rules', 'Screening only; not a fraud finding'],
        grievance_prediction: ['Synthetic EPFiGMS-style fixture v1', 'Trend baseline + SLA ageing', 'Regional Office workload planning'],
        information_retrieval: ['Bundled document catalogue v1', 'Keyword + metadata matching', 'Demo corpus only; verify official source'],
        information_retrieval2: ['Synthetic circular text fixtures v1', 'Deterministic field-pattern extraction', 'Officer verification required'],
        knowledge_base: ['Synthetic policy evidence map v1', 'Typed relationship traversal', 'Illustrative evidence links; no causal claim'],
        member_behaviour: ['Aggregate service-pattern fixture v1', 'Cohort-level descriptive analysis', 'Service planning only; no individual scoring'],
        more_usecases: ['Curated technique catalogue v1', 'Use-case and governance classification', 'Reference catalogue; not an implemented model'],
        policy_impact: ['Synthetic policy scenario fixture v1', 'Transparent before/after comparison', 'Illustrative evaluation; not policy advice'],
        privacy_preserving: ['Bounded synthetic count fixture v1', 'Laplace mechanism demonstration', 'Educational privacy demo; not a deployed control'],
        retirement_planner: ['Illustrative EPF/EPS scenario v1', 'Deterministic contribution projection', 'Educational estimate; not financial advice'],
        semi_supervised: ['Synthetic labelled text fixture v1', 'Deterministic pseudo-labelling simulation', 'Method demo; human label review required'],
        transfer_risk: ['Synthetic transfer-claim cases v1', 'Explainable transfer review rules', 'Officer review workflow; no auto-decision'],
        withdrawal_analysis: ['Aggregate event-history fixture v1', 'Deterministic cohort survival illustration', 'Policy insight only; no member targeting']
    };
    const [dataset, method, scope] = manifests[pageId] || ['Synthetic fixture v1', 'Deterministic demonstration', 'Prototype use only'];
    const manifest = Object.freeze({
        pageId,
        demoVersion: '1.0.0',
        fixtureVersion: '2026-Q1',
        asOfDate: '2026-03-31',
        dataset,
        method,
        scope,
        dataClass: 'Synthetic / non-personal',
        reproducibility: 'Deterministic for the supplied fixture'
    });

    function stableNumber(key, index, min, max) {
        let hash = 2166136261;
        const input = `${key}:${index}`;
        for (let i = 0; i < input.length; i += 1) {
            hash ^= input.charCodeAt(i);
            hash = Math.imul(hash, 16777619);
        }
        const ratio = (hash >>> 0) / 4294967295;
        return min + ratio * (max - min);
    }

    function auditKey() { return `epfo-demo-audit:${pageId}`; }
    function readAudit() {
        try { return JSON.parse(localStorage.getItem(auditKey()) || '[]'); }
        catch (_) { return []; }
    }
    function recordEvent(action, detail) {
        const events = readAudit();
        events.push({ action, detail: detail || '', at: new Date().toISOString(), demoVersion: manifest.demoVersion });
        localStorage.setItem(auditKey(), JSON.stringify(events.slice(-50)));
        return events;
    }
    function downloadRunRecord() {
        const payload = { manifest, localAuditEvents: readAudit() };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${pageId}-demo-run.json`;
        link.click();
        URL.revokeObjectURL(url);
        recordEvent('download-run-record');
    }

    window.EPFODemo = Object.freeze({ manifest, stableNumber, recordEvent, readAudit, downloadRunRecord });

    function renderManifest() {
        if (document.querySelector('.epfo-demo-manifest')) return;
        const panel = document.createElement('section');
        panel.className = 'epfo-demo-manifest';
        panel.setAttribute('aria-label', 'Demonstration facts');
        panel.innerHTML = `
            <div class="epfo-demo-manifest__top">
                <span class="epfo-demo-manifest__badge">✓ Demo-grade fixture</span>
                <button type="button" class="epfo-demo-manifest__button">Download run record</button>
            </div>
            <div class="epfo-demo-manifest__grid">
                <div class="epfo-demo-manifest__item"><span class="epfo-demo-manifest__label">Dataset</span><span class="epfo-demo-manifest__value">${dataset}</span></div>
                <div class="epfo-demo-manifest__item"><span class="epfo-demo-manifest__label">Method</span><span class="epfo-demo-manifest__value">${method}</span></div>
                <div class="epfo-demo-manifest__item"><span class="epfo-demo-manifest__label">As-of date</span><span class="epfo-demo-manifest__value">${manifest.asOfDate}</span></div>
                <div class="epfo-demo-manifest__item"><span class="epfo-demo-manifest__label">Data classification</span><span class="epfo-demo-manifest__value">${manifest.dataClass}</span></div>
            </div>
            <p class="epfo-demo-manifest__note"><strong>Scope:</strong> ${scope}. Results are reproducible for the supplied fixture and must be verified before any operational use.</p>`;
        panel.querySelector('button').addEventListener('click', downloadRunRecord);
        const anchor = document.querySelector('.epfo-lab-context');
        if (anchor) anchor.insertAdjacentElement('afterend', panel);
        else document.body.insertAdjacentElement('afterbegin', panel);
    }

    function showActionConfirmation(action) {
        const existing = document.querySelector('.epfo-demo-toast');
        if (existing) existing.remove();
        const toast = document.createElement('div');
        toast.className = 'epfo-demo-toast';
        toast.setAttribute('role', 'status');
        toast.textContent = `Demo action recorded locally: ${action}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3200);
    }

    document.addEventListener('click', event => {
        const control = event.target.closest('[data-demo-action]');
        if (!control) return;
        event.preventDefault();
        const action = control.getAttribute('data-demo-action');
        const comment = document.getElementById('verifierComments')?.value.trim() || '';
        recordEvent(action, comment);
        showActionConfirmation(action);
    });

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderManifest);
    else renderManifest();
})();
