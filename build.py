import csv, json, sys
from schema import COLUMNS, ACC_VARIATIONS, validate_rows, SchemaError
rows = [
# date, lift, weight, per_side, sets, reps, rpe, variation, notes, source
("2026-09-17","deadlift",145,"",4,5,7,"conventional","RPE 7 (form/bracing); very minor left coccyx feeling on set 4","pre_trainer_csv"),
("2026-09-19","bench",205,"",3,5,None,"touch-and-go","","pre_trainer_csv"),
("2026-09-21","bench",205,"",3,5,None,"touch-and-go","held weight from last week, focus on form; gym bench felt low/narrow","pre_trainer_csv"),
("2026-09-22","squat",115,35,3,10,None,"high-bar","35 lb/side; emphasizing technique; total assumes 45 lb bar","pre_trainer_csv"),
("2026-09-24","deadlift",185,"",3,8,None,"conventional","","pre_trainer_csv"),
("2026-09-26","bench",185,"",3,8,None,"touch-and-go","","pre_trainer_csv"),
("2026-10-04","squat",125,40,3,10,None,"high-bar","40 lb/side; total assumes 45 lb bar","pre_trainer_csv"),
("2026-10-05","bench",185,"",3,8,None,"touch-and-go","","pre_trainer_csv"),
("2026-10-06","deadlift",205,"",3,8,None,"conventional","","pre_trainer_csv"),
("2026-10-08","squat",135,45,3,10,None,"high-bar","45 lb/side; total assumes 45 lb bar","pre_trainer_csv"),
("2026-10-10","bench",185,"",3,8,None,"touch-and-go","note to try pausing","pre_trainer_csv"),
("2026-10-12","deadlift",205,"",3,8,None,"conventional","Done Mon morning after skipping Sun Oct 11; weight not written on Monday, 205 taken from the planned Sunday entry.","pre_trainer_csv"),
("2026-10-14","squat",165,60,3,10,None,"low-bar with belt","60 lb/side; first low-bar session; minor wrist pain; total assumes 45 lb bar","pre_trainer_csv"),
("2026-10-16","bench",185,"",3,8,None,"","","trainer_log"),
("2026-10-17","deadlift",255,"",3,8,8,"not recorded","RPE 8; planned 225","trainer_log"),
("2026-10-19","squat",185,70,3,10,8,"low-bar with belt","RPE 8. Wrists better with slightly wider grip; asking Sina about thumb position.","trainer_log"),
("2026-10-21","bench",210,"",3,5,None,"","Paused (default). First paused 3x5; previous 3x5 was 205 touch-and-go on Sep 21. Short on sleep.","trainer_log"),
("2026-10-21","bench",185,"",3,8,None,"touch-and-go","","trainer_log"),
("2026-10-24","deadlift",275,"",3,8,None,"not recorded","Difficult, form not perfect (slammed the weights down). Hook grip on set 1, straps on the follow sets.","trainer_log"),
("2026-10-31","squat",190,72.5,3,10,None,"low-bar with belt","First session back after missing the NYC trip week (Oct 26-30). Up from 185; 3x10 assumed. Accessories not reported.","trainer_log"),
("2026-11-02","bench",205,"",2,5,None,"","Paused (default). Sets 1 and 3 (set 2 was 210). Set 1 felt good.","trainer_log"),
("2026-11-02","bench",210,"",1,5,None,"","Paused (default). Set 2. Really hard; got the last rep but the pause was subpar.","trainer_log"),
("2026-11-04","deadlift",275,"",3,5,7.5,"conventional","hook grip, last set RPE 7.5","trainer_log"),
("2026-11-04","bench",165,"",3,5,5,"","Paused (default). Block 1 light second bench day; warm-up 135x5. Last set RPE 5.","trainer_log"),
("2026-11-05","squat",215,85,1,5,5.5,"low-bar with belt","top set RPE 5.5-6","trainer_log"),
("2026-11-05","squat",190,72.5,2,10,8,"low-bar with belt","back-offs ~90% of top; first set RPE 7-8; second set ~RPE 8","trainer_log"),
("2026-11-06","bench",205,"",1,5,5.5,"","Paused (default). Working set before the final top set (215); RPE 5.5 per David.","trainer_log"),
("2026-11-06","bench",215,"",1,5,7,"","Paused (default). Final top set; RPE 7 per David.","trainer_log"),
("2026-11-07","deadlift",285,"",1,5,6,"conventional","Top set, hook grip; RPE 5.5-6 per David (call it 6). Thumbs sore from hook grip (familiar, nothing abnormal per David).","trainer_log"),
("2026-11-07","deadlift",255,"",2,8,None,"conventional","Back-offs after 285x5 top set; belted, hook grip (double overhand not enough, switched to hook). First set felt good. RPE not reported.","trainer_log"),
("2026-11-09","squat",235,95,1,5,5,"low-bar with belt","Working top set RPE 5. Belt from 185; knee sleeves from ~165/185 warm-ups (first time in a while). Coach then approved a second top.","trainer_log"),
("2026-11-09","squat",245,100,1,5,6,"low-bar with belt","Final top set RPE 6 (coach-approved small-step after 235x5 @5). Belted, knee sleeves.","trainer_log"),
("2026-11-09","squat",215,85,1,8,6.5,"low-bar with belt","Back-off set 1 after final top 245. RPE 6.5. Belted, knee sleeves.","trainer_log"),
("2026-11-09","squat",225,90,1,8,7.5,"low-bar with belt","Back-off set 2. RPE 7.5 ('gun to head'). Assumed full 8 reps (user to correct if not). Belted, knee sleeves.","trainer_log"),
]
cols=COLUMNS
# Validate everything before writing anything (fail loudly on a bad row).
try:
    validate_rows([dict(zip(cols,r)) for r in rows],"sbd","build.py SBD rows")
    _acc_raw=list(csv.DictReader(open("accessories_data.csv")))
    assert list(_acc_raw[0].keys())==cols if _acc_raw else True, "accessories_data.csv header mismatch"
    validate_rows(_acc_raw,"acc","accessories_data.csv")
