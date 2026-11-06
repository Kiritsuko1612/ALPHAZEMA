"""Extract the original upstream outlines and cmap; normalize font units, never invent missing glyphs."""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
import json,base64,hashlib
r=Path(__file__).parent;a=r/'dist/assets'
specs=[
 ('teyvat','Teyvat · escrita comum','TeyvatBlack-Regular.ttf','Teyvat-Black.glyphs','Escrita comum, especialmente em Mondstadt. Não possui pontuação própria nesta fonte.'),
 ('inazuma','Inazuma','InazumaBrush-Regular.ttf','Inazuma-Brush.glyphs','A tabela enviada confirma A–Z. L, Q, V e X têm notas de uso alternativo; S/Z e a barra vertical têm interpretações incertas. Não traduz para japonês.'),
 ('sumeru','Sumeru · floresta','CartasSumeruReference-Regular.ttf','Sumeru-Scribe.glyphs','X completado por traçado da tabela de Sumeru que você enviou. Os demais glifos originais foram preservados.'),
 ('deshret','Deshret · deserto','DeshretInscription-Regular.ttf','Deshret-Inscription.glyphs','Transcrição visual com os glifos do deserto; não traduz para egípcio.'),
 ('fontaine','Fontaine','CartasFontaineReference-Regular.ttf','Font-Ainee.glyphs','K, Q, Y e Z completados por traçado da tabela de Fontaine que você enviou. Inclui os dez algarismos.'),
 ('khaenriah',"Khaenri’ah",'KhaenriahSun-Regular.ttf','Khaenriah-Sun.glyphs','Escrita antiga. Contém glifos próprios para ! , . ?. Não traduz para latim.'),
 ('chasm',"Khaenri’ah · variante do Despenhadeiro",'KhaenriahSun-Chasm.ttf','Khaenriah-Sun.glyphs','Variante do Despenhadeiro (The Chasm), distinta da forma regular. Não traduz para latim.')]
registry={}
for key,label,name,source,note in specs:
 data=(a/name).read_bytes();f=TTFont(a/name);gs=f.getGlyphSet();cm=f.getBestCmap();upm=f['head'].unitsPerEm;glyphs={}
 for code in sorted(cm):
  if not 32<=code<127:continue
  c=chr(code);pen=SVGPathPen(gs);gs[cm[code]].draw(TransformPen(pen,(1250/upm,0,0,1250/upm,0,0)))
  glyphs[c]={'path':pen.getCommands(),'width':gs[cm[code]].width*1250/upm}
 missing=''.join(c for c in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' if c not in glyphs)
 supported=''.join(chr(c) for c in sorted(cm) if 32<=c<127)
 referenceLetters={'sumeru':'X','fontaine':'KQYZ'}.get(key,'')
 originalFile={'sumeru':'SumeruScribe-Regular.ttf','fontaine':'FontAinee-Regular.ttf'}.get(key,name)
 registry[key]={'originalFile':originalFile,'originalSha256':hashlib.sha256((a/originalFile).read_bytes()).hexdigest(),'referenceLetters':referenceLetters,'referenceImage':('references/'+key+'-alphabet.png') if referenceLetters else None,'extensionSource':'patch_missing_glyphs.py + assets/reference-glyph-traces.json' if referenceLetters else None,'id':key,'label':label,'file':name,'sourceFile':source,'family':'Teyvat-'+key,'version':f['name'].getDebugName(5),'upm':upm,'glyphs':glyphs,'missing':missing,'supported':supported,'note':note,'sha256':hashlib.sha256(data).hexdigest(),'font':base64.b64encode(data).decode()}
(a/'scripts-manifest.json').write_text(json.dumps({'source':'https://github.com/SpeedyOrc-C/HoYo-Glyphs','release':'20250529','sourceCommit':'ad0c03ce9792d623c6a6161e5582a01903bd5d97','scripts':[{k:v for k,v in d.items() if k not in ['font','glyphs']} for d in registry.values()]},indent=2,ensure_ascii=False))
(r/'font-data.js').write_text('const SCRIPTS='+json.dumps(registry,ensure_ascii=False)+';\nlet GLYPHS=SCRIPTS.teyvat.glyphs;\n')
print('Imported',len(registry),'scripts; missing letters:',{k:d['missing'] for k,d in registry.items() if d['missing']})
