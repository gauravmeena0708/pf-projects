# EPFO Prototype Credibility and POC Readiness Audit

**Audit date:** 28 August 2026  
**Scope:** All 20 HTML pages in `prototypes/`  
**Target standard:** Credible demonstration, not production integration

## Executive verdict

None of the reviewed pages is currently a production-grade proof of concept. Most are polished static concept screens driven by hard-coded JavaScript objects. Six pages are especially problematic because they generate random values or use simplistic formulas while displaying the output as model accuracy, forecasts, privacy protection, or behavioural prediction.

The portfolio can become a credible demonstration without access to live EPFO systems, but it must stop presenting invented metrics as measured results. Each demo should use a documented, deterministic synthetic dataset; expose its assumptions; implement the workflow it claims to demonstrate; and clearly separate analytical signals from decisions made by authorised officers.

### Readiness definitions

| Level | Meaning |
|---|---|
| Production-grade POC | Uses representative data and architecture, reproducible evaluation, security controls, auditability, failure handling, and a realistic integration boundary. |
| Credible demo | May use synthetic data, but the dataset is documented and deterministic, interactions are real, metrics are reproducible, limitations are visible, and the workflow is domain-correct. |
| Simulated workflow | The interface reacts to fixed data but does not implement the claimed analytical capability. |
| Static concept | Primarily communicates an idea through charts, text, and modal windows. |
| Misleading simulation | Random or arbitrary logic is presented as meaningful AI, statistical, financial, privacy, or operational output. |

## Portfolio summary

| Page | Current classification | Principal issue | Priority |
|---|---|---|---|
| `analysis_graph.html` | Static concept | Hard-coded network and unsupported fraud counts | High |
| `analysis_member.html` | Static concept | Invented demographic metrics with no cohort or source definition | Medium |
| `analysis_sna.html` | Static concept | Entities are labelled fraudulent without an investigation or evidence model | High |
| `analysis_temporal.html` | Misleading simulation | Random series accompanied by a fixed 92.5% accuracy claim | Critical |
| `automated_kyc.html` | Simulated workflow | Placeholder documents and fixed OCR results | Critical |
| `claim_risk.html` | Simulated workflow | Fixed anomaly score and confidence values with no rule/model execution | Critical |
| `default_prediction.html` | Misleading simulation | Random contribution chart and fictional predicted defaults | Critical |
| `establishment_risk.html` | Simulated workflow | Fixed compliance score presented without evidence provenance | High |
| `grievance_prediction.html` | Simulated workflow | Static forecast and model version without evaluation | High |
| `information_retrieval.html` | Simulated workflow | Search is performed against a fixed result list rather than an index | High |
| `information_retrieval2.html` | Simulated workflow | Extraction returns predetermined entities instead of parsing input | High |
| `knowledge_base.html` | Static concept | Correlations and policy links have no sources or evidence graph | High |
| `member_behaviour.html` | Misleading simulation | Arbitrary formula and invented accuracy used for individual prediction | Critical |
| `more_usecases.html` | Reference catalogue | Useful catalogue, but it is not a POC | Low |
| `policy_impact.html` | Static concept | Causal and forecast claims are hard-coded | Critical |
| `privacy_preserving.html` | Misleading simulation | Random noise is presented as differential privacy | Critical |
| `retirement_planner.html` | Simulated workflow | Static projections and investment advice are not EPFO scheme calculations | Critical |
| `semi_supervised.html` | Misleading simulation | Random accuracy, confidence, labels, and record IDs | Critical |
| `transfer_risk.html` | Simulated workflow | Detailed UI around a single fixed claim and non-persistent actions | High |
| `withdrawal_analysis.html` | Misleading simulation | Random survival curves and unsupported demographic conclusions | Critical |

## Portfolio-wide flaws

