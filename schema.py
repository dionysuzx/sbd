"""Row schema for David's SBD site (one row = one plotted point).

Every row (SBD rows in build.py -> final_data.csv, accessory rows in
accessories_data.csv) has the same columns. validate_rows() checks each row
and raises SchemaError listing every bad row; build.py calls it before building.
Standard library only.

rpe is first-class and nullable: omit / None / "" when unknown.
"""
from dataclasses import dataclass
from datetime import date
from typing import Optional, Union

COLUMNS = [
    "date", "lift", "weight_lb", "per_side_lb", "sets", "reps",
    "rpe", "variation", "notes", "source",
]

# Allowed variations per lift / accessory. "" = default (bench: paused competition-style).
SBD_VARIATIONS = {
    "squat": {"high-bar", "low-bar with belt"},
    "bench": {"", "touch-and-go"},
    "deadlift": {"conventional", "not recorded"},
}
ACC_VARIATIONS = {
    "rfe_lunge": {"with hand support (UE support)", "not recorded"},
    "lat_pullover": {"in glute bridge", "not recorded"},
    "cs_row": {"with dumbbells", "not recorded"},
    "bird_dog_row": {"reps per side", "not recorded"},
    "ham_curl": {"seated", "not recorded"},
    "seated_cable_row": {"narrow neutral V-handle", "not recorded"},
    "triceps_pressdown": {"straight bar", "not recorded"},
    "straight_arm_pulldown": {"straight bar", "not recorded"},
    "lat_pulldown": {"not recorded"},
    "reverse_nordic": {"bodyweight", "banded", "not recorded"},
    "copenhagen": {"seconds per side", "not recorded"},
    "ir_pull_apart": {"banded", "not recorded"},
}
# Bodyweight, banded, or timed-hold accessories may leave weight_lb blank.
# For copenhagen, reps is the hold in seconds (variation "seconds per side").
UNLOADED_ACCESSORIES = {"reverse_nordic", "copenhagen", "ir_pull_apart"}
SOURCES = {"pre_trainer_csv", "pre_trainer_log_pdf", "trainer_log"}
SQUAT_BAR_LB = 45  # squat total = 2 x per_side + bar
RPE_MIN = 1.0
RPE_MAX = 10.0

Num = Union[int, float]


class SchemaError(ValueError):
    pass


@dataclass(frozen=True)
class Row:
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


def _num(v, field, positive=True):
    if isinstance(v, bool):
        raise ValueError(f"{field}: not a number: {v!r}")
    if isinstance(v, str):
        s = v.strip()
        try:
            v = int(s) if s.lstrip("-").isdigit() else float(s)
        except ValueError:
            raise ValueError(f"{field}: not a number: {s!r}")
    if not isinstance(v, (int, float)):
        raise ValueError(f"{field}: not a number: {v!r}")
    if positive and not v > 0:
        raise ValueError(f"{field}: must be > 0, got {v!r}")
    return v


def _int(v, field):
    n = _num(v, field)
    if not isinstance(n, int):
        raise ValueError(f"{field}: must be a whole number, got {v!r}")
    return n


def _rpe(v) -> Optional[float]:
    if v is None or v == "":
        return None
    if isinstance(v, str) and not v.strip():
        return None
    n = _num(v, "rpe", positive=False)
    if not (RPE_MIN <= float(n) <= RPE_MAX):
        raise ValueError(f"rpe: must be in [{RPE_MIN}, {RPE_MAX}], got {n!r}")
    return float(n)


def validate_row(r: dict, kind: str) -> Row:
    allowed = SBD_VARIATIONS if kind == "sbd" else ACC_VARIATIONS
    missing = [c for c in COLUMNS if c not in r]
    if missing:
        raise ValueError(f"missing columns {missing}")
    d = str(r["date"])
    try:
        if date.fromisoformat(d).isoformat() != d:
            raise ValueError
    except ValueError:
        raise ValueError(f"date: not a real ISO date (YYYY-MM-DD): {d!r}")
    lift = r["lift"]
    if lift not in allowed:
        raise ValueError(f"lift: {lift!r} not in allowed {kind} set {sorted(allowed)}")
    raw_w = r["weight_lb"]
    if raw_w in ("", None) or (isinstance(raw_w, str) and not str(raw_w).strip()):
        if kind == "acc" and lift in UNLOADED_ACCESSORIES:
            w = ""
        else:
            raise ValueError("weight_lb: required (bodyweight/band/timed accessories may leave this blank)")
    else:
        w = _num(raw_w, "weight_lb")
    ps = r["per_side_lb"]
    if ps in ("", None):
        ps = ""
        if lift == "squat":
            raise ValueError("per_side_lb: required for squat")
    else:
        ps = _num(ps, "per_side_lb")
        if lift != "squat":
            raise ValueError(f"per_side_lb: only used for squat, got {ps!r}")
        if 2 * ps + SQUAT_BAR_LB != w:
            raise ValueError(f"weight_lb {w} != 2 x per_side {ps} + {SQUAT_BAR_LB} bar")
    sets, reps = _int(r["sets"], "sets"), _int(r["reps"], "reps")
    rpe = _rpe(r["rpe"])
    var = r["variation"] or ""
    if var not in allowed[lift]:
        raise ValueError(f"variation: {var!r} not allowed for {lift}; allowed {sorted(allowed[lift])}")
    src = r["source"]
    if src not in SOURCES:
        raise ValueError(f"source: {src!r} not in {sorted(SOURCES)}")
    notes = r["notes"] or ""
    if not isinstance(notes, str):
        raise ValueError(f"notes: must be text, got {notes!r}")
    return Row(d, lift, w, ps, sets, reps, rpe, var, notes, src, kind)


def validate_rows(rows, kind, label):
    """rows: iterable of dicts with COLUMNS. Returns [Row]. Raises SchemaError on any problem."""
    out, errs, seen = [], [], {}
    for i, r in enumerate(rows, 1):
        try:
            row = validate_row(r, kind)
        except ValueError as e:
            errs.append(f"  {label} row {i} ({r.get('date')!s} {r.get('lift')!s}): {e}")
            continue
        if row.key() in seen:
            errs.append(f"  {label} row {i}: duplicate of row {seen[row.key()]} "
                        f"(date, lift, weight, sets x reps, variation) = {row.key()}")
        else:
            seen[row.key()] = i
        out.append(row)
    if errs:
        raise SchemaError(f"{len(errs)} bad row(s) in {label}:\n" + "\n".join(errs))
    return out
