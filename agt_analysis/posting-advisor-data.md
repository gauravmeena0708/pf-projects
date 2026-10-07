# Next Posting Advisor

Open `posting-advisor.html` from a local HTTP server or the existing static website. Search by anonymized initials, officer ID or historical office. Each Officer 360° profile also links directly to the advisor.

The bundled history is illustrative: names and dates were anonymized, grades and duty offices were inferred, and records stop in 2023. The advisor does not turn this into a current roster. Review joining dates, OIC assignments and every substantive posting; then confirm completeness. Confirmation means user-confirmed facts, not official certification. Edits invalidate confirmation. Personal history and supplied vacancy data stay in page memory; only shortlist choices are saved to this browser, per officer. Selecting a different officer discards unsaved history edits. Export an edited history to keep it.

## Policy coverage

The implemented baseline is TP-CC 2025: 1 May record date (§6.2), normal/hard duty-office tenure (3/2 years), two-year request route, premature-request review, station/zone limits and cooling-off, HO/PDUNASS and ZTI exceptions, field/non-field rotation by cadre, OIC repeat restrictions, ACC(HQ) exemption from clauses 3–6, promotion and special-case review. A continuing duty-office tenure is not automatically cut short on crossing a zone/station limit (§4.2). Target-post eligibility is separate from the transfer route. Continuous segments at the same duty office, grade and role are merged before counting field postings.

Results are **potential policy fit**, **needs review**, or **not a normal option under the supplied facts**. They are not approval, an official priority list or a selection probability. Administrative discretion, individual DoPT concessions, sensitive-post classification, parent state/zone boundaries on Group B promotion, ambiguous continuity around excluded service and later amendments require HRM review. The 2026 APFC-headed DO blocking indication comes from indexed circular text; the later addendum/redistribution remains unverified. Other AGT years do not inherit that block automatically.

The catalogue includes 150 April 2025 RO OIC ranks with July name amendments, plus the existing historical office directory. It is not a complete current sanctioned-post inventory. Older zone boundaries and names must be reconciled for actual tenure decisions. The 2022 scanned sanctioned-strength tables remain reference PDFs and are not silently treated as current values.

Sorting is policy fit, supplied selectable status, optional preferred zone, lower recorded zone exposure, then office name. Lower recorded exposure is a planning tie-breaker, not the CTPC's officer-priority calculation. An absent or zero clear vacancy is not used to fabricate probable vacancies. Counts are never summed or inferred from the officer roster.

## Corrected history

Use **Export edited history**, correct it, and **Load corrected history** for the same selected officer ID. The file shape is:

```json
{
  "eid": "THE_SELECTED_OFFICER_ID",
  "history": [
    {
      "officeId": "OFFICE_ID_FROM_THE_DIRECTORY",
      "start": "2023-05-01",
      "end": "",
      "cadre": "RPFC-II",
      "role": "other",
      "excluded": false
    }
  ]
}
```

Dates use `YYYY-MM-DD`: start is the actual joining date; end is exclusive. Blank end means through the selected record date. A posting starting on the record date contributes zero tenure; ensure the preceding record covers the day before it. `role` is `oic`, `other` or `unknown`. Mark deputation, foreign assignment and study leave as `excluded: true`. Imports reject invalid dates, overlaps, unknown office IDs, cadre/role values and another officer's ID. Gaps and unresolved OIC assignments remain visible review items. This is a shape example, not a real officer record.

## Office-wise vacancy snapshot

Expand **Sources, coverage and how to read the results** and download the empty vacancy template. It includes the full office-ID directory. Populate `positions` only from an authorized, dated office/cadre/role source. Do not distribute station-level totals over individual offices.

```json
{
  "schema_version": 1,
  "agt_year": 2026,
  "as_of": "2026-01-01",
  "source_url": "https://www.epfindia.gov.in/REPLACE_WITH_ACTUAL_SOURCE",
  "positions": [
    {
      "office_id": "REPLACE_WITH_DIRECTORY_OFFICE_ID",
      "cadre": "RPFC-II",
      "role": "other",
      "sanctioned": null,
      "blocked": null,
      "clear": null,
      "probable": null,
      "selectable": null
    }
  ]
}
```

Unknown values must stay `null`; zero means the source explicitly reports zero. `selectable` is `true` only when the source says that office/cadre/role is available for options; `false` excludes it; `null` is unconfirmed. Counts must be nonnegative integers and blocked cannot exceed sanctioned. No subtraction of blocked posts or addition of probable vacancies is performed. Duplicate office/cadre/role keys and unknown IDs are rejected. A snapshot for another AGT year is not used. Imported figures are labelled as supplied, with their date, not independently verified or live. New imports replace the previous snapshot atomically; invalid imports leave it intact.

## Verification

Run `node --test agt_analysis/posting-rules.test.js agt_analysis/posting-integration.test.js` from the repository root for policy boundaries, import validation, application loading and catalogue integration checks. Run `node --check` on the advisor, rules and existing app scripts for syntax checks. The extraction script in `research/extract_oic_catalogue.py` requires PyMuPDF, validates 150 serials and the 107/43 OIC-rank totals, and applies the two July renamings. No build system or new runtime dependency is required for the static application.
