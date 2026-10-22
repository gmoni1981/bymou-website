from pathlib import Path
import json, html, re, math
from collections import deque
out=Path('blender/casa-mirador/approval');p=json.loads((out/'proposal.json').read_text());g=json.loads((out/'layout-geometry.json').read_text())
# Make dimensions and enclosure key legible directly on the plans.
for level,fn in [('GF','ground-plan.svg'),('Upper','upper-plan.svg')]:
 s=(out/fn).read_text();s=re.sub(r'(<rect[^>]+height="3\.36"[^>]+fill=")#403c35',r'\1#829b99',s)
 additions=[]
 for rid,x0,y0,x1,y1 in g['rooms'][level]:
  x=100+(x0+x1)/2*42;y=90+(16.7-y1+.8)*42
  additions.append(f'<text x="{x:.2f}" y="{y:.2f}" text-anchor="middle" font-family="Arial" font-size="10" fill="#5b5549">{x1-x0:.2f} × {y1-y0:.2f} m</text>')
 s=s.replace('</svg>',''.join(additions)+'</svg>');s=s.replace('Orange points = clear door openings. Room IDs match the schedule.','Orange = doors; blue-grey end lines = closeable glazing. IDs match schedule.')
 (out/fn).write_text(s)
# Roof plan; all dimensions proposed.
parts=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 690 920"><rect width="690" height="920" fill="#faf8f1"/><style>text{font-family:Arial,sans-serif;fill:#39392f}</style><text x="35" y="30" font-size="13">PROPOSED · ROOF TERRACE · METRES</text>']
def rect(x,y,w,d,fill,stroke='#716958'):
 parts.append(f'<rect x="{100+x*42}" y="{90+(16.7-y-d)*42}" width="{w*42}" height="{d*42}" fill="{fill}" stroke="{stroke}" stroke-width="1.4"/>')
def text(x,y,s,size=12):parts.append(f'<text x="{100+x*42}" y="{90+(16.7-y)*42}" text-anchor="middle" font-size="{size}">{html.escape(s)}</text>')
rect(0,0,11.2,16.7,'#e8dfd0');rect(4.7,3.6,3,10,'#fffdf8');text(6.2,8.8,'OPEN COURTYARD');text(6.2,8.3,'3.00 × 10.00 m',10)
rect(0,0,3.5,2.8,'#bcb4a3');text(1.75,1.8,'R01 · stair');text(1.75,1.3,'3.50 × 2.80',10);text(1.75,.8,'9.80 m² enclosed',10)
rect(.5,6,.9,3,'#fbf8f0');rect(8.5,5,1.8,1.1,'#bca98c');rect(10.4,9,.55,3,'#bca98c')
for x,y in [(1,12),(3,14.8),(9,14.8),(9.5,2)]:rect(x-.35,y-.35,.7,.7,'#a5ad90')
text(2.3,8,'LOUNGE',10);text(9.35,4.3,'OUTDOOR DINING',10);text(9.4,10.5,'KITCHEN',10);text(5.6,15.2,'ROOF GARDEN / TERRACE',11)
text(5.6,-.9,'11.20 m · reference width');text(5.6,17.5,'16.70 m depth · PROPOSED')
parts.append('<text x="35" y="865" font-size="11">147.24 m² open gross roof plate, before parapets and planting.</text><text x="35" y="885" font-size="11">Only the 9.80 m² stair enclosure is included in indoor built area.</text></svg>');(out/'roof-plan.svg').write_text(''.join(parts))
# Independent 2D passage audit: 0.10m grid and 0.20m person radius.
checks={};step=.1;rad=.2
for level in ['GF','Upper']:
 targets={'entrance':(5.6,.65),'stair approach':(3.7,1.9),'living':(2.6,5.1),'kitchen':(2.6,10.1),'dining':(5.6,14.6),'guest1':(8.2,7.15),'guest2':(8.2,10),'guestWC':(9.8,1),'laundry':(9.8,2.65),'pantry':(8.3,14.6),'bath1':(9.7,4.65),'bath2':(9.7,12.5)} if level=='GF' else {'stair approach':(3.7,1.9),'office':(2.6,5.1),'family':(2.6,10.1),'primary':(8.3,1.7),'bedroom2':(8.3,14.6),'bath1':(9.7,1.65),'bath2':(9.7,15.25),'rear landing':(5.6,14.6)}
 obstacles=[]
 for x1,y1,x2,y2,t in g['walls'][level]:obstacles.append((x1-t/2,y1-t/2,x2+t/2,y2+t/2))
 obstacles.append((.2,.3,3.3,2.5))
 if level=='GF':obstacles += [(4.7,6.4,6.5,10.8),(5.1,4.15,6.6,5.15),(5.1,12,6.6,13),(.5,5.1,1.35,7.65),(.5,9,1.1,12.9),(1.4,14.6,3.8,16.35),(8.65,6,10.25,8),(8.65,9,10.25,11)]
 else:obstacles += [(4.7,3.6,7.7,13.6),(.5,5.1,1.2,7.1),(.5,10.1,1.35,12.6),(8.65,5.45,10.25,7.45),(8.65,9.4,10.25,11.4)]
 def free(ix,iy):
  x,y=ix*step,iy*step
  if not(.25+rad<=x<=10.95-rad and .25+rad<=y<=16.45-rad):return False
  return not any(x0-rad<x<x1+rad and y0-rad<y<y1+rad for x0,y0,x1,y1 in obstacles)
 start=(56,7) if level=='GF' else(37,19);seen={start};q=deque([start])
 while q:
  x,y=q.popleft()
  for nxt in [(x-1,y),(x+1,y),(x,y-1),(x,y+1)]:
   if nxt not in seen and free(*nxt):seen.add(nxt);q.append(nxt)
 results={name:(round(x/step),round(y/step)) in seen for name,(x,y) in targets.items()};checks[level]={'targets':results,'reachableGridCells':len(seen)}