1. **No real analytical boundary.** None of the pages calls an API, loads a dataset, or exposes a replaceable data interface. All records live inside the HTML.
2. **Fabricated evaluation.** Accuracy, confidence, risk, predicted loss, forecast, and impact values are displayed without a test set, labels, baseline, methodology, or calculation trace.
3. **Random output masquerading as analysis.** `Math.random()` is used in temporal forecasts, default histories, privacy queries, semi-supervised metrics, and withdrawal curves.
4. **Decision overreach.** Some pages imply fraud findings, enforcement actions, KYC approval/rejection, or member targeting. A model should create a review lead with reasons, not determine an adverse outcome.
5. **Missing data contracts.** Fields, units, periods, effective dates, missing-value rules, and source ownership are not defined.
6. **Missing governance.** There is no user role, authentication boundary, consent model, audit record, retention policy, model registry, review history, or correction/appeal path.
7. **Weak EPFO grounding.** Claim forms, ECR/contribution cycles, EPFiGMS categories, KYC exceptions, establishment follow-up, scheme-effective dates, and officer responsibilities are not consistently represented.
8. **No reproducibility.** Reloading several pages changes the apparent analytical result. There are no fixtures, expected outputs, unit tests, or model evaluation artefacts.
9. **Accessibility and reliability gaps.** Charts lack equivalent tables or summaries, modal focus is unmanaged, controls lack complete keyboard states, errors are not modelled, and external CDN dependencies are not protected by an application build or content policy.
10. **Presentation defects.** Several pages contain stale 2025 dates, placeholder graphics, “would appear here” copy, and encoding artefacts such as malformed rupee and plus/minus symbols.

## Page-by-page findings and required changes

### 1. `analysis_graph.html` — Graph-based member network analysis

**Verdict:** Static concept, not a graph-analysis POC.

**Evidence and flaws**

- `graphAnalysisData` supplies every statistic, community, connection, and indicator; no graph is loaded or analysed.
- “Potential Fraud Rings: 42” is an unsupported claim, while the visualisation is explicitly described as illustrative.
- The page conflates graph structure, anomaly detection, and proof of fraud.
- No relationship provenance, time window, edge type, confidence, or investigator disposition exists.

**Required changes**

- Provide a deterministic synthetic graph dataset with documented node and edge schemas: masked member, establishment, bank token, claim, relationship type, event time, and source.
- Run an actual graph routine in the browser or a documented mock service, such as connected components, shared-attribute clustering, degree centrality, and explainable rule flags.
- Rename fraud counts to “network leads requiring review”; display the exact edges and rules responsible for each lead.
- Add filtering by period, relationship type, and minimum cluster size, plus a case disposition of open, explained, escalated, or closed.

**Credible-demo acceptance:** The same input graph always produces the same clusters and reason codes, and every displayed total can be traced to visible synthetic records.

### 2. `analysis_member.html` — Member demographics

**Verdict:** Static analytical dashboard.

**Evidence and flaws**

- `demographicAnalysisData` contains all totals and chart series; there is no dataset, query, or cohort selection.
- Geography, age, gender, income, contribution, and liability statements lack reporting period, population definition, exclusions, and source.
- Forecasting liabilities is mentioned without actuarial assumptions.
- Small-cell privacy and aggregation controls are absent.

**Required changes**

- Ship an aggregate synthetic dataset with as-of date, active/inactive definition, regional hierarchy, contribution period, and suppressed small cells.
- Add cohort filters and reconcile filtered totals across all charts.
- Label descriptive observations separately from projections; remove liability forecasts unless actuarial assumptions and calculations are implemented.
- Include missing/unknown categories and a data-quality panel.

**Credible-demo acceptance:** All charts recalculate from one documented dataset, totals reconcile, and no individual record or small group can be inferred.

### 3. `analysis_sna.html` — Social-network integrity review

**Verdict:** Static concept with unsafe fraud labelling.

**Evidence and flaws**

- `fraudAnalysisData` hard-codes nodes such as “fraud-ring-member” and “central-fraud-actor”.
- Counts for high-risk clusters, suspicious accounts, loss averted, and anomalous transactions are not calculated.
- Styling and labels visually adjudicate fraud before investigation.
- This page substantially overlaps `analysis_graph.html`.

**Required changes**

