"""Extract the April 2025 OIC table; retain source pages and July renamings.

Run with PyMuPDF installed. This does not infer sanctioned staffing or vacancies.
"""
import json
import re
from pathlib import Path
import pymupdf

root = Path(__file__).resolve().parent
document = pymupdf.open(root / 'sources/Order_RedistributionOfCommissionerCadre.pdf')
rows = []
for page_index in range(2, len(document)):
    page = document[page_index]
    for table in page.find_tables().tables:
        for cells in table.extract():
            cells = [' '.join((cell or '').split()) for cell in cells]
            if len(cells) != 5 or not cells[0].isdigit():
                continue
            serial = int(cells[0])
            if not 1 <= serial <= 150 or cells[4] not in ('RPFC-I', 'RPFC-II'):
                continue
            rows.append(dict(serial=serial, zone=cells[1], name=cells[2], uan_count=int(cells[3]),
                             oic_cadre=cells[4], source_page=page_index+1))
# The last-page table detector treats the first data row as a header. Recover
# that row only when the complete expected text is present in the source.
if 145 not in {row['serial'] for row in rows}:
    text = ' '.join(document[10].get_text().split())
    assert re.search(r'145\s+NORTH-EASTERN\s+REGION\s+\(GUWAHATI\)\s+TINSUKIA\s+55926\s+RPFC-II', text)
    rows.append(dict(serial=145, zone='NORTH-EASTERN REGION (GUWAHATI)', name='TINSUKIA', uan_count=55926, oic_cadre='RPFC-II', source_page=11))
rows.sort(key=lambda row: row['serial'])
assert [r['serial'] for r in rows] == list(range(1, 151)), 'Missing/duplicate table rows'
assert sum(r['oic_cadre'] == 'RPFC-I' for r in rows) == 107
for row in rows:
    row['original_name'] = row['name']
    if row['serial'] == 22:
        row['name'] = 'KUKATPALLY'
    if row['serial'] == 27:
        row['name'] = 'HYDERABAD-BANJARA HILLS'
    row['effective_date'] = '2025-07-03' if row['serial'] in (22, 27) else '2025-04-23'
output = root.parent / 'oic-catalogue.json'
output.write_text(json.dumps(dict(source='research/sources/Order_RedistributionOfCommissionerCadre.pdf',
    amendment='research/sources/Final_ModificationOrder-3.pdf',
    note='Historical OIC ranks only. Other cadre strength and current vacancies are unknown.', offices=rows), indent=2), encoding='utf-8')
print(f'Extracted {len(rows)} offices: 107 RPFC-I OIC, 43 RPFC-II OIC; two names amended.')