assert all(all(v['targets'].values()) for v in checks.values()),checks
assert abs(2*(11.2*16.7-42)+9.8-299.88)<1e-8
validation={'areaArithmetic':'passed','horizontalPassageAudit':checks,'bodyRadiusMetres':rad,'gridMetres':step,'scope':'Schematic 2D walls, door gaps, pool, principal furniture and planting. Not final cinematic route validation. Detailed door swings, fixtures, stairs and headroom require final model checks after layout approval.'}
(out/'validation.json').write_text(json.dumps(validation,indent=2))
rows=''.join('<tr>'+''.join(f'<td>{html.escape(str(c))}</td>' for c in r)+'</tr>' for r in p['rooms'])
notes=''.join(f'<li>{html.escape(n)}</li>' for n in p['notes'])
report=f'''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Casa Mirador — layout approval</title>
<style>*{{box-sizing:border-box}}body{{margin:0;background:#f5f1e8;color:#302d27;font:16px/1.6 Arial,sans-serif}}main{{max-width:1380px;margin:auto;padding:54px 5vw}}header{{border-top:1px solid #aaa08e;padding-top:24px}}.kicker{{font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#985735}}h1{{font:normal clamp(40px,5vw,74px)/1.05 Georgia,serif;margin:18px 0}}h2{{font:normal 32px Georgia,serif;margin-top:50px}}h3{{font:normal 23px Georgia,serif}}p{{max-width:920px}}.lede{{font:24px/1.45 Georgia,serif}}.summary{{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin:34px 0}}.stat{{border-top:1px solid #b8ad9a;padding-top:14px}}.stat b{{font:38px Georgia,serif;display:block}}.stat span,figcaption,.note{{font-size:13px;color:#706656}}.plans{{display:grid;grid-template-columns:repeat(2,1fr);gap:22px}}figure{{margin:0}}img{{width:100%;display:block}}.overview{{background:#e3dfd4}}.three{{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}}figcaption{{padding:12px 0}}table{{width:100%;border-collapse:collapse;font-size:13px}}td,th{{border-bottom:1px solid #cfc6b7;text-align:left;padding:12px 10px;vertical-align:top}}th{{font-size:11px;letter-spacing:1px;text-transform:uppercase}}.scroll{{overflow:auto}}a{{color:#814729}}.callout{{border-left:3px solid #a26a45;padding:8px 22px;background:#ece6da}}li{{margin:8px 0}}.approval{{border-top:1px solid #a99b85;margin-top:40px;padding-top:24px}}@media(max-width:700px){{main{{padding:25px 18px}}.plans,.three,.summary{{grid-template-columns:1fr}}h2{{font-size:27px}}table{{min-width:780px}}}}@media print{{main{{padding:0}}h2,figure,tr{{break-inside:avoid}}.plans{{grid-template-columns:1fr 1fr}}.three{{grid-template-columns:repeat(3,1fr)}}a{{color:inherit}}.scroll{{overflow:visible}}table{{font-size:10px}}td,th{{padding:6px}}}}
</style><main><header><div class="kicker">BYMOU / Casa Mirador / Design proposal P01</div><h1>A house around<br>light, water and life.</h1><p class="lede">Complete layout proposal for approval — four bedrooms, connected public spaces, an office and a rooftop terrace.</p><p class="callout"><b>This is a new, dimensioned design proposal.</b> The supplied illustrations do not establish a complete 300 m² house. Width, courtyard character and pool proportions are retained; depth, upper layout, bathrooms, stair position and room sizes are proposed. These are schematic Blender floor-plan views, not the six final architectural renders.</p></header>
<div class="summary"><div class="stat"><b>299.88 m²</b><span>Enclosed gross built area, including roof stair</span></div><div class="stat"><b>24.00 m²</b><span>Additional covered outdoor arcade + gallery</span></div><div class="stat"><b>11.20 × 16.70 m</b><span>Proposed footprint; 16.70 m depth is new</span></div></div>
<p><b>Combined covered gross: 323.88 m².</b> This separates approximately 300 m² indoors from the additional covered outdoor circulation. Open courtyard, pool and open roof terrace are not included in the enclosed total.</p>
<h2>01 / The complete plan</h2><p>Ground: west living and kitchen, rear dining, east guest suites. Upper: primary suite, second bedroom suite, office and family lounge. The west arcade/gallery and shared end halls connect every room without passing through another bedroom.</p><div class="plans"><figure><img src="ground-plan.svg" alt="Dimensioned proposed ground-floor plan"><figcaption>Ground floor · 145.04 m² enclosed gross + 12 m² covered arcade.</figcaption></figure><figure><img src="upper-plan.svg" alt="Dimensioned proposed upper-floor plan"><figcaption>Upper floor · 145.04 m² enclosed gross + 12 m² covered gallery.</figcaption></figure></div>
<h2>02 / Actual 3D architectural blockout</h2><figure class="overview"><img src="architectural-overview.png" alt="Actual Blender schematic of ground floor, upper floor and rooftop"><figcaption>Left to right: ground, upper, roof. Floor plates are separated for review. Walls are cut low so the layout is visible; furniture blocks show scale.</figcaption></figure><div class="three"><figure><a href="ground-3d.png"><img src="ground-3d.png" alt="Ground-floor Blender 3D plan"></a><figcaption>Ground · click for full size</figcaption></figure><figure><a href="upper-3d.png"><img src="upper-3d.png" alt="Upper-floor Blender 3D plan"></a><figcaption>Upper · click for full size</figcaption></figure><figure><a href="roof-3d.png"><img src="roof-3d.png" alt="Roof terrace Blender 3D plan"></a><figcaption>Roof · click for full size</figcaption></figure></div>
<h2>03 / Room dimensions</h2><p class="note">Dimensions are metres. Clear planning zones are shown to two decimals; suites include their en-suites and partitions. This table is not a net usable-area certificate and must not be summed to reproduce gross built area.</p><div class="scroll"><table><thead><tr><th>ID</th><th>Space</th><th>Level</th><th>Dimensions / zone</th><th>Approx. m²</th><th>Access / contents</th></tr></thead><tbody>{rows}</tbody></table></div>
<h2>04 / Indoor and outdoor area schedule</h2><div class="scroll"><table><thead><tr><th>Component</th><th>Calculation</th><th>Area</th><th>Accounting</th></tr></thead><tbody><tr><td>Ground enclosed gross</td><td>11.20 × 16.70 − 4.20 × 10.00</td><td>145.04 m²</td><td>Indoor; walls and stair allocation included</td></tr><tr><td>Upper enclosed gross</td><td>Same main envelope minus central court/gallery band</td><td>145.04 m²</td><td>Indoor; walls and stair allocation included</td></tr><tr><td>Roof stair enclosure</td><td>3.50 × 2.80</td><td>9.80 m²</td><td>Indoor</td></tr><tr><td><b>Enclosed total</b></td><td>145.04 + 145.04 + 9.80</td><td><b>299.88 m²</b></td><td>Approximately 300 m² indoors</td></tr><tr><td>Ground arcade + upper gallery</td><td>1.20 × 10.00 × 2</td><td>24.00 m²</td><td>Covered outdoor, additional</td></tr><tr><td><b>Combined covered gross</b></td><td>299.88 + 24.00</td><td><b>323.88 m²</b></td><td>Indoor + covered outdoor</td></tr><tr><td>Ground courtyard band</td><td>4.20 × 10.00</td><td>42.00 m²</td><td>Includes 12 m² arcade and 30 m² open to sky</td></tr><tr><td>Pool surface</td><td>1.60 × 4.20</td><td>6.72 m²</td><td>Within the 30 m² open court; not additional land</td></tr><tr><td>Open courtyard paving + planting</td><td>30.00 − 6.72</td><td>23.28 m²</td><td>Includes two proposed 1.50 × 1.00 m planting beds</td></tr><tr><td>Open roof terrace gross</td><td>157.04 − 9.80</td><td>147.24 m²</td><td>Before parapets, furniture and planting; excludes sky void</td></tr><tr><td>External garden / total plot</td><td>Boundary not supplied</td><td>Unverified</td><td>No invented plot size or external garden boundary</td></tr></tbody></table></div>
<div class="plans"><figure><img src="roof-plan.svg" alt="Dimensioned roof terrace proposal"><figcaption>Rooftop lounge, dining, outdoor kitchen and planting remain part of Casa Mirador.</figcaption></figure><div><h3>Circulation and vertical connection</h3><p>Entry → common lobby → covered court arcade → living, kitchen and guest suites. The rear dining area connects to the kitchen and pantry.</p><p>One continuous U-stair connects ground, upper and roof. The upper gallery joins the front and rear halls; each bedroom, office and family lounge has its own entrance.</p><p><b>Stair proposal:</b> 3.24 m floor-to-floor, 18 risers of 180 mm, eight 260 mm treads per flight, 1.02 m turn landing and two 1.05 m-wide flights. Upper and roof slabs contain real openings.</p><p><b>Checked:</b> area arithmetic and schematic access to all named rooms, using a 0.10 m grid and 0.20 m body radius against walls, door gaps, pool and principal furniture. Full walking-camera, door-swing and detailed headroom checks follow approval.</p><h3>Identity retained</h3><p>Central water and planting, tadelakt arches, warm stone, timber joinery, linen, aged bronze, soft daylight and a planted roof terrace. Courtyard-facing rooms and end halls use proposed closeable glazing to keep indoor and outdoor areas distinct.</p></div></div>
<h2>05 / What requires your approval</h2><ul><li>Proposed depth increases from the reference chain's inferred 11.40 m to <b>16.70 m</b>, retaining the 11.20 m width.</li><li><b>Four bedrooms</b> replace the reference material's two-bedroom program: primary, Bedroom 2 and two guest suites.</li><li><b>299.88 m² indoors plus 24 m² covered outdoors</b> — these are explicitly separate allowances.</li><li>The 1.20 m upper west gallery shelters part of the court. The ground court is 4.20 m wide; the uninterrupted sky opening above is <b>3.00 m wide</b>.</li><li>The main stair is proposed at the front-left, with continuation to the roof. This differs from the inconsistent reference stair positions.</li><li>Garden planting is inside the courtyard and roof. An external garden cannot be dimensioned without a plot boundary.</li></ul><details><summary>Detailed planning notes</summary><ul>{notes}</ul></details>
<div class="approval"><p><b>Awaiting layout approval.</b> After approval: build the detailed house, verify circulation in 3D, and present the six requested Blender views for a second approval. Final day/night films and BYMOU integration follow those approvals.</p><p><a href="Casa-Mirador-300sqm-PROPOSAL.blend">Editable Blender proposal</a> · <a href="../REFERENCE_AUDIT.md">Reference audit</a> · <a href="validation.json">Layout checks</a></p></div></main></html>'''
(out/'index.html').write_text(report)
print(json.dumps(validation,indent=2))

