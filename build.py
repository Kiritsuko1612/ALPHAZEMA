from pathlib import Path
r=Path(__file__).parent
(r/'dist/index.html').write_text((r/'template.html').read_text().replace('__DATA__',(r/'font-data.js').read_text()))
