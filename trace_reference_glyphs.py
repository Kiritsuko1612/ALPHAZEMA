"""Trace supplied alphabet charts into native font contours. Only missing letters are patched."""
from pathlib import Path
import hashlib,json
import numpy as np
from PIL import Image
from fontTools.ttLib import TTFont
from fontTools.pens.boundsPen import BoundsPen
import matplotlib
matplotlib.use('Agg')
from matplotlib.figure import Figure
r=Path(__file__).parent;a=r/'dist/assets'
ABC='ABCDEFGHIJKLMNOPQRSTUVWXYZ'
xs=[41,224,408,592,776,959];ys=[89,302,514,727,939,1151,1358]
result={'description':'Pixel contour traces from user-supplied community reference charts, not official glyph releases. Original upstream font outlines are retained.','sources':{},'patches':{}}
for script,file,missing in [('sumeru','SumeruScribe-Regular.ttf','X'),('fontaine','FontAinee-Regular.ttf','KQYZ')]:
 ref=r/'references'/f'{script}-alphabet.png';image=np.asarray(Image.open(ref).convert('RGB'),dtype=float)
 f=TTFont(a/file);gs=f.getGlyphSet();cm=f.getBestCmap();samples=[];cells={}
 for i,c in enumerate(ABC):
  col=i%5;row=i//5;box=[xs[col]+20,ys[row]+20,xs[col+1]-20,ys[row]+150]
  pix=image[box[1]:box[3],box[0]:box[2]]
  # Gold ink has R > B and G > B; silver labels and dark grid do not.
  ink=(pix[:,:,0]-pix[:,:,2]>25)&(pix[:,:,1]-pix[:,:,2]>15)&(pix[:,:,0]>90)
  y,x=np.where(ink)
  if len(x)<8:raise ValueError('No ink for '+script+c)
  # Retain anti-aliasing in the red channel before tracing the 50% isocontour.
  bg=np.median(pix.reshape(-1,3),axis=0);gold=np.median(pix[ink],axis=0)
  alpha=np.clip((pix[:,:,0]-bg[0])/(gold[0]-bg[0]),0,1)
  alpha[np.logical_not((pix[:,:,0]-pix[:,:,2]>10)&(pix[:,:,1]-pix[:,:,2]>5))]=0
  cells[c]={'alpha':alpha,'box':box,'bounds':[int(x.min()),int(y.min()),int(x.max()+1),int(y.max()+1)],'rowY':ys[row]}
  if ord(c) in cm:
   pen=BoundsPen(gs);gs[cm[ord(c)]].draw(pen)
   if pen.bounds:
    x0,y0,x1,y1=pen.bounds
    samples.append({'scale':(y1-y0)/(y.max()+1-y.min()),'ymax':y1,'ymin':y0,'top':box[1]-ys[row]+y.min(),'bottom':box[1]-ys[row]+y.max()+1,'lsb':max(0,x0)})
 scale=float(np.median([s['scale'] for s in samples]))
 offset=float(np.median([v for s in samples for v in [s['ymax']+scale*s['top'],s['ymin']+scale*s['bottom']]]))
 margin=int(np.median([s['lsb'] for s in samples]));margin=max(35,margin)
 result['sources'][script]={'file':str(ref.relative_to(r)),'sha256':hashlib.sha256(ref.read_bytes()).hexdigest(),'calibrationScale':scale,'calibrationBaseline':offset,'upstreamFont':file}
 result['patches'][script]={}
 for c in missing:
  cell=cells[c];alpha=cell['alpha'];bounds=cell['bounds'];pad=np.pad(alpha,1)
  fig=Figure();ax=fig.subplots();contour=ax.contour(pad,levels=[.5]);path=contour.get_paths()[0]
  contours=[];current=[]
  for vertices,code in path.iter_segments(curves=False,simplify=False):
   if code==1:
    if current:contours.append(current)
    current=[]
   if code in (1,2):
    x,y=vertices[-2:]-1
    current.append([round(margin+(x-bounds[0])*scale),round(offset-(cell['box'][1]-cell['rowY']+y)*scale)])
   if code==79:
    if current:contours.append(current);current=[]
  if current:contours.append(current)
  contours=[p for p in contours if len(p)>=3]
  points=[pt for contour in contours for pt in contour]
  width=max(pt[0] for pt in points)+margin
  result['patches'][script][c]={'contours':contours,'advance':width,'lsb':min(pt[0] for pt in points),'referenceCrop':cell['box'],'referencePixelBounds':bounds,'source':script+'-alphabet.png'}
  print(script,c,'contours',len(contours),'points',len(points),'advance',width)
(a/'reference-glyph-traces.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