except SchemaError as e:
    sys.exit("BUILD FAILED - schema check:\n"+str(e))
def csv_cell(v):
    return "" if v is None else v
with open("final_data.csv","w",newline="") as f:
    w=csv.writer(f); w.writerow(cols)
    for r in sorted(rows,key=lambda r:(r[0],r[1])): w.writerow([csv_cell(x) for x in r])
# JSON for the page: keep null for missing RPE (not empty string).
data=[]
for r in sorted(rows,key=lambda r:(r[0],r[1])):
    d=dict(zip(cols,r))
    data.append(d)
# Accessories: source of truth is accessories_data.csv (same columns as final_data.csv).
# To add an accessory: add rows to accessories_data.csv and a display name here.
ACC_NAMES={"rfe_lunge":"RFE lunge","lat_pullover":"DB lat pullover (glute bridge)","cs_row":"Chest-supported row","bird_dog_row":"Bird dog row","ham_curl":"Seated hamstring curl","seated_cable_row":"Seated cable row","triceps_pressdown":"Cable triceps pressdown"}
assert set(ACC_NAMES)==set(ACC_VARIATIONS), "ACC_NAMES and schema.ACC_VARIATIONS must list the same accessories"
def num(v):
    if v is None: return ""
    s=str(v).strip()
    if not s: return ""
    return int(s) if s.lstrip("-").isdigit() else float(s)
def parse_rpe(v):
    if v is None: return None
    s=str(v).strip()
    if not s: return None
    return float(s)
acc=[]
for r in csv.DictReader(open("accessories_data.csv")):
    for k in ("weight_lb","per_side_lb","sets","reps"): r[k]=num(r[k])
    r["rpe"]=parse_rpe(r.get("rpe"))
    assert r["lift"] in ACC_NAMES, f"missing display name for accessory {r['lift']}"
    acc.append(r)
acc.sort(key=lambda r:(r["date"],r["lift"]))
html=(open("site/template.html").read().replace("__DATA__",json.dumps(data))
      .replace("__ACC_DATA__",json.dumps(acc)).replace("__ACC_NAMES__",json.dumps(ACC_NAMES)))
open("site/index.html","w").write(html)
js=open("site/chart.umd.min.js").read().replace("</script","<\\/script")
src='<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>'
assert src in html
open("site/index_deploy.html","w").write(html.replace(src,'<!-- Chart.js 4.4.1 (MIT) inlined -->\n<script>'+js+'</script>'))
