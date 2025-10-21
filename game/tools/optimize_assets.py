#!/usr/bin/env python3
"""Compress non-sprite PNG assets used by the game.

This script applies palette quantisation and maximum zlib compression to
non-sprite PNG files inside the ``assets`` directory. It keeps the original
dimensions intact so existing drawing code continues to work unchanged.

Usage::

    python3 tools/optimize_assets.py [--dry-run] [--verbose]
"""

from __future__ import annotations

import argparse
import io
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List

from PIL import Image

PROJECT_ROOT = Path(__file__).resolve().parents[1]
ASSETS_ROOT = PROJECT_ROOT / "assets"

SKIP_KEYWORDS = ("sprites",)
DEFAULT_COLORS = 128
COLORS_BY_PARENT = {
    "ui": 96,
}


@dataclass
class Result:
    path: Path
    before: int
    after: int
    changed: bool
    colors: int

    @property
    def delta(self) -> int:
        return self.after - self.before

    @property
    def ratio(self) -> float:
        if self.before == 0:
            return 1.0
        return self.after / self.before


def iter_target_pngs() -> Iterable[Path]:
    for candidate in ASSETS_ROOT.rglob("*.png"):
        lowered: List[str] = [part.lower() for part in candidate.relative_to(ASSETS_ROOT).parts]
        if any(keyword in part for part in lowered for keyword in SKIP_KEYWORDS):
            continue
        yield candidate


def choose_palette_size(path: Path) -> int:
    return COLORS_BY_PARENT.get(path.parent.name, DEFAULT_COLORS)


def has_alpha(img: Image.Image) -> bool:
    if "A" in img.getbands():
        return True
    if img.mode == "P" and "transparency" in img.info:
        return True
    return False


def optimise_png(path: Path, colours: int, dry_run: bool) -> Result:
    original_bytes = path.read_bytes()
    image = Image.open(io.BytesIO(original_bytes))

    if has_alpha(image):
        base = image.convert("RGBA")
        method = Image.FASTOCTREE
        dither = Image.FLOYDSTEINBERG
    else:
        base = image.convert("RGB")
        method = Image.MEDIANCUT
        dither = Image.FLOYDSTEINBERG

    quantised = base.quantize(colors=colours, method=method, dither=dither)
    if method == Image.FASTOCTREE and "transparency" in quantised.info:
        transparency = quantised.info["transparency"]
        if isinstance(transparency, (list, tuple)):
            quantised.info["transparency"] = bytes(transparency)

    buffer = io.BytesIO()
    quantised.save(buffer, format="PNG", optimize=True, compress_level=9)
    compressed_bytes = buffer.getvalue()

    changed = len(compressed_bytes) < len(original_bytes)
    if changed and not dry_run:
        path.write_bytes(compressed_bytes)

    return Result(
        path=path,
        before=len(original_bytes),
        after=len(compressed_bytes) if changed else len(original_bytes),
        changed=changed,
        colors=colours,
    )


def format_size(value: int) -> str:
    units = ["B", "KB", "MB"]
    size = float(value)
    for unit in units:
        if size < 1024 or unit == units[-1]:
            return f"{size:.1f} {unit}"
        size /= 1024
    return f"{size:.1f} {units[-1]}"


def main() -> None:
    parser = argparse.ArgumentParser(description="Optimise PNG assets for web delivery.")
    parser.add_argument("--dry-run", action="store_true", help="Report potential savings without writing files.")
    parser.add_argument("--verbose", action="store_true", help="Print per-file details even when no change occurs.")
    args = parser.parse_args()

    results: List[Result] = []
    for png_path in iter_target_pngs():
        colours = choose_palette_size(png_path)
        result = optimise_png(png_path, colours, args.dry_run)
        results.append(result)
        if args.verbose or result.changed:
            status = "saved" if result.changed else "skipped"
            print(
                f"{status:7s} {png_path.relative_to(PROJECT_ROOT)} "
                f"({format_size(result.before)} -> {format_size(result.after)}; {result.colors} colours)"
            )

    total_before = sum(item.before for item in results)
    total_after = sum(item.after for item in results)
    total_saved = total_before - total_after

    print(f"Processed {len(results)} PNG files.")
    print(f" Total before: {format_size(total_before)}")
    print(f" Total after : {format_size(total_after)}")
    print(f" Space saved: {format_size(total_saved)}")


if __name__ == "__main__":
    main()
