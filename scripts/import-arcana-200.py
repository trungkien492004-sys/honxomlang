"""Read the supplied design workbook; compile data only, never execute cell text."""
import argparse, collections, hashlib, json, shutil
from pathlib import Path
import openpyxl

p=argparse.ArgumentParser();p.add_argument('workbook');args=p.parse_args()
root=Path(__file__).resolve().parent.parent;source=Path(args.workbook).resolve()
book=openpyxl.load_workbook(source,read_only=True,data_only=True)
sheets={s.title:[list(r) for r in s.values] for s in book}
rows=sheets['200 LA BAI'][1:];assert len(rows)==200
families={'may mắn':'coin','siêu thủ':'defense','boss':'mark','biến hóa':'stance','công mạnh':'power','lật kèo':'comeback','mộ':'grave','deck':'mill','phép':'spell','trang bị':'equip','N buff':'swarm','bẫy':'ambush','extra':'extra'}
palette={'coin':('Quang','🎲','#ffd783','#756124'),'defense':('Cơ','🛡️','#a2d3ee','#304964'),'mark':('Quang','⚡','#e4c7ff','#63409e'),'stance':('Phong','🌸','#ffa7d8','#6a255c'),'power':('Hỏa','🔥','#ffad75','#7c2433'),'comeback':('Hỏa','⭐','#ffd28a','#875323'),'grave':('Ám','🦇','#bc9aef','#392257'),'mill':('Cơ','🤖','#85d9ff','#1b5072'),'spell':('Thủy','🔮','#93d9ff','#3a3f85'),'equip':('Quang','⚔️','#ffdc99','#6a4e36'),'swarm':('Phong','🍃','#a7edb1','#255f53'),'ambush':('Ám','🎩','#f4a2e8','#613365'),'extra':('Cơ','🚀','#9fceff','#31416c')}
cards=[]
for r in rows:
    no,ident,name,group,culture,kind,category,tribe,rarity,stars,atk,defense,limit,role,play,description,activation,interactions,design,balance=r
    assert ident==f'XA-{no:03}' and rarity in ('N','R','SR','UR')
    assert isinstance(description,str) and len(description)>20 and limit=={'N':3,'R':3,'SR':2,'UR':1}[rarity]
    typ={'Quái':'Monster','Phép':'Spell','Bẫy':'Trap'}[kind];family=families[play];element,emoji,c1,c2=palette[family];slot=(no-1)%10+1
    c=dict(id=ident,set_number=f'{no:03}',name=name,card_type=typ,archetype=group,culture=culture,tribe=tribe,rarity=rarity,max_copies=limit,role=role,play_style=play,family=family,role_index=slot,description=description,activation_rules=activation,interactions=interactions,balance_note=balance,design_source=design,element=element,art=dict(emoji=emoji,c1=c1,c2=c2),custom_image=f'assets/memecard/art/{ident}.svg',deck_zone='Main',extra_eligible=no in (180,200),is_tuner=False,catalogue_version=200,effect_code=f'xa_{family}_{slot}',effect_value=0)
    if typ=='Monster':
        c.update(stars=int(stars),atk=int(atk),**{'def':int(defense)},monster_category=category,is_boss=slot==10,effect_trigger='on_summon' if slot in (1,4,10) else 'activated' if slot in (2,5) else 'passive')
        if slot==10:c['boss_requirement']=dict(count=2,sameTribe=True,lowRarity=True,comeback=family=='comeback')
        if c['extra_eligible']:c['extra_requirement']=dict(count=2,minStars=6,sameTribe=True)
    elif typ=='Spell':c['spell_category']={'Thông thường':'Thường','Liên tục':'Liên Tục','Trang bị':'Trang Bị'}[category]
    else:c['trap_category']='Phản Ứng'
    notes=[]
    if slot==7 and family in ('defense','ambush'):notes.append('Mệnh đề chỉ số trên Phép Liên Tục áp dụng cho quái cùng tộc đang ngửa; giới hạn số trên lá được giữ nguyên.')
    if slot==7 and family=='comeback':notes.append('Phép Liên Tục gọi 1 quái N/R cùng tộc từ tay khi LP thấp hơn ít nhất 1500; quái được gọi bị vô hiệu hiệu ứng.')
    if slot==8:notes.append('Bẫy phản ứng theo điều kiện cụ thể bên trong mô tả; các mệnh đề “Khi…” được hiểu là điều kiện kích hoạt, không bỏ qua điều kiện này.')
    if notes:c['engine_notes']=' '.join(notes)
    cards.append(c)
by_id={c['id']:c for c in cards};assert len(by_id)==200
decks={}
for group,index,ident,name,typ in sheets['20 DECK MAU'][1:]:
    assert by_id[ident]['name']==name;decks.setdefault(group,[]).append(ident)
assert len(decks)==20
for name,ids in decks.items():
    assert len(ids)==20
    for ident,count in collections.Counter(ids).items():assert count<=by_id[ident]['max_copies'],(name,ident,count)
meta=dict(version='20261021-arcana-200',cardCount=200,mainSize=20,extraLimit=5,sourceFilename=source.name,sourceSha256=hashlib.sha256(source.read_bytes()).hexdigest(),archetypes=[dict(zip(sheets['20 BO CHIEN THUAT'][0],r)) for r in sheets['20 BO CHIEN THUAT'][1:]],rules=[dict(zip(sheets['LUAT & CAN BANG'][0],r)) for r in sheets['LUAT & CAN BANG'][1:]])
data=dict(cards=cards,decks=decks,meta=meta)
(root/'assets/data').mkdir(exist_ok=True)
(root/'assets/data/arcana-200.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
js='// Compiled from '+source.name+'; see scripts/import-arcana-200.py.\n'
js+='window.MEME_CARDS='+json.dumps(cards,ensure_ascii=False,separators=(',',':'))+';\n'
js+='window.MEME_DECK_PRESETS='+json.dumps(decks,ensure_ascii=False,separators=(',',':'))+';\n'
js+='window.ARCANA_CATALOGUE='+json.dumps(meta,ensure_ascii=False,separators=(',',':'))+';\n'
target=root/'assets/js/meme_catalog_200.js';target.write_text(js,encoding='utf-8')
exports=root/'assets/exports';exports.mkdir(exist_ok=True);shutil.copyfile(source,exports/'xom-arcana-200-la.xlsx')
(exports/'catalog-manifest.json').write_text(json.dumps(dict(version=meta['version'],cardCount=200,sourceFiles=['meme_catalog_200.js'],sha256=hashlib.sha256(target.read_bytes()).hexdigest(),filename='xom-arcana-200-la.xlsx',workbookSha256=meta['sourceSha256']),ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(dict(cards=len(cards),decks=len(decks),families=len(set(c['family'] for c in cards)),source=source.name),ensure_ascii=False))
