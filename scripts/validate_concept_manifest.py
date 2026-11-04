#!/usr/bin/env python3
"""Validate the experimental modular character manifest and its referenced SVGs.

This is an authoring/package gate only. The game runtime still uses the
explicitly embedded/current SVG assets and does not consume this JSON.
"""
from __future__ import annotations

import argparse
import json
import math
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path


def fail(errors: list[str], label: str, message: str) -> None:
    errors.append(f"{label}: {message}")


def pair(value: object) -> bool:
    return (isinstance(value, list) and len(value) == 2 and
            all(isinstance(v, (int, float)) and not isinstance(v, bool)
                and math.isfinite(v) for v in value))


def rect(value: object, width: int, height: int) -> bool:
    if not isinstance(value, list) or len(value) != 4:
        return False
    if any(not isinstance(v, (int, float)) or isinstance(v, bool)
           or not math.isfinite(v) for v in value):
        return False
    x, y, right, bottom = value
    return 0 <= x < right <= width and 0 <= y < bottom <= height


def inside(root: Path, candidate: Path) -> bool:
    try:
        candidate.resolve().relative_to(root.resolve())
        return True
    except ValueError:
        return False


def validate(manifest_path: Path) -> list[str]:
    errors: list[str] = []
    try:
        data = json.loads(manifest_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        return [f"manifest: cannot read valid UTF-8 JSON ({exc})"]
    if not isinstance(data, dict):
        return ["manifest: root must be an object"]

    if data.get("schema") != "smf-concept-modular/1":
        fail(errors, "schema", "expected smf-concept-modular/1")
    canvas = data.get("referenceCanvas")
    if (not isinstance(canvas, list) or len(canvas) != 2 or
            any(not isinstance(v, int) or isinstance(v, bool) or v <= 0 for v in canvas)):
        fail(errors, "referenceCanvas", "expected two positive integer dimensions")
        width, height = 0, 0
    else:
        width, height = canvas
    views = data.get("viewIds")
    authored = data.get("authoredViews")
    if not isinstance(views, list) or not views or len(set(views)) != len(views):
        fail(errors, "viewIds", "must be a non-empty list of unique view IDs")
        views = []
    if not isinstance(authored, list) or not authored or len(set(authored)) != len(authored):
        fail(errors, "authoredViews", "must be a non-empty list of unique authored views")
        authored = []
    for view in authored:
        if view not in views:
            fail(errors, "authoredViews", f"{view!r} is absent from viewIds")
    if data.get("authoringView") not in authored:
        fail(errors, "authoringView", "must name one authored view")
    logical_height = data.get("logicalPlayerHeight")
    if (not isinstance(logical_height, (int, float)) or isinstance(logical_height, bool)
            or not math.isfinite(logical_height) or logical_height <= 0):
        fail(errors, "logicalPlayerHeight", "must be finite and positive")

    layers = [data.get("runtimeLayer")]
    additional = data.get("additionalLayers", [])
    if not isinstance(additional, list):
        fail(errors, "additionalLayers", "must be a list")
        additional = []
    layers.extend(additional)
    if not layers or not isinstance(layers[0], dict):
        fail(errors, "runtimeLayer", "required runtime layer is missing")

    package_root = manifest_path.resolve().parent.parent
    seen_ids: set[str] = set()
    view_canvases: dict[str, list[int]] = {}
    for index, layer in enumerate(layers):
        label = f"layers[{index}]"
        if not isinstance(layer, dict):
            fail(errors, label, "must be an object")
            continue
        layer_id = layer.get("id")
        if not isinstance(layer_id, str) or not layer_id.strip():
            fail(errors, label, "id must be a non-empty string")
        elif layer_id in seen_ids:
            fail(errors, label, f"duplicate id {layer_id!r}")
        else:
            seen_ids.add(layer_id)
        if layer.get("view") not in views:
            fail(errors, label, "view must be listed in viewIds")
        elif layer.get("view") not in authored:
            fail(errors, label, "layer view must be declared in authoredViews")
        layer_canvas = layer.get("sourceCanvas")
        if (not isinstance(layer_canvas, list) or len(layer_canvas) != 2 or
                any(not isinstance(v, int) or isinstance(v, bool) or v <= 0 for v in layer_canvas)):
            fail(errors, label, "sourceCanvas must contain two positive integer dimensions")
            layer_width, layer_height = 0, 0
        else:
            layer_width, layer_height = layer_canvas
            view = layer.get("view")
            if isinstance(view, str):
                previous = view_canvases.setdefault(view, layer_canvas)
                if previous != layer_canvas:
                    fail(errors, label, "layers in one view must share sourceCanvas")
            if view == data.get("authoringView") and layer_canvas != canvas:
                fail(errors, label, "authoring-view sourceCanvas must equal referenceCanvas")
        if not rect(layer.get("cropRect"), layer_width, layer_height):
            fail(errors, label, "cropRect must be a non-empty rectangle within sourceCanvas")
        if not pair(layer.get("trimOffset")) or any(v < 0 for v in layer["trimOffset"]):
            fail(errors, label, "trimOffset must be a finite non-negative pair")
        if not pair(layer.get("pivot")) or not (0 <= layer["pivot"][0] <= layer_width and 0 <= layer["pivot"][1] <= layer_height):
            fail(errors, label, "pivot must be a finite point within sourceCanvas")
        if "alphaBoundsEstimate" in layer and not rect(layer["alphaBoundsEstimate"], layer_width, layer_height):
            fail(errors, label, "alphaBoundsEstimate must be a non-empty rectangle within sourceCanvas")
        z = layer.get("z")
        if not isinstance(z, (int, float)) or isinstance(z, bool) or not math.isfinite(z):
            fail(errors, label, "z must be finite")
        if not isinstance(layer.get("noMirroring"), bool):
            fail(errors, label, "noMirroring must be explicit")

        asset = layer.get("asset")
        if not isinstance(asset, str) or not asset:
            fail(errors, label, "asset must be a relative path")
            continue
        asset_path = (manifest_path.parent / asset).resolve()
        if Path(asset).is_absolute() or not inside(package_root, asset_path):
            fail(errors, label, "asset path must stay inside the character package")
            continue
        if not asset_path.is_file():
            fail(errors, label, f"asset does not exist: {asset}")
            continue
        if asset_path.suffix.lower() == ".svg":
            try:
                svg = ET.parse(asset_path).getroot()
                svg_width = re.fullmatch(r"([0-9]+)(?:px)?", svg.attrib.get("width", ""))
                svg_height = re.fullmatch(r"([0-9]+)(?:px)?", svg.attrib.get("height", ""))
                view_box = [float(v) for v in re.split(r"[ ,]+", svg.attrib.get("viewBox", "").strip())]
                if not svg_width or not svg_height:
                    raise ValueError("root width/height must be integer pixel dimensions")
                if (int(svg_width.group(1)), int(svg_height.group(1))) != (layer_width, layer_height):
                    fail(errors, label, "SVG dimensions must equal sourceCanvas")
                if len(view_box) != 4 or view_box != [0.0, 0.0, float(layer_width), float(layer_height)]:
                    fail(errors, label, "SVG viewBox must match the complete sourceCanvas")
            except (ET.ParseError, ValueError) as exc:
                fail(errors, label, f"invalid SVG geometry ({exc})")
        elif asset_path.suffix.lower() not in {".png", ".webp"}:
            fail(errors, label, "asset format must be SVG, PNG, or WebP")
    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("manifest", nargs="?", type=Path,
                        default=Path(__file__).resolve().parents[1] /
                        "assets/characters/concept_modular_v1/manifests/rig.json")
    args = parser.parse_args()
    errors = validate(args.manifest)
    if errors:
        for error in errors:
            print(f"FAIL {error}")
        return 1
    print(f"CONCEPT_MANIFEST_PASS {args.manifest} ({len(json.loads(args.manifest.read_text(encoding='utf-8')).get('additionalLayers', [])) + 1} layers)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
