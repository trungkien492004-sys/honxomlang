// Yu-Gi-Oh! Anime Duel — Character Dialogue & Cut-In Voice System
// Provides anime quotes for 9 heroes during skills, ace monster summons, and match results.
(() => {
  'use strict';

  // Signature Ace Card mapping for each hero
  const HERO_ACE_CARDS = {
    0: 'AN-dark_magician',                   // Yugi / Atem: Phù Thủy Áo Đen
    1: 'AN-blue_eyes_white_dragon',          // Seto Kaiba: Rồng Trắng Mắt Xanh
    2: 'AN-red_eyes_black_dragon',           // Joey Wheeler: Rồng Đen Mắt Đỏ
    3: 'AN-relinquished',                    // Pegasus: Quỷ Hy Sinh / Relinquished
    4: 'AN-elemental_hero_flame_wingman',    // Jaden Yuki: Flame Wingman
    5: 'AN-cyber_dragon',                    // Zane Truesdale: Cyber Dragon
    6: 'AN-harpie_lady',                     // Mai Valentine: Yêu Điểu Harpie Lady
    7: 'AN-number_39_utopia',                // Yuma Tsukumo: Số 39: Utopia
    8: 'AN-stardust_dragon'                  // Yusei Fudo: Rồng Tinh Tú Stardust Dragon
  };

  // Character voice synthesizer tuning (Pitch & Speech Rate)
  const HERO_VOICE_CONFIG = {
    0: { pitch: 1.02, rate: 1.05 }, // Yugi / Atem: Khí thế hào sảng
    1: { pitch: 0.80, rate: 1.02 }, // Seto Kaiba: Trầm ấm, quyền uy, dũng mãnh
    2: { pitch: 0.95, rate: 1.15 }, // Joey Wheeler: Nhanh nhẹn, hào sảng, hăng hái
    3: { pitch: 1.25, rate: 0.92 }, // Pegasus: Quý tộc, ngân nga, điệu nghệ
    4: { pitch: 1.12, rate: 1.12 }, // Jaden Yuki: Sôi nổi, trẻ trung, nhiệt huyết
    5: { pitch: 0.76, rate: 0.95 }, // Zane Truesdale: Lạnh lùng, điềm tĩnh, sắc bén
    6: { pitch: 1.18, rate: 1.05 }, // Mai Valentine: Quyến rũ, tự tin, sắc sảo
    7: { pitch: 1.24, rate: 1.18 }, // Yuma Tsukumo: Kattobingu daze! Nhiệt huyết đỉnh cao
    8: { pitch: 0.88, rate: 1.00 }  // Yusei Fudo: Điềm tĩnh, kiên định, chuẩn xác
  };

  const DIALOGUES = {
    0: { // Yugi Muto / Atem
      skill: 'Hãy tin vào Trái Tim Lá Bài! Tương lai đang ở phía trước!',
      cards: {
        'dark_magician': 'Người cận vệ trung thành nhất của ta — Phù Thủy Áo Đen!',
        'magician_of_black_chaos': 'Khai mở phong ấn ma thuật tối cao! Phù Thủy Áo Đen Hỗn Mang!',
        'slifer': 'Hỡi Đấng Tối Cao Slifer, giáng trần tiêu diệt kẻ thù!',
        'winged_dragon_of_ra': 'Hỡi Thần Ra, ban cho ta sức mạnh vô địch!',
        'summoned_skull': 'Sấm sét gầm vang — Quỷ Triệu Hồi xuất trận!',
        'time_wizard': 'Phù Thủy Thời Gian, xoay chuyển vận mệnh!'
      },
      victory: 'Trận đấu đã minh chứng cho sợi dây liên kết của chúng ta!',
      defeat: 'Cậu đã chiến đấu rất quả cảm... Một trận đấu tuyệt vời!'
    },
    1: { // Seto Kaiba
      skill: 'Kiêu hãnh của ta là vô địch! Dưới chân ta chỉ có kẻ chiến bại!',
      cards: {
        'blue_eyes_white_dragon': 'Chiêm ngưỡng tạo vật hoàn mỹ và bất bại — Rồng Trắng Mắt Xanh!',
        'blue_eyes_ultimate_dragon': 'Hợp nhất ba linh hồn rồng! Rồng Trắng 3 Đầu, hủy diệt tất cả!',
        'obelisk': 'Kẻ thống trị bầu trời — Thần Obelisk, nghiền nát tất cả!'
      },
      victory: 'Hahahahaha! Ngươi nghĩ trình độ đó có thể chạm tới ta sao?!',
      defeat: 'Không thể nào... Thất bại này chỉ là tạm thời thôi!'
    },
    2: { // Joey Wheeler
      skill: 'Vận may và lòng dũng cảm luôn ở bên ta! Vòng quay thời gian, xoay!',
      cards: {
        'red_eyes_black_dragon': 'Gầm lên nào người bạn chí cốt — Rồng Đen Mắt Đỏ!',
        'time_wizard': 'Đến lúc thử vận may rồi! Kim đồng hồ quay đi!',
        'alligator': 'Tiến lên! Cho đối thủ thấy kiếm thuật xóm làng!'
      },
      victory: 'Thấy chưa?! Joey Wheeler này đâu phải dạng vừa đâu nha!',
      defeat: 'Ái chà... Đau đấy, nhưng lần sau ta nhất định phục thù!'
    },
    3: { // Maximillion Pegasus
      skill: 'Mmm, Con Mắt Ngàn Năm nhìn thấu mọi toan tính của cậu rồi~',
      cards: {
        'toon_world': 'Chào mừng cậu bước vào thế giới hoạt hình diệu kỳ của tôi!',
        'relinquished': 'Hút trọn linh hồn và sức mạnh của kẻ thù đi, Relinquished!'
      },
      victory: 'Thật là một màn trình diễn thú vị! Cảm ơn cậu rất nhiều~',
      defeat: 'Ôi không! Kế hoạch hoàn mỹ của tôi lại bị phá vỡ sao...'
    },
    4: { // Jaden Yuki
      skill: 'Bắt đầu cuộc đấu thôi! Thẻ bài trong tay, tương lai rộng mở!',
      cards: {
        'flame_wingman': 'Anh Hùng bay lượn giữa bầu trời rực lửa — Flame Wingman!',
        'neos': 'Từ vũ trụ xa xôi, người hùng chính nghĩa giáng trần — HERO Neos!',
        'miracle_fusion': 'Phép màu xảy ra từ Mộ bài! Dung Hợp Kỳ Tích!'
      },
      victory: 'Gotcha! Đó thực sự là một trận đấu siêu đỉnh luôn!',
      defeat: 'Uầy... Cậu mạnh thật đấy! Trận sau tái đấu nhé!'
    },
    5: { // Zane Truesdale
      skill: 'Chiến thắng là thứ duy nhất có ý nghĩa trên bàn đấu này!',
      cards: {
        'cyber_dragon': 'Thép nguội gầm thét — Xuất chiến đi, Cyber Dragon!',
        'cyber_end_dragon': 'Nhân đôi sức mạnh tuyệt đối! Cyber End Dragon, hủy diệt!',
        'chimeratech': 'Sự kết hợp điên cuồng của những cỗ máy hủy diệt!'
      },
      victory: 'Đó là sự cách biệt tuyệt đối giữa ta và ngươi.',
      defeat: 'Ta tôn trọng sức mạnh của ngươi. Một đòn phản kích chuẩn xác.'
    },
    6: { // Mai Valentine
      skill: 'Hương thơm hoa hồng quyến rũ... Đừng chớp mắt nhé!',
      cards: {
        'harpie_lady': 'Vút cánh bay lượn trên bầu trời — Yêu Điểu Harpie Lady!',
        'harpie_lady_sisters': 'Vũ điệu tam tấu kiêu kỳ! Quét sạch hàng phòng thủ!'
      },
      victory: 'Đừng bao giờ đánh giá thấp một nữ bài thủ xinh đẹp!',
      defeat: 'Hừ... Lần này coi như cậu may mắn đấy!'
    },
    7: { // Yuma Tsukumo
      skill: 'Kattobingu daze! Vượt qua mọi nghịch cảnh, bay cao hơn nữa!',
      cards: {
        'utopia': 'Hiện thân của hy vọng! Hãy mở đường tới tương lai — Number 39: Utopia!',
        'gagaga': 'Học hỏi ma thuật đỉnh cao đi! Gagaga Magician!'
      },
      victory: 'Kattobingu thành công rực rỡ rồi! Tuyệt vời ông mặt trời!',
      defeat: 'Oái... Dù ngã xuống thì mình vẫn sẽ Kattobingu đứng dậy!'
    },
    8: { // Yusei Fudo
      skill: 'Gắn kết những mảnh vụn để mở ra con đường tăng tốc!',
      cards: {
        'stardust_dragon': 'Tập hợp những vì sao hy vọng, chiếu rọi tương lai mới — Stardust Dragon!',
        'junk_warrior': 'Sức mạnh của tình bạn vượt qua mọi rào cản — Junk Warrior!'
      },
      victory: 'Khi các vì sao liên kết, con đường tương lai sẽ luôn rộng mở.',
      defeat: 'Cậu đã chạy hết tốc lực... Một đối thủ đáng kính trọng.'
    }
  };

  const lastQuoteTimes = { player: 0, enemy: 0 };
  const QUOTE_COOLDOWN = 6000; // 6 seconds cooldown per side

  function getHeroData(heroId) {
    if (typeof MEME_HEROES !== 'undefined' && MEME_HEROES[heroId]) {
      return MEME_HEROES[heroId];
    }
    return { id: 0, name: 'Yugi Muto / Atem', color: '#cfa7ff', position: '0%', tile: 0, icon: '◈' };
  }

  function computeHeroStyle(hero) {
    if (typeof heroStyle === 'function') {
      return heroStyle(hero);
    }
    const tile = hero.tile ?? 0;
    const x = (tile % 4) / 3 * 100;
    const y = Math.floor(tile / 4) / 2 * 100;
    return `--hero-color:${hero.color || '#cfa7ff'};--hero-pos:${hero.position || '0%'};--hero-x:${x}%;--hero-y:${y}%`;
  }

  function renderAceBadge(cardId, heroId) {
    const aceId = cardId || HERO_ACE_CARDS[heroId] || 'AN-dark_magician';
    if (typeof artHTML === 'function') {
      const art = artHTML(aceId, 'dialogue-ace-img');
      const c = typeof card === 'function' ? card(aceId) : null;
      return `<span class="anime-dialogue-ace-badge" title="${c ? c.name : 'Át chủ bài'}">${art}</span>`;
    }
    return '';
  }

    // Quản lý giọng đọc Web Speech API đa ngôn ngữ (Việt - Anh chuẩn Anime)
  let viVoiceCache = null;
  let enVoiceCache = null;

  function getViVoice() {
    if (viVoiceCache) return viVoiceCache;
    if (typeof window.speechSynthesis === 'undefined') return null;
    const voices = window.speechSynthesis.getVoices() || [];
    viVoiceCache = voices.find(v => {
      const l = (v.lang || '').toLowerCase();
      const n = (v.name || '').toLowerCase();
      return l.startsWith('vi') || l.includes('vie') || n.includes('vietnam') || n.includes('tiếng việt');
    }) || null;
    return viVoiceCache;
  }

  function getEnVoice() {
    if (enVoiceCache) return enVoiceCache;
    if (typeof window.speechSynthesis === 'undefined') return null;
    const voices = window.speechSynthesis.getVoices() || [];
    // Ưu tiên giọng tiếng Anh tự nhiên (Google US English, Microsoft Natural / David / Zira)
    enVoiceCache = voices.find(v => {
      const l = (v.lang || '').toLowerCase();
      return l.startsWith('en-us') || l.startsWith('en_us');
    }) || voices.find(v => {
      const l = (v.lang || '').toLowerCase();
      return l.startsWith('en') || l.includes('eng');
    }) || null;
    return enVoiceCache;
  }

  if (typeof window.speechSynthesis !== 'undefined') {
    window.speechSynthesis.onvoiceschanged = () => {
      viVoiceCache = null;
      enVoiceCache = null;
      getViVoice();
      getEnVoice();
    };
  }

  // Từ điển chuyển âm và bản ngữ hóa thuật ngữ / tên thẻ bài anime khi đọc bằng giọng tiếng Việt
  // Giúp giọng đọc tiếng Việt đọc mượt mà, đúng tinh thần lồng tiếng anime HTV3 / manga, không bị đánh vần gượng gạo
  const VI_PHONETIC_REPLACEMENTS = [
    [/\bGotcha\b/gi, 'Thắng lớn rồi'],
    [/\bKattobingu\s*daze\b/gi, 'Vươn tới bầu trời'],
    [/\bKattobingu\b/gi, 'Vươn tới bầu trời'],
    [/\bFlame\s*Wingman\b/gi, 'Anh Hùng Cánh Lửa'],
    [/\bWingman\b/gi, 'Cánh Lửa'],
    [/\bHERO\s*Neos\b/gi, 'Anh Hùng Nê-ốt'],
    [/\bNeos\b/gi, 'Nê-ốt'],
    [/\bHERO\b/gi, 'Anh Hùng'],
    [/\bCyber\s*End\s*Dragon\b/gi, 'Rồng Máy Tối Thượng'],
    [/\bCyber\s*Dragon\b/gi, 'Rồng Cơ Khí'],
    [/\bCyber\b/gi, 'Cơ Khí'],
    [/\bRelinquished\b/gi, 'Quái Thú Đoạt Hồn'],
    [/\bHarpie\s*Lady\s*Sisters\b/gi, 'Tam Tấu Yêu Điểu Hác-pi'],
    [/\bHarpie\s*Lady\b/gi, 'Yêu Điểu Hác-pi'],
    [/\bHarpie\b/gi, 'Hác-pi'],
    [/\bNumber\s*39\s*:\s*Utopia\b/gi, 'Số ba mươi chín: Ánh Sáng Utopia'],
    [/\bNumber\s*39\b/gi, 'Số ba mươi chín'],
    [/\bUtopia\b/gi, 'U-tô-pi-a'],
    [/\bGagaga\s*Magician\b/gi, 'Phù Thủy Ga-ga-ga'],
    [/\bGagaga\b/gi, 'Ga-ga-ga'],
    [/\bStardust\s*Dragon\b/gi, 'Rồng Bụi Sao Stardust'],
    [/\bStardust\b/gi, 'Bụi Sao'],
    [/\bJunk\s*Warrior\b/gi, 'Chiến Binh Phế Liệu'],
    [/\bJunk\b/gi, 'Phế Liệu'],
    [/\bBlue-Eyes\s*White\s*Dragon\b/gi, 'Rồng Trắng Mắt Xanh'],
    [/\bBlue-Eyes\b/gi, 'Rồng Trắng Mắt Xanh'],
    [/\bRed-Eyes\s*Black\s*Dragon\b/gi, 'Rồng Đen Mắt Đỏ'],
    [/\bRed-Eyes\b/gi, 'Rồng Đen Mắt Đỏ'],
    [/\bDark\s*Magician\b/gi, 'Phù Thủy Áo Đen'],
    [/\bSlifer\b/gi, 'Rồng Thần Slifer'],
    [/\bObelisk\b/gi, 'Thần Obelisk'],
    [/\bRa\b/gi, 'Thần Ra']
  ];

  function normalizeForVietnameseSpeech(text) {
    let s = text;
    for (const [pattern, replacement] of VI_PHONETIC_REPLACEMENTS) {
      s = s.replace(pattern, replacement);
    }
    return s;
  }

  // Kiểm tra xem đoạn văn bản là thuần tiếng Anh hay có tiếng Việt
  function hasVietnameseChars(str) {
    return /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(str);
  }

  // Giọng đọc câu thoại theo ngữ cảnh (Tự động chọn giọng chuẩn: Vi cho tiếng Việt, En cho tiếng Anh)
  function speakDialogue(text, heroId) {
    if (!text || typeof window.speechSynthesis === 'undefined') return;
    if (localStorage.getItem('meme-sound') === 'off' || localStorage.getItem('meme-voice') === 'off') return;

    try {
      window.speechSynthesis.cancel(); // Hủy câu cũ, không nói đè

      // Làm sạch ký tự dấu gạch ngang, dấu ngoặc kép trước khi đọc
      const cleanText = text
        .replace(/[-—–~]/g, ' ')
        .replace(/["'«»]/g, '')
        .replace(/!{2,}/g, '!')
        .replace(/\s+/g, ' ')
        .trim();

      if (!cleanText) return;

      const cfg = HERO_VOICE_CONFIG[heroId] || { pitch: 1.0, rate: 1.0 };
      const vol = Number(localStorage.getItem('meme-sfx-volume') || 0.6);
      const volumeLevel = Math.max(0, Math.min(1, vol * 1.2));

      const isVi = hasVietnameseChars(cleanText);

      if (isVi) {
        // CÂU TIẾNG VIỆT:
        // Chuyển hóa các từ tiếng Anh lồng ghép thành ngữ âm tiếng Việt chuẩn anime để giọng đọc không bị gượng gạo
        const spokenViText = normalizeForVietnameseSpeech(cleanText);
        const viUtterance = new SpeechSynthesisUtterance(spokenViText);
        viUtterance.lang = 'vi-VN';
        viUtterance.pitch = cfg.pitch;
        viUtterance.rate = cfg.rate;
        viUtterance.volume = volumeLevel;

        const viVoice = getViVoice();
        if (viVoice) {
          viUtterance.voice = viVoice;
          window.speechSynthesis.speak(viUtterance);
        } else {
          const allVoices = window.speechSynthesis.getVoices() || [];
          if (allVoices.length === 0) {
            window.speechSynthesis.speak(viUtterance);
          }
          // Nếu hệ điều hành không có giọng tiếng Việt, không dùng giọng tiếng Anh đọc tiếng Việt
        }
      } else {
        // CÂU TIẾNG ANH (hoặc cụm từ tiếng Anh):
        // Dùng giọng tiếng Anh bản xứ chuẩn (en-US) đọc đúng phát âm, ngữ điệu tự nhiên!
        const enUtterance = new SpeechSynthesisUtterance(cleanText);
        enUtterance.lang = 'en-US';
        enUtterance.pitch = cfg.pitch;
        enUtterance.rate = cfg.rate;
        enUtterance.volume = volumeLevel;

        const enVoice = getEnVoice();
        if (enVoice) {
          enUtterance.voice = enVoice;
        }
        window.speechSynthesis.speak(enUtterance);
      }
    } catch (_) {}
  }

  function showDialogue(owner, text, heroId = null, cardId = null) {
    if (!text) return;
    const now = Date.now();
    if (now - (lastQuoteTimes[owner] || 0) < QUOTE_COOLDOWN) {
      return;
    }
    lastQuoteTimes[owner] = now;

    // Remove existing banner
    const existing = document.querySelector(`.anime-dialogue-banner.${owner}-dialogue`);
    if (existing) existing.remove();

    // Determine hero
    let hId = heroId;
    if (hId == null && typeof duel !== 'undefined' && duel && duel[owner]) {
      hId = duel[owner].heroId;
    }
    const hero = getHeroData(hId ?? 0);
    const styleStr = computeHeroStyle(hero);
    const aceBadge = renderAceBadge(cardId, hId ?? 0);

    const banner = document.createElement('div');
    banner.className = `anime-dialogue-banner ${owner}-dialogue`;
    banner.style.setProperty('--hero-color', hero.color || '#ffd28c');

    banner.innerHTML = `
      <div class="anime-dialogue-avatar">
        <span class="hero-portrait" style="${styleStr}"></span>
      </div>
      <div class="anime-dialogue-content">
        <div class="anime-dialogue-name">
          ${aceBadge}
          <span>${hero.name}</span>
        </div>
        <span class="anime-dialogue-text">"${text}"</span>
      </div>
    `;

    document.body.appendChild(banner);

    // 1. Phát âm thanh hiệu ứng khí thế xướng tên của nhân vật (Vocal Call SFX)
    window.memeAudioSfx?.playHeroCall(hId ?? 0);

    // 2. Phát giọng đọc câu thoại anime
    speakDialogue(text, hId ?? 0);

    setTimeout(() => {
      banner.remove();
    }, 3200);
  }

  function checkAceCard(cardId, heroId) {
    const id = (cardId || '').toLowerCase();
    const heroQuotes = DIALOGUES[heroId]?.cards;
    if (!heroQuotes) return null;

    for (const [key, quote] of Object.entries(heroQuotes)) {
      if (id.includes(key)) {
        return quote;
      }
    }
    return null;
  }

  function hookEvents() {
    // 1. Hook resolveCard in memeFx to capture card summons and skills
    if (window.memeFx) {
      const origResolve = window.memeFx.resolveCard;
      window.memeFx.resolveCard = function(task, done) {
        if (task) {
          const owner = task.owner || 'player';
          const heroId = (typeof duel !== 'undefined' && duel && duel[owner]) ? duel[owner].heroId : 0;

          if (task.kind === 'skill') {
            const skillQuote = DIALOGUES[heroId]?.skill;
            if (skillQuote) {
              lastQuoteTimes[owner] = 0; // Skill always has priority
              showDialogue(owner, skillQuote, heroId, HERO_ACE_CARDS[heroId]);
            }
          } else if (task.cardId) {
            const cardQuote = checkAceCard(task.cardId, heroId);
            if (cardQuote) {
              lastQuoteTimes[owner] = 0; // Ace summon has priority
              showDialogue(owner, cardQuote, heroId, task.cardId);
            }
          }
        }
        return origResolve.apply(this, arguments);
      };
    }

    // 2. Hook match conclusion
    if (window.memeFx) {
      const origAfterRender = window.memeFx.afterRender;
      let matchEnded = false;
      window.memeFx.afterRender = function(d, oldElements) {
        if (d && d.finished && !matchEnded) {
          matchEnded = true;
          const playerWon = d.player.lp > 0 && d.enemy.lp <= 0;
          const pHeroId = d.player.heroId ?? 0;
          const eHeroId = d.enemy.heroId ?? 1;

          setTimeout(() => {
            if (playerWon) {
              const pQuote = DIALOGUES[pHeroId]?.victory;
              lastQuoteTimes.player = 0;
              showDialogue('player', pQuote, pHeroId, HERO_ACE_CARDS[pHeroId]);
              window.memeAudioSfx?.play('victory');
            } else {
              const eQuote = DIALOGUES[eHeroId]?.victory;
              lastQuoteTimes.enemy = 0;
              showDialogue('enemy', eQuote, eHeroId, HERO_ACE_CARDS[eHeroId]);
              window.memeAudioSfx?.play('defeat');
            }
          }, 600);
        } else if (d && !d.finished) {
          matchEnded = false;
        }
        return origAfterRender ? origAfterRender.apply(this, arguments) : undefined;
      };
    }
  }

  window.memeAnimeDialogue = {
    show: showDialogue,
    speak: speakDialogue,
    hookEvents,
    get dialogues() { return DIALOGUES; },
    get aceCards() { return HERO_ACE_CARDS; },
    toggleVoice(enable) {
      if (typeof enable === 'boolean') {
        localStorage.setItem('meme-voice', enable ? 'on' : 'off');
      } else {
        const cur = localStorage.getItem('meme-voice') !== 'off';
        localStorage.setItem('meme-voice', cur ? 'off' : 'on');
      }
      return localStorage.getItem('meme-voice') !== 'off';
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hookEvents);
  } else {
    hookEvents();
  }
})();
