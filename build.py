from pathlib import Path
import base64
r=Path(__file__).parent
(r/'dist/index.html').write_text((r/'template.html').read_text().replace('__DATA__',(r/'font-data.js').read_text()).replace('__ORNAMENT__',base64.b64encode((r/'dist/assets/letter-fleur-de-lis.png').read_bytes()).decode()))
