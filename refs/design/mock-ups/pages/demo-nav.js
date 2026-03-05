(function () {
  'use strict';

  /* ── CURRENT PAGE ───────────────────────────────────── */
  var parts = location.pathname.split('/');
  var CURRENT = decodeURIComponent(parts[parts.length - 2] || '');

  var SCREENS = [
    { label: 'Login',             folder: 'Email Composer' },
    { label: 'Sign Up',           folder: 'Sign Up' },
    { label: 'Forgot Password',   folder: 'Forgot Password' },
    { label: 'Inbox',             folder: 'Inbox' },
    { label: 'Starred',           folder: 'Starred' },
    { label: 'Sent',              folder: 'Sent' },
    { label: 'Drafts',            folder: 'Drafts' },
    { label: 'Trash',             folder: 'Trash' },
    { label: 'Contacts',          folder: 'MailBox' },
    { label: 'Dashboard',         folder: 'Personal Dashboard \u2013 Brand Collection Applied' },
    { label: 'Attachments Hub',   folder: 'EaseMail - Attachments Hub' },
    { label: 'Calendar',          folder: 'Unified Red Enterprise Calendar' },
    { label: 'Event Detail',      folder: 'Event Detail' },
    { label: 'Email Accounts',    folder: 'Email Accounts Dashboard' },
    { label: 'Account Details',   folder: 'Account Details & Sync Settings' },
    { label: 'Add Account',       folder: 'Add Email Account' },
    { label: 'Disconnect',        folder: 'Disconnect Confirmation' },
    { label: 'AI Remix',          folder: 'AI Remix Panel' },
    { label: 'AI Dictate',        folder: 'AI Dictate Overlay (Copy)' },
    { label: 'Help Center',       folder: 'Detailed Help Center \u2014 Brand Design System' },
  ];

  function go(folder) {
    window.location.href = '../' + encodeURIComponent(folder) + '/index.html';
  }

  /* ── STYLES ─────────────────────────────────────────── */
  var css = [
    '#em-demo-nav{position:fixed;bottom:20px;right:20px;z-index:99999;font-family:"Inter","Outfit",sans-serif}',
    '#em-demo-trigger{display:flex;align-items:center;gap:8px;height:36px;padding:0 16px;background:#1C1A16;color:#fff;border:none;border-radius:20px;font-size:12.5px;font-weight:500;cursor:pointer;box-shadow:0 4px 16px rgba(28,26,22,.32);transition:all .15s;font-family:inherit;letter-spacing:-.01em}',
    '#em-demo-trigger:hover{background:#3A3730;transform:translateY(-1px);box-shadow:0 6px 20px rgba(28,26,22,.36)}',
    '.em-dot{width:7px;height:7px;border-radius:50%;background:#E05D38;flex-shrink:0}',
    '#em-demo-panel{position:absolute;bottom:calc(100% + 10px);right:0;width:230px;background:#FDFBF7;border:1.5px solid #E0DBD1;border-radius:14px;box-shadow:0 8px 36px rgba(28,26,22,.14),0 3px 10px rgba(28,26,22,.08);overflow:hidden;display:none;flex-direction:column;animation:emSlideUp .18s ease both}',
    '#em-demo-panel.open{display:flex}',
    '@keyframes emSlideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}',
    '.em-panel-head{padding:11px 14px 9px;border-bottom:1px solid #E0DBD1;font-size:10px;font-weight:600;color:#B0AA9E;letter-spacing:.08em;text-transform:uppercase;font-family:monospace;display:flex;align-items:center;justify-content:space-between}',
    '.em-current-label{font-size:11px;font-weight:500;color:#E05D38;letter-spacing:0;text-transform:none;font-family:sans-serif}',
    '.em-panel-list{padding:6px;max-height:380px;overflow-y:auto}',
    '.em-panel-list::-webkit-scrollbar{width:4px}',
    '.em-panel-list::-webkit-scrollbar-track{background:transparent}',
    '.em-panel-list::-webkit-scrollbar-thumb{background:#D0CAC0;border-radius:2px}',
    '.em-nav-item{display:flex;align-items:center;width:100%;padding:7px 10px;border-radius:8px;border:none;background:transparent;color:#3A3730;font-size:12.5px;font-weight:400;cursor:pointer;text-align:left;font-family:inherit;transition:background .1s,color .1s;text-decoration:none;letter-spacing:-.01em}',
    '.em-nav-item:hover{background:#F2EFE8;color:#1C1A16}',
    '.em-nav-item.em-current{background:rgba(224,93,56,.1);color:#E05D38;font-weight:500}',
    '.em-nav-num{font-size:10px;font-family:monospace;color:#B0AA9E;margin-left:auto;padding-left:8px;flex-shrink:0}',
    '.em-nav-item.em-current .em-nav-num{color:rgba(224,93,56,.5)}',
    /* Composer modal */
    '@keyframes emComposerIn{from{opacity:0;transform:scale(.97) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}',
    '#em-composer-overlay{position:fixed;inset:0;z-index:50000;background:rgba(15,23,42,.45);display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(3px)}',
    '#em-composer-modal{width:100%;max-width:820px;background:#fff;border-radius:12px;box-shadow:0 25px 60px rgba(0,0,0,.28),0 8px 20px rgba(0,0,0,.12);display:flex;flex-direction:column;max-height:90vh;overflow:hidden;border:1px solid #e2e8f0;animation:emComposerIn .18s ease both;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}',
    '#em-composer-modal button{cursor:pointer;transition:opacity .12s,background .12s}',
    '#em-composer-modal button:hover{opacity:.75}',
  ].join('');

  /* ── Glass Mode CSS ─────────────────────────────────── */
  css += [
    'html.em-glass,body.em-glass{background:transparent!important}',
    /* Frosted glass for white/light backgrounds — raised opacity for readability */
    'body.em-glass .bg-white,body.em-glass .bg-background-50{background:rgba(255,255,255,.30)!important;backdrop-filter:blur(20px)!important;-webkit-backdrop-filter:blur(20px)!important}',
    'body.em-glass .bg-background-100{background:rgba(255,255,255,.36)!important;backdrop-filter:blur(14px)!important;-webkit-backdrop-filter:blur(14px)!important}',
    'body.em-glass .bg-background-200{background:rgba(255,255,255,.40)!important}',
    'body.em-glass .bg-background-300{background:rgba(255,255,255,.44)!important}',
    'body.em-glass .bg-neutral-50,body.em-glass .bg-neutral-100{background:rgba(255,255,255,.25)!important;backdrop-filter:blur(12px)!important;-webkit-backdrop-filter:blur(12px)!important}',
    /* Dark neutral blocks get dark glass */
    'body.em-glass .bg-neutral-800{background:rgba(0,0,0,.55)!important;backdrop-filter:blur(14px)!important;-webkit-backdrop-filter:blur(14px)!important}',
    'body.em-glass .bg-neutral-900{background:rgba(0,0,0,.65)!important;backdrop-filter:blur(14px)!important;-webkit-backdrop-filter:blur(14px)!important}',
    /* Borders — more visible over dark background */
    'body.em-glass .border-neutral-100,body.em-glass .border-neutral-200{border-color:rgba(255,255,255,.30)!important}',
    'body.em-glass .border-neutral-300{border-color:rgba(255,255,255,.40)!important}',
    /* Amber active nav items (Starred/Drafts pages) — frosted amber instead of opaque light-yellow */
    'body.em-glass .bg-amber-50{background:rgba(245,158,11,.22)!important;backdrop-filter:blur(12px)!important;-webkit-backdrop-filter:blur(12px)!important}',
    'body.em-glass .bg-amber-100{background:rgba(245,158,11,.35)!important}',
    'body.em-glass .border-amber-200{border-color:rgba(245,158,11,.45)!important}',
    /* Selected / active email rows — brand red glass instead of light pink */
    'body.em-glass .bg-primary-50{background:rgba(138,9,9,.38)!important;backdrop-filter:blur(14px)!important;-webkit-backdrop-filter:blur(14px)!important}',
    'body.em-glass .bg-primary-100,body.em-glass .hover\\:bg-primary-100:hover{background:rgba(138,9,9,.50)!important}',
    /* Any text (badges, nav labels, chips) inside primary glass backgrounds → white so dark-red-on-dark-red doesn't occur */
    'body.em-glass .bg-primary-50 *,body.em-glass .bg-primary-100 *{color:rgba(255,255,255,.93)!important}',
    /* Primary left-border accent stays visible */
    'body.em-glass .border-l-primary-500{border-left-color:rgba(255,255,255,.80)!important}',
    /* AI Dictate waveform header has an inline gradient — override it with brand-red glass */
    'body.em-glass .em-dictate-header{background:rgba(138,9,9,.28)!important;backdrop-filter:blur(14px)!important;-webkit-backdrop-filter:blur(14px)!important}',
    /* Text — neutrals become white variants with higher contrast */
    'body.em-glass .text-neutral-900,body.em-glass .text-neutral-800{color:rgba(255,255,255,.97)!important}',
    'body.em-glass .text-neutral-700,body.em-glass .text-neutral-600{color:rgba(255,255,255,.88)!important}',
    'body.em-glass .text-neutral-500{color:rgba(255,255,255,.78)!important}',
    /* Raised from .62 → .85 so icon buttons on frosted-white headers are readable */
    'body.em-glass .text-neutral-400{color:rgba(255,255,255,.85)!important}',
    /* Inputs — visible box with clear boundary */
    'body.em-glass input:not([type=checkbox]):not([type=radio]),body.em-glass textarea,body.em-glass select{background:rgba(255,255,255,.25)!important;color:rgba(255,255,255,.95)!important;border-color:rgba(255,255,255,.45)!important}',
    'body.em-glass input::placeholder,body.em-glass textarea::placeholder{color:rgba(255,255,255,.58)!important}',
    /* Hover states — perceptible lift above base */
    'body.em-glass .hover\\:bg-background-100:hover,body.em-glass .hover\\:bg-background-200:hover,body.em-glass .hover\\:bg-neutral-50:hover,body.em-glass .hover\\:bg-neutral-100:hover{background:rgba(255,255,255,.38)!important}',
    /* Divider lines — visible separation */
    'body.em-glass .divide-neutral-100>*+*,body.em-glass .divide-neutral-200>*+*{border-color:rgba(255,255,255,.28)!important}',
  ].join('');

  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ── BUILD NAVIGATOR DOM ────────────────────────────── */
  var nav = document.createElement('div');
  nav.id = 'em-demo-nav';

  var panel = document.createElement('div');
  panel.id = 'em-demo-panel';

  var currentScreen = SCREENS.find(function (s) { return s.folder === CURRENT; });

  var head = document.createElement('div');
  head.className = 'em-panel-head';
  head.innerHTML = 'Demo Screens'
    + (currentScreen ? '<span class="em-current-label">' + currentScreen.label + '</span>' : '');

  /* Glass Mode toggle row */
  var toggleRow = document.createElement('div');
  toggleRow.style.cssText = 'padding:8px 12px 9px;border-bottom:1px solid #E0DBD1;display:flex;align-items:center;justify-content:space-between;gap:8px;';
  toggleRow.innerHTML = '<span style="font-size:11.5px;font-weight:500;color:#3A3730;display:flex;align-items:center;gap:5px;">&#127956; Glass Mode</span>'
    + '<button id="em-glass-toggle" style="width:36px;height:20px;border-radius:10px;border:none;cursor:pointer;position:relative;transition:background .2s;background:#D0CAC0;flex-shrink:0;padding:0;" aria-label="Toggle glass mode">'
    + '<span id="em-glass-knob" style="position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.25);transition:transform .15s;display:block;"></span>'
    + '</button>';

  var list = document.createElement('div');
  list.className = 'em-panel-list';

  SCREENS.forEach(function (screen, i) {
    var a = document.createElement('a');
    a.className = 'em-nav-item' + (screen.folder === CURRENT ? ' em-current' : '');
    a.href = '../' + encodeURIComponent(screen.folder) + '/index.html';
    a.innerHTML = screen.label
      + '<span class="em-nav-num">' + String(i + 1).padStart(2, '0') + '</span>';
    list.appendChild(a);
  });

  panel.appendChild(head);
  panel.appendChild(toggleRow);
  panel.appendChild(list);

  var trigger = document.createElement('button');
  trigger.id = 'em-demo-trigger';
  trigger.innerHTML = '<span class="em-dot"></span>Demo Navigator';

  trigger.addEventListener('click', function (e) {
    e.stopPropagation();
    panel.classList.toggle('open');
  });

  document.addEventListener('click', function (e) {
    if (!nav.contains(e.target)) panel.classList.remove('open');
  });

  nav.appendChild(panel);
  nav.appendChild(trigger);
  document.body.appendChild(nav);

  /* ── COMPOSER MODAL ─────────────────────────────────── */
  var overlay = document.createElement('div');
  overlay.id = 'em-composer-overlay';
  overlay.style.display = 'none';
  overlay.innerHTML = [
    '<div id="em-composer-modal">',

    /* Header */
    '<div style="display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-bottom:1px solid #f1f5f9;flex-shrink:0;background:#fff;">',
    '  <div style="display:flex;align-items:center;gap:10px;">',
    '    <span style="font-size:15px;font-weight:600;color:#1e293b;">New Message</span>',
    '    <span style="font-size:11px;color:#94a3b8;padding:2px 8px;background:#f8fafc;border-radius:6px;border:1px solid #f1f5f9;">Draft saved</span>',
    '  </div>',
    '  <div style="display:flex;align-items:center;gap:4px;">',
    '    <button style="padding:6px 8px;background:none;border:none;color:#94a3b8;font-size:15px;border-radius:4px;" title="Minimize">⊟</button>',
    '    <button id="em-composer-close" style="padding:6px 8px;background:none;border:none;color:#94a3b8;font-size:17px;border-radius:4px;" title="Close">✕</button>',
    '  </div>',
    '</div>',

    /* Recipients + Subject */
    '<div style="padding:0 20px;flex-shrink:0;background:#fff;">',
    '  <div style="display:flex;align-items:center;padding:9px 0;border-bottom:1px solid #f1f5f9;gap:8px;">',
    '    <label style="width:48px;font-size:13px;font-weight:500;color:#64748b;flex-shrink:0;">To</label>',
    '    <div style="flex:1;display:flex;flex-wrap:wrap;gap:5px;align-items:center;">',
    '      <span style="display:inline-flex;align-items:center;gap:4px;background:#f1f5f9;color:#1e293b;font-size:12px;padding:2px 8px;border-radius:6px;border:1px solid #e2e8f0;">',
    '        alex@uxmagic.ai',
    '        <span style="color:#94a3b8;font-size:11px;cursor:pointer;line-height:1;">✕</span>',
    '      </span>',
    '      <input type="text" placeholder="Add recipient..." style="flex:1;min-width:80px;border:none;outline:none;font-size:13px;background:transparent;color:#1e293b;">',
    '    </div>',
    '    <div style="display:flex;gap:8px;flex-shrink:0;">',
    '      <button style="background:none;border:none;font-size:12px;color:#94a3b8;padding:2px 4px;">Cc</button>',
    '      <button style="background:none;border:none;font-size:12px;color:#94a3b8;padding:2px 4px;">Bcc</button>',
    '    </div>',
    '  </div>',
    '  <div style="display:flex;align-items:center;padding:9px 0;border-bottom:1px solid #f1f5f9;gap:8px;">',
    '    <label style="width:48px;font-size:13px;font-weight:500;color:#64748b;flex-shrink:0;">Subject</label>',
    '    <input type="text" value="Project Update: Q4 Design Review" style="flex:1;border:none;outline:none;font-size:13px;font-weight:500;color:#1e293b;background:transparent;">',
    '  </div>',
    '</div>',

    /* Toolbar */
    '<div style="padding:6px 20px;border-bottom:1px solid #f1f5f9;background:#f8fafc;display:flex;align-items:center;gap:3px;flex-shrink:0;overflow-x:auto;">',
    '  <select style="font-size:12px;border:none;outline:none;background:transparent;color:#475569;padding:3px 4px;border-right:1px solid #e2e8f0;margin-right:4px;cursor:pointer;"><option>Normal Text</option><option>Heading 1</option><option>Heading 2</option></select>',
    '  <button style="padding:4px 7px;background:none;border:none;border-radius:4px;font-weight:700;font-size:13px;color:#475569;" title="Bold">B</button>',
    '  <button style="padding:4px 7px;background:none;border:none;border-radius:4px;font-style:italic;font-size:13px;color:#475569;" title="Italic">I</button>',
    '  <button style="padding:4px 7px;background:none;border:none;border-radius:4px;font-size:13px;color:#475569;text-decoration:underline;" title="Underline">U</button>',
    '  <span style="width:1px;height:14px;background:#e2e8f0;margin:0 3px;display:inline-block;"></span>',
    '  <button style="padding:4px 7px;background:none;border:none;border-radius:4px;font-size:15px;color:#475569;" title="Bullet list">≡</button>',
    '  <button style="padding:4px 7px;background:none;border:none;border-radius:4px;font-size:13px;color:#475569;" title="Numbered list">1.</button>',
    '  <span style="width:1px;height:14px;background:#e2e8f0;margin:0 3px;display:inline-block;"></span>',
    '  <button style="padding:4px 7px;background:none;border:none;border-radius:4px;font-size:13px;color:#475569;" title="Link">🔗</button>',
    '  <button style="padding:4px 7px;background:none;border:none;border-radius:4px;font-size:13px;color:#475569;" title="Image">🖼</button>',
    '  <button style="padding:4px 7px;background:none;border:none;border-radius:4px;font-size:13px;color:#475569;" title="Emoji">😊</button>',
    '</div>',

    /* Editor body */
    '<div style="flex:1;overflow-y:auto;padding:20px 24px;background:#fff;min-height:180px;font-size:14px;line-height:1.7;color:#334155;">',
    '  <p style="margin:0 0 12px;">Hi Alex,</p>',
    '  <p style="margin:0 0 12px;">Here are the latest updates for the Q4 design review. We&#39;ve made significant progress on the new dashboard components and the mobile responsiveness updates.</p>',
    '  <p style="margin:0 0 8px;font-weight:500;color:#1e293b;">Key Highlights:</p>',
    '  <ul style="margin:0 0 12px;padding-left:20px;">',
    '    <li>Completed the new navigation structure</li>',
    '    <li>Finalized the color palette for dark mode</li>',
    '    <li>Updated all icon sets to the new style</li>',
    '  </ul>',
    '  <p style="margin:0 0 12px;">I&#39;ve attached the preliminary mockups below for your review. Let me know if you have any feedback before our meeting on Thursday.</p>',
    '  <div style="margin:16px 0;padding:12px 16px;border:1px solid #e2e8f0;border-radius:8px;background:#f8fafc;display:flex;align-items:center;gap:12px;max-width:320px;">',
    '    <div style="padding:8px;background:#fff;border:1px solid #e2e8f0;border-radius:6px;font-size:20px;line-height:1;">📄</div>',
    '    <div style="flex:1;min-width:0;">',
    '      <p style="font-size:13px;font-weight:500;color:#1e293b;margin:0 0 2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Q4_Design_Mockups_v2.pdf</p>',
    '      <p style="font-size:12px;color:#64748b;margin:0;">2.4 MB · PDF Document</p>',
    '    </div>',
    '    <button style="background:none;border:none;color:#94a3b8;font-size:14px;padding:4px;">✕</button>',
    '  </div>',
    '  <p style="margin:24px 0 4px;color:#64748b;">Best regards,</p>',
    '  <p style="margin:0;font-weight:500;color:#1e293b;">Sarah Jenkins</p>',
    '  <p style="font-size:12px;color:#94a3b8;margin:2px 0 0;">Senior Product Designer | Uxmagic.ai</p>',
    '</div>',

    /* Footer */
    '<div style="padding:12px 20px;border-top:1px solid #f1f5f9;background:#f8fafc;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">',
    '  <div style="display:flex;align-items:center;gap:8px;">',
    '    <button style="display:flex;align-items:center;gap:8px;background:#DC2626;color:#fff;padding:8px 18px;border-radius:7px;font-size:13px;font-weight:500;border:none;box-shadow:0 2px 6px rgba(220,38,38,.35);">',
    '      Send <span style="opacity:.55;margin-left:2px;">▾</span>',
    '    </button>',
    '    <button style="padding:7px 8px;background:none;border:none;color:#64748b;font-size:16px;border-radius:4px;" title="Attach files">📎</button>',
    '  </div>',
    '  <button id="em-composer-discard" style="padding:7px 8px;background:none;border:none;color:#94a3b8;font-size:16px;border-radius:4px;" title="Discard draft">🗑</button>',
    '</div>',

    '</div>', /* end #em-composer-modal */
  ].join('');

  document.body.appendChild(overlay);

  /* Close on backdrop click */
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) window.closeComposer();
  });

  /* Close on Escape key */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { window.closeComposer(); }
  });

  /* Wire close + discard buttons (after DOM insertion) */
  setTimeout(function () {
    var closeBtn = document.getElementById('em-composer-close');
    var discardBtn = document.getElementById('em-composer-discard');
    if (closeBtn) closeBtn.addEventListener('click', function () { window.closeComposer(); });
    if (discardBtn) discardBtn.addEventListener('click', function () { window.closeComposer(); });
  }, 0);

  /* Public API */
  window.openComposer = function () {
    var el = document.getElementById('em-composer-overlay');
    if (el) el.style.display = 'flex';
  };
  window.closeComposer = function () {
    var el = document.getElementById('em-composer-overlay');
    if (el) el.style.display = 'none';
  };

  /* ── FLOW WIRING ────────────────────────────────────── */

  // Generic button text matcher
  function wireText(texts, targetFolder, delay, prevent) {
    if (prevent === undefined) prevent = true;
    document.querySelectorAll('button, a').forEach(function (el) {
      var t = el.textContent.trim().toLowerCase();
      for (var i = 0; i < texts.length; i++) {
        if (t === texts[i].toLowerCase() || t.includes(texts[i].toLowerCase())) {
          (function (el, targetFolder, delay, prevent) {
            el.addEventListener('click', function (e) {
              if (prevent) { e.preventDefault(); e.stopPropagation(); }
              if (delay) { setTimeout(function () { go(targetFolder); }, delay); }
              else { go(targetFolder); }
            });
          })(el, targetFolder, delay, prevent);
          break;
        }
      }
    });
  }

  // ── Sidebar nav items ──────────────────────────────────
  var SIDEBAR_MAP = {
    'inbox':          'Inbox',
    'mailbox':        'Inbox',
    'starred':        'Starred',
    'sent':           'Sent',
    'drafts':         'Drafts',
    'trash':          'Trash',
    'contacts':       'MailBox',
    'dashboard':      'Personal Dashboard \u2013 Brand Collection Applied',
    'email accounts': 'Email Accounts Dashboard',
    'accounts':       'Email Accounts Dashboard',
    'attachments':    'EaseMail - Attachments Hub',
    'calendar':       'Unified Red Enterprise Calendar',
    'help':           'Detailed Help Center \u2014 Brand Design System',
    'help center':    'Detailed Help Center \u2014 Brand Design System',
  };

  document.querySelectorAll('a, button').forEach(function (el) {
    var t = el.textContent.trim().toLowerCase();
    if (SIDEBAR_MAP[t]) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        go(SIDEBAR_MAP[t]);
      });
    }
  });

  // ── Compose button → open modal ────────────────────────
  document.querySelectorAll('button').forEach(function (btn) {
    if (btn.textContent.trim().toLowerCase() === 'compose') {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        window.openComposer();
      });
    }
  });

  // ── LOGIN PAGE ─────────────────────────────────────────
  // Sign in → Dashboard (the main app home after login)
  wireText(
    ['sign in to mailflow', 'sign in', 'log in', 'get started', 'sign in with sso'],
    'Personal Dashboard \u2013 Brand Collection Applied',
    900
  );

  // Sign up / Create account → Dashboard (after delay to simulate account creation)
  wireText(
    ['create free account', 'create account', 'continue with google', 'continue with github'],
    'Personal Dashboard \u2013 Brand Collection Applied',
    1200
  );

  // Forgot password link → Forgot Password page
  wireText(
    ['forgot password', 'forgot your password?', 'reset password'],
    'Forgot Password'
  );

  // Create account / Sign up link → Sign Up page
  wireText(
    ['create a free account', 'sign up', 'create an account', 'get started free'],
    'Sign Up'
  );

  // Back to sign in (from Forgot Password / Sign Up) → Login
  wireText(['back to sign in'], 'Email Composer');

  // ── AI Remix & Dictate ─────────────────────────────────
  wireText(['ai remix', 'remix'], 'AI Remix Panel');
  wireText(['ai dictate', 'dictate'], 'AI Dictate Overlay (Copy)');

  // ── EMAIL ACCOUNTS ─────────────────────────────────────
  wireText(['add account', 'add email account', 'connect another account'], 'Add Email Account');
  wireText(['disconnect'], 'Disconnect Confirmation');

  // Settings gear → Account Details
  document.querySelectorAll('button').forEach(function (btn) {
    var svgs = btn.querySelectorAll('svg');
    var txt = btn.textContent.trim();
    if (svgs.length > 0 && txt === '') {
      var html = btn.innerHTML.toLowerCase();
      if (html.includes('m19.4 15') || html.includes('settings') || html.includes('gear') || btn.title === 'Settings' || btn.getAttribute('aria-label') === 'Settings') {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          go('Account Details & Sync Settings');
        });
      }
    }
  });

  // ── ADD EMAIL ACCOUNT ──────────────────────────────────
  wireText(['cancel'], 'Email Accounts Dashboard');

  // ── ACCOUNT DETAILS ────────────────────────────────────
  wireText(['back', 'email accounts'], 'Email Accounts Dashboard');

  // ── DISCONNECT CONFIRMATION ────────────────────────────
  wireText(['cancel', 'cancel \u2014 keep account', 'keep account'], 'Email Accounts Dashboard');
  wireText(['back to email accounts'], 'Email Accounts Dashboard', 0);
  var _origDisconnect = window.handleDisconnect;
  if (typeof _origDisconnect === 'function') {
    window.handleDisconnect = function () {
      _origDisconnect();
      setTimeout(function () { go('Email Accounts Dashboard'); }, 2800);
    };
  } else {
    setTimeout(function () {
      if (typeof window.handleDisconnect === 'function' && !window.handleDisconnect._wired) {
        var orig = window.handleDisconnect;
        window.handleDisconnect = function () {
          orig();
          setTimeout(function () { go('Email Accounts Dashboard'); }, 2800);
        };
        window.handleDisconnect._wired = true;
      }
    }, 500);
  }

  // ── CALENDAR → EVENT DETAIL ────────────────────────────
  wireText(['back to calendar', 'back to calendar →'], 'Unified Red Enterprise Calendar');
  wireText(['email all attendees'], 'Email Composer');
  wireText(['new event'], 'Unified Red Enterprise Calendar');

  // Calendar event cards → Event Detail (the calendar uses div.cursor-pointer with border-l-4)
  document.querySelectorAll('article, [data-event], .fc-event').forEach(function (el) {
    el.addEventListener('click', function (e) {
      if (!e.target.closest('button')) { go('Event Detail'); }
    });
  });
  // Also target the calendar's positioned event divs
  document.querySelectorAll('div.cursor-pointer').forEach(function (el) {
    if (el.className.includes('border-l-4') || el.className.includes('border-blue') || el.className.includes('border-primary') || el.className.includes('border-orange') || el.className.includes('border-teal')) {
      el.addEventListener('click', function (e) {
        if (!e.target.closest('button')) { go('Event Detail'); }
      });
    }
  });

  // ── AI REMIX PANEL ─────────────────────────────────────
  wireText(['accept & replace', 'accept and replace'], 'Inbox', 400);
  wireText(['composer'], 'Inbox');
  wireText(['email composer'], 'Email Composer');

  // ── AI DICTATE ─────────────────────────────────────────
  wireText(['insert into email'], 'Inbox', 400);

  // ── DASHBOARD ──────────────────────────────────────────
  wireText(['view all inbox', 'go to inbox', 'view inbox'], 'Inbox');
  wireText(['view calendar', 'view calendar →', 'view calendar -\u003e'], 'Unified Red Enterprise Calendar');

  // Agenda event rows → Calendar  |  Email rows → MailBox
  document.querySelectorAll('section').forEach(function (section) {
    var h2 = section.querySelector('h2');
    if (!h2) return;
    var title = h2.textContent.toLowerCase();

    if (title.includes('agenda')) {
      section.querySelectorAll('div.group').forEach(function (item) {
        item.style.cursor = 'pointer';
        item.addEventListener('click', function (e) {
          if (!e.target.closest('button')) {
            go('Unified Red Enterprise Calendar');
          }
        });
      });
    }

    if (title.includes('email') || title.includes('inbox')) {
      section.querySelectorAll('div.group').forEach(function (item) {
        item.style.cursor = 'pointer';
        item.addEventListener('click', function (e) {
          if (!e.target.closest('button')) {
            go('Inbox');
          }
        });
      });
    }
  });

  // ── INBOX EMAIL ROWS → READING PANE ────────────────────
  // Each email row's click updates the reading pane with that email's content
  (function () {
    var emailList = document.querySelector('.divide-y');
    if (!emailList) return;

    var readingPane = document.getElementById('editor-area') || document.querySelector('.hidden.lg\\:flex.flex-col.flex-1');
    if (!readingPane) return;

    // Data for each email row in the list (maps to row index)
    var emails = [
      {
        subject: 'Re: Project Timeline Update',
        from: 'Sarah Jenkins', fromEmail: 'sarah.jenkins@uxmagic.ai',
        avatarSrc: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face',
        time: 'Today at 9:31 AM', badge: 'Unread', badgeClass: 'text-primary-600 bg-primary-50',
        body: '<p>Hi Alex,</p><p>I\'ve reviewed the project timeline you sent over and I have a few suggestions regarding the milestones for Q4. Overall the structure looks solid, but I think we could be more realistic about the testing phase.</p><p>Here are my thoughts:</p><ul class="list-disc pl-5 space-y-1"><li>The design handoff on <strong>October 30th</strong> feels tight — can we push to November 1st?</li><li>The QA window (Nov 4–8) needs at least 7 days, not 5.</li><li>Launch date of <strong>November 15th</strong> looks great and has executive buy-in.</li></ul><p>Best,<br><strong>Sarah</strong></p>',
        replyTo: 'Sarah Jenkins'
      },
      {
        subject: 'Weekly Inspiration Digest',
        from: 'Design Team', fromEmail: 'design@uxmagic.ai',
        initials: 'DT', initialsClass: 'bg-secondary-100 text-secondary-700',
        time: 'Today at 8:00 AM', badge: 'Unread', badgeClass: 'text-primary-600 bg-primary-50',
        body: '<p>Hi team,</p><p>Check out the latest design trends for October. We\'ve curated a list of top UI kits and resources to keep your work fresh and inspired.</p><p>Highlights this week: New Figma variables system, CSS container queries in production, and a deep dive into motion design principles.</p>',
        replyTo: 'Design Team'
      },
      {
        subject: 'Open Enrollment Reminder',
        from: 'HR Department', fromEmail: 'hr@company.io',
        initials: 'HR', initialsClass: 'bg-tertiary-100 text-tertiary-700',
        time: 'Today at 7:15 AM', badge: 'Unread', badgeClass: 'text-primary-600 bg-primary-50',
        body: '<p>This is a reminder that open enrollment for benefits ends this <strong>Friday</strong>. Please log in to the HR portal to complete your selections before the deadline.</p><p>If you have questions, contact benefits@company.io.</p>',
        replyTo: 'HR Department'
      },
      {
        subject: 'Q3 Budget Approval',
        from: 'Marcus Lee', fromEmail: 'marcus.lee@company.io',
        avatarSrc: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=40&h=40&fit=crop&crop=face',
        time: 'Yesterday', badge: 'Read', badgeClass: 'text-neutral-500 bg-neutral-50',
        body: '<p>Hi Alex,</p><p>The budget has been approved by the finance team. Please review the attached breakdown and let me know if you need any adjustments before we proceed with vendor contracts.</p>',
        replyTo: 'Marcus Lee'
      },
      {
        subject: 'Design System Audit — Final Review',
        from: 'Aisha Patel', fromEmail: 'aisha.patel@uxmagic.ai',
        initials: 'AP', initialsClass: 'bg-neutral-100 text-neutral-600',
        time: 'Yesterday', badge: 'Read', badgeClass: 'text-neutral-500 bg-neutral-50',
        body: '<p>Hi Alex,</p><p>Attaching the audit report for your review. The new button variants and spacing tokens are finalized. Please sign off when you get a chance so we can ship it to dev.</p>',
        replyTo: 'Aisha Patel'
      },
      {
        subject: 'Re: Figma Component Library Update',
        from: 'Diana Johnson', fromEmail: 'diana.j@company.io',
        avatarSrc: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face',
        time: 'Monday', badge: 'Read', badgeClass: 'text-neutral-500 bg-neutral-50',
        body: '<p>Thanks for the update! The new button variants look great. I\'ve shared them with the front-end team and they\'re excited to implement them in the next sprint.</p>',
        replyTo: 'Diana Johnson'
      },
      {
        subject: 'Onboarding Flow Feedback',
        from: 'Carlos Martinez', fromEmail: 'carlos.m@company.io',
        initials: 'CM', initialsClass: 'bg-primary-100 text-primary-700',
        time: 'Monday', badge: 'Read', badgeClass: 'text-neutral-500 bg-neutral-50',
        body: '<p>The onboarding revisions look much better. A couple of small nitpicks on step 3 but overall ready to move forward. Let\'s sync Thursday after the design review.</p>',
        replyTo: 'Carlos Martinez'
      },
      {
        subject: 'This week in product design',
        from: 'Newsletter Weekly', fromEmail: 'hello@newsletter.io',
        initials: 'NW', initialsClass: 'bg-secondary-100 text-secondary-700',
        time: 'Sunday', badge: 'Read', badgeClass: 'text-neutral-500 bg-neutral-50',
        body: '<p>Inside: Figma\'s new auto-layout updates, how Notion designs for speed, and 5 resources for UX writers.</p>',
        replyTo: 'Newsletter Weekly'
      }
    ];

    var rows = emailList.children;
    var readingScrollArea = readingPane.querySelector('.flex-1.overflow-y-auto');
    if (!readingScrollArea) return;

    function avatarHtml(email) {
      if (email.avatarSrc) {
        return '<img src="' + email.avatarSrc + '" alt="' + email.from + '" class="w-10 h-10 rounded-small object-cover flex-shrink-0">';
      }
      return '<div class="w-10 h-10 rounded-small ' + email.initialsClass + ' flex items-center justify-center flex-shrink-0"><span class="text-sm font-bold">' + email.initials + '</span></div>';
    }

    function renderEmail(email) {
      readingScrollArea.innerHTML = [
        '<div class="px-8 py-6">',
        '  <div class="mb-6">',
        '    <h1 class="font-heading text-xl font-bold text-neutral-900 mb-4">' + email.subject + '</h1>',
        '    <div class="flex items-start justify-between gap-4">',
        '      <div class="flex items-start gap-3">',
        '        ' + avatarHtml(email),
        '        <div>',
        '          <div class="flex items-center gap-2 flex-wrap">',
        '            <span class="font-semibold text-sm text-neutral-900">' + email.from + '</span>',
        '            <span class="text-xs text-neutral-400">&lt;' + email.fromEmail + '&gt;</span>',
        '          </div>',
        '          <p class="text-xs text-neutral-500 mt-0.5">To: alex@darrenmillerlaw.com &nbsp;&middot;&nbsp; ' + email.time + '</p>',
        '        </div>',
        '      </div>',
        '      <span class="text-xs font-semibold ' + email.badgeClass + ' px-2 py-1 rounded-small flex-shrink-0">' + email.badge + '</span>',
        '    </div>',
        '  </div>',
        '  <div class="text-sm text-neutral-700 leading-relaxed space-y-4">' + email.body + '</div>',
        '  <div class="mt-8 border border-neutral-200 rounded-large overflow-hidden bg-background-50 shadow-custom">',
        '    <div class="flex items-center gap-2 px-4 py-3 border-b border-neutral-200 text-xs text-neutral-500">',
        '      <span>Reply to</span>',
        '      <span class="font-semibold text-neutral-700">' + email.replyTo + '</span>',
        '    </div>',
        '    <div class="px-4 py-3 min-h-[80px] text-sm text-neutral-400 cursor-text">Click to reply...</div>',
        '    <div class="flex items-center justify-between px-4 py-3 border-t border-neutral-200 bg-background-100">',
        '      <div class="flex items-center gap-2">',
        '        <button class="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold px-4 py-2 rounded-small transition-colors">Send Reply</button>',
        '      </div>',
        '      <div class="flex items-center gap-1">',
        '        <button class="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-primary-600 hover:bg-primary-50 px-2.5 py-1.5 rounded-small transition-colors font-medium">AI Remix</button>',
        '        <button class="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-primary-600 hover:bg-primary-50 px-2.5 py-1.5 rounded-small transition-colors font-medium">AI Dictate</button>',
        '      </div>',
        '    </div>',
        '  </div>',
        '</div>',
      ].join('');
      // Re-wire the newly rendered AI buttons
      readingScrollArea.querySelectorAll('button').forEach(function (btn) {
        var t = btn.textContent.trim().toLowerCase();
        if (t === 'ai remix' || t === 'remix') btn.addEventListener('click', function (e) { e.preventDefault(); go('AI Remix Panel'); });
        if (t === 'ai dictate' || t === 'dictate') btn.addEventListener('click', function (e) { e.preventDefault(); go('AI Dictate Overlay (Copy)'); });
      });
    }

    // Generic renderer for non-Inbox pages — reads data from the row DOM
    function renderRowEmail(row) {
      var nameEl   = row.querySelector('span.font-bold, span.font-semibold, span.font-medium');
      var subjectEl = row.querySelector('p.font-semibold, p.font-medium');
      var previewEl = row.querySelector('p.line-clamp-2, p.line-clamp-1');
      var timeEl   = row.querySelector('span.text-xs.text-neutral-400');
      var imgEl    = row.querySelector('img');

      var sender  = nameEl    ? nameEl.textContent.trim()   : '';
      var subject = subjectEl ? subjectEl.textContent.trim(): '';
      var preview = previewEl ? previewEl.textContent.trim(): '';
      var time    = timeEl    ? timeEl.textContent.trim()   : '';

      var avatarHTML;
      if (imgEl) {
        avatarHTML = '<img src="' + imgEl.src + '" alt="' + sender + '" class="w-10 h-10 rounded-small object-cover flex-shrink-0">';
      } else {
        var initial = sender ? sender.charAt(0) : '?';
        avatarHTML = '<div class="w-10 h-10 rounded-small bg-primary-100 flex items-center justify-center flex-shrink-0 font-bold text-sm text-primary-700">' + initial + '</div>';
      }

      readingScrollArea.innerHTML = [
        '<div class="px-8 py-6">',
        '  <div class="mb-6">',
        '    <h1 class="font-heading text-xl font-bold text-neutral-900 mb-4">' + subject + '</h1>',
        '    <div class="flex items-start gap-3">',
        '      ' + avatarHTML,
        '      <div>',
        '        <span class="font-semibold text-sm text-neutral-900">' + sender + '</span>',
        '        <p class="text-xs text-neutral-500 mt-0.5">' + time + '</p>',
        '      </div>',
        '    </div>',
        '  </div>',
        '  <div class="text-sm text-neutral-700 leading-relaxed space-y-4">',
        '    <p>' + preview + '</p>',
        '  </div>',
        '  <div class="mt-8 border border-neutral-200 rounded-large overflow-hidden bg-background-50 shadow-custom">',
        '    <div class="flex items-center gap-2 px-4 py-3 border-b border-neutral-200 text-xs text-neutral-500">',
        '      <span>Reply to</span><span class="font-semibold text-neutral-700 ml-1">' + sender + '</span>',
        '    </div>',
        '    <div class="px-4 py-3 min-h-[80px] text-sm text-neutral-400 cursor-text">Click to reply...</div>',
        '    <div class="flex items-center justify-between px-4 py-3 border-t border-neutral-200 bg-background-100">',
        '      <button class="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold px-4 py-2 rounded-small transition-colors">Send Reply</button>',
        '      <div class="flex items-center gap-1">',
        '        <button class="text-xs text-neutral-500 hover:text-primary-600 hover:bg-primary-50 px-2.5 py-1.5 rounded-small transition-colors font-medium">AI Remix</button>',
        '        <button class="text-xs text-neutral-500 hover:text-primary-600 hover:bg-primary-50 px-2.5 py-1.5 rounded-small transition-colors font-medium">AI Dictate</button>',
        '      </div>',
        '    </div>',
        '  </div>',
        '</div>',
      ].join('');
      readingScrollArea.querySelectorAll('button').forEach(function (btn) {
        var t = btn.textContent.trim().toLowerCase();
        if (t === 'ai remix')   btn.addEventListener('click', function (e) { e.preventDefault(); go('AI Remix Panel'); });
        if (t === 'ai dictate') btn.addEventListener('click', function (e) { e.preventDefault(); go('AI Dictate Overlay (Copy)'); });
      });
    }

    for (var i = 0; i < rows.length; i++) {
      (function (row, idx) {
        row.addEventListener('click', function (e) {
          if (e.target.closest('button')) return;
          // Update active state in list
          for (var j = 0; j < rows.length; j++) {
            rows[j].classList.remove('bg-primary-50', 'border-l-2', 'border-l-primary-500');
            rows[j].classList.add('hover:bg-background-100');
          }
          row.classList.add('bg-primary-50', 'border-l-2', 'border-l-primary-500');
          row.classList.remove('hover:bg-background-100');
          // Remove the unread dot
          var dot = row.querySelector('.w-2.h-2.rounded-full.bg-primary-500');
          if (dot) dot.style.visibility = 'hidden';
          // Use hardcoded data for Inbox, DOM extraction for other mailboxes
          if (CURRENT === 'Inbox' && emails[idx]) { renderEmail(emails[idx]); }
          else { renderRowEmail(row); }
        });
      })(rows[i], i);
    }
  })();

  // ── INBOX ACTION BUTTONS → VISUAL FEEDBACK ─────────────
  (function () {
    function flashBtn(btn, successClass, icon) {
      var orig = btn.innerHTML;
      var origClass = btn.className;
      btn.innerHTML = icon + ' Done';
      btn.classList.add(successClass);
      setTimeout(function () {
        btn.innerHTML = orig;
        btn.className = origClass;
      }, 1200);
    }

    // Archive button — fades row with a brief "Archived" toast inline
    document.querySelectorAll('[title="Archive"]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var row = document.querySelector('.bg-primary-50.border-l-2');
        if (!row) return;
        // Show inline "Archived" feedback on the row
        var toast = document.createElement('span');
        toast.textContent = '✓ Archived';
        toast.style.cssText = 'position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:11px;font-weight:600;color:#15803d;background:#f0fdf4;border:1px solid #bbf7d0;padding:2px 8px;border-radius:6px;pointer-events:none;z-index:10;';
        row.style.position = 'relative';
        row.appendChild(toast);
        setTimeout(function () {
          row.style.transition = 'opacity .3s';
          row.style.opacity = '0';
          setTimeout(function () { row.style.display = 'none'; }, 320);
        }, 700);
      });
    });

    // Delete button — shows "Moved to Trash" red flash, then fades
    document.querySelectorAll('[title="Delete"]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var row = document.querySelector('.bg-primary-50.border-l-2');
        if (!row) return;
        // Flash row red briefly
        row.style.transition = 'background .15s';
        row.style.background = 'rgba(220,38,38,.08)';
        // Show inline "Moved to Trash" feedback
        var toast = document.createElement('span');
        toast.textContent = '🗑 Moved to Trash';
        toast.style.cssText = 'position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:11px;font-weight:600;color:#dc2626;background:#fef2f2;border:1px solid #fecaca;padding:2px 8px;border-radius:6px;pointer-events:none;z-index:10;';
        row.style.position = 'relative';
        row.appendChild(toast);
        setTimeout(function () {
          row.style.transition = 'opacity .3s';
          row.style.opacity = '0';
          setTimeout(function () { row.style.display = 'none'; }, 320);
        }, 900);
      });
    });

    // Star button → toggle filled/unfilled
    document.querySelectorAll('[title="Star"]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var svg = btn.querySelector('svg');
        if (!svg) return;
        if (svg.classList.contains('fill-current')) {
          svg.classList.remove('fill-current', 'text-secondary-500');
          btn.title = 'Star';
        } else {
          svg.classList.add('fill-current', 'text-secondary-500');
          btn.title = 'Unstar';
        }
      });
    });

    // Mark Unread → toggles label
    document.querySelectorAll('[title="Mark unread"]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        btn.title = btn.title === 'Mark unread' ? 'Mark read' : 'Mark unread';
        // Re-add unread dot to active row
        var row = document.querySelector('.bg-primary-50.border-l-2');
        if (row) {
          var dot = row.querySelector('.w-2.h-2.rounded-full');
          if (dot) dot.style.visibility = '';
        }
      });
    });
  })();

  // ── TRASH ACTION BUTTONS ────────────────────────────────
  // Restore — moves message back to Inbox
  document.querySelectorAll('[title="Restore"]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var row = document.querySelector('.bg-primary-50.border-l-2');
      if (!row) return;
      var toast = document.createElement('span');
      toast.textContent = '✓ Restored to Inbox';
      toast.style.cssText = 'position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:11px;font-weight:600;color:#15803d;background:#f0fdf4;border:1px solid #bbf7d0;padding:2px 8px;border-radius:6px;pointer-events:none;z-index:10;';
      row.style.position = 'relative';
      row.appendChild(toast);
      setTimeout(function () {
        row.style.transition = 'opacity .3s';
        row.style.opacity = '0';
        setTimeout(function () {
          row.style.display = 'none';
          setTimeout(function () { go('Inbox'); }, 600);
        }, 320);
      }, 800);
    });
  });

  // Delete Forever — permanently removes, no undo
  document.querySelectorAll('[title="Delete permanently"]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var row = document.querySelector('.bg-primary-50.border-l-2');
      if (!row) return;
      row.style.transition = 'background .15s';
      row.style.background = 'rgba(220,38,38,.1)';
      var toast = document.createElement('span');
      toast.textContent = '✕ Permanently deleted';
      toast.style.cssText = 'position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:11px;font-weight:600;color:#dc2626;background:#fef2f2;border:1px solid #fecaca;padding:2px 8px;border-radius:6px;pointer-events:none;z-index:10;';
      row.style.position = 'relative';
      row.appendChild(toast);
      setTimeout(function () {
        row.style.transition = 'opacity .3s';
        row.style.opacity = '0';
        setTimeout(function () { row.style.display = 'none'; }, 320);
      }, 900);
    });
  });

  // ── DRAFTS ACTION BUTTONS ───────────────────────────────
  // Delete All — fades all draft rows
  document.querySelectorAll('button').forEach(function (btn) {
    if (btn.textContent.trim() === 'Delete All') {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var emailList = document.querySelector('.divide-y');
        if (!emailList) return;
        var rows = emailList.children;
        for (var i = 0; i < rows.length; i++) {
          (function (r, delay) {
            setTimeout(function () {
              r.style.transition = 'opacity .25s';
              r.style.opacity = '0';
              setTimeout(function () { r.style.display = 'none'; }, 260);
            }, delay);
          })(rows[i], i * 120);
        }
        btn.textContent = 'Deleted';
        btn.style.color = '#dc2626';
        btn.disabled = true;
      });
    }
  });

  // Discard draft — fades the active row
  document.querySelectorAll('[title="Discard"]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var row = document.querySelector('.bg-primary-50.border-l-2');
      if (!row) return;
      row.style.transition = 'background .15s';
      row.style.background = 'rgba(220,38,38,.06)';
      setTimeout(function () {
        row.style.transition = 'opacity .3s';
        row.style.opacity = '0';
        setTimeout(function () { row.style.display = 'none'; }, 320);
      }, 500);
    });
  });

  // Quick-stat cards on dashboard
  document.querySelectorAll('section .rounded-large').forEach(function (card) {
    var t = card.textContent.toLowerCase();
    if (t.includes('events today')) {
      card.style.cursor = 'pointer';
      card.addEventListener('click', function () { go('Unified Red Enterprise Calendar'); });
    }
    if (t.includes('unread messages') || t.includes('unread')) {
      card.style.cursor = 'pointer';
      card.addEventListener('click', function () { go('Inbox'); });
    }
  });

  // ── GLASS MODE ──────────────────────────────────────────
  var _glassBg = null, _glassOv = null;

  function applyGlassMode(on) {
    if (on) {
      document.documentElement.classList.add('em-glass');
      document.body.classList.add('em-glass');
      if (!_glassBg) {
        _glassBg = document.createElement('img');
        _glassBg.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80';
        _glassBg.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;object-fit:cover;z-index:-999;pointer-events:none;';
        _glassOv = document.createElement('div');
        _glassOv.style.cssText = 'position:fixed;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.42) 0%,rgba(0,0,0,.38) 100%);z-index:-998;pointer-events:none;';
        document.body.appendChild(_glassBg);
        document.body.appendChild(_glassOv);
      } else {
        _glassBg.style.display = '';
        _glassOv.style.display = '';
      }
    } else {
      document.documentElement.classList.remove('em-glass');
      document.body.classList.remove('em-glass');
      if (_glassBg) _glassBg.style.display = 'none';
      if (_glassOv) _glassOv.style.display = 'none';
    }

    localStorage.setItem('em-glass', on ? '1' : '0');

    var btn  = document.getElementById('em-glass-toggle');
    var knob = document.getElementById('em-glass-knob');
    if (btn)  btn.style.background = on ? '#8a0909' : '#D0CAC0';
    if (knob) knob.style.transform  = on ? 'translateX(16px)' : 'translateX(0)';

    /* Update Chart.js tick colours if a chart exists on this page */
    if (window.Chart && Chart.instances) {
      var tickCol = on ? 'rgba(255,255,255,.55)' : '#6b7280';
      var gridCol = on ? 'rgba(255,255,255,.08)' : 'rgba(214,215,215,0.5)';
      Object.values(Chart.instances).forEach(function (c) {
        if (c.options && c.options.scales) {
          ['x','y'].forEach(function (ax) {
            if (c.options.scales[ax]) {
              c.options.scales[ax].ticks = c.options.scales[ax].ticks || {};
              c.options.scales[ax].ticks.color = tickCol;
              if (ax === 'y' && c.options.scales[ax].grid) {
                c.options.scales[ax].grid.color = gridCol;
              }
            }
          });
        }
        c.update();
      });
    }
  }

  document.getElementById('em-glass-toggle').addEventListener('click', function () {
    applyGlassMode(!document.body.classList.contains('em-glass'));
  });

  /* Restore mode across page loads */
  applyGlassMode(localStorage.getItem('em-glass') === '1');

  /* ── INFINITE SCROLL ─────────────────────────────────── */
  function setupInfiniteScroll() {
    var EMAIL_PAGES = ['Inbox','Starred','Sent','Drafts','Trash'];
    if (EMAIL_PAGES.indexOf(CURRENT) === -1) return;

    /* Find the email list container */
    var container;
    var emailRows = document.querySelectorAll('.email-row');
    if (emailRows.length) {
      /* New-style pages: Starred / Sent / Drafts / Trash */
      container = emailRows[0].parentElement;
      while (container && !container.classList.contains('overflow-y-auto')) {
        container = container.parentElement;
      }
    } else {
      /* Inbox: email list has divide-y divide-neutral-100 */
      container = document.querySelector('.divide-y.divide-neutral-100');
    }
    if (!container) return;

    var isNewStyle = emailRows.length > 0;

    /* ── Sample data pools ──────────────────────────────── */
    var SENDERS  = ['Alex Carter','Jamie Lee','Morgan Webb','Taylor Brooks','Casey Quinn',
                    'Riley Stone','Jordan Park','Dana Walsh','Sam Rivera','Chris Novak',
                    'Patricia Wells','Marcus Bellamy','Elena Reyes','David Kim','Sophia Martinez',
                    'Nathan Cole','Priya Sharma','Ben Okafor','Lena Fischer','Omar Hassan'];
    var TIMES    = ['2m ago','8m ago','14m ago','22m ago','47m ago','1h ago','2h ago',
                    '3h ago','Yesterday','Mon','Tue','Oct 14','Oct 12','Oct 10','Oct 8'];
    var SUBJECTS = ['Re: Q4 Strategy Review','Updated Contract Terms','Meeting Follow-up',
                    'New Client Onboarding','Invoice #2847 Attached','Re: Project Deadline',
                    'Quarterly Report Draft','Team Standup Notes','Re: Budget Approval',
                    'Compliance Update','Document Review Request','Re: Case No. 4481',
                    'Settlement Discussion','Board Meeting Agenda','Policy Amendment',
                    'Re: Deposition Scheduling','Client Intake Form','Retainer Agreement'];
    var PREVIEWS = ['Please review the attached documents before our meeting on Thursday morning...',
                    'Following up on our conversation from last week regarding the proposed changes...',
                    'I wanted to circle back on the open items from the last review session...',
                    'The team has completed their analysis and the findings are summarized below...',
                    'Could you please confirm your availability for the call next week? We need to...',
                    'Attached you will find the revised version with all requested amendments applied...',
                    'As discussed, I am forwarding the relevant case files for your immediate review...',
                    'Just a quick note to confirm the details we discussed earlier this afternoon...'];
    var COLORS   = [['bg-blue-100','text-blue-700'],['bg-green-100','text-green-700'],
                    ['bg-purple-100','text-purple-700'],['bg-orange-100','text-orange-700'],
                    ['bg-teal-100','text-teal-700'],['bg-rose-100','text-rose-700'],
                    ['bg-amber-100','text-amber-700'],['bg-indigo-100','text-indigo-700']];

    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
    function initials(name) { return name.split(' ').map(function(w){return w[0];}).join('').slice(0,2).toUpperCase(); }

    function makeNewStyleRow() {
      var name = pick(SENDERS), col = pick(COLORS);
      var div = document.createElement('div');
      div.className = 'email-row px-4 py-3 cursor-pointer border-b border-neutral-100';
      div.innerHTML = '<div class="flex items-start gap-3">'
        + '<div class="flex-shrink-0 mt-0.5"><div class="w-8 h-8 rounded-full ' + col[0] + ' flex items-center justify-center">'
        + '<span class="text-xs font-bold ' + col[1] + '">' + initials(name) + '</span></div></div>'
        + '<div class="flex-1 min-w-0">'
        + '<div class="flex items-center justify-between mb-0.5">'
        + '<span class="text-sm font-semibold text-neutral-900 truncate">' + name + '</span>'
        + '<span class="text-xs text-neutral-400 flex-shrink-0 ml-2">' + pick(TIMES) + '</span>'
        + '</div>'
        + '<p class="text-xs font-medium text-neutral-700 truncate mb-0.5">' + pick(SUBJECTS) + '</p>'
        + '<p class="text-xs text-neutral-500 truncate">' + pick(PREVIEWS) + '</p>'
        + '</div></div>';
      div.addEventListener('click', function() {
        document.querySelectorAll('.email-row').forEach(function(r){ r.classList.remove('selected'); });
        div.classList.add('selected');
      });
      return div;
    }

    function makeInboxRow() {
      var name = pick(SENDERS), col = pick(COLORS);
      var div = document.createElement('div');
      div.className = 'flex items-start gap-3 px-4 py-3.5 cursor-pointer hover:bg-background-100 transition-colors';
      div.innerHTML = '<div class="w-9 h-9 rounded-small ' + col[0] + ' flex items-center justify-center flex-shrink-0 mt-0.5">'
        + '<span class="text-sm font-bold ' + col[1] + '">' + initials(name) + '</span></div>'
        + '<div class="flex-1 min-w-0">'
        + '<div class="flex items-center justify-between gap-2 mb-0.5">'
        + '<span class="text-sm font-medium text-neutral-700 truncate">' + name + '</span>'
        + '<span class="text-xs text-neutral-400 flex-shrink-0">' + pick(TIMES) + '</span>'
        + '</div>'
        + '<p class="text-sm font-medium text-neutral-600 truncate">' + pick(SUBJECTS) + '</p>'
        + '<p class="text-xs text-neutral-400 mt-0.5 line-clamp-2">' + pick(PREVIEWS) + '</p>'
        + '</div>';
      return div;
    }

    /* ── Spinner + keyframe ─────────────────────────────── */
    if (!document.getElementById('em-inf-style')) {
      var st = document.createElement('style');
      st.id = 'em-inf-style';
      st.textContent = '@keyframes em-spin{to{transform:rotate(360deg)}}';
      document.head.appendChild(st);
    }
    var spinner = document.createElement('div');
    spinner.style.cssText = 'display:none;align-items:center;justify-content:center;padding:14px;gap:8px;';
    spinner.innerHTML = '<div style="width:16px;height:16px;border:2px solid #e5e7eb;border-top-color:#dc2626;border-radius:50%;animation:em-spin .7s linear infinite;flex-shrink:0"></div>'
      + '<span style="font-size:11.5px;color:#9ca3af;font-family:sans-serif">Loading more…</span>';

    /* ── Sentinel (triggers load when scrolled into view) ─ */
    var sentinel = document.createElement('div');
    sentinel.style.height = '1px';

    container.appendChild(spinner);
    container.appendChild(sentinel);

    var loading = false;

    var observer = new IntersectionObserver(function(entries) {
      if (!entries[0].isIntersecting || loading) return;
      loading = true;
      spinner.style.display = 'flex';
      setTimeout(function() {
        for (var i = 0; i < 8; i++) {
          container.insertBefore(isNewStyle ? makeNewStyleRow() : makeInboxRow(), spinner);
        }
        spinner.style.display = 'none';
        loading = false;
      }, 650);
    }, { root: container, rootMargin: '0px', threshold: 0.1 });

    observer.observe(sentinel);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupInfiniteScroll);
  } else {
    setupInfiniteScroll();
  }

})();
