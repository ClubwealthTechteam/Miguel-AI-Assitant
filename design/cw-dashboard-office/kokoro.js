
  /* ---------- Kokoro "Heart" voice (af_heart) for CW Voice ----------
     Kokoro-82M runs in a background Web Worker (kokoro-js + transformers.js, onnxruntime-web), so the page never
     freezes while it speaks. The model comes from Hugging Face when the page may reach it, otherwise from a copy
     published next to this page (office3d/kokoro/, base64 parts); first use downloads ~110 MB, then the browser
     cache keeps it. Text is spoken in ~200-character chunks generated ahead of playback; playback starts once
     enough audio is buffered to play through without gaps. If Heart isn't ready (or the worker can't start),
     the answer is read by Claude's built-in voice (tts capability), and only as a last resort by the browser. */
  var KK = { w: null, p: null, ready: false, failed: false, ctx: null, srcs: [], gen: 0, cb: {}, seq: 0, spc: 0.06, apc: 0.075 };
  try { var spc0 = parseFloat(localStorage.getItem('cw-kk-spc')); if (spc0 > 0.005 && spc0 < 1) KK.spc = spc0; } catch (e) {}
  var KK_WORKER = [
    "var HF = 'https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/main/', TFU = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.5.1/';",
    "var real = self.fetch.bind(self), BASE = '', tts = null, pct = 0;",
    "var PARTS = { model: 9, ort: 3, voice: 1 };",
    "function list(p) { var a = []; for (var i = 0; i < PARTS[p]; i++) a.push(new URL('office3d/kokoro/' + p + '-' + i + '.json', BASE).href); return a; }",
    "async function parts(urls, weight) {",
    "  var bufs = await Promise.all(urls.map(function (u) { return real(u).then(function (r) { if (!r.ok) throw new Error(u + ' ' + r.status); return r.json(); }).then(function (j) {",
    "    var s = atob(j.b), b = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) b[i] = s.charCodeAt(i);",
    "    pct = Math.min(99, pct + weight / urls.length); postMessage({ t: 'pct', pct: Math.round(pct) }); return b; }); }));",
    "  var n = 0; bufs.forEach(function (b) { n += b.length; }); var out = new Uint8Array(n), o = 0; bufs.forEach(function (b) { out.set(b, o); o += b.length; }); return out.buffer;",
    "}",
    "async function local(path) {",
    "  if (path === 'config.json' || path === 'tokenizer.json' || path === 'tokenizer_config.json') return real(new URL('office3d/kokoro/' + path, BASE).href);",
    "  var buf = path === 'onnx/model_quantized.onnx' ? await parts(list('model'), 80) : path === 'voices/af_heart.bin' ? await parts(list('voice'), 1) : null;",
    "  if (!buf) throw new Error('not packaged: ' + path);",
    "  return new Response(buf, { status: 200, headers: { 'Content-Type': 'application/octet-stream', 'Content-Length': String(buf.byteLength) } });",
    "}",
    "self.fetch = function (input, init) {",
    "  var url = typeof input === 'string' ? input : input && input.url;",
    "  if (url && url.indexOf(HF) === 0) { var path = url.slice(HF.length).split('?')[0];",
    "    return real(input, init).then(function (r) { if (!r.ok) throw new Error('hf ' + r.status); return r; }).catch(function () { return local(path); }); }",
    "  return real(input, init);",
    "};",
    "async function load() {",
    "  var TF = await import(TFU + '+esm');",
    "  var ow = TF.env.backends.onnx.wasm; ow.numThreads = 1; ow.proxy = false;",
    "  var wasm = null; try { var r = await real(TFU + 'dist/ort-wasm-simd-threaded.jsep.wasm'); if (r.ok) wasm = await r.arrayBuffer(); } catch (e) {}",
    "  if (!wasm) wasm = await parts(list('ort'), 18);",
    "  ow.wasmBinary = wasm;",
    "  var K = await import('https://cdn.jsdelivr.net/npm/kokoro-js@1.2.1/+esm');",
    "  tts = await K.KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', { dtype: 'q8', device: 'wasm' });",
    "}",
    "var q = Promise.resolve();",
    "self.onmessage = function (e) {",
    "  var m = e.data;",
    "  if (m.t === 'load') { BASE = m.base; load().then(function () { postMessage({ t: 'ready' }); }, function (err) { postMessage({ t: 'fail', msg: String(err && err.message || err) }); }); }",
    "  if (m.t === 'gen') q = q.then(async function () {",
    "    try { var t0 = performance.now(), a = await tts.generate(m.text, { voice: 'af_heart', speed: m.speed || 1 }), au = a.audio;",
    "      postMessage({ t: 'audio', id: m.id, audio: au, rate: a.sampling_rate, ms: performance.now() - t0 }, [au.buffer]);",
    "    } catch (err) { postMessage({ t: 'gerr', id: m.id, msg: String(err && err.message || err) }); }",
    "  });",
    "};",
    "postMessage({ t: 'up' });"
  ].join('\n');
  function kkMsg(t) { var el = $('#vc-voice'); if (el) el.textContent = t; }
  function kkLoad() {
    if (KK.p) return KK.p;
    KK.p = new Promise(function (resolve, reject) {
      var w, up = false;
      try { w = new Worker(URL.createObjectURL(new Blob([KK_WORKER], { type: 'text/javascript' })), { type: 'module' }); } catch (e) { reject(e); return; }
      KK.w = w; kkMsg('Heart voice: loading…');
      setTimeout(function () { if (!up) { try { w.terminate(); } catch (e) {} reject(new Error('worker did not start')); } }, 8000);
      w.onerror = function (e) { if (!KK.ready) reject(new Error('worker error ' + (e && e.message || ''))); };
      w.onmessage = function (e) {
        var m = e.data;
        if (m.t === 'up') { up = true; w.postMessage({ t: 'load', base: location.href }); }
        else if (m.t === 'pct') { if (!KK.ready) kkMsg('Heart voice: downloading ' + m.pct + '% · Claude voice meanwhile'); }
        else if (m.t === 'ready') { KK.ready = true; kkMsg('Voice: Kokoro · Heart'); resolve(true); }
        else if (m.t === 'fail') reject(new Error(m.msg));
        else if ((m.t === 'audio' || m.t === 'gerr') && KK.cb[m.id]) { var f = KK.cb[m.id]; delete KK.cb[m.id]; f(m); }
      };
    });
    KK.p.catch(function (e) { KK.failed = true; try { console.warn('Kokoro voice unavailable', e); } catch (x) {} kkMsg('Voice: Claude (Heart voice couldn’t load here)'); });
    return KK.p;
  }
  function kkGen(text) { return new Promise(function (res) { var id = ++KK.seq; KK.cb[id] = res; KK.w.postMessage({ t: 'gen', id: id, text: text }); }); }
  function kkStop() { KK.srcs.forEach(function (s) { try { s.stop(); } catch (e) {} }); KK.srcs = []; KK.gen++; KK.cb = {}; }
  /* ~200-character chunks on sentence boundaries: fewer seams, more natural phrasing */
  function kkChunks(text) {
    var sents = String(text).replace(/\s+/g, ' ').trim().match(/[^.!?;]+[.!?;]*["”’)]*\s*/g) || [text], out = [], cur = '';
    sents.forEach(function (s) { if (cur && (cur + s).length > (out.length ? 200 : 90)) { out.push(cur.trim()); cur = ''; } cur += s; });   // short first chunk = quick start
    if (cur.trim()) out.push(cur.trim());
    return out;
  }
  /* Speak with Heart. Resolves true when Heart took the text, false to let the caller use another voice. */
  async function kkSpeak(text) {
    if (KK.failed || !KK.ctx || !KK.ready) { if (!KK.failed && KK.ctx) kkLoad(); return false; }
    kkStop(); var gen = KK.gen, ctx = KK.ctx;
    var chunks = kkChunks(text), total = chunks.reduce(function (t, c) { return t + c.length; }, 0), done = 0;
    /* on a computer too slow to keep up, Heart would leave a long silence first: let Claude's voice read this one */
    if (chunks[0].length * KK.spc + Math.max(0, total * (KK.spc - KK.apc)) > 7) return false;
    var buf = [], playing = false, at = 0, buffered = 0;
    var schedule = function () {
      while (buf.length) {
        var b = buf.shift(), src = ctx.createBufferSource(); src.buffer = b; src.connect(ctx.destination);
        at = Math.max(at, ctx.currentTime + .03); src.start(at); at += b.duration + .06; KK.srcs.push(src);
      }
    };
    for (var i = 0; i < chunks.length; i++) {
      var r = await kkGen(chunks[i]);
      if (gen !== KK.gen) return true;
      if (r.t !== 'audio') { if (!playing) return false; continue; }
      var ab = ctx.createBuffer(1, r.audio.length, r.rate); ab.copyToChannel(r.audio, 0);
      done += chunks[i].length; KK.spc = KK.spc * .5 + (r.ms / 1000 / chunks[i].length) * .5; KK.apc = KK.apc * .5 + (ab.duration / chunks[i].length) * .5;
      try { localStorage.setItem('cw-kk-spc', String(KK.spc)); } catch (e) {}
      buf.push(ab); buffered += ab.duration;
      /* start once the audio already made covers the time needed to make the rest */
      var left = (total - done) * KK.spc;
      if (!playing && (done >= total || buffered >= left * 1.15)) { playing = true; at = ctx.currentTime + .05; }
      if (playing) schedule();
    }
    if (!playing) { at = ctx.currentTime + .05; schedule(); }
    return true;
  }
