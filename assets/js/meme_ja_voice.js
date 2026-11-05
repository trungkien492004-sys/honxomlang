// Giọng nhân vật chỉ dùng tiếng Nhật, đúng ngữ cảnh: tổng hợp bằng giọng ja-JP của trình duyệt.
// Nếu máy không có giọng tiếng Nhật thì im lặng, không đọc tiếng khác.
// Muốn dùng file giọng riêng: đặt assets/audio/voices/ja/<code>_<ngữ cảnh>.mp3 (ngữ cảnh: skill, summon, trap, attack, victory, defeat).
(() => {
  if (window.memeJaVoice) return;
  const LINES = {
    destiny: { skill: '俺のターン！', summon: '現れろ、ブラック・マジシャン！', trap: '罠カード発動！', attack: 'ブラック・マジック！', victory: 'これが結束の力だ！', defeat: 'まだ、終わりじゃない。' },
    kaiba: { skill: 'この俺に勝てると思うな！', summon: '現れろ、青眼の白龍！', trap: '愚か者め、罠発動！', attack: '滅びのバーストストリーム！', victory: 'これが俺の力だ！', defeat: '馬鹿な…この俺が！' },
    joey: { skill: 'いくぜ、運試しだ！', summon: '来い、真紅眼の黒竜！', trap: 'ひっかかったな、罠発動だぜ！', attack: '黒炎弾！', victory: 'よっしゃあ、俺の勝ちだぜ！', defeat: 'ちくしょう…！' },
    pegasus: { skill: 'ユーの手の内は、お見通しデース！', summon: 'ワンダフル！', trap: 'トラップカード、オープン！', attack: 'アタックデース！', victory: 'ゲームセットデース！', defeat: 'オーマイガッ！' },
    jaden: { skill: '俺のターン、ドロー！', summon: '来い、俺のヒーロー！', trap: '罠カード発動！', attack: 'いっけえ！', victory: 'ガッチャ！楽しいデュエルだったぜ！', defeat: '負けたけど、楽しかったぜ。' },
    zane: { skill: 'リスペクトを忘れるな。', summon: '現れろ、サイバー・ドラゴン！', trap: '罠発動。', attack: 'エターナル・エヴォリューション・バースト！', victory: 'これが帝王のデュエルだ。', defeat: '見事だ。' },
    mai: { skill: 'いくわよ！', summon: 'おいで、ハーピィ・レディ！', trap: '罠にかかったわね！', attack: 'お行きなさい！', victory: '私の勝ちね！', defeat: 'やるじゃない…。' },
    yuma: { skill: 'かっとビングだ、俺！', summon: '現れろ、希望皇ホープ！', trap: '罠カード発動！', attack: 'ホープ剣スラッシュ！', victory: 'やったぜ！', defeat: 'まだまだ、かっとビングだ！' },
    marik: { skill: '闇のゲームの始まりだ！', summon: '出でよ、我がしもべ！', trap: '罠カード発動！', attack: 'やれ！', victory: '闇に沈むがいい！', defeat: 'この私が…！' },
    jack: { skill: 'キングのデュエルは常にエンターテイメントでなければならない！', summon: '王者の鼓動、今ここに列を成す！', trap: '罠発動！', attack: 'アブソリュート・パワーフォース！', victory: 'これがキングのデュエルだ！', defeat: 'この俺が敗れるとは…！' },
    shark: { skill: '俺のターン！', summon: '現れろ！', trap: '罠カード発動！', attack: '喰らいやがれ！', victory: '俺の勝ちだ！', defeat: 'くそっ…！' },
    chazz: { skill: '一！十！百！千！万丈目サンダー！', summon: '来い！', trap: '罠発動！', attack: 'いけえ！', victory: '万丈目サンダーの勝利だ！', defeat: 'この俺が…！' },
    yusei: { skill: '俺のターン！', summon: '飛翔せよ、スターダスト・ドラゴン！', trap: '罠発動！', attack: 'シューティング・ソニック！', victory: '絆の力だ。', defeat: 'まだだ…！' }
  };
  const TONE = { destiny: [.92, 1.02], kaiba: [.72, 1.05], joey: [1.02, 1.12], pegasus: [1.08, .96], jaden: [1.2, 1.12], zane: [.7, .94], mai: [1.42, 1.04], yuma: [1.38, 1.16], yusei: [.8, 1], marik: [.74, .92], jack: [.76, 1.04], shark: [.9, 1.08], chazz: [1.04, 1.14] };
  const ACTIONS = ['skill', 'summon', 'trap', 'attack', 'victory', 'defeat'];
  const fileState = new Map(); // src -> Audio | false
  let current = null, jaCache = null;

  const muted = () => { try { return localStorage.getItem('meme-sound') === 'off' || localStorage.getItem('meme-voice') === 'off'; } catch { return false; } };
  const volume = () => { let v = .65; try { v = Number(localStorage.getItem('meme-sfx-volume') || .65); } catch { /* bỏ qua */ } return Math.max(0, Math.min(1, v * 1.15)); };
  function jaVoice() {
    if (jaCache || typeof speechSynthesis === 'undefined') return jaCache;
    jaCache = speechSynthesis.getVoices().find(v => /^ja/i.test(v.lang || '')) || null;
    return jaCache;
  }
  if (typeof speechSynthesis !== 'undefined') speechSynthesis.addEventListener?.('voiceschanged', () => { jaCache = null; jaVoice(); });

  function speak(code, text) {
    const v = jaVoice();
    if (!v) return false;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text), t = TONE[code] || [1, 1];
      u.voice = v; u.lang = 'ja-JP'; u.pitch = t[0]; u.rate = t[1]; u.volume = volume();
      speechSynthesis.speak(u);
      return true;
    } catch { return false; }
  }
  function playFile(src, fallback) {
    const known = fileState.get(src);
    if (known === false) return fallback();
    const a = known || new Audio(src);
    if (!known) {
      a.preload = 'auto';
      a.addEventListener('error', () => { fileState.set(src, false); fallback(); }, { once: true });
      fileState.set(src, a);
    }
    try {
      current?.pause();
      a.currentTime = 0; a.volume = volume(); current = a;
      a.play()?.catch(() => { /* trình duyệt chặn tự phát hoặc file thiếu: sự kiện error sẽ chuyển sang giọng tổng hợp */ });
    } catch { fallback(); }
    return true;
  }
  function actionFor(action, cardId) {
    if (ACTIONS.includes(action)) return action;
    let c = null; try { c = card(cardId || action); } catch { /* bỏ qua */ }
    if (c?.card_type === 'Trap') return 'trap';
    if (c?.card_type === 'Monster') return 'summon';
    return 'skill';
  }
  function say(heroId, action, cardId) {
    if (muted()) return false;
    let h = null; try { h = getHero(heroId ?? 0); } catch { return false; }
    const lines = LINES[h?.code]; if (!lines) return false;
    const ctx = actionFor(action, cardId), text = lines[ctx] || lines.skill;
    return playFile(`assets/audio/voices/ja/${h.code}_${ctx}.mp3`, () => speak(h.code, text));
  }
  window.memeJaVoice = { say, LINES, hasVoice: () => !!jaVoice() };
})();
