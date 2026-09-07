import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

// ── Autocorrelation pitch detection ─────────────────────────────────────────
function detectPitchHz(buffer, sampleRate) {
  const SIZE = buffer.length;
  const HALF = Math.floor(SIZE / 2);

  // RMS — silence gate
  let rms = 0;
  for (let i = 0; i < SIZE; i++) rms += buffer[i] * buffer[i];
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.015) return null;

  // Autocorrelation
  let bestOffset = -1;
  let bestCorr = 0;
  let lastCorr = 1;
  let foundGood = false;

  for (let offset = 2; offset < HALF; offset++) {
    let corr = 0;
    for (let i = 0; i < HALF; i++) corr += Math.abs(buffer[i] - buffer[i + offset]);
    corr = 1 - corr / HALF;
    if (corr > 0.9 && corr > lastCorr) {
      foundGood = true;
      if (corr > bestCorr) { bestCorr = corr; bestOffset = offset; }
    } else if (foundGood) break;
    lastCorr = corr;
  }

  if (bestOffset === -1) return null;
  return sampleRate / bestOffset;
}

// ── Note helpers ─────────────────────────────────────────────────────────────
const NOTE_NAMES   = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const SARGAM_NAMES = ['Sa','Ni♭','Re♭','Re','Ga♭','Ga','Ma','Ma#','Pa','Dha♭','Dha','Ni'];

export function hzToNoteInfo(hz) {
  if (!hz || hz < 50 || hz > 2000) return null;
  const semis = 12 * Math.log2(hz / 440);
  const midi  = Math.round(semis) + 69;
  const idx   = ((midi % 12) + 12) % 12;
  const cents = Math.round((semis - Math.round(semis)) * 100);
  return {
    note:   NOTE_NAMES[idx],
    sargam: SARGAM_NAMES[idx],
    octave: Math.floor(midi / 12) - 1,
    cents,
    hz,
  };
}

// ── PitchVisualizer component ─────────────────────────────────────────────────
// Exposes { getStats() } via ref for the parent to call after recording stops.
const PitchVisualizer = forwardRef(function PitchVisualizer(
  { isRecording, onPitchDetected, color = '#10b981' },
  ref
) {
  const canvasRef       = useRef(null);
  const audioCtxRef     = useRef(null);
  const analyserRef     = useRef(null);
  const streamRef       = useRef(null);
  const rafRef          = useRef(null);
  const historyRef      = useRef([]); // array of { hz, cents }
  const deviationsRef   = useRef([]); // |cents| values for scoring

  // Expose getStats() to parent
  useImperativeHandle(ref, () => ({
    getStats() {
      const devs = deviationsRef.current;
      if (devs.length === 0) return { avgDeviation: 50, maxDeviation: 100, smoothness: 50, notesSung: 0 };
      const avg    = devs.reduce((a, b) => a + b, 0) / devs.length;
      const max    = Math.max(...devs);
      // Smoothness: % of readings within 25 cents
      const smooth = Math.round((devs.filter(d => d <= 25).length / devs.length) * 100);
      return { avgDeviation: avg, maxDeviation: max, smoothness: smooth, notesSung: devs.length };
    },
    getCurrentNote() {
      const h = historyRef.current;
      return h.length > 0 ? h[h.length - 1] : null;
    },
  }));

  useEffect(() => {
    if (isRecording) { startAudio(); }
    else             { stopAudio(); }
    return () => stopAudio();
  }, [isRecording]);

  async function startAudio() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;

      const ctx      = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = ctx.createAnalyser();
      analyser.fftSize               = 2048;
      analyser.smoothingTimeConstant = 0.85;
      audioCtxRef.current  = ctx;
      analyserRef.current  = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      historyRef.current    = [];
      deviationsRef.current = [];
      drawLoop();
    } catch (e) {
      console.error('PitchVisualizer mic error:', e);
    }
  }

  function stopAudio() {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
    analyserRef.current = null;
  }

  function drawLoop() {
    const canvas  = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    // Time-domain for pitch
    const floatBuf = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(floatBuf);
    const hz   = detectPitchHz(floatBuf, audioCtxRef.current.sampleRate);
    const info = hzToNoteInfo(hz);

    if (info) {
      historyRef.current.push(info);
      if (historyRef.current.length > 60) historyRef.current.shift();
      deviationsRef.current.push(Math.abs(info.cents));
      onPitchDetected?.(info);
    }

    // ── Draw ──────────────────────────────────────────────────────────────
    ctx.clearRect(0, 0, W, H);

    // Waveform backdrop
    const byteBuf = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(byteBuf);
    ctx.beginPath();
    ctx.strokeStyle = `${color}40`;
    ctx.lineWidth = 1.5;
    const sw = W / byteBuf.length;
    for (let i = 0; i < byteBuf.length; i++) {
      const y = ((byteBuf[i] / 128) * H) / 2;
      if (i === 0) ctx.moveTo(0, y); else ctx.lineTo(i * sw, y);
    }
    ctx.stroke();

    // Pitch history bars
    const history = historyRef.current;
    if (history.length > 1) {
      const barW   = W / 60;
      const hzVals = history.map(h => h.hz);
      const minHz  = Math.min(...hzVals) * 0.95;
      const maxHz  = Math.max(...hzVals) * 1.05;
      const range  = maxHz - minHz || 1;

      history.forEach((item, i) => {
        const norm  = (item.hz - minHz) / range;
        const barH  = Math.max(4, norm * H * 0.7);
        const alpha = 0.2 + (i / history.length) * 0.8;
        const hex   = Math.round(alpha * 255).toString(16).padStart(2, '0');
        ctx.fillStyle = `${color}${hex}`;
        ctx.fillRect(i * barW, H - barH, barW - 1, barH);
      });

      // Current note label
      const last = history[history.length - 1];
      if (last) {
        ctx.font      = 'bold 18px Inter, sans-serif';
        ctx.fillStyle = color;
        ctx.textAlign = 'right';
        ctx.fillText(`${last.sargam} (${last.cents >= 0 ? '+' : ''}${last.cents}¢)`, W - 8, 24);
      }
    }

    rafRef.current = requestAnimationFrame(drawLoop);
  }

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={100}
      style={{ width: '100%', height: 100, borderRadius: 8, background: 'rgba(255,255,255,0.03)' }}
    />
  );
});

export default PitchVisualizer;
