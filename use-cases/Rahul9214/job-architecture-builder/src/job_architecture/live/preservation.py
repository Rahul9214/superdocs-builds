"""Preservation checks against exported DOCX text, not container bytes."""

from __future__ import annotations

import zipfile
import xml.etree.ElementTree as ElementTree
from dataclasses import dataclass
from pathlib import Path
from typing import Mapping

W_NS = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"


@dataclass(frozen=True)
class DocxLayoutSummary:
    paragraph_count: int
    run_count: int
    break_count: int
    level_expectations_paragraphs: int
    level_expectations_runs: int
    level_expectations_breaks: int
    text: str

    def as_dict(self) -> dict[str, int]:
        return {
            "paragraph_count": self.paragraph_count,
            "run_count": self.run_count,
            "break_count": self.break_count,
            "level_expectations_paragraphs": self.level_expectations_paragraphs,
            "level_expectations_runs": self.level_expectations_runs,
            "level_expectations_breaks": self.level_expectations_breaks,
        }


@dataclass(frozen=True)
class ExportPreservationCheck:
    found_new_fragment: bool
    preserved_markers: tuple[str, ...]
    missing_markers: tuple[str, ...]
    excerpt: str

    @property
    def ok(self) -> bool:
        return self.found_new_fragment and not self.missing_markers


def extract_docx_text(path: Path) -> str:
    return inspect_docx_layout(path).text


def inspect_docx_layout(path: Path) -> DocxLayoutSummary:
    """Read WordprocessingML layout. Line breaks (`w:br`) are semantic newlines, not missing fields."""
    with zipfile.ZipFile(path) as archive:
        xml = archive.read("word/document.xml")
    root = ElementTree.fromstring(xml)
    paragraphs: list[str] = []
    run_count = 0
    break_count = 0
    in_level = False
    level_paragraphs = 0
    level_runs = 0
    level_breaks = 0
    for paragraph in root.iter(f"{W_NS}p"):
        text, runs, breaks = _paragraph_plain_text(paragraph)
        run_count += runs
        break_count += breaks
        heading = text.strip().lower()
        if heading == "level expectations":
            in_level = True
            if text.strip():
                paragraphs.append(text.strip())
            continue
        if in_level and heading in {
            "progression",
            "source / evidence note",
            "role purpose",
            "responsibilities",
            "scope / decision making",
            "core competencies",
        }:
            in_level = False
        if in_level and text.strip():
            level_paragraphs += 1
            level_runs += runs
            level_breaks += breaks
        if text.strip():
            paragraphs.append(text.strip())
    return DocxLayoutSummary(
        paragraph_count=len(list(root.iter(f"{W_NS}p"))),
        run_count=run_count,
        break_count=break_count,
        level_expectations_paragraphs=level_paragraphs,
        level_expectations_runs=level_runs,
        level_expectations_breaks=level_breaks,
        text="\n".join(paragraphs),
    )


def _paragraph_plain_text(paragraph: ElementTree.Element) -> tuple[str, int, int]:
    chunks: list[str] = []
    runs = 0
    breaks = 0
    for node in paragraph.iter():
        if node.tag == f"{W_NS}r":
            runs += 1
        elif node.tag == f"{W_NS}t" and node.text:
            chunks.append(node.text)
        elif node.tag in {f"{W_NS}br", f"{W_NS}cr"}:
            chunks.append("\n")
            breaks += 1
        elif node.tag == f"{W_NS}tab":
            chunks.append("\t")
    return "".join(chunks).strip(), runs, breaks


def verify_exported_profile(
    path: Path,
    *,
    expected_new_fragment: str,
    preserved_markers: Mapping[str, str],
) -> ExportPreservationCheck:
    text = extract_docx_text(path)
    lowered = text.lower()
    missing = tuple(
        name for name, marker in preserved_markers.items() if marker.lower() not in lowered
    )
    return ExportPreservationCheck(
        found_new_fragment=expected_new_fragment.lower() in lowered,
        preserved_markers=tuple(preserved_markers),
        missing_markers=missing,
        excerpt=text[:2000],
    )