- Merge with `analysis_graph.html` or give the pages distinct scopes: graph exploration versus investigator case triage.
- Replace ground-truth fraud labels with neutral entity types and explainable network signals.
- Calculate cluster metrics from deterministic fixtures and add evidence, analyst notes, status, and false-positive disposition.
- Remove “loss averted” unless it is derived from completed, documented cases.

**Credible-demo acceptance:** No entity is called fraudulent; every lead has reproducible network evidence and a human disposition workflow.

### 4. `analysis_temporal.html` — Transaction time-series analysis

**Verdict:** Misleading simulation.

**Evidence and flaws**

- Contributions, withdrawals, claims, residuals, and anomaly series are generated using `Math.random()`.
- A fixed “92.5%” forecast accuracy is displayed without a metric definition or holdout period.
- Reloading the page changes historical-looking results.
- Units such as crore, counts, and rates are not consistently defined.

**Required changes**

- Replace random arrays with a versioned monthly synthetic dataset containing period, metric, unit, region, and known events.
- Implement a transparent baseline such as seasonal naive or moving average, with train/test split, MAE or MAPE, and prediction intervals.
- Annotate policy, portal, seasonal, and economic events without claiming causality.
- Add empty, missing-month, and outlier states.

**Credible-demo acceptance:** Forecasts are reproducible, the reported metric can be recalculated, and a baseline comparison and uncertainty interval are shown.

### 5. `automated_kyc.html` — KYC validation assistant

**Verdict:** Simulated workflow, not OCR or KYC validation.

**Evidence and flaws**

- Document previews come from `placehold.co`; `kycVerificationData` supplies fixed OCR values, match scores, and confidence.
- Buttons imply viewing documents and completing KYC actions but have no end-to-end state or audit trail.
- Aadhaar, PAN, bank, address, and member data are shown without a masking, consent, access, or retention model.
- A single “confidence” blends extraction, matching, and decision certainty.

**Required changes**

- Bundle clearly synthetic document fixtures and implement deterministic extraction fixtures or a replaceable OCR adapter.
- Separate OCR confidence, field-normalisation result, source verification result, and officer disposition.
- Mask identifiers by default and document consent, permitted roles, retention, and audit events.
- Model review states: received, extracted, validation pending, exception raised, officer verified, returned for correction.
- Remove direct automated approval/rejection semantics.

**Credible-demo acceptance:** Each field can be traced to a synthetic document region, exceptions are reproducible, and officer actions produce an auditable state transition.

### 6. `claim_risk.html` — Claim scrutiny signals

**Verdict:** Simulated case profile.

**Evidence and flaws**

- `claimAnomalyData` contains a fixed risk score, confidence, anomalies, member details, and timeline.
- Isolation Forest and One-Class SVM are named, but no model runs and no training/evaluation evidence exists.
- The same bank account across members or a recent KYC update is treated as suspicious without modelling legitimate explanations.
- The page mixes Form 19 content with a generic claim-risk concept.

**Required changes**

- Choose explicit supported claim types and define a field/rule contract for each.
- Implement deterministic rule evaluation over several synthetic cases, including normal, incomplete, explained, and review-required examples.
- Replace the composite risk score with reason codes unless a reproducibly evaluated scoring model is supplied.
- Add officer outcome, evidence viewed, comments, timestamps, and no-auto-rejection statement.

**Credible-demo acceptance:** Selecting different fixture claims changes the evidence and reasons correctly, with at least one false-positive/explained scenario.

### 7. `default_prediction.html` — Contribution compliance watchlist

**Verdict:** Misleading simulation.

**Evidence and flaws**

- `defaultPredictionData` contains fictional establishments, predicted default amounts, factors, and prescribed actions.
- Modal contribution history is generated with `Math.random()` and labelled as dummy data.
- “Immediate Visit” and “Send Notice” are presented as model-selected enforcement actions.
- ECR filing, wage month, due date, payment, arrear, inspection, and notice data are not defined.

**Required changes**

