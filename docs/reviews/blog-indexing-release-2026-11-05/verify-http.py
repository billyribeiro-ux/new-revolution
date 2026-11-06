import json,re,subprocess,sys,urllib.request,urllib.error,urllib.parse,xml.etree.ElementTree as ET
from pathlib import Path
from html.parser import HTMLParser
from concurrent.futures import ThreadPoolExecutor
SITE='https://www.revolutiontradingpros.com'
DEPLOY='new-revolution-hazrqww4u-will-ribeiros-projects.vercel.app'
ARTICLE='/blog/0dte-spx-options-strategy-guide'
MODE=sys.argv[1]
class Page(HTMLParser):
 def __init__(self):super().__init__();self.robots=[];self.canonical=[];self.links=[];self.schemas=[];self.in_schema=False;self.buf=''
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='meta' and a.get('name')=='robots':self.robots.append(a.get('content',''))
  if tag=='link' and a.get('rel')=='canonical':self.canonical.append(a.get('href',''))
  if tag=='a' and a.get('href'):self.links.append(a['href'])
  if tag=='script' and a.get('type')=='application/ld+json':self.in_schema=True;self.buf=''
 def handle_data(self,data):
  if self.in_schema:self.buf+=data
 def handle_endtag(self,tag):
  if tag=='script' and self.in_schema:self.schemas.append(json.loads(self.buf));self.in_schema=False

def fetch(path):
 if MODE=='stage':
  r=subprocess.run(['vercel','curl',path,'--deployment',DEPLOY,'--','--silent','--show-error','--max-time','25','--dump-header','-'],capture_output=True,text=True,check=True)
  raw=r.stdout; splits=re.split(r'\r?\n\r?\n',raw,maxsplit=1);header,body=splits;status=int(header.splitlines()[0].split()[1]);headers={}
  for line in header.splitlines()[1:]:
   if ':' in line:k,v=line.split(':',1);headers[k.lower()]=v.strip()
  return status,headers,body
 req=urllib.request.Request(SITE+path,headers={'User-Agent':'Googlebot'})
 try:r=urllib.request.urlopen(req,timeout=25)
 except urllib.error.HTTPError as e:r=e
 return r.status,{k.lower():v for k,v in r.headers.items()},r.read().decode('utf8','replace')

paths=['/robots.txt','/sitemap.xml','/rss.xml','/','/blog',ARTICLE,'/watchlist','/store/courses','/api/health','/maintenance-state.json','/api/admin/posts','/blog/nonexistent-index-verification-20261105']
with ThreadPoolExecutor(max_workers=4) as ex: responses=dict(zip(paths,ex.map(fetch,paths)))
proof={'mode':MODE,'deployment':DEPLOY,'canonicalOrigin':SITE,'responses':{}}
for path,(status,headers,body) in responses.items():
 proof['responses'][path]={'status':status,'xRobotsTag':headers.get('x-robots-tag'),'contentType':headers.get('content-type')}
 if path not in ['/api/admin/posts','/blog/nonexistent-index-verification-20261105']:assert status==200,(path,status,body[:100])
 if path in ['/','/blog',ARTICLE,'/watchlist','/store/courses']:
  p=Page();p.feed(body);d=proof['responses'][path];d.update(robots=p.robots,canonical=p.canonical,jsonLdBlocks=len(p.schemas))
  if path=='/store/courses':assert any('noindex' in x for x in p.robots) and not p.canonical
  else:
   assert p.canonical==[SITE+('' if path=='/' else path)],(path,p.canonical)
   assert not any('noindex' in x for x in p.robots),(path,p.robots)
   if MODE=='public':assert 'noindex' not in headers.get('x-robots-tag',''),(path,headers.get('x-robots-tag'))
  if path in ['/','/blog']:assert SITE+ARTICLE in [urllib.parse.urljoin(SITE+path,x) for x in p.links],(path,'article link missing')
  if path=='/watchlist':assert 'Sunday Alpha Protocol' in body
  if path==ARTICLE:
   nodes=[n for s in p.schemas for n in s.get('@graph',[])];articles=[n for n in nodes if n.get('@type')=='BlogPosting'];assert len(articles)==1
   d['articleSchemaId']=articles[0].get('@id');assert articles[0].get('@id')==SITE+ARTICLE+'#article';assert articles[0].get('mainEntityOfPage',{}).get('@id')==SITE+ARTICLE+'#webpage'
robots=responses['/robots.txt'][2]
assert 'Sitemap: '+SITE+'/sitemap.xml' in robots
assert not re.search(r'^Disallow:\s*/blog',robots,re.M)
assert 'User-agent: Googlebot' in robots and 'Allow: /' in robots
root=ET.fromstring(responses['/sitemap.xml'][2]);ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
locs=[x.text for x in root.findall('s:url/s:loc',ns)]
assert len(locs)==len(set(locs))
assert all(x.startswith(SITE) for x in locs)
assert SITE+'/blog' in locs and SITE+ARTICLE in locs
assert not any('/store' in x for x in locs)
proof['sitemapUrls']=locs
maintenance=json.loads(responses['/maintenance-state.json'][2]);proof['maintenance']=maintenance;assert maintenance.get('maintenance') is False,maintenance
assert responses['/api/admin/posts'][0]==401
assert responses['/blog/nonexistent-index-verification-20261105'][0]==404
health=json.loads(responses['/api/health'][2]);proof['health']=health;assert health['version']=='33a1346';assert health['db']['ok'] is True
Path('/private/tmp/blog-index-'+MODE+'-proof.json').write_text(json.dumps(proof,indent=2)+'\n')
print(json.dumps(proof,indent=2))
