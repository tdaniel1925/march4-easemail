import React from 'react';

const EmailComposerWindow = () => {
  return (
    <>
      

<div className="flex" style={{minHeight: 960}}>

  <!-- LEFT SIDEBAR -->
  <aside className="hidden lg:flex flex-col w-64 bg-background-50 border-r border-neutral-200 flex-shrink-0">

    <!-- Logo -->
    <div className="flex items-center gap-3 px-6 py-5 border-b border-neutral-200">
      <div className="w-8 h-8 bg-primary-500 rounded-small flex items-center justify-center flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-neutral-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
      </div>
      <span className="font-heading font-semibold text-neutral-900 text-lg">MailFlow</span>
    </div>

    <!-- Compose Button -->
    <div className="px-4 py-4">
      <a href="/api/copilot/prototype/3af3e7e8-faf3-4b36-a888-633eb80526b0/email-composer-window" className="w-full flex items-center justify-center gap-2 ai-gradient-bg text-neutral-50 font-semibold text-sm py-3 px-4 rounded-small compose-btn-glow transition-all cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg>
        Compose
        <span className="ml-1 flex items-center gap-0.5 bg-white bg-opacity-20 px-1.5 py-0.5 rounded-small text-xs font-medium ai-badge-pulse">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          AI
        </span>
      </a>
    </div>

    <!-- Navigation -->
    <nav className="flex-1 px-3 pb-4 overflow-y-auto">
      <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-3 mb-2">Mailboxes</p>
      <ul className="space-y-0.5 mb-5">
        <li>
          <a href="/api/copilot/prototype/3af3e7e8-faf3-4b36-a888-633eb80526b0/inbox-compose-trigger" className="flex items-center gap-3 px-3 py-2.5 rounded-small text-neutral-600 hover:bg-background-100 text-sm cursor-pointer transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
            Inbox
            <span className="ml-auto bg-primary-500 text-neutral-50 text-xs font-semibold px-2 py-0.5 rounded-small">12</span>
          </a>
        </li>
        <li>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-small text-neutral-600 hover:bg-background-100 text-sm cursor-pointer transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
            Starred
          </div>
        </li>
        <li>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-small text-neutral-600 hover:bg-background-100 text-sm cursor-pointer transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
            Sent
          </div>
        </li>
        <li>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-small bg-primary-50 text-primary-700 font-semibold text-sm cursor-pointer transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Drafts
            <span className="ml-auto bg-neutral-200 text-neutral-600 text-xs font-semibold px-2 py-0.5 rounded-small">3</span>
          </div>
        </li>
        <li>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-small text-neutral-600 hover:bg-background-100 text-sm cursor-pointer transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
            Archive
          </div>
        </li>
      </ul>

      <!-- AI Tools -->
      <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-3 mb-2">AI Tools</p>
      <ul className="space-y-0.5">
        <li>
          <a href="/api/copilot/prototype/3af3e7e8-faf3-4b36-a888-633eb80526b0/email-composer-window" className="flex items-center gap-3 px-3 py-2 rounded-small bg-primary-50 text-primary-700 font-semibold text-sm cursor-pointer transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            AI Composer
          </a>
        </li>
        <li>
          <a href="/api/copilot/prototype/3af3e7e8-faf3-4b36-a888-633eb80526b0/ai-remix-panel" className="flex items-center gap-3 px-3 py-2 rounded-small text-neutral-600 hover:bg-primary-50 hover:text-primary-700 text-sm cursor-pointer transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            AI Remix
          </a>
        </li>
        <li>
          <a href="/api/copilot/prototype/3af3e7e8-faf3-4b36-a888-633eb80526b0/ai-dictate-mode" className="flex items-center gap-3 px-3 py-2 rounded-small text-neutral-600 hover:bg-primary-50 hover:text-primary-700 text-sm cursor-pointer transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
            AI Dictate
          </a>
        </li>
        <li>
          <a href="/api/copilot/prototype/3af3e7e8-faf3-4b36-a888-633eb80526b0/voice-message-recorder" className="flex items-center gap-3 px-3 py-2 rounded-small text-neutral-600 hover:bg-primary-50 hover:text-primary-700 text-sm cursor-pointer transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.536 8.464a5 5 0 010 7.072M12 18.364V21m0 0H9m3 0h3M12 3v2.636m0 0a5 5 0 015 5v2.728M12 5.636a5 5 0 00-5 5v2.728"></path></svg>
            Voice Recorder
          </a>
        </li>
      </ul>
    </nav>

    <!-- User Profile -->
    <div className="px-4 py-4 border-t border-neutral-200">
      <div className="flex items-center gap-3">
        <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face" alt="User" className="w-9 h-9 rounded-small object-cover flex-shrink-0">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-neutral-900 truncate">Alex Morgan</p>
          <p className="text-xs text-neutral-500 truncate">alex@mailflow.io</p>
        </div>
        <button className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-background-100 rounded-small transition-colors flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
        </button>
      </div>
    </div>
  </aside>

  <!-- MAIN CONTENT -->
  <div className="flex flex-col flex-1 bg-background-100">

    <!-- TOP HEADER -->
    <header className="flex items-center justify-between px-6 py-4 bg-background-50 border-b border-neutral-200 flex-shrink-0" style={{maxHeight: 72}}>
      <div className="flex items-center gap-3">
        <a href="/api/copilot/prototype/3af3e7e8-faf3-4b36-a888-633eb80526b0/inbox-compose-trigger" className="flex items-center gap-2 text-sm text-neutral-500 hover:text-primary-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12"></path></svg>
          Back to Inbox
        </a>
        <span className="text-neutral-300">/</span>
        <h1 className="font-heading font-semibold text-neutral-900 text-base">New Message</h1>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-tertiary-50 border border-tertiary-200 rounded-small">
          <span className="draft-saved-dot w-1.5 h-1.5 rounded-small bg-tertiary-500 flex-shrink-0"></span>
          <span className="text-xs font-medium text-tertiary-700">Draft saved</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-600 border border-neutral-200 rounded-small hover:bg-background-100 transition-colors shadow-custom">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
          Save Draft
        </button>
        <button className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-background-100 rounded-small transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
    </header>

    <!-- COMPOSER WINDOW -->
    <div className="flex-1 px-6 py-5 overflow-y-auto" style={{maxHeight: 900}}>
      <div className="max-w-4xl mx-auto bg-background-50 rounded-large composer-shadow border border-neutral-200 flex flex-col overflow-hidden">

        <!-- COMPOSER HEADER -->
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-background-50 flex-shrink-0" style={{maxHeight: 64}}>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 ai-gradient-bg rounded-small flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-neutral-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            </div>
            <h2 className="font-heading font-semibold text-neutral-900 text-sm">Compose New Email</h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-background-100 rounded-small transition-colors" title="Minimize">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20 12H4"></path></svg>
            </button>
            <button className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-background-100 rounded-small transition-colors" title="Expand">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
            </button>
            <button className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-background-100 rounded-small transition-colors" title="Close">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        </div>

        <!-- TO FIELD -->
        <div className="flex items-center gap-3 px-6 py-3 border-b border-neutral-100" style={{maxHeight: 56}}>
          <span className="text-xs font-semibold text-neutral-400 w-14 flex-shrink-0">To</span>
          <div className="flex flex-wrap items-center gap-1.5 flex-1">
            <span className="recipient-chip">
              Sarah Chen
              <button>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </span>
            <span className="recipient-chip">
              David Park
              <button>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </span>
            <input type="text" placeholder="Add recipient…" className="flex-1 min-w-32 text-sm text-neutral-700 placeholder-neutral-400 bg-transparent border-none outline-none focus:outline-none">
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="text-xs font-medium text-neutral-500 hover:text-primary-600 px-2 py-1 rounded-small hover:bg-primary-50 transition-colors">CC</button>
            <button className="text-xs font-medium text-neutral-500 hover:text-primary-600 px-2 py-1 rounded-small hover:bg-primary-50 transition-colors">BCC</button>
          </div>
        </div>

        <!-- CC FIELD -->
        <div className="flex items-center gap-3 px-6 py-3 border-b border-neutral-100" style={{maxHeight: 52}}>
          <span className="text-xs font-semibold text-neutral-400 w-14 flex-shrink-0">CC</span>
          <div className="flex flex-wrap items-center gap-1.5 flex-1">
            <span className="inline-flex items-center gap-1 bg-neutral-100 text-neutral-600 border border-neutral-200 rounded-small px-2 py-0.5 text-xs font-medium">
              Priya Nair
              <button className="text-neutral-400 hover:text-neutral-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </span>
            <input type="text" placeholder="Add CC…" className="flex-1 min-w-32 text-sm text-neutral-700 placeholder-neutral-400 bg-transparent border-none outline-none focus:outline-none">
          </div>
        </div>

        <!-- SUBJECT FIELD -->
        <div className="flex items-center gap-3 px-6 py-3 border-b border-neutral-200" style={{maxHeight: 52}}>
          <span className="text-xs font-semibold text-neutral-400 w-14 flex-shrink-0">Subject</span>
          <input type="text" value="Q3 Design Review — Action Items & Next Steps" className="flex-1 text-sm font-semibold text-neutral-900 bg-transparent border-none outline-none focus:outline-none placeholder-neutral-400">
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-xs text-neutral-400 bg-background-100 border border-neutral-200 px-2 py-0.5 rounded-small">High Priority</span>
            <button className="p-1 text-neutral-400 hover:text-neutral-600 rounded-small hover:bg-background-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"></path></svg>
            </button>
          </div>
        </div>

        <!-- AI FEATURE BUTTONS TOOLBAR -->
        <div className="px-6 py-3 border-b border-neutral-200 ai-section-glow flex-shrink-0" style={{maxHeight: 72}}>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-neutral-500 flex-shrink-0 flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              AI Features
            </span>
            <div className="w-px h-5 bg-neutral-200 flex-shrink-0"></div>

            <!-- AI Remix Button -->
            <a href="/api/copilot/prototype/3af3e7e8-faf3-4b36-a888-633eb80526b0/ai-remix-panel" className="flex items-center gap-2 ai-remix-btn text-neutral-50 font-semibold text-xs py-2 px-3.5 rounded-small transition-all cursor-pointer flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              AI Remix
              <span className="bg-white bg-opacity-20 text-neutral-50 text-xs px-1.5 py-0.5 rounded-small font-medium">Rewrite</span>
            </a>

            <!-- AI Dictate Button -->
            <a href="/api/copilot/prototype/3af3e7e8-faf3-4b36-a888-633eb80526b0/ai-dictate-mode" className="flex items-center gap-2 ai-dictate-btn text-neutral-50 font-semibold text-xs py-2 px-3.5 rounded-small transition-all cursor-pointer flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
              AI Dictate
              <span className="bg-white bg-opacity-20 text-neutral-50 text-xs px-1.5 py-0.5 rounded-small font-medium">Speak</span>
            </a>

            <!-- Voice Message Button -->
            <a href="/api/copilot/prototype/3af3e7e8-faf3-4b36-a888-633eb80526b0/voice-message-recorder" className="flex items-center gap-2 ai-voice-btn text-neutral-50 font-semibold text-xs py-2 px-3.5 rounded-small transition-all cursor-pointer flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.536 8.464a5 5 0 010 7.072M12 18.364V21m0 0H9m3 0h3M12 3v2.636m0 0a5 5 0 015 5v2.728M12 5.636a5 5 0 00-5 5v2.728"></path></svg>
              Voice Message
              <span className="bg-white bg-opacity-20 text-neutral-50 text-xs px-1.5 py-0.5 rounded-small font-medium">Record</span>
            </a>

            <div className="ml-auto flex items-center gap-1.5">
              <span className="text-xs text-neutral-400">Powered by</span>
              <span className="text-xs font-semibold text-primary-600 bg-primary-50 border border-primary-100 px-2 py-0.5 rounded-small">MailFlow AI</span>
            </div>
          </div>
        </div>

        <!-- RICH TEXT TOOLBAR -->
        <div className="flex items-center gap-1 px-5 py-2.5 border-b border-neutral-200 bg-background-50 flex-wrap flex-shrink-0" style={{maxHeight: 52}}>
          <!-- Text style -->
          <div className="flex items-center gap-0.5">
            <select className="text-xs text-neutral-600 bg-transparent border border-neutral-200 rounded-small px-2 py-1 focus:outline-none focus:border-primary-300 cursor-pointer">
              <option>Paragraph</option>
              <option>Heading 1</option>
              <option>Heading 2</option>
            </select>
          </div>
          <div className="format-divider"></div>
          <!-- Font size -->
          <div className="flex items-center gap-0.5">
            <select className="text-xs text-neutral-600 bg-transparent border border-neutral-200 rounded-small px-2 py-1 focus:outline-none focus:border-primary-300 cursor-pointer w-14">
              <option>14</option>
              <option>16</option>
              <option>18</option>
            </select>
          </div>
          <div className="format-divider"></div>
          <!-- Bold, Italic, Underline, Strike -->
          <div className="flex items-center gap-0.5">
            <button className="toolbar-btn active" title="Bold">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z"></path></svg>
            </button>
            <button className="toolbar-btn" title="Italic">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 4h4M8 20h4M12 4l-4 16"></path></svg>
            </button>
            <button className="toolbar-btn" title="Underline">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 4v6a5 5 0 0010 0V4M5 20h14"></path></svg>
            </button>
            <button className="toolbar-btn" title="Strikethrough">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 15s1.5 2 4.5 2 4.5-2 4.5-2M9 9s1.5-2 4.5-2 4.5 2 4.5 2M4 12h16"></path></svg>
            </button>
          </div>
          <div className="format-divider"></div>
          <!-- Lists -->
          <div className="flex items-center gap-0.5">
            <button className="toolbar-btn" title="Bullet List">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
            <button className="toolbar-btn" title="Numbered List">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"></path></svg>
            </button>
          </div>
          <div className="format-divider"></div>
          <!-- Alignment -->
          <div className="flex items-center gap-0.5">
            <button className="toolbar-btn active" title="Align Left">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 6h18M3 12h12M3 18h15"></path></svg>
            </button>
            <button className="toolbar-btn" title="Align Center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 6h18M6 12h12M4 18h16"></path></svg>
            </button>
          </div>
          <div className="format-divider"></div>
          <!-- Link, Image, Attachment -->
          <div className="flex items-center gap-0.5">
            <button className="toolbar-btn" title="Insert Link">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
            </button>
            <button className="toolbar-btn" title="Insert Image">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </button>
            <button className="toolbar-btn" title="Attach File">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
            </button>
          </div>
          <div className="format-divider"></div>
          <!-- Emoji, More -->
          <div className="flex items-center gap-0.5">
            <button className="toolbar-btn" title="Emoji">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </button>
            <button className="toolbar-btn" title="More options">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
            </button>
          </div>
        </div>

        <!-- EMAIL BODY EDITOR -->
        <div className="flex-1 px-8 py-6 bg-background-50" style={{minHeight: 320, maxHeight: 420, overflowY: 'auto'}}>
          <div className="text-sm text-neutral-700 leading-relaxed space-y-4 outline-none" contentEditable="true">
            <p>Hi Sarah and David,</p>
            <p>I hope you're both doing well! Following up on our discussion from last week's design sync, I wanted to share the key action items and next steps for the Q3 design review process.</p>
            <p className="font-semibold text-neutral-900">Action Items:</p>
            <ul className="space-y-1.5 pl-5" style={{listStyleType: 'disc'}}>
              <li>Finalize the component library audit report by Friday, Oct 25</li>
              <li>Review and approve the updated button variants in the Figma file</li>
              <li>Schedule a 30-minute sync with the engineering team to discuss handoff timelines</li>
            </ul>
            <p>Please let me know if you have any questions or if there's anything I've missed. Looking forward to getting everyone aligned before the end of the week.</p>
            <p>Best regards,<br>Alex<span className="cursor-blink inline-block w-0.5 h-4 bg-primary-500 ml-0.5 align-middle"></span></p>
          </div>
        </div>

        <!-- ATTACHMENTS ROW -->
        <div className="px-6 py-3 border-t border-neutral-100 bg-background-100 flex-shrink-0" style={{maxHeight: 64}}>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-semibold text-neutral-500 flex-shrink-0">Attachments</span>
            <div className="flex items-center gap-1.5 bg-background-50 border border-neutral-200 rounded-small px-2.5 py-1.5 shadow-custom">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              <span className="text-xs text-neutral-700 font-medium">Q3_Design_Review.pdf</span>
              <span className="text-xs text-neutral-400">2.4 MB</span>
              <button className="text-neutral-400 hover:text-neutral-600 ml-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <button className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-primary-600 border border-dashed border-neutral-300 hover:border-primary-300 rounded-small px-2.5 py-1.5 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg>
              Add file
            </button>
          </div>
        </div>

        <!-- COMPOSER FOOTER / SEND BAR -->
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200 bg-background-50 flex-shrink-0" style={{maxHeight: 72}}>
          <div className="flex items-center gap-2">
            <!-- Send Button -->
            <button className="flex items-center gap-2 ai-gradient-bg text-neutral-50 font-semibold text-sm py-2.5 px-5 rounded-small compose-btn-glow transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
              Send
            </button>
            <!-- Send Later dropdown -->
            <button className="flex items-center gap-1.5 text-sm font-medium text-neutral-600 border border-neutral-200 hover:bg-background-100 py-2.5 px-3 rounded-small transition-colors shadow-custom">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Schedule
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"></path></svg>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <!-- Word count -->
            <span className="text-xs text-neutral-400">~120 words</span>
            <div className="w-px h-4 bg-neutral-200"></div>
            <!-- Discard -->
            <button className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-primary-600 hover:bg-primary-50 px-2.5 py-1.5 rounded-small transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              Discard
            </button>
          </div>
        </div>

      </div>

      <!-- FLOW NAVIGATION BREADCRUMB -->
      <div className="max-w-4xl mx-auto mt-4 flex items-center justify-center gap-4 pb-4">
        <a href="/api/copilot/prototype/3af3e7e8-faf3-4b36-a888-633eb80526b0/inbox-compose-trigger" className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-primary-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
          Inbox
        </a>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path></svg>
        <span className="flex items-center gap-1.5 text-xs text-primary-600 font-semibold">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          Composer
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path></svg>
        <a href="/api/copilot/prototype/3af3e7e8-faf3-4b36-a888-633eb80526b0/ai-remix-panel" className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-primary-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          AI Remix
        </a>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path></svg>
        <a href="/api/copilot/prototype/3af3e7e8-faf3-4b36-a888-633eb80526b0/ai-dictate-mode" className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-secondary-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
          AI Dictate
        </a>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path></svg>
        <a href="/api/copilot/prototype/3af3e7e8-faf3-4b36-a888-633eb80526b0/voice-message-recorder" className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-tertiary-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.536 8.464a5 5 0 010 7.072M12 18.364V21m0 0H9m3 0h3M12 3v2.636m0 0a5 5 0 015 5v2.728M12 5.636a5 5 0 00-5 5v2.728"></path></svg>
          Voice Message
        </a>
      </div>

    </div>
  </div>
</div>




    </>
  );
};

export default EmailComposerWindow;