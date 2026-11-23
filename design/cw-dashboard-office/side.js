  /* Collapsible left menu: icons-only rail, remembered per browser; each icon gets its name as a tooltip */
  (function () {
    var app = document.getElementById('app'), user = document.querySelector('.side-user'); if (!app || !user) return;
    var b = document.createElement('button'); b.type = 'button'; b.className = 'side-tog'; b.id = 'side-tog';
    b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/><path d="M20 4v16"/></svg><span>Collapse menu</span>';
    user.parentNode.insertBefore(b, user);
    document.querySelectorAll('.side nav button[data-tab], .side nav .nav-group').forEach(function (x) { if (!x.title) x.title = x.textContent.replace(/\s+/g, ' ').trim(); });
    var set = function (mini) {
      app.classList.toggle('side-mini', mini); b.setAttribute('aria-expanded', String(!mini));
      b.setAttribute('aria-label', mini ? 'Expand menu' : 'Collapse menu'); b.title = mini ? 'Expand menu' : 'Collapse menu';
      try { localStorage.setItem('cw-side-mini', mini ? '1' : '0'); } catch (e) {}
    };
    var start = false; try { start = localStorage.getItem('cw-side-mini') === '1'; } catch (e) {}
    set(start);
    b.addEventListener('click', function () { set(!app.classList.contains('side-mini')); });
    /* a group with sub-pages (ISA & RM stats) opens the full menu so its sub-pages show */
    var g = document.getElementById('grp-isa'); if (g) g.addEventListener('click', function () { if (app.classList.contains('side-mini')) set(false); }, true);
  })();
