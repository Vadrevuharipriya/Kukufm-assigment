from api.index import Req,analyze
def test_status_contradiction_flag():
 r=analyze(Req(previous_episode="Maya says her father is alive and found a letter.",next_episode="Maya says her father died years ago."))
 assert any("status" in x["title"].lower() for x in r["findings"])
def test_report_includes_checklist():
 r=analyze(Req(previous_episode="Maya enters the hospital and sees Arjun.",next_episode="Maya arrives at a hotel and sees Arjun."))
 assert r["review_checklist"] and r["limitations"]
