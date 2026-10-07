"""Read-only checks of public EPFO sources; save only actual PDF responses."""
import concurrent.futures
import json
from pathlib import Path
import requests
import sys

ROOT = Path(__file__).resolve().parent
URLS = [
    "https://www.epfindia.nic.in/site_docs/PDFs/Circulars/Y2025-2026/Corrigendum_AGTCircular_31122025.pdf",
    "https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2024-2025/AGT_2025_OptionCallingCircular.pdf",
    "https://www.epfindia.gov.in/site_docs/PDFs/Circulars/Y2022-2023/Circular_sanctioned_strength_23092022.pdf",
    "https://www.epfo.gov.in/",
]

def fetch(url):
    result = {"url": url}
    try:
        response = requests.get(url, timeout=25)
        result.update(status=response.status_code, final_url=response.url,
                      content_type=response.headers.get("Content-Type"), bytes=len(response.content))
        if response.ok and response.content.startswith(b"%PDF"):
            dest = ROOT / "sources" / url.rsplit("/", 1)[-1]
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(response.content)
            result["saved"] = str(dest.relative_to(ROOT))
        elif url.endswith("/"):
            from html.parser import HTMLParser
            class Links(HTMLParser):
                def handle_starttag(self, tag, attrs):
                    if tag == "a":
                        href = dict(attrs).get("href", "")
                        if any(term in href.lower() for term in ("circular", "uploads", "transfer", "document")):
                            result.setdefault("relevant_links", []).append(href)
            Links().feed(response.text)
    except requests.RequestException as error:
        result["error"] = type(error).__name__
    return result

if __name__ == "__main__":
    if len(sys.argv) > 1:
        URLS = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(fetch, URLS))
    log = ROOT / "download_checks.json"
    previous = json.loads(log.read_text(encoding="utf-8")) if log.exists() else []
    log.write_text(json.dumps(previous + results, indent=2), encoding="utf-8")
    print(json.dumps(results, indent=2))