- Replace prediction language with a deterministic contribution-compliance watchlist unless a real evaluated model is implemented.
- Create synthetic ECR/contribution histories with wage month, filing/payment dates, employee counts, payable amount, paid amount, and prior follow-up.
- Derive visible reason codes such as missing filing, delayed payment, repeated variance, or material employee-count change.
- Present suggested follow-up for officer selection, never automatic enforcement.

**Credible-demo acceptance:** Every watchlist entry and amount is reproducibly derived from its visible history, with no random charts or automatic legal action.

### 8. `establishment_risk.html` — Establishment compliance screening

**Verdict:** Simulated screening profile.

**Evidence and flaws**

- `establishmentData` supplies a fixed score, risk factors, identity details, contribution history, and promoter claims.
- External facts such as GST status, promoter history, address verification, and linked entities have no stated source or freshness.
- The score has no weighting, threshold, calibration, or review history.
- “High risk” can be mistaken for a finding rather than a triage category.

**Required changes**

- Define which fields are EPFO-held, externally verified, manually recorded, or unavailable in the demo.
- Use several deterministic establishment fixtures and calculate transparent compliance signals.
- Show source, as-of date, quality, and reason for every signal.
- Replace the opaque score with low/medium/high follow-up priority based on published demo rules, plus officer disposition.

**Credible-demo acceptance:** Priority can be recalculated from the displayed rules and evidence, and external-source claims are clearly simulated or omitted.

### 9. `grievance_prediction.html` — EPFiGMS grievance forecasting

**Verdict:** Static forecast dashboard.

**Evidence and flaws**

- `grievancePredictionData` hard-codes forecast volume, categories, sentiment, regional hotspot, and recommendations.
- `GP_v2.1` looks like a governed model version but has no model card, run date, training period, or evaluation.
- Categories and regional labels are illustrative rather than tied to a documented EPFiGMS taxonomy.
- Pendency, SLA breach, escalation, inflow, disposal, and reopened grievances are not cleanly distinguished.

**Required changes**

- Provide a deterministic weekly synthetic grievance dataset with office, category, received/disposed dates, status, SLA, and escalation.
- Implement descriptive workload and a transparent forecast baseline with backtesting and intervals.
- Separate incoming volume, current pendency, ageing, and predicted SLA breach.
- Replace generic recommendations with capacity scenarios whose effect is explicitly hypothetical.

**Credible-demo acceptance:** Dashboard totals reconcile with fixture records, taxonomy and SLA definitions are visible, and forecast quality is reproducible.

### 10. `information_retrieval.html` — Document search

**Verdict:** Simulated search interface.

**Evidence and flaws**

- `retrievalSystemData.sampleResults` is the only corpus; queries display simulated results rather than a genuine indexed search.
- “94% NLP Accuracy” has no task definition, relevance judgments, or evaluation set.
- Results mix policy documents and member records without modelling access control.
- Advanced filters explicitly contain placeholder copy.

**Required changes**

- Index a small bundled corpus of synthetic/public documents and implement deterministic keyword plus metadata search.
- Show snippets, matched terms, document date/version, source, and stable document link.
- Add functioning filters and no-result/error states.
- Remove the accuracy claim or provide a labelled query set with precision/recall or ranking metrics.
- Keep member-record search in a separate, access-controlled concept.

**Credible-demo acceptance:** Different queries return genuinely different ranked results from the bundled corpus and every result opens its source document.

### 11. `information_retrieval2.html` — Document information extraction

**Verdict:** Simulated extraction interface.

**Evidence and flaws**

- `docExtractionData.sampleEntitiesFromText` is returned regardless of the pasted document.
- “97.2% extraction accuracy” is unsupported.
- Extracted fields have no source offsets, page/paragraph reference, schema validation, or correction workflow.
- The page overlaps document search but does not expose a clean extraction contract.

**Required changes**

- Define an EPFO document schema for a narrow set of public circular fields: reference number, date, subject, effective date, superseded document, and authority.
- Implement deterministic parsing of supplied fixture documents or a replaceable extraction adapter.
- Highlight the source span for every extracted field and allow correction with an audit record.
- Add validation, missing/ambiguous field states, and a small labelled evaluation set.

