"""Create openly reproducible, renamed font derivatives; retain every upstream glyph."""
from pathlib import Path
import json,hashlib
from fontTools.ttLib import TTFont
from fontTools.pens.ttGlyphPen import TTGlyphPen
r=Path(__file__).parent;a=r/'dist/assets';traces=json.loads((a/'reference-glyph-traces.json').read_text())
for script,base,out,family in [('sumeru','SumeruScribe-Regular.ttf','CartasSumeruReference-Regular.ttf','Cartas Sumeru Reference'),('fontaine','FontAinee-Regular.ttf','CartasFontaineReference-Regular.ttf','Cartas Fontaine Reference')]:
 f=TTFont(a/base);order=list(f.getGlyphOrder());before={n:f['glyf'][n].compile(f['glyf']) for n in order}
 for c,data in traces['patches'][script].items():
  name='CTreference'+c;assert name not in order
  pen=TTGlyphPen(None)
  for points in data['contours']:
   pen.moveTo(tuple(points[0]))
   for p in points[1:]:pen.lineTo(tuple(p))
   pen.closePath()
  f['glyf'][name]=pen.glyph();f['hmtx'][name]=(data['advance'],data['lsb']);order.append(name)
  for table in f['cmap'].tables:
   if table.isUnicode():table.cmap[ord(c)]=name;table.cmap[ord(c.lower())]=name
 f.setGlyphOrder(order)
 ps=family.replace(' ','')+'-Regular'
 for rec in f['name'].names:
  values={1:family,2:'Regular',3:ps+'-Reference-v1',4:family+' Regular',5:'Version 1.001; Cartas reference extension of '+base,6:ps,16:family,17:'Regular'}
  if rec.nameID in values:rec.string=values[rec.nameID].encode(rec.getEncoding(),errors='replace')
 f.save(a/out)
 check=TTFont(a/out)
 for name,data in before.items():assert check['glyf'][name].compile(check['glyf'])==data,('Changed upstream glyph',name)
 assert all(ord(c) in check.getBestCmap() for c in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')
 print(out, 'original glyphs unchanged:',len(before),'added:', ''.join(traces['patches'][script]),'SHA-256',hashlib.sha256((a/out).read_bytes()).hexdigest())