# Keep one room label and dimension per zone; avoid furniture and small bathrooms.
import xml.etree.ElementTree as ET
label_positions={'G01':(5.6,1.65),'G02':(2.25,6.5),'G03':(2.2,11.5),'G04':(5.5,15.2),'G05':(9.45,8.3),'G06':(9.45,11.35),'G07':(10.175,1.15),'G08':(10.175,2.85),'G09':(9.4,15.2),'U01':(9.45,7.95),'U02':(9.45,12.4),'U03':(2.2,6.5),'U04':(2.2,11.5),'U05':(5.6,1.65),'U06':(4.0,15.0)}
ET.register_namespace('', 'http://www.w3.org/2000/svg')
ns='{http://www.w3.org/2000/svg}'
for level,fn in [('GF','ground-plan.svg'),('Upper','upper-plan.svg')]:
 tree=ET.parse(out/fn);rt=tree.getroot()
 for el in list(rt):
  val=el.text or ''
  if el.tag==ns+'text' and (re.fullmatch(r'[GU]\d{2}',val) or re.fullmatch(r'\d+\.\d+ × \d+\.\d+ m',val)):
   rt.remove(el)
 for rid,x0,y0,x1,y1 in g['rooms'][level]:
  x,y=label_positions[rid]
  for shift,textval,size in [(0,rid,12),(-.34,f'{x1-x0:.2f} × {y1-y0:.2f} m',9)]:
   el=ET.SubElement(rt,ns+'text',{'x':str(100+x*42),'y':str(90+(16.7-y-shift)*42),'text-anchor':'middle','font-family':'Arial','font-size':str(size),'fill':'#39392f'})
   el.text=textval
 tree.write(out/fn,encoding='unicode')
