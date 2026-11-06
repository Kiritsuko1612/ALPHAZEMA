from pathlib import Path
import json,hashlib
import numpy as np
from scipy.ndimage import binary_dilation
from PIL import Image,ImageDraw,ImageFont
from fontTools.ttLib import TTFont
r=Path(__file__).parent;a=r/'dist/assets';data=json.loads((a/'reference-glyph-traces.json').read_text())
for script,base,new in [('sumeru','SumeruScribe-Regular.ttf','CartasSumeruReference-Regular.ttf'),('fontaine','FontAinee-Regular.ttf','CartasFontaineReference-Regular.ttf')]:
 original=TTFont(a/base);extended=TTFont(a/new)
 for n in original.getGlyphOrder():assert original['glyf'][n].compile(original['glyf'])==extended['glyf'][n].compile(extended['glyf'])
 assert all(ord(c) in extended.getBestCmap() for c in 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz')
 refpath=r/data['sources'][script]['file'];assert hashlib.sha256(refpath.read_bytes()).hexdigest()==data['sources'][script]['sha256']
 ref=np.asarray(Image.open(refpath).convert('RGB'),dtype=float)
 for c,g in data['patches'][script].items():
  x0,y0,x1,y1=g['referenceCrop'];pix=ref[y0:y1,x0:x1]
  m=(pix[:,:,0]-pix[:,:,2]>25)&(pix[:,:,1]-pix[:,:,2]>15)&(pix[:,:,0]>90)
  yy,xx=np.where(m);m=m[yy.min():yy.max()+1,xx.min():xx.max()+1]
  scale=data['sources'][script]['calibrationScale'];baseline=data['sources'][script]['calibrationBaseline'];factor=8
  margin=g['advance']-max(p[0] for contour in g['contours'] for p in contour)
  row='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.index(c)//5;rowY=[89,302,514,727,939,1151][row]
  f=ImageFont.truetype(str(a/new),round(extended['head'].unitsPerEm/scale*factor))
  im=Image.new('L',((x1-x0)*factor,(y1-y0)*factor))
  ImageDraw.Draw(im).text(((g['referencePixelBounds'][0]-margin/scale)*factor,(baseline/scale-(y0-rowY))*factor),c,font=f,fill=255,anchor='ls')
  im=im.resize((x1-x0,y1-y0),Image.Resampling.LANCZOS)
  render=np.asarray(im)[yy.min():yy.max()+1,xx.min():xx.max()+1]>128
  iou=np.logical_and(m,render).sum()/np.logical_or(m,render).sum();tolerance=2
  precision=np.logical_and(render,binary_dilation(m,iterations=tolerance)).sum()/render.sum()
  recall=np.logical_and(m,binary_dilation(render,iterations=tolerance)).sum()/m.sum()
  assert min(precision,recall)>.99,(script,c,iou,precision,recall)
  print(script,c,'pixel IoU',round(float(iou),4),'precision/recall at 2px',round(float(precision),4),round(float(recall),4))
print('PASS: originais preservados, fontes completas e todos os contornos rasterizados conferidos com suas referências.')
