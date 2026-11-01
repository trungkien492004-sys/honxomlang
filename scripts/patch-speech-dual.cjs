const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'assets', 'js', 'meme_anime_dialogue.js');
let code = fs.readFileSync(filePath, 'utf8');

const targetRegex = /\/\/ Quản lý giọng đọc tiếng Việt theo chuẩn Web Speech API[\s\S]*?function speakDialogue\(text, heroId\) \{[\s\S]*?catch \(_\) \{\}\s*\}/;

const replacement = `// Quản lý giọng đọc Web Speech API đa ngôn ngữ (Việt - Anh chuẩn Anime)
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
    [/\\bGotcha\\b/gi, 'Thắng lớn rồi'],
    [/\\bKattobingu\\s*daze\\b/gi, 'Vươn tới bầu trời'],
    [/\\bKattobingu\\b/gi, 'Vươn tới bầu trời'],
    [/\\bFlame\\s*Wingman\\b/gi, 'Anh Hùng Cánh Lửa'],
    [/\\bWingman\\b/gi, 'Cánh Lửa'],
    [/\\bHERO\\s*Neos\\b/gi, 'Anh Hùng Nê-ốt'],
    [/\\bNeos\\b/gi, 'Nê-ốt'],
    [/\\bHERO\\b/gi, 'Anh Hùng'],
    [/\\bCyber\\s*End\\s*Dragon\\b/gi, 'Rồng Máy Tối Thượng'],
    [/\\bCyber\\s*Dragon\\b/gi, 'Rồng Cơ Khí'],
    [/\\bCyber\\b/gi, 'Cơ Khí'],
    [/\\bRelinquished\\b/gi, 'Quái Thú Đoạt Hồn'],
    [/\\bHarpie\\s*Lady\\s*Sisters\\b/gi, 'Tam Tấu Yêu Điểu Hác-pi'],
    [/\\bHarpie\\s*Lady\\b/gi, 'Yêu Điểu Hác-pi'],
    [/\\bHarpie\\b/gi, 'Hác-pi'],
    [/\\bNumber\\s*39\\s*:\\s*Utopia\\b/gi, 'Số ba mươi chín: Ánh Sáng Utopia'],
    [/\\bNumber\\s*39\\b/gi, 'Số ba mươi chín'],
    [/\\bUtopia\\b/gi, 'U-tô-pi-a'],
    [/\\bGagaga\\s*Magician\\b/gi, 'Phù Thủy Ga-ga-ga'],
    [/\\bGagaga\\b/gi, 'Ga-ga-ga'],
    [/\\bStardust\\s*Dragon\\b/gi, 'Rồng Bụi Sao Stardust'],
    [/\\bStardust\\b/gi, 'Bụi Sao'],
    [/\\bJunk\\s*Warrior\\b/gi, 'Chiến Binh Phế Liệu'],
    [/\\bJunk\\b/gi, 'Phế Liệu'],
    [/\\bBlue-Eyes\\s*White\\s*Dragon\\b/gi, 'Rồng Trắng Mắt Xanh'],
    [/\\bBlue-Eyes\\b/gi, 'Rồng Trắng Mắt Xanh'],
    [/\\bRed-Eyes\\s*Black\\s*Dragon\\b/gi, 'Rồng Đen Mắt Đỏ'],
    [/\\bRed-Eyes\\b/gi, 'Rồng Đen Mắt Đỏ'],
    [/\\bDark\\s*Magician\\b/gi, 'Phù Thủy Áo Đen'],
    [/\\bSlifer\\b/gi, 'Rồng Thần Slifer'],
    [/\\bObelisk\\b/gi, 'Thần Obelisk'],
    [/\\bRa\\b/gi, 'Thần Ra']
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
        .replace(/\\s+/g, ' ')
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
  }`;

if (targetRegex.test(code)) {
  code = code.replace(targetRegex, replacement);
  fs.writeFileSync(filePath, code, 'utf8');
  console.log('Successfully updated speech synthesis in meme_anime_dialogue.js');
} else {
  console.error('Target regex not found in meme_anime_dialogue.js');
  process.exit(1);
}
