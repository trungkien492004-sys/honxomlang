// Shared by the duel, deck warnings, and catalogue tests. Entries represent copies, not IDs.
(() => {
 const attributes={Thủy:'NƯỚC',Quang:'QUANG',Địa:'ĐỊA',Phong:'PHONG',Ám:'ÁM',Hỏa:'HỎA'};
 function matches(c,rule){if(!c||c.card_type!=='Monster')return false;if(rule.id&&c.id!==rule.id)return false;if(rule.attribute&&(c.source_attribute||attributes[c.element])!==rule.attribute)return false;if(rule.archetype==='Elemental HERO'&&!/^Elemental HERO /.test(c.name_en||''))return false;if(rule.archetype==='HERO'&&!/\bHERO\b/.test(c.name_en||''))return false;return true;}
 function combinations(recipe,pool,getCard){const out=[];function walk(i,picked){if(i===recipe.length){out.push(picked);return;}for(const e of pool)if(!picked.includes(e)&&matches(getCard(e),recipe[i]))walk(i+1,[...picked,e]);}walk(0,[]);return out;}
 function label(recipe){return recipe.map(r=>r.id||[r.archetype?'1 '+r.archetype:'1 quái',r.attribute||''].filter(Boolean).join(' · ')).join(' + ');}
 window.memeFusionRecipes={matches,combinations,label};
})();
