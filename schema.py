"""Strict typed row schema for David's SBD site.

Every row (SBD rows in build.py, accessory rows in accessories_data.csv)
is parsed into a frozen Row model with explicit types. validate_rows()
raises SchemaError listing every bad row; build.py calls it before writing
anything. Standard library only — no extra CI dependency.

The ordered variation lists are the single source of truth for:
- allowed variation values on each lift
- chart marker assignment (index 0 = default = first shape in the palette)
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import date as date_cls
from typing import Any, Mapping, Optional, Union

COLUMNS = [
    "date", "lift", "weight_lb", "per_side_lb", "sets", "reps",
    "rpe", "variation", "notes", "source",
]

# Ordered: first entry is the default and receives the first marker shape.
SBD_VARIATIONS = {
    "squat": ("high-bar", "low-bar with belt"),
    "bench": ("", "touch-and-go"),
    "deadlift": ("conventional", "not recorded"),
}
ACC_VARIATIONS = {
    "rfe_lunge": ("with hand support (UE support)", "no hand support"),
    "lat_pullover": ("in glute bridge", "not recorded"),
    "cs_row": ("with dumbbells",),
    "bird_dog_row": ("reps per side", "not recorded"),
    "ham_curl": ("seated", "not recorded"),
    "seated_cable_row": ("narrow neutral V-handle", "wide grip", "not recorded"),
    "triceps_pressdown": ("straight bar", "not recorded"),
    "straight_arm_pulldown": ("straight bar", "not recorded"),
    "lat_pulldown": ("not recorded",),
    "reverse_nordic": ("bodyweight", "banded", "not recorded"),
    "copenhagen": ("seconds per side", "not recorded"),
    "ir_pull_apart": ("banded", "not recorded"),
    "dip": ("added weight",),
    "pull_up": ("unassisted",),
    "back_extension": ("with plate",),
}

# Optional display labels. Anything omitted is shown as the stored variation
# (or "Not recorded" / "Comp standard" via variation_label()).
VARIATION_LABELS = {
    ("bench", ""): "Comp standard",
    ("bench", "touch-and-go"): "Touch-and-go",
    ("squat", "high-bar"): "High-bar",
    ("squat", "low-bar with belt"): "Low-bar (belted)",
    ("deadlift", "conventional"): "Conventional",
    ("deadlift", "not recorded"): "Stance not recorded",
    ("reverse_nordic", "bodyweight"): "Bodyweight",
    ("reverse_nordic", "banded"): "Banded",
    ("copenhagen", "seconds per side"): "Seconds per side",
    ("ir_pull_apart", "banded"): "Banded",
    ("seated_cable_row", "narrow neutral V-handle"): "Narrow V-handle",
    ("seated_cable_row", "wide grip"): "Wide grip",
    ("dip", "added weight"): "Added weight",
    ("pull_up", "unassisted"): "Unassisted",
    ("back_extension", "with plate"): "With plate",
}

# Bodyweight, banded, or timed-hold accessories may leave weight_lb blank.
# For copenhagen, reps is the hold in seconds (variation "seconds per side").
UNLOADED_ACCESSORIES = {"reverse_nordic", "copenhagen", "ir_pull_apart", "pull_up"}
SOURCES = ("pre_trainer_csv", "pre_trainer_log_pdf", "trainer_log")
KINDS = ("sbd", "acc")
SQUAT_BAR_LB = 45  # squat total = 2 x per_side + bar
RPE_MIN = 1.0
RPE_MAX = 10.0

Num = Union[int, float]

_OVERLAP = set(SBD_VARIATIONS) & set(ACC_VARIATIONS)
if _OVERLAP:
    raise RuntimeError(f"lift names in both SBD_VARIATIONS and ACC_VARIATIONS: {sorted(_OVERLAP)}")


def all_variations():
    """Lift -> ordered variation tuple, SBD then accessories."""
    return {**SBD_VARIATIONS, **ACC_VARIATIONS}


def variations_for(kind: str):
    if kind == "sbd":
        return SBD_VARIATIONS
    if kind == "acc":
        return ACC_VARIATIONS
    raise ValueError(f"kind: must be 'sbd' or 'acc', got {kind!r}")


def variation_label(lift: str, variation: str) -> str:
    if (lift, variation) in VARIATION_LABELS:
        return VARIATION_LABELS[(lift, variation)]
    if variation == "not recorded":
        return "Not recorded"
    if variation == "":
        return ""
    return variation


def variation_label_map():
    """{lift: {stored_variation: display_label}} for the page."""
    return {
        lift: {var: variation_label(lift, var) for var in vars_}
        for lift, vars_ in all_variations().items()
    }


class SchemaError(ValueError):
    pass


class FieldError(ValueError):
    """A single field failed its type or enum check."""

    def __init__(self, field: str, message: str):
        super().__init__(f"{field}: {message}")
        self.field = field


def _iso_date(v: Any) -> str:
    if not isinstance(v, str):
        raise FieldError("date", f"must be text, got {type(v).__name__}: {v!r}")
    try:
        parsed = date_cls.fromisoformat(v)
    except ValueError:
        raise FieldError("date", f"not a real ISO date (YYYY-MM-DD): {v!r}") from None
    if parsed.isoformat() != v:
        raise FieldError("date", f"not a real ISO date (YYYY-MM-DD): {v!r}")
    return v


def _text(v: Any, field: str, *, empty_ok: bool = True) -> str:
    if v is None:
        v = ""
    if not isinstance(v, str):
        raise FieldError(field, f"must be text, got {type(v).__name__}: {v!r}")
    if not empty_ok and not v:
        raise FieldError(field, "must be non-empty text")
    return v


def _kind(v: Any) -> str:
    if v not in KINDS:
        raise FieldError("kind", f"must be one of {list(KINDS)}, got {v!r}")
    return v


def _enum(v: Any, field: str, allowed) -> str:
    if v not in allowed:
        raise FieldError(field, f"{v!r} not in allowed set {list(allowed)}")
    return v


def _num(v: Any, field: str, *, positive: bool = True) -> Num:
    if isinstance(v, bool):
        raise FieldError(field, f"not a number: {v!r}")
    if isinstance(v, str):
        s = v.strip()
        try:
            v = int(s) if s.lstrip("-").isdigit() else float(s)
        except ValueError:
            raise FieldError(field, f"not a number: {s!r}") from None
    if isinstance(v, int):
        n: Num = v
    elif isinstance(v, float):
        n = v
    else:
        raise FieldError(field, f"not a number: {v!r}")
    if positive and not n > 0:
        raise FieldError(field, f"must be > 0, got {n!r}")
    return n


def _int(v: Any, field: str) -> int:
    n = _num(v, field)
    if not isinstance(n, int) or isinstance(n, bool):
        raise FieldError(field, f"must be a whole number, got {v!r}")
    return n


def _rpe(v: Any) -> Optional[float]:
    if v is None or v == "":
        return None
    if isinstance(v, str) and not v.strip():
        return None
    n = _num(v, "rpe", positive=False)
    if not (RPE_MIN <= float(n) <= RPE_MAX):
        raise FieldError("rpe", f"must be in [{RPE_MIN}, {RPE_MAX}], got {n!r}")
    return float(n)


def _blank(v: Any) -> bool:
    return v is None or v == "" or (isinstance(v, str) and not v.strip())


def _weight(v: Any, lift: str, kind: str) -> Union[Num, str]:
    if _blank(v):
        if kind == "acc" and lift in UNLOADED_ACCESSORIES:
            return ""
        raise FieldError(
            "weight_lb",
            "required (bodyweight/band/timed accessories may leave this blank)",
        )
    return _num(v, "weight_lb")


def _per_side(v: Any, lift: str, weight: Union[Num, str]) -> Union[Num, str]:
    if _blank(v):
        if lift == "squat":
            raise FieldError("per_side_lb", "required for squat")
        return ""
    ps = _num(v, "per_side_lb")
    if lift != "squat":
        raise FieldError("per_side_lb", f"only used for squat, got {ps!r}")
    if 2 * ps + SQUAT_BAR_LB != weight:
        raise FieldError(
            "per_side_lb",
            f"weight_lb {weight} != 2 x per_side {ps} + {SQUAT_BAR_LB} bar",
        )
    return ps


def _expect_columns(raw: Mapping[str, Any]) -> None:
    missing = [c for c in COLUMNS if c not in raw]
    if missing:
        raise ValueError(f"missing columns {missing}")


@dataclass(frozen=True)
class Row:
    """One logged set. Types are the post-validation forms written to the site."""

    date: str
    lift: str
    weight_lb: Union[Num, str]  # "" for unloaded accessories
    per_side_lb: Union[Num, str]  # "" when not applicable
    sets: int
    reps: int
    rpe: Optional[float]  # None when unknown
    variation: str
    notes: str
    source: str
    kind: str  # "sbd" or "acc" (not a column)

    def key(self):
        return (self.date, self.lift, self.weight_lb, self.sets, self.reps, self.variation)

    @classmethod
    def parse(cls, raw: Any, kind: str) -> "Row":
        if not isinstance(raw, Mapping):
            raise ValueError(f"row must be a mapping, got {type(raw).__name__}")
        kind = _kind(kind)
        _expect_columns(raw)
        lift = _text(raw["lift"], "lift", empty_ok=False)
        allowed = variations_for(kind)
        if lift not in allowed:
            raise FieldError("lift", f"{lift!r} not in allowed {kind} set {sorted(allowed)}")
        weight = _weight(raw["weight_lb"], lift, kind)
        variation = raw["variation"] or ""
        if not isinstance(variation, str):
            raise FieldError("variation", f"must be text, got {type(variation).__name__}: {variation!r}")
        if variation not in allowed[lift]:
            raise FieldError(
                "variation",
                f"{variation!r} not allowed for {lift}; allowed {list(allowed[lift])}",
            )
        return cls(
            date=_iso_date(raw["date"]),
            lift=lift,
            weight_lb=weight,
            per_side_lb=_per_side(raw["per_side_lb"], lift, weight),
            sets=_int(raw["sets"], "sets"),
            reps=_int(raw["reps"], "reps"),
            rpe=_rpe(raw["rpe"]),
            variation=variation,
            notes=_text(raw["notes"], "notes"),
            source=_enum(raw["source"], "source", SOURCES),
            kind=kind,
        )


def validate_row(r: dict, kind: str) -> Row:
    return Row.parse(r, kind)


def validate_rows(rows, kind, label):
    """rows: iterable of dicts with COLUMNS. Returns [Row]. Raises SchemaError on any problem."""
    out, errs, seen = [], [], {}
    for i, r in enumerate(rows, 1):
        try:
            row = Row.parse(r, kind)
        except (FieldError, ValueError) as e:
            errs.append(f"  {label} row {i} ({(r or {}).get('date')!s} {(r or {}).get('lift')!s}): {e}")
            continue
        if row.key() in seen:
            errs.append(
                f"  {label} row {i}: duplicate of row {seen[row.key()]} "
                f"(date, lift, weight, sets x reps, variation) = {row.key()}"
            )
        else:
            seen[row.key()] = i
        out.append(row)
    if errs:
        raise SchemaError(f"{len(errs)} bad row(s) in {label}:\n" + "\n".join(errs))
    return out
