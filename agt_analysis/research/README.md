# AGT office-choice dashboard: data and source assessment

Checked 10 September 2026. Scope: EPFO Commissioners' cadre, matching the existing `agt_analysis` application. This is a feasibility assessment, not a certified current vacancy list. No application behavior was changed.

Implementation update, 11 September 2026: the subsequent [Next Posting Advisor](../posting-advisor.html) now uses these findings for officer-first, explainable policy checks. See the [data and rule guide](../posting-advisor-data.md) for implemented coverage, limitations and imports. The original source assessment below remains dated 10 September.

## Finding

**Yes: official PDFs contain the necessary building blocks. A useful dashboard is feasible, but a complete, current office-by-cadre vacancy dataset has not yet been verified.** Office-wise sanctioned posts, annual blocked-post instructions, published vacancy snapshots, and current postings must be maintained as separate dated datasets. The existing local posting history cannot supply current vacancies.

Five original official PDFs have been downloaded into `sources/`. Several old EPFO URLs redirect to missing pages on the new domain. Working replacements were discovered on [EPFO's new circulars page](https://www.epfo.gov.in/circulars/). Download outcomes are recorded in `download_checks.json`. Upload-folder dates on the replacement CDN are migration dates, not order dates.

## Best sources

| Document | What it supplies | Verification and limitations |
| --- | --- | --- |
| [Consolidated revised sanctioned strength, 22 September 2022](https://pmvbry-cdn.epfindia.gov.in/wp-content/uploads/2025/09/Circular_sanctioned_strength_23092022.pdf) | Annexure 4, PDF pages 6–15: office-wise posts, including RO, DO, ZO, training and HO categories; separate OIC and other-post columns. | Downloaded, 15 pages. Visually checked the order, table header, representative rows and totals. Historical baseline; later amendments must be applied. Scanned PDF requires OCR and manual validation. |
| [SSO revised strength, 6 October 2023](https://pmvbry-cdn.epfindia.gov.in/wp-content/uploads/2025/09/OO_HRD_09102023-1.pdf) | Changes relating to Special State Offices and their parent ROs; revised strengths are in Annexure 2. | Downloaded, 5 pages. Cover instructions checked; detailed amendment rows still need extraction. The filename says `09102023`, but the stamped order date is 6 October. |
| [Redistribution order, 23 April 2025](https://pmvbry-cdn.epfindia.gov.in/wp-content/uploads/2025/09/Order_RedistributionOfCommissionerCadre.pdf) | Annexure A lists 150 ROs, zone, UAN count and revised OIC rank. The order specifies 107 RPFC-I-headed and 43 RPFC-II-headed ROs and revised RPFC-I strengths for five ZOs. | Downloaded, 11 pages; cover and representative table page visually checked, annexure text extracted. **This is primarily an OIC-rank table, not a complete APFC/RPFC-II staffing table or vacancy list.** |
| [Modification, 3 July 2025](https://pmvbry-cdn.epfindia.gov.in/wp-content/uploads/2025/09/Final_ModificationOrder-3.pdf) | Changes Annexure A entry 22 from Siddipet-Medchal to Kukatpally and entry 27 from Hyderabad (High Tech City) to Hyderabad-Banjara Hills. | Downloaded; entire single page visually checked. Demonstrates why office names need a dated crosswalk. |
| [Commissioners' Transfer Policy 2025](https://pmvbry-cdn.epfindia.gov.in/wp-content/uploads/2025/09/TransferPolicy_CommissionerCadreFinal-1.pdf) | Paragraphs 1.6 and 7.2 describe advance publication/assessment of posts available for transfer and blocked posts. Paragraph 7.3 describes five station options. | Downloaded; relevant policy text checked. Any eligibility engine needs the full policy, exceptions and later instructions. |
| [AGT 2026 option-calling circular, 31 December 2025](https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2025-2026/Circular_AGT_31122025_Final.pdf) | Indexed text says APFC-headed DO posts are blocked for AGT 2026; no blocked posts in ACC-HQ, ACC, RPFC-I and RPFC-II for that exercise. Existing DO incumbents have a continuation provision. | Official indexed text found, original file not downloaded or visually verified. Treat the rule as an AGT-2026 source finding pending amendment review, not a permanent rule. |
| [AGT 2026 corrigendum](https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2025-2026/Corrigendum_AGTCircular_31122025.pdf) | City/station tables with number of offices, sanctioned posts, in position, clear vacancy and probable vacancy. Indexed APFC note specifies 96 blocked APFC-headed DOs to exclude from displayed vacancies. | Official indexed text found; direct download redirects to HTTP 404. Table extraction in the search index is malformed. Do not import its numeric rows without the original PDF. **Station totals cannot be allocated to individual offices by assumption.** |
| [AGT 2025 option-calling circular](https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2024-2025/AGT_2025_OptionCallingCircular.pdf) | Historical station/cadre sanctioned, in-position, clear and probable vacancy tables; indexed headings refer to tenure completions/retirements through 31 March 2025. | Official indexed text found; direct download redirects to HTTP 404. Useful for a historical comparison only. |

The [official legacy circular index](https://www.epfindia.gov.in/site_en/circulars.php/1000) also lists an AGT addendum dated **12 January 2026**, a transfer advisory dated **30 January 2026**, and **APFC redistribution order /1495 dated 2 February 2026**. Their full contents have not been verified here. In particular, the February order must be reconciled before presenting the December/January snapshot as current. The index lists fresh officer posting-profile annexures dated 5 January 2026; these are candidates to replace the old posting data.

No verified public `.xls`/`.xlsx` file combining current office-wise strength, blocked posts and vacancies was found. An [indexed posting-profile annexure](https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2025-2026/Annexure_II_05012025.pdf) has an Excel-style document title but a **PDF** URL: this is not evidence that its workbook is downloadable. A current authorized HR-Soft office/cadre export would resolve much of the remaining gap.

## Local data audit

`../data.json` contains **4,504 posting rows for 673 unique officer IDs**, not 4,504 officers or sanctioned posts. `date1` spans 17 March 1990 to 28 December 2023, but these exact dates are altered. There are no strength, blocked-post, official vacancy, publication-date or source-page fields.

- All 4,504 `desig` values are `Unknown`. `col2` retains many historical cadre values, but 285 entries are blank and others contain events such as `TRANSFERRED` and `DEPUTATION`.
- The notebook hashes IDs, reduces names to initials and randomizes day/month in **DOB, date1 and date2**, retaining years. 665 of the 673 IDs have multiple DOB values across their rows. Exact retirement dates and tenure cutoffs cannot be derived reliably.
- `col4` mixes office/station text. `app.js` resolves it through a dictionary and inference, then sorts by altered `date1` to derive the latest posting. Intra-year order and current office are consequently uncertain.
- The application defaults its as-on date to `2023-01-01`. It has office/zone profiles, maps and a `pf-contacts` integration that can be reused, but these do not establish current staffing.
- Hard-coded historical tenure alerts (for example single stint over 4 years and cumulative station over 8 years) should not be reused as authoritative 2026 eligibility rules.

`period1` and `period2` may still help historical summaries, but need their original definitions and snapshot date. Neither resolves the missing current roster.

## Proposed dashboard

Start with a **cadre-specific vacancy explorer and preference shortlist**. Give each row an explicit geography level (`office` or `station`), source date and verification status.

| Display field | Required source or treatment |
| --- | --- |
| Office, station, zone, office type, OIC rank | Stable office master plus dated renaming/reorganisation crosswalk |
| Sanctioned strength | Consolidated order with effective amendments; retain post type and whether OIC is included |
| Posts permitted to be filled / blocked posts | AGT-year-specific HRM list; missing is unknown, not zero |
| In position | Certified roster/HR-Soft snapshot for the same date and cadre |
| Published clear vacancy | Official vacancy list, with original definition and geography |
| Published probable vacancy | Separate conditional count and cutoff date; never describe as guaranteed |
| Available to choose | Explicit blocked/available/needs-confirmation status, including source notes |
| Officer fit | Accurate service history plus versioned policy rules; defer until inputs are reliable |

Filters should cover cadre, state/zone, office type, confirmed vacancy and unblocked choices. Offer side-by-side comparison, a map and a five-station shortlist with notes. Where only station totals are available, show them once at station level and mark the office breakdown unavailable. Preserve officer-specific exceptions without presenting them as a probability of selection.

### Calculation rules

Keep **sanctioned**, **permitted to fill**, **occupied**, **blocked**, and **vacant** distinct. If blocked posts are defined within the same sanctioned universe, permitted strength can be derived as `sanctioned - blocked`. A staffing gap can then be computed as `permitted - occupied_against_permitted_posts`, but only after reconciling incumbents allowed to remain on blocked posts, additional charge and posts operated elsewhere. Retain negative gaps as over-position flags.

Prefer the published clear vacancy over an inferred subtraction. Do not automatically subtract blocked posts twice. Do not add probable vacancies to clear vacancies unless the circular confirms they are additional and non-overlapping. Tenure completion may lead to a vacancy; it does not prove that the incumbent will move. Transfer orders require relieving/joining confirmation before changing current occupancy.

### Data model and readiness

Use separate `office_master`, `sanction_versions`, `agt_block_rules`, `vacancy_snapshots` and `posting_events` tables. Store `agt_year`, `effective_date`, `as_of_date`, `source_url`, PDF page, original label, geography level and verification status on imported records. Preserve raw cells, including blanks, alongside interpreted counts. A station alias alone is insufficient to match offices.

**Feasible now:** source catalogue, historical office-strength view, OIC-rank map and a clearly dated station-vacancy prototype once its PDF is obtained. **Still needed for decisions:** reconcile all applicable amendments, obtain and validate the latest office/cadre occupancy and vacancy list, validate blocked-post allocation, and replace altered dates for personal eligibility. Currentness as of September 2026 is not established by the documents downloaded here.

The most useful next input is an authorized export with office code, cadre/post type, sanctioned strength, permitted/blocked count, occupied count, clear vacancy, probable vacancy, cutoff date and source order. This would support an office-choice dashboard without trying to infer current vacancies from anonymized 2023 history.
