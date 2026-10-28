// Shared by the duel, deck warnings, and catalogue tests. Entries represent copies, not IDs.
(() => {
  const normAttr = a => {
    if (!a) return '';
    const s = String(a).trim().toUpperCase();
    if (s === 'ĐỊA' || s === 'ĐẤT' || s === 'EARTH') return 'ĐỊA';
    if (s === 'THỦY' || s === 'NƯỚC' || s === 'WATER') return 'NƯỚC';
    if (s === 'HỎA' || s === 'LỬA' || s === 'FIRE') return 'HỎA';
    if (s === 'PHONG' || s === 'GIÓ' || s === 'WIND') return 'PHONG';
    if (s === 'QUANG' || s === 'SÁNG' || s === 'LIGHT') return 'QUANG';
    if (s === 'ÁM' || s === 'TỐI' || s === 'DARK') return 'ÁM';
    if (s === 'THẦN' || s === 'DIVINE') return 'THẦN';
    return s;
  };
  const attributes = { Thủy: 'NƯỚC', Quang: 'QUANG', Địa: 'ĐỊA', Phong: 'PHONG', Ám: 'ÁM', Hỏa: 'HỎA', Đất: 'ĐỊA', Nước: 'NƯỚC', Lửa: 'HỎA', Gió: 'PHONG', Sáng: 'QUANG', Tối: 'ÁM' };
  const heroElementFallback = {
    'AN-elemental_hero_clayman': 'Địa', 'AN-elemental_hero_wildheart': 'Địa', 'AN-elemental_hero_bladeedge': 'Địa',
    'AN-elemental_hero_rampart_blaster': 'Địa', 'AN-elemental_hero_mudballman': 'Địa', 'AN-elemental_hero_wildedge': 'Địa',
    'AN-elemental_hero_burstinatrix': 'Hỏa', 'AN-elemental_hero_sparkman': 'Quang', 'AN-elemental_hero_neos': 'Quang',
    'AN-elemental_hero_bubbleman': 'Thủy', 'AN-elemental_hero_necroshade': 'Ám'
  };
  const getCardAttr = c => {
    if (!c) return '';
    return normAttr(c.source_attribute) || normAttr(attributes[c.element]) || normAttr(c.element) || (heroElementFallback[c.id] ? normAttr(heroElementFallback[c.id]) : '');
  };

  function matches(c, rule) {
    if (!c || c.card_type !== 'Monster') return false;
    if (rule.id && c.id !== rule.id) return false;
    if (rule.attribute && getCardAttr(c) !== normAttr(rule.attribute)) return false;
    if (rule.archetype === 'Elemental HERO') {
      const isEHero = /^Elemental HERO\b/i.test(c.name_en || '') || /^Anh Hùng Nguyên Tố\b/i.test(c.name_vi || c.name || '');
      if (!isEHero) return false;
    }
    if (rule.archetype === 'HERO') {
      const isHero = /\bHERO\b/i.test(c.name_en || '') || /\bAnh Hùng\b/i.test(c.name_vi || c.name || '');
      if (!isHero) return false;
    }
    return true;
  }
  function combinations(recipe, pool, getCard) {
    const out = [];
    function walk(i, picked) {
      if (i === recipe.length) { out.push(picked); return; }
      for (const e of pool) {
        if (!picked.includes(e) && matches(getCard(e), recipe[i])) {
          walk(i + 1, [...picked, e]);
        }
      }
    }
    walk(0, []);
    return out;
  }
  function label(recipe) {
    return recipe.map(r => r.id || [r.archetype ? '1 ' + r.archetype : '1 quái', r.attribute || ''].filter(Boolean).join(' · ')).join(' + ');
  }
  window.memeFusionRecipes = { matches, combinations, label };
})();
