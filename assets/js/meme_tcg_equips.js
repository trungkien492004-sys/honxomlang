// TCG equip calculation shared by the current engine and the migration candidate.
(() => {
 function megamorphDelta(name,monster){
  if(!duel||!monster?.uid)return 0;const equips=[];
  for(const owner of ['player','enemy'])for(const [index,slot]of [...side(owner).spells,side(owner).field].entries())if(slot&&!slot.faceDown&&slot.equippedTo===monster.uid&&card(slot.id)?.id==='AN-megamorph')equips.push({owner,slot,index});
  if(!equips.length)return 0;equips.sort((a,b)=>(a.slot.equippedSerial||0)-(b.slot.equippedSerial||0));const equip=equips.at(-1),own=side(equip.owner).lp,foe=side(other(equip.owner)).lp,original=Math.max(0,Number(card(monster.id)?.atk)||0);
  return own<foe?original:own>foe?-original/2:0;
 }
 window.memeEquipRules={megamorphDelta};
})();
