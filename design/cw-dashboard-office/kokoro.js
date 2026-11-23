
  /* ---------- Kokoro "Heart" voice (af_heart) for CW Voice ----------
     Kokoro-82M runs in the browser (kokoro-js + transformers.js, onnxruntime-web). The model is fetched from Hugging Face
     when the page is allowed to; otherwise from a copy published next to this page (office3d/kokoro/, base64 parts).
     First use downloads ~110 MB; after that the browser cache keeps it. Falls back to the browser's own voice. */
  var KK = { p: null, tts: null, ready: false, failed: false, ctx: null, srcs: [], pct: 0 };
  var KK_HF = 'https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/main/';
  var KK_TF = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.5.1/';
  var KK_PARTS = { model: 9, ort: 3, voice: 1 };
  function kkList(prefix) { var a = []; for (var i = 0; i < KK_PARTS[prefix]; i++) a.push('office3d/kokoro/' + prefix + '-' + i + '.json'); return a; }
  function kkMsg(t) { var el = $('#vc-voice'); if (el) el.textContent = t; }
  async function kkParts(urls, real, weight) {
    var bufs = await Promise.all(urls.map(function (u) {
      return real(u).then(function (r) { if (!r.ok) throw new Error(u + ' ' + r.status); return r.json(); }).then(function (j) {
        var s = atob(j.b), b = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) b[i] = s.charCodeAt(i);
        KK.pct = Math.min(99, KK.pct + weight / urls.length); if (!KK.ready) kkMsg('Heart voice: downloading ' + Math.round(KK.pct) + '%'); return b;
      });
    }));
    var n = bufs.reduce(function (t, b) { return t + b.length; }, 0), out = new Uint8Array(n), o = 0;
    bufs.forEach(function (b) { out.set(b, o); o += b.length; });
    return out.buffer;
  }
  function kkLoad() {
    if (KK.p) return KK.p;
    KK.p = (async function () {
      kkMsg('Heart voice: loading…');
      var real = window.fetch.bind(window);
      var LOCAL = { 'config.json': 1, 'tokenizer.json': 1, 'tokenizer_config.json': 1 };
      async function local(path) {
        if (LOCAL[path]) return real('office3d/kokoro/' + path);
        var buf = path === 'onnx/model_quantized.onnx' ? await kkParts(kkList('model'), real, 80) : path === 'voices/af_heart.bin' ? await kkParts(kkList('voice'), real, 1) : null;
        if (!buf) throw new Error('not packaged: ' + path);
        return new Response(buf, { status: 200, headers: { 'Content-Type': 'application/octet-stream', 'Content-Length': String(buf.byteLength) } });
      }
      window.fetch = function (input, init) {
        var url = typeof input === 'string' ? input : input && input.url;
        if (url && url.indexOf(KK_HF) === 0) {
          var path = url.slice(KK_HF.length).split('?')[0];
          return real(input, init).then(function (r) { if (!r.ok) throw new Error('hf ' + r.status); return r; }).catch(function () { return local(path); });
        }
        return real(input, init);
      };
      var TF = await import(KK_TF + '+esm');
      var ow = TF.env.backends.onnx.wasm; ow.numThreads = 1; ow.proxy = false;
      var wasm = null;
      try { var r = await real(KK_TF + 'dist/ort-wasm-simd-threaded.jsep.wasm'); if (r.ok) wasm = await r.arrayBuffer(); } catch (e) {}
      if (!wasm) wasm = await kkParts(kkList('ort'), real, 18);
      ow.wasmBinary = wasm;
      var K = await import('https://cdn.jsdelivr.net/npm/kokoro-js@1.2.1/+esm');
      KK.tts = await K.KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', { dtype: 'q8', device: 'wasm' });
      KK.ready = true; kkMsg('Voice: Kokoro · Heart'); return KK.tts;
    })();
    KK.p.catch(function (e) { KK.failed = true; try { console.warn('Kokoro voice failed', e); } catch (x) {} kkMsg('Heart voice didn’t load · using the browser voice'); });
    return KK.p;
  }
  function kkStop() { KK.srcs.forEach(function (s) { try { s.stop(); } catch (e) {} }); KK.srcs = []; KK.gen = (KK.gen || 0) + 1; }
  async function kkSpeak(text) {
    if (KK.failed || !KK.ctx) return false;
    var tts = KK.ready ? KK.tts : await Promise.race([kkLoad().catch(function () { return null; }), new Promise(function (r) { setTimeout(function () { r(null); }, 45000); })]);
    if (!tts) return false;
    kkStop(); var gen = KK.gen, ctx = KK.ctx, at = ctx.currentTime + .05;
    var parts = String(text).replace(/\s+/g, ' ').match(/[^.!?]+[.!?]*/g) || [text];
    for (var i = 0; i < parts.length; i++) {
      var s = parts[i].trim(); if (!s) continue;
      var a = await tts.generate(s, { voice: 'af_heart' });
      if (gen !== KK.gen) return true;
      var buf = ctx.createBuffer(1, a.audio.length, a.sampling_rate); buf.copyToChannel(a.audio, 0);
      var src = ctx.createBufferSource(); src.buffer = buf; src.connect(ctx.destination);
      at = Math.max(at, ctx.currentTime + .02); src.start(at); at += buf.duration; KK.srcs.push(src);
    }
    return true;
  }
