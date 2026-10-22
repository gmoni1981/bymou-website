#!/usr/bin/env python3
"""Build crawlable locale routes without changing the source portfolio's layout.
Run from any directory: python3 scripts/build-locales.py
"""
from pathlib import Path
from html.parser import HTMLParser
from html import escape, unescape
from urllib.parse import urlsplit, urlunsplit
import json, re, posixpath
ROOT=Path(__file__).resolve().parents[1]
LANGS=('en','fr','it','ar')
ORIGIN='https://bymou.space'
site=json.loads((ROOT/'data/site.json').read_text())
extra=json.loads((ROOT/'data/locale-extra.json').read_text()) if (ROOT/'data/locale-extra.json').exists() else {}
files=[p for p in ROOT.glob('*.html') if p.name not in ('content-editor.html','404.html')]
files+=list((ROOT/'work').glob('*.html'))+list((ROOT/'insights').glob('*.html'))+list((ROOT/'tools').glob('*.html'))
routes={p.relative_to(ROOT).as_posix() for p in files}
void={'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
missing={l:set() for l in LANGS}
def route(path,lang):return '/'+lang+'/' + ('' if path=='index.html' else path)
def mapping(lang):
 d={v:site['locales'].get(lang,{}).get(k,v) for k,v in site['locales']['en'].items()}
 for src,translations in extra.items():d[src]=translations.get(lang,src) if isinstance(translations,dict) else src
 return d
class Page(HTMLParser):
 def __init__(self,path,lang):
  super().__init__(convert_charrefs=True);self.path=path;self.lang=lang;self.stack=[];self.out=[];self.map=mapping(lang);self.runtime=False;self.css=False
 def tx(self,s,key=None):
  if not s.strip():return s
  clean=unescape(s).strip()
  value=site['locales'].get(self.lang,{}).get(key) if key else None
  if value is None:value=self.map.get(clean)
  if value is None:
   if self.lang!='en' and re.search('[A-Za-z]{3}',clean):missing[self.lang].add(clean)
   return escape(s,quote=False)
  return s[:len(s)-len(s.lstrip())]+escape(value,quote=False)+s[len(s.rstrip()):]
 def url(self,v):
  if not v or v.startswith(('#','mailto:','tel:','data:','blob:','javascript:','//')):return v
  parts=urlsplit(v)
  if parts.scheme:return v
  path=posixpath.normpath(posixpath.join(posixpath.dirname(self.path),parts.path)) if not parts.path.startswith('/') else parts.path[1:]
  if not (ROOT/path).exists() and not parts.path.startswith('/') and (ROOT/parts.path).exists():path=parts.path
  if path in ('','.'):path='index.html'
  new=route(path,self.lang) if path in routes else '/'+path
  return urlunsplit(('', '',new,parts.query,parts.fragment))
 def handle_starttag(self,tag,attrs):
  d=dict(attrs)
  if tag=='script' and d.get('src','').startswith('/localization.js'):self.runtime=True
  if tag=='link' and d.get('href','').startswith('/localization.css'):self.css=True
  if tag=='option' and d.get('value')=='ar' and self.stack:self.stack[-1][1]['_has_ar']=True
  if tag=='br' and self.lang!='en' and any('data-i18n' in a for _,a in self.stack):return
  if tag=='link' and (d.get('rel')=='canonical' or d.get('hreflang')):return
  if tag=='html':d.update(lang=self.lang,dir='rtl' if self.lang=='ar' else 'ltr')
  for a in ('href','src','poster','action'):
   if a in d:d[a]=self.url(d[a])
  if 'srcset' in d:d['srcset']=', '.join(self.url(x.strip().split()[0])+' '+' '.join(x.strip().split()[1:]) for x in d['srcset'].split(','))
  for a in ('aria-label','alt','placeholder','title'):
   if d.get(a):d[a]=unescape(self.tx(d[a]))
  if tag=='meta' and d.get('content'):
   k=d.get('property',d.get('name',''))
   if k in ('description','title','og:title','og:description','og:image:alt','twitter:title','twitter:description','twitter:image:alt'):d['content']=unescape(self.tx(d['content']))
   if k=='og:url':d['content']=ORIGIN+route(self.path,self.lang)
   if k=='og:locale':d['content']={'en':'en_US','fr':'fr_FR','it':'it_IT','ar':'ar_MA'}[self.lang]
  if tag=='option' and self.stack and self.stack[-1][1].get('id') in ('language','case-language'):
   d.pop('selected',None)
   if d.get('value')==self.lang:d['selected']=None
  self.out.append('<'+tag+''.join(' '+k+('="'+escape(v,quote=True)+'"' if v is not None else '') for k,v in d.items())+'>')
  if tag not in void:self.stack.append((tag,d))
 def handle_startendtag(self,t,a):
  depth=len(self.stack);count=len(self.out);self.handle_starttag(t,a)
  if len(self.out)>count:self.out[-1]=self.out[-1][:-1]+'/>'
  if len(self.stack)>depth:self.stack.pop()
 def handle_endtag(self,t):
  if t=='head':
   if self.path.startswith('tools/') or re.match(r'work/case-\d+\.html',self.path):self.out.append('<meta name="robots" content="noindex,follow">')
   self.out.append('<link rel="canonical" href="'+ORIGIN+route(self.path,self.lang)+'">')
   for lang in LANGS:self.out.append('<link rel="alternate" hreflang="'+lang+'" href="'+ORIGIN+route(self.path,lang)+'">')
   self.out.append('<link rel="alternate" hreflang="x-default" href="'+ORIGIN+route(self.path,'en')+'">')
   if not self.css:self.out.append('<link rel="stylesheet" href="/localization.css">')
   if not self.runtime:self.out.append('<script src="/localization.js" defer></script>')
  if t=='div' and self.stack and self.stack[-1][1].get('class')=='language-switcher':self.out.append('<button class="language-option" type="button" data-lang="ar" aria-pressed="'+('true' if self.lang=='ar' else 'false')+'">العربية</button>')
  if t=='select' and self.stack and not self.stack[-1][1].get('_has_ar') and self.stack[-1][1].get('id') in ('language','case-language'):
   self.out.append('<option value="ar"'+(' selected' if self.lang=='ar' else '')+'>العربية</option>')
  self.out.append('</'+t+'>')
  for i in range(len(self.stack)-1,-1,-1):
   if self.stack[i][0]==t:self.stack=self.stack[:i];break
 def handle_data(self,s):
  if any(t in ('script','style','svg') for t,d in self.stack):
   if self.stack and self.stack[-1][1].get('type')=='application/ld+json':
    try:
     def walk(v):
      if isinstance(v,dict):return {k:(ORIGIN+self.url(x[len(ORIGIN):] or '/') if k in ('url','item','@id') and isinstance(x,str) and x.startswith(ORIGIN) else walk(x)) for k,x in v.items()}
      if isinstance(v,list):return [walk(x) for x in v]
      return self.map.get(v,v) if isinstance(v,str) else v
     s=json.dumps(walk(json.loads(s)),ensure_ascii=False).replace('</','<\\/')
    except (ValueError,TypeError):pass
   self.out.append(s);return
  owner=next((d for t,d in reversed(self.stack) if 'data-i18n'in d),None)
  key=owner.get('data-i18n') if owner and self.lang!='en' else None
  if key and key in site['locales'].get(self.lang,{}) and s.strip():
   if owner.get('_emitted'):return
   owner['_emitted']=True
  self.out.append(self.tx(s,key))
 def handle_entityref(self,n):self.out.append('&'+n+';')
 def handle_charref(self,n):self.out.append('&#'+n+';')
 def handle_comment(self,s):self.out.append('<!--'+s+'-->')
 def handle_decl(self,s):self.out.append('<!'+s+'>')
for lang in LANGS:
 for p in files:
  rel=p.relative_to(ROOT).as_posix();parser=Page(rel,lang);parser.feed(p.read_text());out=ROOT/lang/rel;out.parent.mkdir(parents=True,exist_ok=True);out.write_text(''.join(parser.out))
 (ROOT/'data'/('locale-runtime-'+lang+'.json')).write_text(json.dumps(mapping(lang),ensure_ascii=False))
xml=['<?xml version="1.0" encoding="UTF-8"?>','<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">']
for path in sorted(routes):
 if path.startswith('tools/') or re.match(r'work/case-\d+\.html',path):continue
 for lang in LANGS:
  xml.append('<url><loc>'+ORIGIN+route(path,lang)+'</loc>'+''.join('<xhtml:link rel="alternate" hreflang="'+l+'" href="'+ORIGIN+route(path,l)+'"/>' for l in LANGS)+'</url>')
xml.append('</urlset>');(ROOT/'sitemap.xml').write_text('\n'.join(xml))
(ROOT/'localization-audit.json').write_text(json.dumps({l:sorted(v) for l,v in missing.items()},ensure_ascii=False,indent=2))
print('Built',len(files)*4,'pages. Unmatched strings:',{l:len(v) for l,v in missing.items()})
