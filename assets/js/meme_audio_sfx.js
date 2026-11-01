// Yu-Gi-Oh! Anime Duel — Dynamic Web Audio SFX Synthesizer
// Clean native synthesis, zero external dependencies, no memory leaks, polyphony-guarded.
(() => {
  'use strict';

  let audioCtx = null;
  let sfxVolume = Math.max(0, Math.min(1, Number(localStorage.getItem('meme-sfx-volume') || 0.45)));
  let isMuted = localStorage.getItem('meme-sound') === 'off';
  let activeVoices = 0;
  const MAX_VOICES = 5;

  function getAudioCtx() {
    if (!audioCtx) {
      const AudioClass = window.AudioContext || window.webkitAudioContext;
      if (AudioClass) {
        audioCtx = new AudioClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  // Pre-generate short white-noise buffer for whooshes, slashes, and impacts
  let noiseBuffer = null;
  function getNoiseBuffer(ctx) {
    if (!noiseBuffer && ctx) {
      const sampleRate = ctx.sampleRate;
      const bufferSize = sampleRate * 0.5; // 0.5 sec
      noiseBuffer = ctx.createBuffer(1, bufferSize, sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
    }
    return noiseBuffer;
  }

  function trackVoice(source, gainNode) {
    activeVoices++;
    const cleanup = () => {
      activeVoices = Math.max(0, activeVoices - 1);
      try {
        if (source) source.disconnect();
        if (gainNode) gainNode.disconnect();
      } catch (_) {}
    };
    if (source.onended !== undefined) {
      source.onended = cleanup;
    } else {
      setTimeout(cleanup, 1200);
    }
  }

  const SFX = {
    // 1. Rút bài (Card Draw whoosh)
    draw() {
      const ctx = getAudioCtx();
      if (!ctx || activeVoices >= MAX_VOICES) return;
      const t = ctx.currentTime;
      const noise = ctx.createBufferSource();
      noise.buffer = getNoiseBuffer(ctx);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, t);
      filter.frequency.exponentialRampToValueAtTime(2600, t + 0.12);
      filter.Q.setValueAtTime(2.5, t);

      const gain = ctx.createGain();
      const vol = sfxVolume * 0.35;
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(vol, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

      noise.connect(filter).connect(gain).connect(ctx.destination);
      noise.start(t);
      noise.stop(t + 0.15);
      trackVoice(noise, gain);
    },

    // 2. Đặt bài / Úp bài (Card Place / Set snap) - Đã bỏ tiếng tách tách theo yêu cầu
    place() {
      // Loại bỏ hoàn toàn âm thanh tách tách khi chạm / ấn vào lá bài
      return;
    },

    // 3. Lật bài (Card Flip magic chime)
    flip() {
      const ctx = getAudioCtx();
      if (!ctx || activeVoices >= MAX_VOICES) return;
      const t = ctx.currentTime;
      const notes = [659.25, 987.77, 1318.51]; // E5, B5, E6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + i * 0.05);

        const gain = ctx.createGain();
        const vol = sfxVolume * 0.28;
        gain.gain.setValueAtTime(0.001, t + i * 0.05);
        gain.gain.linearRampToValueAtTime(vol, t + i * 0.05 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.05 + 0.24);

        osc.connect(gain).connect(ctx.destination);
        osc.start(t + i * 0.05);
        osc.stop(t + i * 0.05 + 0.26);
        trackVoice(osc, gain);
      });
    },

    // 4. Triệu hồi thường (Normal Summon energy burst)
    summon() {
      const ctx = getAudioCtx();
      if (!ctx || activeVoices >= MAX_VOICES) return;
      const t = ctx.currentTime;

      // Bass boom
      const oscLow = ctx.createOscillator();
      oscLow.type = 'sine';
      oscLow.frequency.setValueAtTime(220, t);
      oscLow.frequency.exponentialRampToValueAtTime(70, t + 0.28);
      const gainLow = ctx.createGain();
      gainLow.gain.setValueAtTime(sfxVolume * 0.45, t);
      gainLow.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      oscLow.connect(gainLow).connect(ctx.destination);
      oscLow.start(t);
      oscLow.stop(t + 0.32);
      trackVoice(oscLow, gainLow);

      // Ascension chord (E4, G#4, B4, E5)
      [329.63, 415.30, 493.88, 659.25].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + idx * 0.04);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.001, t + idx * 0.04);
        gain.gain.linearRampToValueAtTime(sfxVolume * 0.22, t + idx * 0.04 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.04 + 0.35);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t + idx * 0.04);
        osc.stop(t + idx * 0.04 + 0.38);
        trackVoice(osc, gain);
      });
    },

    // 5. Triệu hồi đặc biệt (Fusion / Synchro / XYZ summon)
    special_summon() {
      const ctx = getAudioCtx();
      if (!ctx || activeVoices >= MAX_VOICES) return;
      const t = ctx.currentTime;

      // Resonant deep sub
      const sub = ctx.createOscillator();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(160, t);
      sub.frequency.exponentialRampToValueAtTime(55, t + 0.55);
      const subGain = ctx.createGain();
      subGain.gain.setValueAtTime(sfxVolume * 0.5, t);
      subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      sub.connect(subGain).connect(ctx.destination);
      sub.start(t);
      sub.stop(t + 0.62);
      trackVoice(sub, subGain);

      // Majestic orchestral chord (A3, C#4, E4, A4, C#5)
      [220.00, 277.18, 329.63, 440.00, 554.37].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = i % 2 === 0 ? 'sine' : 'sawtooth';
        osc.frequency.setValueAtTime(freq + (i === 1 ? 1.5 : 0), t + i * 0.06);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, t);
        filter.frequency.exponentialRampToValueAtTime(3500, t + 0.35);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.001, t + i * 0.06);
        gain.gain.linearRampToValueAtTime(sfxVolume * 0.22, t + i * 0.06 + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.65);

        osc.connect(filter).connect(gain).connect(ctx.destination);
        osc.start(t + i * 0.06);
        osc.stop(t + i * 0.06 + 0.7);
        trackVoice(osc, gain);
      });
    },

    // 6. Quái vật tấn công (Attack energy slash)
    attack() {
      const ctx = getAudioCtx();
      if (!ctx || activeVoices >= MAX_VOICES) return;
      const t = ctx.currentTime;

      // Downward slash noise sweep
      const noise = ctx.createBufferSource();
      noise.buffer = getNoiseBuffer(ctx);
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3400, t);
      filter.frequency.exponentialRampToValueAtTime(450, t + 0.16);
      filter.Q.setValueAtTime(3.0, t);

      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(sfxVolume * 0.45, t);
      nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      noise.connect(filter).connect(nGain).connect(ctx.destination);
      noise.start(t);
      noise.stop(t + 0.2);
      trackVoice(noise, nGain);

      // Blade tone
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(580, t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.15);
      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(sfxVolume * 0.3, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
      osc.connect(oscGain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.18);
      trackVoice(osc, oscGain);
    },

    // 7. Quái vật bị phá hủy (Monster Destruction shatter explosion)
    destroy() {
      const ctx = getAudioCtx();
      if (!ctx || activeVoices >= MAX_VOICES) return;
      const t = ctx.currentTime;

      // Sub explosion
      const boom = ctx.createOscillator();
      boom.type = 'sine';
      boom.frequency.setValueAtTime(140, t);
      boom.frequency.exponentialRampToValueAtTime(38, t + 0.35);
      const bGain = ctx.createGain();
      bGain.gain.setValueAtTime(sfxVolume * 0.55, t);
      bGain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
      boom.connect(bGain).connect(ctx.destination);
      boom.start(t);
      boom.stop(t + 0.4);
      trackVoice(boom, bGain);

      // Glass shatter noise
      const noise = ctx.createBufferSource();
      noise.buffer = getNoiseBuffer(ctx);
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1800, t);
      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(sfxVolume * 0.4, t);
      nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      noise.connect(filter).connect(nGain).connect(ctx.destination);
      noise.start(t);
      noise.stop(t + 0.28);
      trackVoice(noise, nGain);

      // Shard pings
      [1480, 2200, 3100].forEach((freq, idx) => {
        const ping = ctx.createOscillator();
        ping.type = 'triangle';
        ping.frequency.setValueAtTime(freq, t + 0.05 + idx * 0.04);
        const pGain = ctx.createGain();
        pGain.gain.setValueAtTime(sfxVolume * 0.18, t + 0.05 + idx * 0.04);
        pGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05 + idx * 0.04 + 0.15);
        ping.connect(pGain).connect(ctx.destination);
        ping.start(t + 0.05 + idx * 0.04);
        ping.stop(t + 0.05 + idx * 0.04 + 0.18);
        trackVoice(ping, pGain);
      });
    },

    // 8. Kích hoạt bẫy / phép (Trap alert shimmer)
    trap() {
      const ctx = getAudioCtx();
      if (!ctx || activeVoices >= MAX_VOICES) return;
      const t = ctx.currentTime;

      // Tritone warning shimmer (F#5 + C6)
      [739.99, 1046.50].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1400, t);
        filter.Q.setValueAtTime(4, t);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(sfxVolume * 0.26, t + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

        osc.connect(filter).connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.38);
        trackVoice(osc, gain);
      });
    },

    // 9. Phản đòn Counter Clash (Metallic deflection ripple)
    counter() {
      const ctx = getAudioCtx();
      if (!ctx || activeVoices >= MAX_VOICES) return;
      const t = ctx.currentTime;

      // Crystal bell harmonics
      [1174.66, 2349.32, 3520.00].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        const gain = ctx.createGain();
        const factor = (3 - i) / 3;
        gain.gain.setValueAtTime(sfxVolume * 0.32 * factor, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.48);
        trackVoice(osc, gain);
      });
    },

    // 10. Thay đổi LP (LP Ticker count)
    lp_tick() {
      const ctx = getAudioCtx();
      if (!ctx || activeVoices >= MAX_VOICES) return;
      const t = ctx.currentTime;

      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.setValueAtTime(1100, t + 0.015);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(sfxVolume * 0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.04);
      trackVoice(osc, gain);
    },

    // 11. Cảnh báo cuối lượt (Turn warning pulse <= 10s)
    turn_warn() {
      const ctx = getAudioCtx();
      if (!ctx || activeVoices >= MAX_VOICES) return;
      const t = ctx.currentTime;

      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(950, t);
      osc.frequency.linearRampToValueAtTime(1150, t + 0.08);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(sfxVolume * 0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.14);
      trackVoice(osc, gain);
    },

    // 12. Chiến thắng (Victory fanfare)
    victory() {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const t = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + idx * 0.12);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.001, t + idx * 0.12);
        gain.gain.linearRampToValueAtTime(sfxVolume * 0.35, t + idx * 0.12 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.12 + 0.45);

        osc.connect(gain).connect(ctx.destination);
        osc.start(t + idx * 0.12);
        osc.stop(t + idx * 0.12 + 0.5);
        trackVoice(osc, gain);
      });
    },

    // 13. Thất bại (Defeat descent)
    defeat() {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const t = ctx.currentTime;
      const notes = [622.25, 523.25, 415.30, 311.13]; // Eb5, C5, Ab4, Eb4
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.14);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.001, t + idx * 0.14);
        gain.gain.linearRampToValueAtTime(sfxVolume * 0.3, t + idx * 0.14 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.14 + 0.5);

        osc.connect(gain).connect(ctx.destination);
        osc.start(t + idx * 0.14);
        osc.stop(t + idx * 0.14 + 0.55);
        trackVoice(osc, gain);
      });
    },

    // 14. Tiếng xướng khí thế đặc trưng của 9 nhân vật Anime (Hero Vocal Resonance Call)
    hero_call(heroId = 0) {
      const ctx = getAudioCtx();
      if (!ctx || activeVoices >= MAX_VOICES) return;
      const t = ctx.currentTime;

      if (heroId === 1) { // Seto Kaiba: Rồng gầm dũng mãnh & Sấm sét uy lực
        const sub = ctx.createOscillator();
        sub.type = 'sawtooth';
        sub.frequency.setValueAtTime(220, t);
        sub.frequency.exponentialRampToValueAtTime(60, t + 0.45);
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, t);
        filter.frequency.exponentialRampToValueAtTime(320, t + 0.45);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(sfxVolume * 0.55, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.48);
        sub.connect(filter).connect(gain).connect(ctx.destination);
        sub.start(t);
        sub.stop(t + 0.5);
        trackVoice(sub, gain);
      } else if (heroId === 0) { // Yugi / Atem: Chuông ma thuật Trò chơi Ngàn Năm
        [523.25, 783.99, 1046.50, 1567.98].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t + idx * 0.04);
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.001, t + idx * 0.04);
          gain.gain.linearRampToValueAtTime(sfxVolume * 0.32, t + idx * 0.04 + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.04 + 0.45);
          osc.connect(gain).connect(ctx.destination);
          osc.start(t + idx * 0.04);
          osc.stop(t + idx * 0.04 + 0.48);
          trackVoice(osc, gain);
        });
      } else if (heroId === 2) { // Joey Wheeler: Vòng quay đồng xu may mắn
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1300, t);
        osc.frequency.exponentialRampToValueAtTime(2500, t + 0.18);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(sfxVolume * 0.36, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.32);
        trackVoice(osc, gain);
      } else if (heroId === 3) { // Pegasus: Toon Magic huyền ảo
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(750, t);
        osc.frequency.linearRampToValueAtTime(1250, t + 0.12);
        osc.frequency.linearRampToValueAtTime(700, t + 0.25);
        osc.frequency.linearRampToValueAtTime(1150, t + 0.38);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(sfxVolume * 0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.42);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.44);
        trackVoice(osc, gain);
      } else if (heroId === 4) { // Jaden: Khí thế bừng cháy HERO nguyên tố
        [293.66, 369.99, 440.00, 587.33].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t + idx * 0.05);
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.001, t + idx * 0.05);
          gain.gain.linearRampToValueAtTime(sfxVolume * 0.32, t + idx * 0.05 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.35);
          osc.connect(gain).connect(ctx.destination);
          osc.start(t + idx * 0.05);
          osc.stop(t + idx * 0.05 + 0.38);
          trackVoice(osc, gain);
        });
      } else if (heroId === 5) { // Zane: Điện trường kim loại sắc lạnh Cyber
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(420, t);
        osc.frequency.exponentialRampToValueAtTime(80, t + 0.32);
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1900, t);
        filter.Q.setValueAtTime(3.8, t);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(sfxVolume * 0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.36);
        osc.connect(filter).connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.38);
        trackVoice(osc, gain);
      } else if (heroId === 6) { // Mai Valentine: Lốc xoáy lông vũ Harpie
        const noise = ctx.createBufferSource();
        noise.buffer = getNoiseBuffer(ctx);
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1500, t);
        filter.frequency.exponentialRampToValueAtTime(2900, t + 0.22);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(sfxVolume * 0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.26);
        noise.connect(filter).connect(gain).connect(ctx.destination);
        noise.start(t);
        noise.stop(t + 0.28);
        trackVoice(noise, gain);
      } else if (heroId === 7) { // Yuma: Chìa khóa Hoàng Đế Utopia
        [659.25, 880.00, 1318.51].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t + idx * 0.04);
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.001, t + idx * 0.04);
          gain.gain.linearRampToValueAtTime(sfxVolume * 0.3, t + idx * 0.04 + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.04 + 0.38);
          osc.connect(gain).connect(ctx.destination);
          osc.start(t + idx * 0.04);
          osc.stop(t + idx * 0.04 + 0.4);
          trackVoice(osc, gain);
        });
      } else { // Yusei Fudo (8): Động cơ Tăng tốc Đồng bộ
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, t);
        osc.frequency.exponentialRampToValueAtTime(700, t + 0.3);
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, t);
        filter.frequency.linearRampToValueAtTime(2400, t + 0.3);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(sfxVolume * 0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.34);
        osc.connect(filter).connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.36);
        trackVoice(osc, gain);
      }
    }
  };

  function play(name) {
    if (isMuted) return;
    if (typeof SFX[name] === 'function') {
      try {
        SFX[name]();
      } catch (err) {
        console.warn('SFX Error:', err);
      }
    }
  }

  function playHeroCall(heroId) {
    if (isMuted) return;
    try {
      SFX.hero_call(heroId);
    } catch (_) {}
  }

  // Hook into memeFx.sound
  function hookEngine() {
    if (window.memeFx) {
      const origSound = window.memeFx.sound;
      window.memeFx.sound = function(kind) {
        if (isMuted) return;
        if (kind === 'hit') play('attack');
        else if (kind === 'heal') play('flip');
        else if (kind === 'summon') play('summon');
        else if (kind === 'charge') play('trap');
        else if (kind === 'soft') play('place');
        else if (origSound) origSound(kind);
      };
    }

    // Hook card motion (draw / discard)
    if (window.memeCardMotion) {
      const origRecord = window.memeCardMotion.record;
      window.memeCardMotion.record = function(kind, owner, id, index) {
        if (kind === 'draw') play('draw');
        else if (kind === 'discard') play('place');
        return origRecord.apply(this, arguments);
      };
    }
  }

  // Listen for user gestures to unlock audio context smoothly
  function unlock() {
    getAudioCtx();
  }
  document.addEventListener('pointerdown', unlock, { capture: true, once: true });
  document.addEventListener('keydown', unlock, { capture: true, once: true });

  // Sync mute state with memeSoundBtn
  window.addEventListener('storage', (e) => {
    if (e.key === 'meme-sound') isMuted = e.newValue === 'off';
    if (e.key === 'meme-sfx-volume') sfxVolume = Number(e.newValue || 0.45);
  });

  // Export module
  window.memeAudioSfx = {
    play,
    playHeroCall,
    get volume() { return sfxVolume; },
    set volume(v) {
      sfxVolume = Math.max(0, Math.min(1, Number(v)));
      localStorage.setItem('meme-sfx-volume', String(sfxVolume));
    },
    get enabled() { return !isMuted; },
    setEnabled(val) {
      isMuted = !val;
      localStorage.setItem('meme-sound', isMuted ? 'off' : 'on');
    },
    hookEngine
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hookEngine);
  } else {
    hookEngine();
  }
})();