**Credible-demo acceptance:** Output changes with input, every value maps to source text, and extraction metrics are calculated from committed labelled fixtures.

### 12. `knowledge_base.html` — Policy evidence knowledge base

**Verdict:** Static concept.

**Evidence and flaws**

- `kbPolicyImpactData` hard-codes policy links, correlations, and “data sources integrated”.
- Claims such as demographic-policy links and economic effects have no citations, dates, definitions, or statistical evidence.
- A knowledge base, knowledge graph, and causal inference system are discussed interchangeably.
- No entity model, relationship provenance, query, or versioning exists.

**Required changes**

- Narrow the demo to a documented evidence map: policy/circular, effective date, affected process, metric, observation, source, and confidence/caveat.
- Provide citations and distinguish asserted relationship, measured association, and causal estimate.
- Implement filtering and traversal over deterministic fixture data.
- Represent supersession and effective-date history so policy versions are not mixed.

**Credible-demo acceptance:** Every node and relationship has a source and type, and the interface never presents correlation as causation.

### 13. `member_behaviour.html` — Member service pattern analysis

**Verdict:** Misleading and potentially harmful simulation.

**Evidence and flaws**

- The page claims 88.5% and 91.2% accuracy without a dataset or evaluation.
- `getPrediction()` uses a simplistic hand-written formula based on age, balance, service, and last withdrawal.
- It produces individual withdrawal/closure probabilities and originally promotes targeted retention.
- There is no lawful-purpose analysis, consent, fairness assessment, explainability, correction path, or protection against adverse use.

**Required changes**

- Reframe the page as aggregate service-demand analysis, not individual behavioural scoring.
- Remove invented accuracy and individual probabilities.
- Use deterministic aggregate cohorts to demonstrate service uptake, withdrawal requests, dormant accounts, and communication needs.
- Add privacy thresholds, fairness checks, and an explicit prohibition on eligibility, claim, enforcement, or service-denial decisions.

**Credible-demo acceptance:** No individual is scored; all outputs are aggregate, reproducible, privacy-protected, and limited to service planning.

### 14. `more_usecases.html` — AI technique directory

**Verdict:** Useful reference catalogue, not a POC.

**Evidence and flaws**

- The page contains no data, model, workflow, or executable demonstration.
- Technique descriptions imply benefits without feasibility, data, risk, or evaluation requirements.
- “Internal Use Restricted” conflicts with public GitHub Pages hosting.

**Required changes**

- Label the page “Concept Catalogue” and remove any POC implication.
- For every use case, add business owner, intended user, required data, decision supported, risk level, evaluation method, and prototype link where available.
- Mark speculative ideas and disallowed/high-risk uses clearly.
- Replace the internal-use footer with an accurate publication status.

**Credible-demo acceptance:** Not applicable as a POC; success means an honest, navigable catalogue with traceable links and governance metadata.

### 15. `policy_impact.html` — Policy impact evaluation

**Verdict:** Static concept with unsupported causal claims.

**Evidence and flaws**

- `policyEvaluationData` contains dummy policy events, impacts, forecasts, and insights.
- Time-series, difference-in-differences, regression discontinuity, and synthetic control are named but not executed.
- The page presents policy effects without an estimand, comparison group, pre-period, assumptions, uncertainty, or sensitivity test.
- “AI-powered” language obscures the need for policy, legal, actuarial, and statistical review.

**Required changes**

- Select one synthetic policy question and state population, intervention, comparison, outcome, period, and estimand.
- Implement a transparent before/after descriptive analysis first; add causal inference only with its assumptions and diagnostics.
- Cite all inputs and display confidence intervals and sensitivity limitations.
- Keep simulations separate from observed evaluations and label both prominently.

**Credible-demo acceptance:** A reviewer can reproduce the estimate from the fixture dataset and identify every assumption and limitation.

### 16. `privacy_preserving.html` — Privacy-enhancing technologies

**Verdict:** Misleading simulation.

**Evidence and flaws**

