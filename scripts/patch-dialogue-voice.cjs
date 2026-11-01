const fs = require('node:fs');
const path = require('node:path');

const file = path.join(__dirname, '../assets/js/meme_anime_dialogue.js');
let content = fs.readFileSync(file, 'utf8');

const target = `  // Giọng đọc câu thoại tiếng Việt theo sắc thái nhân vật (Native Web Speech Synthesis)
  function speakDialogue(text, heroId) {
    if (!text || typeof window.speechSynthesis === 'undefined') return;
    if (localStorage.getItem('meme-sound') === 'off') return;

    try {
      window.speechSynthesis.cancel(); // Hủy câu cũ, không nói đè
      const utterance = new SpeechSynthesisUtterance(text);
      const cfg = HERO_VOICE_CONFIG[heroId] || { pitch: 1.0, rate: 1.0 };
      utterance.pitch = cfg.pitch;
      utterance.rate = cfg.rate;
      const vol = Number(localStorage.getItem('meme-sfx-volume') || 0.6);
      utterance.volume = Math.max(0, Math.min(1, vol * 1.2));

      // Ưu tiên giọng tiếng Việt có sẵn trong hệ điều hành
      const voices = window.speechSynthesis.getVoices();
      const viVoice = voices.find(v => v.lang && (v.lang.startsWith('vi') || v.lang.includes('VIE')));
      if (viVoice) {
        utterance.voice = viVoice;
      }
      window.speechSynthesis.speak(utterance);
    } catch (_) {}
  }`;

const replacement = `  // Quản lý giọng đọc tiếng Việt theo chuẩn Web Speech API
  let viVoiceCache = null;
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

  if (typeof window.speechSynthesis !== 'undefined') {
    window.speechSynthesis.onvoiceschanged = () => {
      viVoiceCache = null;
      getViVoice();
    };
  }

  // Giọng đọc câu thoại tiếng Việt theo sắc thái nhân vật (Native Web Speech Synthesis)
  function speakDialogue(text, heroId) {
    if (!text || typeof window.speechSynthesis === 'undefined') return;
    if (localStorage.getItem('meme-sound') === 'off' || localStorage.getItem('meme-voice') === 'off') return;

    try {
      window.speechSynthesis.cancel(); // Hủy câu cũ, không nói đè

      // Làm sạch ký tự dấu gạch ngang, dấu ngoặc kép trước khi đọc để không bị phát âm "dấu trừ / gạch ngang"
      const cleanText = text
        .replace(/[-—–~]/g, ' ')
        .replace(/["'«»]/g, '')
        .replace(/!{2,}/g, '!')
        .replace(/\\s+/g, ' ')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'vi-VN';

      const cfg = HERO_VOICE_CONFIG[heroId] || { pitch: 1.0, rate: 1.0 };
      utterance.pitch = cfg.pitch;
      utterance.rate = cfg.rate;
      const vol = Number(localStorage.getItem('meme-sfx-volume') || 0.6);
      utterance.volume = Math.max(0, Math.min(1, vol * 1.2));

      const viVoice = getViVoice();
      if (viVoice) {
        utterance.voice = viVoice;
        window.speechSynthesis.speak(utterance);
      } else {
        // Kiểm tra danh sách voices đã tải
        const allVoices = window.speechSynthesis.getVoices() || [];
        if (allVoices.length === 0) {
          // Trình duyệt chưa tải xong danh sách voices (Chrome async), gửi utterance với lang='vi-VN'
          window.speechSynthesis.speak(utterance);
        } else {
          // Đã có danh sách voices nhưng hệ điều hành không có giọng tiếng Việt:
          // Tuyệt đối KHÔNG để giọng tiếng Anh (như Microsoft David) đọc tiếng Việt gây sai ngữ âm
          // Âm thanh Web Audio heroCall đã đảm nhiệm tiếng hô anime đặc trưng
        }
      }
    } catch (_) {}
  }`;

if (content.includes('function speakDialogue')) {
  content = content.replace(/(\/\/ Giọng đọc câu thoại[\s\S]*?catch \(_\) \{\}\s*\})/, replacement);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully patched meme_anime_dialogue.js speakDialogue!');
} else {
  console.error('speakDialogue not found in meme_anime_dialogue.js');
}
