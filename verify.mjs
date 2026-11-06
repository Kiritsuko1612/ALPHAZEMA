import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {TextEncoder,TextDecoder} from 'node:util';
const html=fs.readFileSync(new URL('./dist/index.html',import.meta.url),'utf8');
const elements=new Map();
function el(id){if(!elements.has(id))elements.set(id,{id,value:'',checked:false,disabled:false,textContent:'',hidden:false,append(){},replaceChildren(){},remove(){},addEventListener(){},setAttribute(){},focus(){},select(){},getContext(){return {measureText:s=>({width:[...s].length*23})}}});return elements.get(id)}
el('source').value='pt';el('target').value='en';el('use-text').value='original';
const sandbox={console,TextEncoder,TextDecoder,Uint8Array,setTimeout,clearTimeout,Blob,URL,atob,btoa,FontFace:class{load(){return Promise.resolve(this)}},document:{documentElement:{style:{setProperty(){}}},createTextNode:s=>({textContent:s}),getElementById:el,querySelectorAll:()=>[],createElement:t=>({...el('element-'+Math.random()),tagName:t}),fonts:{add(){},ready:Promise.resolve()}},window:{}};
vm.createContext(sandbox);for(const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g))vm.runInContext(m[1],sandbox);const t=sandbox.window.Teyvat;await t.fontReady;
assert.equal([...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].filter(c=>t.GLYPHS[c]).length,26);assert.equal(t.normalise('Ação, coração, bênção!'),'ACAO, CORACAO, BENCAO!');
for(const s of ['Olá, Wolf! 🦊🐺\nCoração & céu <3','ABCDEFGHIJKLMNOPQRSTUVWXYZ','', 'á'.repeat(2000)]){const p={v:2,original:s,translated:'May the wind guide you. 🌙',source:'pt',target:'en'};const c='TYVT2:'+t.encode(JSON.stringify(p));assert.equal(t.parse(c).original,s);assert.equal(t.decode(t.encode(s)),s)}
const legacy={v:1,source:'en',target:'pt',original:'Hello',translated:'Olá'};assert.equal(t.parse('TYVT1:'+t.encode(JSON.stringify(legacy))).translated,'Olá');
for(const bad of ['TYVT2:!!','garbage','TYVT2:'+t.encode('{}'),'TYVT2:'+t.encode(JSON.stringify({...legacy,v:2,source:'xx'})),'TYVT2:'+t.encode(JSON.stringify({...legacy,v:2,original:'x'.repeat(2001)})),'TYVT1:'+t.encode(JSON.stringify({...legacy,v:2}))])assert.throws(()=>t.parse(bad));
for(const c of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')assert.ok(t.GLYPHS[c].path.length>20);
const all=t.svgCard('ABCDEFGHIJKLMNOPQRSTUVWXYZ',false);assert.equal((all.svg.match(/<path /g)||[]).length,26);assert.ok(!all.svg.includes('font-family="Teyvat"'));
const long=t.svgCard('W'.repeat(2000),true);assert.equal((long.svg.match(/<use href="#rune-/g)||[]).length,2000);assert.equal((long.svg.match(/<path /g)||[]).length,1);assert.ok(long.svg.length<2000000);assert.ok(long.height>560);
const safe=t.svgCard('<script>alert("oi")</script>&',true);assert.ok(!safe.svg.includes('<script>'));assert.ok(safe.svg.includes('&lt;'));
fs.writeFileSync(new URL('./dist/assets/alphabet.svg',import.meta.url),t.atlasSVG());fs.writeFileSync('/tmp/teyvat-long-test.svg',long.svg);fs.writeFileSync('/tmp/teyvat-all-test.svg',all.svg);
console.log('PASS: 26 glifos, acentos, Unicode, TYVT1/TYVT2, validação de códigos, SVG seguro e carta longa com 2000 glifos sem corte.');
// Sticker regressions: preserve every letter across pagination and reject SVG injection.
assert.equal(t.stickerPages('   ').length,0);
assert.equal(t.stickerPages('Olá\r\nWolf!')[0].join('\n'),'OLA\nWOLF!');
const many=t.stickerPages('W'.repeat(2000));assert.ok(many.length>1);assert.equal(many.flat().join(''),'W'.repeat(2000));assert.ok(many.every(p=>p.length<=6));
for(const page of many)for(const line of page){const width=[...line].reduce((w,c)=>w+t.GLYPHS[c].width/1250*42+2,0);assert.ok(width<=420)}
const sticker=t.stickerSVG(['ABC'],'#635070',true);assert.ok(sticker.includes('width="512" height="512"'));assert.ok(!sticker.includes('<rect'));assert.equal((sticker.match(/<path /g)||[]).length,3);assert.ok(sticker.includes('non-scaling-stroke'));assert.ok(!t.stickerSVG(['ABC'],'#635070',false).includes('stroke-width'));
assert.throws(()=>t.stickerSVG(['ABC'],'red" onload="alert(1)'));assert.ok(!t.stickerSVG(['<script>'],'#635070').includes('<script>'));
fs.writeFileSync('/tmp/teyvat-sticker-test.svg',sticker);
console.log('PASS: sticker pagination (2000 letters), CRLF, transparency, vector outlines, 512×512 dimensions, optional stroke, safe SVG color.');
// Cross-script coverage, source-specific punctuation, deterministic export and letter preservation.
assert.equal(Object.keys(t.SCRIPTS).length,7);
const missing={teyvat:'',inazuma:'',sumeru:'',deshret:'',fontaine:'',khaenriah:'',chasm:''};
const hashes=[];
for(const [id,info] of Object.entries(t.SCRIPTS)){
 t.setScript(id);assert.equal(t.currentScript().id,id);assert.equal(info.missing,missing[id]);assert.equal(t.pack().script,id);
 const recovered=t.parse('TYVT2:'+t.encode(JSON.stringify(t.pack())));assert.equal(recovered.script,id);
 const card=t.svgCard('ABCDEFGHIJKLMNOPQRSTUVWXYZ',false);assert.equal((card.svg.match(/<path /g)||[]).length,26-info.missing.length);
 for(const c of info.missing){assert.ok(card.svg.includes('>'+c+'</text>'));assert.ok(card.svg.includes('fill="#a44b44"'))}
 const repeated=t.svgCard('W'.repeat(2000),true);assert.equal((repeated.svg.match(/<use href="#rune-/g)||[]).length,2000);assert.ok(repeated.svg.length<2000000);const pages=t.stickerPages('W'.repeat(2000));assert.equal(pages.flat().join(''),'W'.repeat(2000));assert.ok(pages.every(p=>p.length<=6));
 const svg=t.stickerSVG(['HI WOLF!','HOW ARE YOU?']);assert.ok(svg.includes('512'));assert.ok(svg.includes('Figurinha · '));
 fs.writeFileSync('/tmp/teyvat-'+id+'-test.svg',svg);hashes.push(info.sha256);
}
assert.equal(new Set(hashes).size,7);assert.notEqual(t.SCRIPTS.khaenriah.glyphs.A.path,t.SCRIPTS.chasm.glyphs.A.path);
for(const c of '0123456789')assert.ok(t.SCRIPTS.fontaine.glyphs[c]?.path);
for(const c of '!,?.')assert.ok(t.SCRIPTS.khaenriah.glyphs[c]?.path);
assert.ok(!t.SCRIPTS.teyvat.glyphs['?']);
assert.throws(()=>t.setScript('unknown'));assert.throws(()=>t.parse('TYVT2:'+t.encode(JSON.stringify({...legacy,v:2,script:'unknown'}))));
t.setScript('teyvat');
console.log('PASS: 7 scripts, exact missing-letter coverage, source-specific digits/punctuation, script-aware round trips, distinct Khaenri’ah variants, 2000-letter pagination in every script.');

// Reconstructed glyphs must be genuine vector paths in every output, not Latin fallbacks.
for(const [id,letters] of [['sumeru','X'],['fontaine','ABCDEFGHIJKLMNOPQRSTUVWXYZ']]){
 t.setScript(id);assert.equal(t.currentScript().referenceLetters,letters);assert.equal(t.currentScript().missing,'');
 for(const c of letters){assert.ok(t.GLYPHS[c].path.length>100);assert.equal(t.GLYPHS[c].path,t.GLYPHS[c.toLowerCase()].path)}
 const c=t.svgCard(letters,false);assert.equal((c.svg.match(/<path /g)||[]).length,letters.length);assert.ok(!c.svg.includes('fill="#a44b44"'));
 const st=t.stickerSVG([letters]);assert.equal((st.match(/<path /g)||[]).length,letters.length);
}
t.setScript('teyvat');console.log('PASS: X de Sumeru e K/Q/Y/Z de Fontaine são contornos nativos na prévia, SVG e figurinhas.');
// Composition regressions: single mode, word boundaries, independent plain metrics and PDF offsets.
t.setScript('fontaine');el('input').value='A single letter';el('translated').value='Outra mensagem';el('use-text').value='translated';t.setComposeMode('single');assert.equal(t.pack().selected,'original');assert.equal(t.pack().mode,'single');assert.ok(el('translation-fields').hidden);t.setComposeMode('translation');assert.ok(!el('translation-fields').hidden);assert.equal(t.pack().selected,'translated');t.setComposeMode('single');
const phrase='Even the fiercest wolf deserves a warm cup of tea\n\nFrom Wriothesley';
for(const dimensions of [{width:800,height:1132},{width:1132,height:800},{width:480,height:400},{width:1600,height:2400}]){
 const card=t.svgCard(phrase,true,dimensions);assert.equal(card.width,dimensions.width);assert.ok(card.height>=dimensions.height);if(dimensions.width>=1132)assert.ok(card.lines.some(l=>l.includes('WRIOTHESLEY')));assert.equal(card.footerLines.join(' '),'May the wind carry your words');
 assert.equal(card.lines.join('').replace(/\s+/g,''),t.normalise(phrase).replace(/\s+/g,''));
 const wordSet=new Set(phrase.toUpperCase().split(/\s+/));if(dimensions.width>=1132)for(const line of card.lines)for(const word of line.split(/\s+/).filter(Boolean))assert.ok(wordSet.has(word));
 for(const line of card.plain)assert.ok([...line].length*23<=dimensions.width-2*Math.max(38,dimensions.width*.065));
 assert.ok(card.layout.contentEnd<card.height-70);assert.ok(card.layout.footerStart>card.layout.contentEnd);
}
const veryLong=t.svgCard('W'.repeat(2000),true,{width:480,height:400});assert.equal(veryLong.lines.join(''),'W'.repeat(2000));assert.equal(veryLong.plain.join(''),'W'.repeat(2000));
const pdf=t.pdfFromJPEG(new Uint8Array([255,216,255,217]),1132,800),pdfBytes=Buffer.from(await pdf.arrayBuffer()),pdfText=pdfBytes.toString('latin1');assert.ok(pdfText.startsWith('%PDF-1.4'));assert.ok(pdfText.includes('/MediaBox [0 0 679.1999999999999 480]')||pdfText.includes('/MediaBox [0 0 679.2 480]'));
const start=Number(/startxref\n(\d+)/.exec(pdfText)[1]);assert.equal(pdfText.slice(start,start+4),'xref');for(const m of pdfText.matchAll(/(\d{10}) 00000 n /g)){const offset=Number(m[1]);assert.match(pdfText.slice(offset),/^[1-5] 0 obj/)}
fs.writeFileSync('/tmp/teyvat-letter-layout.svg',t.svgCard(phrase,true,{width:1132,height:800}).svg);
if(fs.existsSync('/tmp/teyvat-letter-layout.jpg'))fs.writeFileSync('/tmp/teyvat-letter-layout.pdf',Buffer.from(await t.pdfFromJPEG(fs.readFileSync('/tmp/teyvat-letter-layout.jpg'),1132,800).arrayBuffer()));
console.log('PASS: single/translation modes, portrait/landscape/custom layouts, intact words, independent readable text metrics, 2000 characters and PDF cross-reference offsets.');
// Stationery: separate author, exact metadata recovery, safe optional fields and non-overlapping sections.
t.setScript('fontaine');t.restoreLetter({author:'Wriothesley',recipient:'Wolf',details:'Fontaine · 6 November',footer:'May the wind carry your words',authorRunes:true,fontSize:54,lineHeight:1.55,width:1200,height:900,orientation:'landscape',showNormal:true});
const body='Even the fiercest wolf deserves a warm cup of tea',stationery=t.svgCard(body,true,{width:1200,height:900});
assert.equal(stationery.lines.join(' ').replace(/\s+/g,' '),t.normalise(body));assert.equal(stationery.authorLines.join(' '),'FROM WRIOTHESLEY');assert.ok(stationery.svg.includes('A Letter from Teyvat'));assert.ok(stationery.svg.includes('To Wolf'));assert.ok(stationery.svg.includes('From Wriothesley'));
assert.ok(stationery.layout.bodyEnd<stationery.layout.authorDivider);assert.ok(stationery.layout.authorDivider<stationery.layout.authorStart);assert.ok(stationery.layout.authorStart<stationery.layout.plainStart);assert.ok(stationery.layout.plainStart<stationery.layout.plainDivider);assert.ok(stationery.layout.plainDivider<stationery.layout.plainAuthorStart);assert.ok(stationery.layout.contentEnd<stationery.layout.footerStart-25);
const packet=t.parse('TYVT2:'+t.encode(JSON.stringify(t.pack())));assert.equal(packet.letter.author,'Wriothesley');assert.equal(packet.letter.width,1200);assert.equal(packet.letter.fontSize,54);assert.equal(packet.letter.recipient,'Wolf');
for(const patch of [{author:'x'.repeat(101)},{fontSize:101},{height:300},{recipient:{}},{lineHeight:2}])assert.throws(()=>t.parse('TYVT2:'+t.encode(JSON.stringify({...packet,letter:{...packet.letter,...patch}}))));
t.restoreLetter({author:'<script>alert(1)</script>',recipient:'<img onerror=x>',details:'& test',footer:'',authorRunes:false,fontSize:54,lineHeight:1.55});const safeLetter=t.svgCard('Hello',false,{width:480,height:400});assert.ok(!safeLetter.svg.includes('<script>'));assert.ok(!safeLetter.svg.includes('<img '));assert.ok(safeLetter.svg.includes('&lt;script&gt;'));assert.equal(safeLetter.authorLines.length,0);assert.ok(safeLetter.plainAuthor.length>0);assert.equal(safeLetter.layout.footerStart,null);
t.restoreLetter({author:'Wriothesley',footer:'May the wind carry your words',authorRunes:true,fontSize:54,lineHeight:1.55});
for(const dimensions of [{width:1200,height:900},{width:900,height:1200},{width:480,height:400}]){const card=t.svgCard(body,true,dimensions);assert.ok(card.layout.footerStart>card.layout.contentEnd+25);assert.equal(card.authorLines.join('').replace(/\s+/g,''),'FROMWRIOTHESLEY')}
fs.writeFileSync('/tmp/teyvat-stationery-model.svg',t.svgCard(body,true,{width:1200,height:900}).svg);t.restoreLetter();
console.log('PASS: separate author/recipient/details, stationery section order, optional footer, safe metadata, reversible layout and portrait/landscape/narrow cards.');