- `runSecureQuery()` generates a random base value and random noise, presenting the result as differentially private.
- No epsilon, delta, sensitivity, clipping rule, privacy budget, composition, or threat model is specified.
- Federated learning, homomorphic encryption, secure multiparty computation, and differential privacy are presented together without implementations.
- Random noise alone is not a differential-privacy proof.

**Required changes**

- Limit the interactive demo to one auditable mechanism, preferably a bounded-count Laplace mechanism over a fixed synthetic dataset.
- Display query, sensitivity, epsilon, noise draw, seed policy for demo reproducibility, noisy result, and utility impact.
- Explain what the mechanism protects and does not protect; add a simple privacy-budget ledger.
- Present the other technologies as explanatory cards, not implemented capabilities.

**Credible-demo acceptance:** The mechanism and privacy parameters are explicit, mathematically correct, reproducible in test mode, and accompanied by utility/error explanation.

### 17. `retirement_planner.html` — Retirement education planner

**Verdict:** Simulated financial-advice screen.

**Evidence and flaws**

- `retirementData` supplies all projections, allocation advice, VPF suggestions, and confidence statements; the page has no calculation inputs.
- It suggests member-specific equity/debt allocation as if EPFO members control the scheme portfolio in this way.
- EPF accumulation, EPS benefits, wage ceiling, contribution components, interest-rate effective dates, service history, and tax assumptions are not modelled.
- “AI-optimized returns” and confidence labels are unsupported and create financial-advice risk.

**Required changes**

- Rebuild as an educational scenario calculator with editable age, retirement age, current EPF balance, pensionable service, eligible wages, contribution, and VPF assumption.
- Version every scheme assumption and interest-rate input by effective date.
- Separate EPF accumulation from EPS estimate and clearly state simplifications and exclusions.
- Remove asset-allocation recommendations and all unsupported AI/confidence language.
- Provide calculation breakdown, scenario comparison, and downloadable assumptions.

**Credible-demo acceptance:** Known test cases reproduce the displayed calculation, all assumptions are visible, and the page is clearly educational rather than personalised financial advice.

### 18. `semi_supervised.html` — Semi-supervised classification

**Verdict:** Misleading simulation.

**Evidence and flaws**

- The start button randomly generates classified counts, 88–96% accuracy, 89–99% confidence, record IDs, labels, and sample results.
- Hyperparameters are displayed but do not control a model.
- There is no task definition, feature schema, labelled set, train/validation/test split, class balance, baseline, or error analysis.
- “High accuracy” is asserted before any evaluation.

**Required changes**

- Choose one low-risk classification task, such as routing synthetic grievance text into documented categories.
- Commit labelled and unlabelled fixtures, deterministic features, and a reproducible baseline.
- Make controls affect the result and show coverage, abstention, per-class precision/recall, confusion matrix, and reviewed pseudo-labels.
- Add label correction and model-run metadata.

**Credible-demo acceptance:** Results are deterministic, metrics are computed from a held-out labelled set, and low-confidence records abstain for human labelling.

### 19. `transfer_risk.html` — Transfer claim review

**Verdict:** Detailed simulated workflow.

**Evidence and flaws**

- `currentClaimData` supplies one fixed claim, establishments, member data, anomalies, score, and timeline.
- The interface has many action buttons and a comment box, but no persisted review state or audit record.
- Risk thresholds and factors are not calculated or mapped to a documented transfer-claim review policy.
- A single high-risk narrative provides no normal, incomplete, or explained comparison.

**Required changes**

- Create a small deterministic fixture set covering straightforward transfer, incomplete service data, duplicate service, unusual establishment cluster, and explained exception.
- Implement transparent rules and reason codes over the fixtures.
- Persist review actions locally for the demo or through a documented mock API, including actor, timestamp, comment, evidence, and disposition.
- Disable invalid actions by workflow state and include loading, failure, and conflict handling.

**Credible-demo acceptance:** Cases follow a real state machine, decisions survive reload in demo storage, and every signal is traceable to displayed evidence.

