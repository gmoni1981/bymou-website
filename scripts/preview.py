"""Static local preview with byte ranges for paused-video scroll seeking."""
import argparse,http.server,os,re
from pathlib import Path
from functools import partial
class Handler(http.server.SimpleHTTPRequestHandler):
 def send_head(self):
  self.byte_range=None
  path=self.translate_path(self.path)
  if not self.headers.get('Range') or not os.path.isfile(path):return super().send_head()
  f=open(path,'rb');size=os.fstat(f.fileno()).st_size
  m=re.fullmatch(r'bytes=(\d*)-(\d*)',self.headers['Range'])
  if not m:f.close();self.send_error(416);return None
  a,b=m.groups();start=int(a) if a else max(0,size-int(b));end=min(size-1,int(b)) if a and b else size-1
  if start>end or start>=size:f.close();self.send_response(416);self.send_header('Content-Range',f'bytes */{size}');self.end_headers();return None
  self.send_response(206);self.send_header('Content-type',self.guess_type(path));self.send_header('Content-Length',str(end-start+1));self.send_header('Content-Range',f'bytes {start}-{end}/{size}');self.end_headers();f.seek(start);self.byte_range=(start,end);return f
 def copyfile(self,source,output):
  if not self.byte_range:return super().copyfile(source,output)
  left=self.byte_range[1]-self.byte_range[0]+1
  while left:
   buf=source.read(min(65536,left))
   if not buf:break
   output.write(buf);left-=len(buf)
 def end_headers(self):
  self.send_header('Accept-Ranges','bytes')
  self.send_header('Cache-Control','no-cache')
  super().end_headers()
if __name__=='__main__':
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--port',type=int,default=3000);args=parser.parse_args()
 root=Path(__file__).resolve().parent.parent
 print(f'BYMOU preview: http://localhost:{args.port} (video range requests enabled)',flush=True)
 http.server.ThreadingHTTPServer(('127.0.0.1',args.port),partial(Handler,directory=str(root))).serve_forever()
