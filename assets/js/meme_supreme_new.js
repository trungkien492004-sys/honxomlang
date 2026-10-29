// Supreme (Tối Thượng) presets for the anime-era heroes and the Limit-1 ace
// rule that keeps them in check. Loaded after every catalog and before meme_game.js.
(function () {
  const ACE_LIMITS = {
    'AN-number_39_utopia': 1,
    'AN-number_17_leviathan_dragon': 1,
    'AN-gagaga_cowboy': 1,
    'AN-zubaba_general': 1,
    'AN-stardust_dragon': 1,
    'AN-junk_warrior': 1,
    'AN-nitro_warrior': 1,
    'AN-harpie_s_pet_dragon': 1,
    'AN-harpie_lady_sisters': 1,
    'AN-amazoness_queen': 1
  };
  const HERO_ACES = {
    yuma: ['AN-number_39_utopia', 'AN-number_17_leviathan_dragon', 'AN-gagaga_cowboy', 'AN-zubaba_general'],
    yusei: ['AN-stardust_dragon', 'AN-junk_warrior', 'AN-nitro_warrior'],
    mai: ['AN-harpie_s_pet_dragon', 'AN-harpie_lady_sisters', 'AN-amazoness_queen']
  };
  for (const c of window.MEME_CARDS || []) {
    if (ACE_LIMITS[c.id] != null) c.max_copies = ACE_LIMITS[c.id];
  }
  window.MEME_HERO_ACE_LIMITS = HERO_ACES;
  window.memeHeroAceNote = code => HERO_ACES[code]?.length ? ' · Át chủ Limit 1' : '';

  window.MEME_SUPREME_DECKS = {
    yugi: 'Yugi · Ma Thuật Tối Thượng',
    kaiba: 'Kaiba · Đỉnh Cao Mắt Xanh',
    joey: 'Joey · Rồng Đen Bất Diệt',
    pegasus: 'Pegasus · Vương Quốc Hoạt Hình',
    jaden: 'Jaden · Anh Hùng Tối Thượng',
    zane: 'Zane · Rồng Máy Tận Diệt',
    mai: 'Mai · Tối Thượng',
    yuma: 'Yuma · Tối Thượng',
    yusei: 'Yusei · Tối Thượng'
  };

  const decks = {
    'Mai · Tối Thượng': [
      'AN-harpie_lady', 'AN-harpie_lady', 'AN-harpie_lady',
      'AN-cyber_harpie_lady', 'AN-cyber_harpie_lady', 'AN-cyber_harpie_lady',
      'AN-harpie_queen', 'AN-harpie_queen',
      'AN-harpie_lady_sisters',
      'AN-harpie_s_pet_dragon',
      'AN-harpie_s_pet_baby_dragon', 'AN-harpie_s_pet_baby_dragon',
      'AN-amazoness_queen',
      'AN-amazoness_swordswoman',
      'AN-amazoness_tiger',
      'AN-amazoness_chain_master',
      'AN-elegant_egotist', 'AN-elegant_egotist', 'AN-elegant_egotist',
      'AN-harpie_lady_phoenix_formation',
      'AN-harpie_s_hunting_ground', 'AN-harpie_s_hunting_ground',
      'AN-triangle_ecstasy_spark',
      'AN-shadow_of_eyes',
      'AN-mirror_wall',
      'AN-harpies_feather_duster',
      'AN-monster_reborn',
      'AN-pot_of_greed',
      'AN-mirror_force',
      'AN-magic_cylinder'
    ],
    'Yusei · Tối Thượng': [
      'AN-junk_synchron', 'AN-junk_synchron', 'AN-junk_synchron',
      'AN-speed_warrior', 'AN-speed_warrior',
      'AN-quillbolt_hedgehog', 'AN-quillbolt_hedgehog',
      'AN-sonic_chick', 'AN-sonic_chick',
      'AN-shield_wing',
      'AN-junk_forward', 'AN-junk_forward',
      'AN-doppelwarrior', 'AN-doppelwarrior',
      'AN-turbo_synchron', 'AN-turbo_synchron',
      'AN-nitro_synchron', 'AN-nitro_synchron',
      'AN-effect_veiler',
      'AN-tuning', 'AN-tuning',
      'AN-synchro_blast_wave',
      'AN-limiter_overload',
      'AN-scrap_iron_scarecrow',
      'AN-spirit_force',
      'AN-pot_of_greed',
      'AN-monster_reborn',
      'AN-mirror_force',
      'AN-mystical_space_typhoon',
      'AN-raigeki'
    ],
    'Yuma · Tối Thượng': [
      'AN-gagaga_magician', 'AN-gagaga_magician', 'AN-gagaga_magician',
      'AN-gagaga_girl', 'AN-gagaga_girl', 'AN-gagaga_girl',
      'AN-gagaga_child', 'AN-gagaga_child', 'AN-gagaga_child',
      'AN-zubaba_knight', 'AN-zubaba_knight', 'AN-zubaba_knight',
      'AN-gogogo_golem', 'AN-gogogo_golem', 'AN-gogogo_golem',
      'AN-kagetokage', 'AN-kagetokage', 'AN-kagetokage',
      'AN-ganbara_knight', 'AN-ganbara_knight', 'AN-ganbara_knight',
      'AN-onomatopaira', 'AN-onomatopaira',
      'AN-gagagabolt', 'AN-gagagabolt',
      'AN-gagagaguard',
      'AN-half_unbreak',
      'AN-monster_reborn',
      'AN-pot_of_greed',
      'AN-mirror_force'
    ]
  };
  const extras = {
    'Mai · Tối Thượng': [],
    'Yusei · Tối Thượng': [
      'AN-stardust_dragon',
      'AN-junk_warrior',
      'AN-nitro_warrior',
      'AN-formula_synchron', 'AN-formula_synchron',
      'AN-armory_arm', 'AN-armory_arm'
    ],
    'Yuma · Tối Thượng': [
      'AN-number_39_utopia',
      'AN-number_17_leviathan_dragon',
      'AN-gagaga_cowboy',
      'AN-zubaba_general'
    ]
  };

  const trim = cards => {
    const seen = new Map();
    return cards.filter(id => {
      const cap = ACE_LIMITS[id] ?? Infinity;
      const n = seen.get(id) || 0;
      if (n >= cap) return false;
      seen.set(id, n + 1);
      return true;
    });
  };
  for (const [name, cards] of Object.entries(window.MEME_DECK_PRESETS || {})) {
    if (Array.isArray(cards)) window.MEME_DECK_PRESETS[name] = trim(cards);
  }
  for (const [name, cards] of Object.entries(window.MEME_EXTRA_PRESETS || {})) {
    if (Array.isArray(cards)) window.MEME_EXTRA_PRESETS[name] = trim(cards);
  }
  Object.assign(window.MEME_DECK_PRESETS || (window.MEME_DECK_PRESETS = {}), decks);
  Object.assign(window.MEME_EXTRA_PRESETS || (window.MEME_EXTRA_PRESETS = {}), extras);
})();