### 20. `withdrawal_analysis.html` — Withdrawal pattern analysis

**Verdict:** Misleading simulation.

**Evidence and flaws**

- Survival curves are generated with `Math.random()` while demographic differences are stated as findings.
- Fixed claims such as higher withdrawal probability by income, city tier, or job loss have no source, uncertainty, or confounder analysis.
- Clusters can stereotype members and encourage targeted intervention.
- The page mixes descriptive withdrawals, survival analysis, causal inference, and policy recommendations.

**Required changes**

- Use a deterministic aggregate synthetic event-history dataset with entry, contribution periods, withdrawal event, censoring, and documented cohort fields.
- Implement descriptive rates and a reproducible Kaplan–Meier-style educational calculation before any predictive claims.
- Remove unsupported demographic conclusions and label associations as illustrative.
- Apply privacy thresholds and restrict recommendations to aggregate education and service planning.

**Credible-demo acceptance:** Curves are reproducible from fixtures, censoring and cohort definitions are explained, and no individual targeting or causal claim is made.

## Recommended delivery roadmap

### Phase 1 — Honesty and safety

- Remove every random or invented analytical metric from user-facing output.
- Add an as-of date, dataset label, methodology, limitations, and decision-support statement to each analytical page.
- Replace fraud, enforcement, approval, and prediction wording where the page only supplies a review signal.
- Fix encoding, stale-date, placeholder, public/internal-use, and accessibility defects.

### Phase 2 — Shared credible-demo foundation

- Define a common versioned fixture format and data-source panel.
- Add deterministic scenario selection, calculation traces, reason codes, and empty/error states.
- Add a shared run manifest: demo version, fixture version, method, parameters, timestamp, and limitations.
- Add automated checks that reject `Math.random()` in analytical output and require every displayed metric to have a calculation or explicit “illustrative” label.

### Phase 3 — Implement highest-value demos

1. Document search and extraction using a bundled public/synthetic corpus.
2. Grievance workload dashboard using deterministic EPFiGMS-style fixtures.
3. Claim and transfer review using transparent rule fixtures and audit states.
4. Contribution compliance watchlist using deterministic ECR/payment histories.
5. Retirement education calculator using versioned EPF/EPS assumptions.

### Phase 4 — Consolidate or retire

- Merge the two graph pages unless they receive clearly different workflows.
- Merge the policy knowledge-base and impact concepts around a single evidence model.
- Keep `more_usecases.html` as a catalogue, not a POC.
- Retire individual member-behaviour scoring unless a lawful, fair, aggregate-only purpose is established.
- Keep advanced privacy, causal inference, and semi-supervised pages as educational concepts until they have mathematically valid implementations and reproducible evaluation.

## Common acceptance checklist

A page should be called a credible demo only when all applicable items pass:

- [ ] Purpose, intended user, and supported decision are explicit.
- [ ] Data is synthetic/public, documented, versioned, and deterministic.
- [ ] Every metric is calculated from the supplied data or clearly labelled illustrative.
- [ ] Reloading the same scenario produces the same result.
- [ ] Method, parameters, baseline, limitations, and as-of date are visible.
- [ ] Outputs include traceable evidence or reason codes.
- [ ] Human review and correction are modelled for consequential workflows.
- [ ] No automatic adverse action is implied.
- [ ] Privacy, masking, access, retention, and audit expectations are stated.
- [ ] Empty, invalid, loading, failure, and no-result states exist.
- [ ] Controls perform the action they advertise.
- [ ] Charts have accessible text or tabular equivalents.
- [ ] Test fixtures cover normal, exceptional, ambiguous, and false-positive cases.
- [ ] No random value is presented as historical data, prediction, accuracy, confidence, or privacy protection.

## Final assessment

The prototypes are useful as an idea portfolio and UI exploration, but their current analytical credibility is low. The main problem is not the use of synthetic data; it is the absence of a verifiable relationship between input, method, and output. A smaller portfolio of deterministic, source-aware, domain-correct demos would be substantially more credible than twenty pages that visually imply systems or models that do not exist.
