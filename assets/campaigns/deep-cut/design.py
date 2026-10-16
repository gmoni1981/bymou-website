from pathlib import Path
import base64,json,math
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
BASE=Path(__file__).resolve().parent;OUT=BASE
fonts={name:TTFont(path)for name,path in {'serif':BASE/'fonts/InstrumentSerif-Regular.ttf','italic':BASE/'fonts/InstrumentSerif-Italic.ttf','sans':Path('/System/Library/Fonts/Supplemental/Arial.ttf')}.items()}
INK='#18171d';RED='#fb492b';LILAC='#d3c5f1';PAPER='#f4f0e7'
class Poster:
 def __init__(self,title,desc,bg):self.parts=[f'<rect width="1080" height="1350" fill="{bg}"/>'];self.title=title;self.desc=desc
 def raw(self,s):self.parts.append(s)
 def text(self,t,x,y,size=40,font='serif',fill=INK,anchor='start',tracking=0,maxw=None,stroke=None):
  f=fonts[font];units=f['head'].unitsPerEm;cmap=f.getBestCmap();glyphset=f.getGlyphSet();adv=f['hmtx'].metrics
  glyphs=[cmap.get(ord(ch),'.notdef')for ch in t];width=sum(adv[g][0]for g in glyphs)*size/units+max(0,len(glyphs)-1)*tracking
  if maxw and width>maxw:return self.text(t,x,y,size*maxw/width,font,fill,anchor,tracking*maxw/width,None,stroke)
  if anchor=='end':x-=width
  if anchor=='middle':x-=width/2
  pos=0;paths=[]
  for g in glyphs:
   pen=SVGPathPen(glyphset);glyphset[g].draw(TransformPen(pen,(1,0,0,1,pos,0)));d=pen.getCommands()
   if d:paths.append(f'<path d="{d}"/>')
   pos+=adv[g][0]+tracking*units/size
  style=f'fill="{fill}"'
  if stroke:style=f'fill="none" stroke="{stroke}" stroke-width="{units/size*1.6}"'
  self.raw(f'<g {style} transform="translate({x:.3f} {y:.3f}) scale({size/units:.7f} {-size/units:.7f})">'+''.join(paths)+'</g>')
  return width
 def photo(self,name,x,y,w,h,clip=None):
  img=base64.b64encode((BASE/'sources'/f'{name}.jpg').read_bytes()).decode();extra=f' clip-path="url(#{clip})"'if clip else''
  self.raw(f'<image href="data:image/jpeg;base64,{img}" x="{x}" y="{y}" width="{w}" height="{h}" preserveAspectRatio="xMidYMid slice"{extra}/>')
 def line(self,d,color=INK,width=2):self.raw(f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{width}" stroke-linecap="round"/>')
 def mark(self,x,y,size,color=INK):
  # An incomplete groove and the entry of a needle: a small owned identity element.
  self.raw(f'<g transform="translate({x} {y}) scale({size/100})"><path d="M82 26 A40 40 0 1 0 88 63" fill="none" stroke="{color}" stroke-width="5"/><path d="M98 9 L51 56" stroke="{color}" stroke-width="5"/><circle cx="51" cy="56" r="4" fill="{color}"/></g>')
 def logo(self,x=60,y=62,color=INK):self.mark(x,y-30,42,color);self.text('deep cut',x+57,y+8,49,'italic',color,tracking=-.6)
 def footer(self,n,label,color=INK):
  self.text(f'0{n} / 05',60,1300,24,'sans',color,tracking=1)
  self.text(label,1020,1300,21,'sans',color,anchor='end',tracking=1.2)
 def save(self,n):
  s=f'<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350" role="img"><title>{self.title}</title><desc>{self.desc}</desc>'+''.join(self.parts)+'</svg>'
  (OUT/f'slide-{n:02}.svg').write_text(s)
# 01: decisive photographic hook, with its final word printed on the orange sleeve.
p=Poster('There’s more after the hook.','DEEP CUT. An orange record sleeve and vinyl are the material for an editorial invitation to listen beyond the hook.',PAPER)
p.photo('hero',0,0,1080,1350);p.logo();p.text('There’s more',60,238,160,'serif',tracking=-3,maxw=960);p.text('after the',60,380,148,'italic',tracking=-2,maxw=850)
p.text('hook.',1015,1257,254,'italic',INK,'end',tracking=-5,maxw=490);p.footer(1,'FULL ATTENTION',PAPER);p.save(1)
# 02: a record label becomes a calm typographic aperture inside a material macro.
p=Poster('Give it a whole side.','A macro view of real-looking record grooves surrounds an oversized lilac center label.',INK)
p.photo('macro',0,0,1080,1350);p.logo(color=PAPER);p.raw(f'<circle cx="540" cy="670" r="320" fill="{LILAC}"/>');p.line('M852 496 A357 357 0 1 1 768 397',PAPER,2)
p.text('Give it',540,524,151,'serif',INK,'middle',tracking=-2,maxw=560);p.text('a whole',540,684,151,'serif',INK,'middle',tracking=-2,maxw=570);p.text('side.',540,883,220,'italic',INK,'middle',tracking=-3,maxw=540)
p.text('ONE SIDE / ALL YOUR ATTENTION',540,1110,24,'sans',PAPER,'middle',tracking=1.3,maxw=900);p.footer(2,'GO DEEPER',PAPER);p.save(2)
# 03: chance and touch; a circular photographic window contrasts a staggered headline.
if (BASE/'sources/discovery.webp').exists():
 p=Poster('Let chance pick.','A hand chooses an orange sleeve from a record bin, seen through a large circular crop below a staggered headline.',LILAC)
 p.logo();p.text('Let',60,252,190,'serif',tracking=-4);p.text('chance',60,434,190,'serif',tracking=-4,maxw=900);p.text('pick.',60,615,190,'italic',tracking=-4,maxw=600)
 p.raw('<defs><clipPath id="discovery-circle"><circle cx="720" cy="1030" r="430"/></clipPath></defs>');p.photo('discovery',250,570,860,1000,'discovery-circle')
 p.line('M911 211 C1022 246 1033 363 933 417',RED,4);p.line('M936 388 L929 421 L965 417',RED,4)
 p.text('FOLLOW',60,1120,25,'sans',tracking=1);p.text('YOUR EAR.',60,1158,25,'sans',tracking=1);p.raw(f'<rect x="0" y="1260" width="1080" height="90" fill="{LILAC}"/>');p.footer(3,'THE JOY OF FINDING');p.save(3)
# 04: a designed listening ritual; no repeated photo and no decorative mockup.
p=Poster('A little ritual. Pick it. Put it on. Stay.','Three progressively placed numbered instructions form one continuous visual route.',INK)
p.logo(color=PAPER);p.text('A little',60,244,164,'serif',PAPER,tracking=-2);p.text('ritual.',60,396,186,'italic',PAPER,tracking=-3)
p.line('M108 506 V648 Q108 702 188 702 H292 Q343 702 343 770 V894 Q343 958 430 958 H630 Q688 958 688 1027 V1173',RED,3)
for n,x,y,title in [(1,60,607,'Pick it.'),(2,300,859,'Put it on.'),(3,645,1115,'Stay.')]:
 p.text(str(n),x,y,140,'italic',RED);p.text(title,x+105,y-8,88,'serif',PAPER,tracking=-1,maxw=640)
p.text('MAKE ROOM FOR A FULL SIDE.',60,1237,24,'sans',LILAC,tracking=1.4);p.footer(4,'A SMALL LISTENING RITUAL',PAPER);p.save(4)
# 05: the brand takes over; typographic signature with the owned cut-groove device.
p=Poster('DEEP CUT. Keep listening.','A vermilion brand poster with an incomplete record-groove mark, large original typographic lockup and a clear invitation.',RED)
p.text('KEEP LISTENING.',60,83,29,'sans',INK,tracking=2.5)
p.mark(720,120,440,PAPER)
p.text('deep',49,450,390,'italic',INK,tracking=-8,maxw=950);p.text('cut.',49,900,450,'italic',INK,tracking=-9,maxw=950)
p.line('M62 991 H1018',INK,2);p.text('A RECORD CLUB',60,1056,32,'sans',INK,tracking=1.5);p.text('FOR FULL ATTENTION.',60,1101,32,'sans',INK,tracking=1.5)
p.text('Find your next deep cut.',60,1225,54,'serif',INK,maxw=860);p.line('M954 1222 L1008 1168 M966 1168 H1008 V1210',INK,3);p.footer(5,'DEEP CUT / BYMOU CONCEPT');p.save(5)
print('Designed SVG posters:',[p.name for p in OUT.glob('slide-*.svg')])
