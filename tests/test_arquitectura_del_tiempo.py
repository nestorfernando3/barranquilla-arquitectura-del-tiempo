from pathlib import Path
import re
from bs4 import BeautifulSoup

PAGE = Path(__file__).resolve().parents[1] / "arquitectura-del-tiempo.html"


def page_text() -> str:
    assert PAGE.exists(), "arquitectura-del-tiempo.html must exist"
    return PAGE.read_text(encoding="utf-8")


def soup() -> BeautifulSoup:
    return BeautifulSoup(page_text(), "html.parser")


def test_document_metadata_and_language():
    doc = soup()
    assert doc.html.get("lang") == "es"
    assert doc.find("meta", attrs={"name": "viewport"})
    assert doc.find("meta", attrs={"name": "description"})
    assert "Barranquilla" in doc.title.string


def test_required_semantic_regions_exist():
    doc = soup()
    for element_id in [
        "intro",
        "experience",
        "atlas-map",
        "building-stage",
        "story-panel",
        "timeline",
        "sources",
    ]:
        assert doc.find(id=element_id), f"missing #{element_id}"


def test_accessibility_controls_exist():
    doc = soup()
    assert doc.select_one('a[href="#experience"].skip-link')
    assert doc.find(attrs={"aria-live": re.compile("polite|assertive")})
    assert doc.find("button", id="sound-toggle")
    assert doc.find("button", id="guided-mode")
    assert doc.find("button", id="free-mode")
    assert "prefers-reduced-motion" in page_text()


def test_data_driven_buildings_and_fragment_profiles():
    text = page_text()
    assert "const BUILDINGS" in text
    assert text.count("fragmentProfile:") >= 8
    for function_name in [
        "renderPins",
        "selectBuilding",
        "renderBuilding",
        "buildFragments",
    ]:
        assert re.search(rf"function\s+{function_name}\s*\(", text)


def test_core_interaction_hooks_exist():
    text = page_text()
    for hook in [
        "keydown",
        "hashchange",
        "AudioContext",
        "pointermove",
        "data-building-id",
    ]:
        assert hook in text


def test_design_has_mobile_and_documentary_disclaimer():
    text = page_text()
    assert "@media (max-width: 760px)" in text
    assert "cartografía interpretativa" in text.lower()
    assert "datos curatoriales preliminares" in text.lower()
