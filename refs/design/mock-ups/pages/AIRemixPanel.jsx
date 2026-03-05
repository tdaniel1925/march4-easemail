import React from 'react';

const AIRemixPanel = () => {
  return (
    <>
      

<div className="flex" style={{minHeight: '100vh'}}>

  <!-- LEFT SIDEBAR (dimmed) -->
  <aside className="hidden lg:flex flex-col w-64 bg-background-50 border-r border-neutral-200 flex-shrink-0 opacity-30 pointer-events-none select-none">
    <div className="flex items-center gap-3 px-6 py-5 border-b border-neutral-200">
      <div className="w-8 h-8 bg-primary-500 rounded-small flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-neutral-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
      </div>
      <span className="font-heading font-semibold text-neutral-900 text-lg">MailFlow</span>
    </div>
    <div className="px-4 py-4">
      <div className="w-full flex items-center justify-center gap-2 bg-primary-500 text-neutral-50 font-medium text-sm py-2.5 px-4 rounded-small">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg>
        Compose
      </div>
    </div>
    <nav className="flex-1 px-3 pb-4">
      <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-3 mb-2">Mailboxes</p>
      <ul className="space-y-0.5">
        <li><div className="flex items-center gap-3 px-3 py-2 rounded-small text-neutral-600 text-sm"><svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>Inbox<span className="ml-auto bg-primary-500 text-neutral-50 text-xs font-semibold px-2 py-0.5 rounded-small">12</span></div></li>
        <li><div className="flex items-center gap-3 px-3 py-2 rounded-small text-neutral-600 text-sm"><svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>Sent</div></li>
        <li><div className="flex items-center gap-3 px-3 py-2 rounded-small bg-primary-50 text-primary-700 font-medium text-sm"><svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>Drafts<span className="ml-auto bg-neutral-200 text-neutral-600 text-xs font-semibold px-2 py-0.5 rounded-small">3</span></div></li>
      </ul>
      <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-3 mb-2 mt-4">AI Tools</p>
      <ul className="space-y-0.5">
        <li><div className="flex items-center gap-3 px-3 py-2 rounded-small text-neutral-600 text-sm"><svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>AI Composer</div></li>
        <li><div className="flex items-center gap-3 px-3 py-2 rounded-small bg-primary-50 text-primary-700 font-medium text-sm"><svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>AI Remix</div></li>
        <li><div className="flex items-center gap-3 px-3 py-2 rounded-small text-neutral-600 text-sm"><svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>AI Dictate</div></li>
      </ul>
    </nav>
    <div className="px-4 py-4 border-t border-neutral-200">
      <div className="flex items-center gap-3">
        <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face" alt="User" className="w-9 h-9 rounded-small object-cover">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-neutral-900 truncate">Alex Morgan</p>
          <p className="text-xs text-neutral-500 truncate">alex@mailflow.io</p>
        </div>
      </div>
    </div>
  </aside>

  <!-- MAIN AREA -->
  <div className="flex flex-col flex-1 relative">

    <!-- COMPOSER BACKGROUND (dimmed) -->
    <div className="flex flex-col flex-1 bg-background-50 opacity-20 pointer-events-none select-none" style={{maxHeight: 900, overflow: 'hidden'}}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <h2 className="font-heading font-semibold text-neutral-900 text-base">New Message</h2>
          <span className="text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-small font-medium">Draft saved</span>
        </div>
      </div>
      <div className="border-b border-neutral-200">
        <div className="flex items-center gap-3 px-6 py-3 border-b border-neutral-100">
          <span className="text-xs font-semibold text-neutral-400 w-12">To</span>
          <div className="flex gap-1.5">
            <span className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 border border-primary-200 rounded-small px-2 py-0.5 text-xs font-medium">Sarah Chen</span>
            <span className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 border border-primary-200 rounded-small px-2 py-0.5 text-xs font-medium">David Park</span>
          </div>
        </div>
        <div className="flex items-center gap-3 px-6 py-3">
          <span className="text-xs font-semibold text-neutral-400 w-12">Subject</span>
          <span className="text-sm font-semibold text-neutral-900">Q3 Design Review — Action Items & Next Steps</span>
        </div>
      </div>
      <div className="px-8 py-6">
        <p className="text-sm text-neutral-700 mb-3">Hi Sarah and David,</p>
        <p className="text-sm text-neutral-700 mb-3">I hope you're both doing well! Following up on our discussion from last week's design sync, I wanted to share the key action items and next steps for the Q3 design review process.</p>
        <p className="text-sm font-semibold text-neutral-900 mb-2">Action Items:</p>
        <ul className="text-sm text-neutral-700 space-y-1 pl-5 mb-3" style={{listStyleType: 'disc'}}>
          <li>Finalize the component library audit report by Friday, Oct 25</li>
          <li>Review and approve the updated button variants in the Figma file</li>
        </ul>
      </div>
    </div>

    <!-- OVERLAY BACKDROP -->
    <div className="absolute inset-0 overlay-bg z-10"></div>

    <!-- AI REMIX OVERLAY PANEL -->
    <div className="absolute inset-0 z-20 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-2xl bg-background-50 rounded-large remix-panel-shadow flex flex-col overflow-hidden" style={{maxHeight: 900}}>

        <!-- PANEL HEADER -->
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-background-50 flex-shrink-0" style={{maxHeight: 72}}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 ai-gradient-bg rounded-small flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-neutral-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            </div>
            <div>
              <h2 className="font-heading font-semibold text-neutral-900 text-base leading-tight">AI Remix</h2>
              <p className="text-xs text-neutral-500">Rewrite your email with a different tone or style</p>
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold text-primary-600 bg-primary-50 border border-primary-100 px-2 py-0.5 rounded-small ai-badge-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              MailFlow AI
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a href="/api/copilot/prototype/3af3e7e8-faf3-4b36-a888-633eb80526b0/email-composer-window" className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded-small transition-colors border border-neutral-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12"></path></svg>
              Composer
            </a>
            <a href="/api/copilot/prototype/3af3e7e8-faf3-4b36-a888-633eb80526b0/email-composer-window" className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-small transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
            </a>
          </div>
        </div>

        <!-- SCROLLABLE CONTENT -->
        <div className="flex-1 overflow-y-auto">

          <!-- SECTION 1: Tone Selection -->
          <div className="px-6 pt-5 pb-5 border-b border-neutral-200" style={{background: 'linear-gradient(to bottom, rgb(var(--color-primary-50)), rgb(var(--color-background-50)))', maxHeight: 220}}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading text-sm font-semibold text-neutral-800">Select Tone</h3>
              <span className="text-xs text-neutral-400">Choose how your email should sound</span>
            </div>
            <div className="grid grid-cols-4 gap-2.5">

              <!-- Professional (active) -->
              <button className="tone-card-active rounded-large p-3 flex flex-col items-center gap-2 cursor-pointer">
                <div className="w-9 h-9 bg-white bg-opacity-20 rounded-small flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5 text-neutral-50" style={{width: 18, height: 18}} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-neutral-50 leading-tight">Professional</p>
                  <p className="text-xs text-white text-opacity-70 leading-tight mt-0.5" style={{fontSize: 10}}>Formal & clear</p>
                </div>
                <div className="w-4 h-4 bg-white bg-opacity-30 rounded-small flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-neutral-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                </div>
              </button>

              <!-- Casual -->
              <button className="tone-card-hover rounded-large p-3 flex flex-col items-center gap-2 cursor-pointer border-2 border-neutral-200 bg-background-50">
                <div className="w-9 h-9 bg-secondary-100 rounded-small flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5 text-secondary-600" style={{width: 18, height: 18}} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-neutral-800 leading-tight">Casual</p>
                  <p className="text-neutral-500 leading-tight mt-0.5" style={{fontSize: 10}}>Friendly & warm</p>
                </div>
                <div className="w-4 h-4 border-2 border-neutral-300 rounded-small flex-shrink-0 bg-background-50"></div>
              </button>

              <!-- Persuasive -->
              <button className="tone-card-hover rounded-large p-3 flex flex-col items-center gap-2 cursor-pointer border-2 border-neutral-200 bg-background-50">
                <div className="w-9 h-9 bg-primary-100 rounded-small flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5 text-primary-600" style={{width: 18, height: 18}} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-neutral-800 leading-tight">Persuasive</p>
                  <p className="text-neutral-500 leading-tight mt-0.5" style={{fontSize: 10}}>Compelling & bold</p>
                </div>
                <div className="w-4 h-4 border-2 border-neutral-300 rounded-small flex-shrink-0 bg-background-50"></div>
              </button>

              <!-- Concise -->
              <button className="tone-card-hover rounded-large p-3 flex flex-col items-center gap-2 cursor-pointer border-2 border-neutral-200 bg-background-50">
                <div className="w-9 h-9 bg-tertiary-100 rounded-small flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5 text-tertiary-600" style={{width: 18, height: 18}} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h8m-8 6h16"></path></svg>
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-neutral-800 leading-tight">Concise</p>
                  <p className="text-neutral-500 leading-tight mt-0.5" style={{fontSize: 10}}>Short & direct</p>
                </div>
                <div className="w-4 h-4 border-2 border-neutral-300 rounded-small flex-shrink-0 bg-background-50"></div>
              </button>

            </div>
          </div>

          <!-- SECTION 2: Style Presets -->
          <div className="px-6 py-4 border-b border-neutral-200 bg-background-50" style={{maxHeight: 140}}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading text-sm font-semibold text-neutral-800">Style Presets</h3>
              <button className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors">+ Custom</button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="preset-chip preset-chip-active text-xs font-medium px-3 py-1.5 rounded-small border-2 transition-all">
                Executive Brief
              </button>
              <button className="preset-chip text-xs font-medium text-neutral-600 px-3 py-1.5 rounded-small border-2 border-neutral-200 bg-background-50 transition-all">
                Team Update
              </button>
              <button className="preset-chip text-xs font-medium text-neutral-600 px-3 py-1.5 rounded-small border-2 border-neutral-200 bg-background-50 transition-all">
                Client Proposal
              </button>
              <button className="preset-chip text-xs font-medium text-neutral-600 px-3 py-1.5 rounded-small border-2 border-neutral-200 bg-background-50 transition-all">
                Follow-up
              </button>
              <button className="preset-chip text-xs font-medium text-neutral-600 px-3 py-1.5 rounded-small border-2 border-neutral-200 bg-background-50 transition-all">
                Cold Outreach
              </button>
              <button className="preset-chip text-xs font-medium text-neutral-600 px-3 py-1.5 rounded-small border-2 border-neutral-200 bg-background-50 transition-all">
                Apology
              </button>
              <button className="preset-chip text-xs font-medium text-neutral-600 px-3 py-1.5 rounded-small border-2 border-neutral-200 bg-background-50 transition-all">
                Thank You
              </button>
            </div>
          </div>

          <!-- SECTION 3: Remix Settings Row -->
          <div className="px-6 py-3.5 border-b border-neutral-200 bg-background-100" style={{maxHeight: 80}}>
            <div className="flex items-center gap-6 flex-wrap">
              <!-- Length -->
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-neutral-500 flex-shrink-0">Length</span>
                <div className="flex items-center gap-1">
                  <button className="text-xs px-2.5 py-1 rounded-small border border-neutral-200 text-neutral-500 hover:border-primary-300 hover:text-primary-600 bg-background-50 transition-all">Shorter</button>
                  <button className="text-xs px-2.5 py-1 rounded-small border-2 border-primary-300 text-primary-700 bg-primary-50 font-medium">Same</button>
                  <button className="text-xs px-2.5 py-1 rounded-small border border-neutral-200 text-neutral-500 hover:border-primary-300 hover:text-primary-600 bg-background-50 transition-all">Longer</button>
                </div>
              </div>
              <div className="w-px h-5 bg-neutral-200 flex-shrink-0"></div>
              <!-- Formality slider -->
              <div className="flex items-center gap-2 flex-1 min-w-40">
                <span className="text-xs font-semibold text-neutral-500 flex-shrink-0">Formality</span>
                <div className="flex-1 relative h-1.5 bg-neutral-200 rounded-small overflow-hidden">
                  <div className="strength-bar absolute left-0 top-0 h-full rounded-small" style={{width: '75%'}}></div>
                </div>
                <span className="text-xs font-semibold text-primary-600 flex-shrink-0">High</span>
              </div>
              <div className="w-px h-5 bg-neutral-200 flex-shrink-0"></div>
              <!-- Emoji toggle -->
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-neutral-500">Emoji</span>
                <div className="w-8 h-4 bg-neutral-200 rounded-small relative cursor-pointer flex-shrink-0">
                  <div className="w-3 h-3 bg-neutral-400 rounded-small absolute top-0.5 left-0.5 transition-all"></div>
                </div>
                <span className="text-xs text-neutral-400">Off</span>
              </div>
            </div>
          </div>

          <!-- SECTION 4: Remixed Preview -->
          <div className="px-6 py-5 border-b border-neutral-200 bg-background-50" style={{maxHeight: 380}}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-sm font-semibold text-neutral-800">Remixed Preview</h3>
                <span className="flex items-center gap-1 text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-small border border-primary-100">
                  <span className="w-1.5 h-1.5 rounded-small bg-primary-500 ai-badge-pulse flex-shrink-0"></span>
                  Professional
                </span>
              </div>
              <div className="flex items-center gap-2">
                <!-- Diff toggle -->
                <button className="flex items-center gap-1 text-xs font-medium text-tertiary-700 bg-tertiary-50 border border-tertiary-200 px-2.5 py-1 rounded-small hover:bg-tertiary-100 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                  Show Diff
                </button>
                <!-- Regenerate -->
                <button className="flex items-center gap-1 text-xs font-medium text-neutral-600 border border-neutral-200 px-2.5 py-1 rounded-small hover:bg-background-100 transition-colors shadow-custom">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                  Regenerate
                </button>
              </div>
            </div>

            <!-- Preview card -->
            <div className="bg-background-100 border border-neutral-200 rounded-large p-4 shadow-custom" style={{maxHeight: 280, overflowY: 'auto'}}>

              <!-- AI quality bar -->
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-neutral-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                <span className="text-xs text-neutral-500">AI Quality Score</span>
                <div className="flex-1 h-1.5 bg-neutral-200 rounded-small overflow-hidden">
                  <div className="remix-shimmer h-full rounded-small" style={{width: '88%'}}></div>
                </div>
                <span className="text-xs font-semibold text-primary-600">88%</span>
                <div className="flex items-center gap-1 ml-1">
                  <span className="text-xs text-neutral-400">Changes:</span>
                  <span className="text-xs font-semibold text-tertiary-600">+12</span>
                  <span className="text-xs font-semibold text-primary-500">-8</span>
                </div>
              </div>

              <!-- Remixed email content with diff highlights -->
              <div className="text-sm text-neutral-700 leading-relaxed space-y-3">
                <p>
                  <span className="diff-removed">Hi</span>
                  <span className="diff-added"> Dear</span>
                  Sarah and David,
                </p>
                <p>
                  <span className="diff-removed">I hope you're both doing well!</span>
                  <span className="diff-added"> I trust this message finds you well.</span>
                  Following up on our discussion from last week's design sync, I
                  <span className="diff-removed">wanted to share</span>
                  <span className="diff-added"> am writing to outline</span>
                  the key action items and next steps for the Q3 design review process.
                </p>
                <p className="font-semibold text-neutral-900">
                  <span className="diff-added">Summary of Required Actions:</span>
                  <span className="diff-removed">Action Items:</span>
                </p>
                <ul className="space-y-1.5 pl-5" style={{listStyleType: 'disc'}}>
                  <li>
                    <span className="diff-added">Please ensure the</span>
                    <span className="diff-removed">Finalize the</span>
                    component library audit report
                    <span className="diff-added">is completed and submitted</span>
                    by Friday, October 25
                  </li>
                  <li>
                    <span className="diff-added">Kindly review and provide approval for</span>
                    <span className="diff-removed">Review and approve</span>
                    the updated button variants in the Figma file
                  </li>
                  <li>
                    <span className="diff-added">We should schedule a dedicated</span>
                    <span className="diff-removed">Schedule a</span>
                    30-minute sync with the engineering team to
                    <span className="diff-added">align on</span>
                    <span className="diff-removed">discuss</span>
                    handoff timelines
                  </li>
                </ul>
                <p>
                  <span className="diff-removed">Please let me know if you have any questions or if there's anything I've missed.</span>
                  <span className="diff-added">Should you have any questions or require clarification on any of the above points, please do not hesitate to reach out.</span>
                  <span className="diff-removed">Looking forward to getting everyone aligned before the end of the week.</span>
                  <span className="diff-added"> I look forward to your confirmation.</span>
                </p>
                <p>
                  <span className="diff-removed">Best regards,</span>
                  <span className="diff-added">Kind regards,</span>
                  <br>Alex<span className="cursor-blink inline-block w-0.5 h-4 bg-primary-500 ml-0.5 align-middle"></span>
                </p>
              </div>
            </div>

            <!-- Diff legend -->
            <div className="flex items-center gap-4 mt-2.5">
              <div className="flex items-center gap-1.5">
                <span className="diff-added text-xs px-1.5 py-0.5">Added</span>
                <span className="text-xs text-neutral-400">New content</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="diff-removed text-xs px-1.5 py-0.5">Removed</span>
                <span className="text-xs text-neutral-400">Original content</span>
              </div>
            </div>
          </div>

          <!-- SECTION 5: Comparison Stats -->
          <div className="px-6 py-4 border-b border-neutral-200 bg-background-100" style={{maxHeight: 120}}>
            <div className="grid grid-cols-4 gap-3">
              <div className="flex items-center gap-2.5 p-3 bg-background-50 rounded-large border border-neutral-200 shadow-custom">
                <div className="w-7 h-7 bg-primary-100 rounded-small flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path></svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">138</p>
                  <p className="text-xs text-neutral-500">Words</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 p-3 bg-background-50 rounded-large border border-neutral-200 shadow-custom">
                <div className="w-7 h-7 bg-secondary-100 rounded-small flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">+15%</p>
                  <p className="text-xs text-neutral-500">Longer</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 p-3 bg-background-50 rounded-large border border-neutral-200 shadow-custom">
                <div className="w-7 h-7 bg-tertiary-100 rounded-small flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-tertiary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">High</p>
                  <p className="text-xs text-neutral-500">Clarity</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 p-3 bg-background-50 rounded-large border border-neutral-200 shadow-custom">
                <div className="w-7 h-7 bg-primary-100 rounded-small flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">Formal</p>
                  <p className="text-xs text-neutral-500">Tone</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- PANEL FOOTER — Accept / Reject Controls -->
        <div className="flex-shrink-0 border-t border-neutral-200 bg-background-50 px-6 py-4">
          <div className="flex items-center gap-3">

            <!-- Reject / Keep Original -->
            <button className="flex items-center gap-2 border-2 border-neutral-200 text-neutral-600 hover:border-primary-200 hover:text-primary-600 hover:bg-primary-50 font-medium text-sm py-2.5 px-4 rounded-small transition-all shadow-custom flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
              Reject
            </button>

            <!-- Try Another Tone -->
            <button className="flex items-center gap-2 border-2 border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-background-100 font-medium text-sm py-2.5 px-4 rounded-small transition-all shadow-custom flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              Try Another
            </button>

            <!-- Edit Before Accepting -->
            <button className="flex items-center gap-2 border-2 border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-background-100 font-medium text-sm py-2.5 px-4 rounded-small transition-all shadow-custom flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              Edit First
            </button>

            <!-- Accept Remix (primary CTA) -->
            <button className="flex-1 flex items-center justify-center gap-2 ai-gradient-bg text-neutral-50 font-semibold text-sm py-2.5 px-5 rounded-small transition-all accept-btn-glow">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
              Accept Remix
            </button>

          </div>

          <!-- Flow navigation row -->
          <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-neutral-200 flex-wrap">
            <a href="/api/copilot/prototype/3af3e7e8-faf3-4b36-a888-633eb80526b0/inbox-compose-trigger" className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-primary-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
              Inbox
            </a>
            <span className="text-neutral-300">·</span>
            <a href="/api/copilot/prototype/3af3e7e8-faf3-4b36-a888-633eb80526b0/email-composer-window" className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-primary-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              Composer
            </a>
            <span className="text-neutral-300">·</span>
            <span className="flex items-center gap-1.5 text-xs text-primary-600 font-semibold">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              AI Remix
            </span>
            <span className="text-neutral-300">·</span>
            <a href="/api/copilot/prototype/3af3e7e8-faf3-4b36-a888-633eb80526b0/ai-dictate-mode" className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-secondary-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
              AI Dictate
            </a>
            <span className="text-neutral-300">·</span>
            <a href="/api/copilot/prototype/3af3e7e8-faf3-4b36-a888-633eb80526b0/voice-message-recorder" className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-tertiary-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.536 8.464a5 5 0 010 7.072M12 18.364V21m0 0H9m3 0h3M12 3v2.636m0 0a5 5 0 015 5v2.728M12 5.636a5 5 0 00-5 5v2.728"></path></svg>
              Voice Recorder
            </a>
          </div>
        </div>

      </div>
    </div>

  </div>
</div>




    </>
  );
};

export default AIRemixPanel;