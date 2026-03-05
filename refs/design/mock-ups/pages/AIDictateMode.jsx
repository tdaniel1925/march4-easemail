import React from 'react';

const AIDictateMode = () => {
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
        <li><div className="flex items-center gap-3 px-3 py-2 rounded-small text-neutral-600 text-sm"><svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>AI Remix</div></li>
        <li><div className="flex items-center gap-3 px-3 py-2 rounded-small bg-primary-50 text-primary-700 font-medium text-sm"><svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>AI Dictate</div></li>
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
    <div className="flex flex-col flex-1 bg-background-50 opacity-25 pointer-events-none select-none" style={{maxHeight: 900, overflow: 'hidden'}}>
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

    <!-- AI DICTATE OVERLAY PANEL -->
    <div className="absolute inset-0 z-20 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl bg-background-50 rounded-large dictate-panel-shadow flex flex-col overflow-hidden" style={{maxHeight: 860}}>

        <!-- PANEL HEADER -->
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-background-50 flex-shrink-0" style={{maxHeight: 72}}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 ai-gradient-bg rounded-small flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-neutral-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
            </div>
            <div>
              <h2 className="font-heading font-semibold text-neutral-900 text-base leading-tight">AI Dictate</h2>
              <p className="text-xs text-neutral-500">Speak naturally — AI transcribes in real-time</p>
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

          <!-- SECTION 1: Waveform Visualizer + Status -->
          <div className="px-6 pt-5 pb-5 border-b border-neutral-200" style={{background: 'linear-gradient(to bottom, rgb(var(--color-primary-50)), rgb(var(--color-background-50)))', maxHeight: 230}}>

            <!-- Status bar -->
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="timer-dot w-2.5 h-2.5 rounded-small bg-primary-500 flex-shrink-0"></span>
                <span className="text-sm font-semibold text-neutral-800">Recording</span>
                <span className="text-sm font-mono font-semibold text-primary-600 ml-1">0:42</span>
              </div>
              <div className="flex items-center gap-3">
                <!-- Noise level -->
                <div className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.536 8.464a5 5 0 010 7.072M12 18.364V21m0 0H9m3 0h3M12 3v2.636m0 0a5 5 0 015 5v2.728M12 5.636a5 5 0 00-5 5v2.728"></path></svg>
                  <div className="flex items-end gap-0.5 h-4">
                    <div className="noise-bar w-1 bg-primary-300 rounded-small" style={{height: 6}}></div>
                    <div className="noise-bar w-1 bg-primary-400 rounded-small" style={{height: 10}}></div>
                    <div className="noise-bar w-1 bg-primary-500 rounded-small" style={{height: 14}}></div>
                    <div className="noise-bar w-1 bg-primary-400 rounded-small" style={{height: 10}}></div>
                    <div className="noise-bar w-1 bg-primary-300 rounded-small" style={{height: 6}}></div>
                  </div>
                  <span className="text-xs text-neutral-500">Good signal</span>
                </div>

                <!-- Language Selector -->
                <div className="lang-dropdown">
                  <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-background-50 border border-neutral-200 rounded-small shadow-custom hover:border-neutral-300 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path></svg>
                    <span className="text-xs font-semibold text-neutral-700">English (US)</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                  <div className="lang-dropdown-menu">
                    <div className="px-3 py-2 border-b border-neutral-100">
                      <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Language</p>
                    </div>
                    <div className="lang-option active">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                      English (US)
                    </div>
                    <div className="lang-option">
                      <span className="w-3.5 h-3.5 flex-shrink-0"></span>
                      English (UK)
                    </div>
                    <div className="lang-option">
                      <span className="w-3.5 h-3.5 flex-shrink-0"></span>
                      Spanish
                    </div>
                    <div className="lang-option">
                      <span className="w-3.5 h-3.5 flex-shrink-0"></span>
                      French
                    </div>
                    <div className="lang-option">
                      <span className="w-3.5 h-3.5 flex-shrink-0"></span>
                      German
                    </div>
                    <div className="lang-option">
                      <span className="w-3.5 h-3.5 flex-shrink-0"></span>
                      Japanese
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Waveform bars -->
            <div className="flex items-center justify-center gap-1.5" style={{height: 96}}>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
            </div>
          </div>

          <!-- SECTION 2: Live Transcription -->
          <div className="px-6 py-5 border-b border-neutral-200 bg-background-50" style={{maxHeight: 320}}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-sm font-semibold text-neutral-800">Live Transcription</h3>
                <span className="flex items-center gap-1 text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-small border border-primary-100">
                  <span className="timer-dot w-1.5 h-1.5 rounded-small bg-primary-500"></span>
                  Live
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-700 transition-colors px-2 py-1 hover:bg-neutral-100 rounded-small">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                  Edit
                </button>
                <button className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-700 transition-colors px-2 py-1 hover:bg-neutral-100 rounded-small">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  Clear
                </button>
              </div>
            </div>

            <!-- Transcription text area -->
            <div className="bg-background-100 border border-neutral-200 rounded-large p-4 relative shadow-custom" style={{maxHeight: 200, overflowY: 'auto'}}>
              <!-- Confidence indicator -->
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-200">
                <span className="text-xs text-neutral-500">Confidence</span>
                <div className="flex-1 h-1.5 bg-neutral-200 rounded-small overflow-hidden">
                  <div className="confidence-bar h-full rounded-small" style={{width: '94%'}}></div>
                </div>
                <span className="text-xs font-semibold text-primary-600">94%</span>
              </div>

              <!-- Transcribed text -->
              <div className="text-sm text-neutral-800 leading-relaxed">
                <span className="word-appear" style={{animationDelay: '0s'}}>Hi</span>
                <span className="word-appear" style={{animationDelay: '0.05s'}}> Sarah</span>
                <span className="word-appear" style={{animationDelay: '0.1s'}}> and</span>
                <span className="word-appear" style={{animationDelay: '0.15s'}}> David,</span>
                <span className="word-appear" style={{animationDelay: '0.2s'}}> I</span>
                <span className="word-appear" style={{animationDelay: '0.25s'}}> wanted</span>
                <span className="word-appear" style={{animationDelay: '0.3s'}}> to</span>
                <span className="word-appear" style={{animationDelay: '0.35s'}}> follow</span>
                <span className="word-appear" style={{animationDelay: '0.4s'}}> up</span>
                <span className="word-appear" style={{animationDelay: '0.45s'}}> on</span>
                <span className="word-appear" style={{animationDelay: '0.5s'}}> our</span>
                <span className="word-appear" style={{animationDelay: '0.55s'}}> design</span>
                <span className="word-appear" style={{animationDelay: '0.6s'}}> sync</span>
                <span className="word-appear" style={{animationDelay: '0.65s'}}> from</span>
                <span className="word-appear" style={{animationDelay: '0.7s'}}> last</span>
                <span className="word-appear" style={{animationDelay: '0.75s'}}> week.</span>
                <span className="word-appear" style={{animationDelay: '0.8s'}}> I</span>
                <span className="word-appear" style={{animationDelay: '0.85s'}}> just</span>
                <span className="word-appear" style={{animationDelay: '0.9s'}}> wanted</span>
                <span className="word-appear" style={{animationDelay: '0.95s'}}> to</span>
                <span className="word-appear" style={{animationDelay: '1.0s'}}> quickly</span>
                <span className="word-appear" style={{animationDelay: '1.05s'}}> recap</span>
                <span className="word-appear" style={{animationDelay: '1.1s'}}> the</span>
                <span className="word-appear" style={{animationDelay: '1.15s'}}> three</span>
                <span className="word-appear" style={{animationDelay: '1.2s'}}> main</span>
                <span className="word-appear" style={{animationDelay: '1.25s'}}> action</span>
                <span className="word-appear" style={{animationDelay: '1.3s'}}> items</span>
                <span className="word-appear" style={{animationDelay: '1.35s'}}> we</span>
                <span className="word-appear" style={{animationDelay: '1.4s'}}> discussed</span>
                <span className="word-appear" style={{animationDelay: '1.45s'}}> and</span>
                <span className="word-appear" style={{animationDelay: '1.5s'}}> make</span>
                <span className="word-appear" style={{animationDelay: '1.55s'}}> sure</span>
                <span className="word-appear" style={{animationDelay: '1.6s'}}> everyone</span>
                <span className="word-appear" style={{animationDelay: '1.65s'}}> is</span>
                <span className="word-appear" style={{animationDelay: '1.7s'}}> aligned</span>
                <span className="word-appear" style={{animationDelay: '1.75s'}}> on</span>
                <span className="word-appear" style={{animationDelay: '1.8s'}}> the</span>
                <span className="word-appear" style={{animationDelay: '1.85s'}}> next</span>
                <span className="word-appear" style={{animationDelay: '1.9s'}}> steps</span>
                <span className="word-appear" style={{animationDelay: '1.95s'}}> before</span>
                <span className="word-appear" style={{animationDelay: '2.0s'}}> the</span>
                <span className="word-appear" style={{animationDelay: '2.05s'}}> end</span>
                <span className="word-appear" style={{animationDelay: '2.1s'}}> of</span>
                <span className="word-appear" style={{animationDelay: '2.15s'}}> the</span>
                <span className="word-appear" style={{animationDelay: '2.2s'}}> week.</span>
                <span className="bg-primary-100 text-primary-800 px-0.5 rounded-small word-appear" style={{animationDelay: '2.3s'}}> First</span>
                <span className="bg-primary-100 text-primary-800 px-0.5 rounded-small word-appear" style={{animationDelay: '2.4s'}}> of</span>
                <span className="bg-primary-100 text-primary-800 px-0.5 rounded-small word-appear" style={{animationDelay: '2.5s'}}> all,</span>
                <span className="cursor-blink inline-block w-0.5 h-4 bg-primary-500 ml-0.5 align-middle"></span>
              </div>

              <!-- Word count badge -->
              <div className="absolute bottom-3 right-3">
                <span className="text-xs text-neutral-400 bg-background-50 border border-neutral-200 px-2 py-0.5 rounded-small">52 words</span>
              </div>
            </div>

            <!-- Smart suggestions row -->
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-neutral-400 flex-shrink-0">AI suggests:</span>
              <button className="flex items-center gap-1 text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 border border-primary-200 px-2.5 py-1 rounded-small transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg>
                Add greeting
              </button>
              <button className="flex items-center gap-1 text-xs font-medium text-secondary-700 bg-secondary-50 hover:bg-secondary-100 border border-secondary-200 px-2.5 py-1 rounded-small transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                Format as list
              </button>
              <button className="flex items-center gap-1 text-xs font-medium text-tertiary-700 bg-tertiary-50 hover:bg-tertiary-100 border border-tertiary-200 px-2.5 py-1 rounded-small transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                Make concise
              </button>
            </div>
          </div>

          <!-- SECTION 3: Mic Controls -->
          <div className="px-6 py-6 border-b border-neutral-200 bg-background-50" style={{maxHeight: 200}}>
            <div className="flex items-center justify-center gap-6">

              <!-- Restart button -->
              <button className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-large border-2 border-neutral-200 group-hover:border-neutral-300 bg-background-50 group-hover:bg-background-100 flex items-center justify-center transition-all shadow-custom">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-neutral-500 group-hover:text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                </div>
                <span className="text-xs text-neutral-500 group-hover:text-neutral-700 font-medium">Restart</span>
              </button>

              <!-- Pause button -->
              <button className="flex flex-col items-center gap-2 group">
                <div className="w-14 h-14 rounded-large border-2 border-secondary-300 group-hover:border-secondary-400 bg-secondary-50 group-hover:bg-secondary-100 flex items-center justify-center transition-all shadow-custom">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-secondary-600 group-hover:text-secondary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <span className="text-xs text-secondary-600 group-hover:text-secondary-700 font-medium">Pause</span>
              </button>

              <!-- Mic button (main) — with pulse rings -->
              <button className="flex flex-col items-center gap-2 group relative">
                <div className="relative flex items-center justify-center">
                  <div className="mic-pulse absolute w-20 h-20 rounded-large border-2 border-primary-400 opacity-40"></div>
                  <div className="mic-pulse-2 absolute w-20 h-20 rounded-large border-2 border-primary-300 opacity-30"></div>
                  <div className="mic-pulse-3 absolute w-20 h-20 rounded-large border-2 border-primary-200 opacity-20"></div>
                  <div className="w-20 h-20 rounded-large ai-gradient-bg flex items-center justify-center shadow-custom-hover relative z-10 group-hover:opacity-90 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-neutral-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                  </div>
                </div>
                <span className="text-xs text-primary-600 font-semibold">Recording…</span>
              </button>

              <!-- Stop button -->
              <button className="flex flex-col items-center gap-2 group">
                <div className="w-14 h-14 rounded-large border-2 border-primary-200 group-hover:border-primary-300 bg-primary-50 group-hover:bg-primary-100 flex items-center justify-center transition-all shadow-custom">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-primary-500 group-hover:text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"></path></svg>
                </div>
                <span className="text-xs text-primary-500 group-hover:text-primary-600 font-medium">Stop</span>
              </button>

              <!-- Settings button -->
              <button className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-large border-2 border-neutral-200 group-hover:border-neutral-300 bg-background-50 group-hover:bg-background-100 flex items-center justify-center transition-all shadow-custom">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-neutral-500 group-hover:text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                </div>
                <span className="text-xs text-neutral-500 group-hover:text-neutral-700 font-medium">Settings</span>
              </button>

            </div>
          </div>

          <!-- SECTION 4: Dictation Settings — Language + Punctuation Toggle -->
          <div className="px-6 py-4 border-b border-neutral-200 bg-background-100" style={{maxHeight: 160}}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading text-sm font-semibold text-neutral-800">Dictation Settings</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">

              <!-- Language selector card -->
              <div className="flex items-center justify-between p-3 bg-background-50 rounded-large border border-neutral-200 shadow-custom">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-primary-100 rounded-small flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path></svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-800">Language</p>
                    <p className="text-xs text-neutral-500">Speech recognition</p>
                  </div>
                </div>
                <div className="lang-dropdown">
                  <button className="flex items-center gap-1 px-2 py-1 bg-background-100 border border-neutral-200 rounded-small hover:border-neutral-300 transition-colors">
                    <span className="text-xs font-semibold text-neutral-700">EN (US)</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                  <div className="lang-dropdown-menu">
                    <div className="lang-option active">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                      English (US)
                    </div>
                    <div className="lang-option">
                      <span className="w-3.5 h-3.5 flex-shrink-0"></span>
                      English (UK)
                    </div>
                    <div className="lang-option">
                      <span className="w-3.5 h-3.5 flex-shrink-0"></span>
                      Spanish
                    </div>
                    <div className="lang-option">
                      <span className="w-3.5 h-3.5 flex-shrink-0"></span>
                      French
                    </div>
                    <div className="lang-option">
                      <span className="w-3.5 h-3.5 flex-shrink-0"></span>
                      German
                    </div>
                  </div>
                </div>
              </div>

              <!-- Punctuation auto-insert toggle card -->
              <div className="flex items-center justify-between p-3 bg-background-50 rounded-large border border-neutral-200 shadow-custom">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-secondary-100 rounded-small flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-800">Auto-Punctuate</p>
                    <p className="text-xs text-neutral-500">Insert commas & periods</p>
                  </div>
                </div>
                <div className="toggle-track on" onclick="this.classList.toggle('on'); this.classList.toggle('off');">
                  <div className="toggle-thumb"></div>
                </div>
              </div>

            </div>
          </div>

          <!-- SECTION 5: Dictation Stats -->
          <div className="px-6 py-4 border-b border-neutral-200 bg-background-100" style={{maxHeight: 120}}>
            <div className="grid grid-cols-3 gap-3">
              <!-- Duration -->
              <div className="flex items-center gap-3 p-3 bg-background-50 rounded-large border border-neutral-200 shadow-custom">
                <div className="w-8 h-8 bg-primary-100 rounded-small flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900 font-mono">0:42</p>
                  <p className="text-xs text-neutral-500">Duration</p>
                </div>
              </div>
              <!-- Words -->
              <div className="flex items-center gap-3 p-3 bg-background-50 rounded-large border border-neutral-200 shadow-custom">
                <div className="w-8 h-8 bg-secondary-100 rounded-small flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path></svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">52</p>
                  <p className="text-xs text-neutral-500">Words</p>
                </div>
              </div>
              <!-- Speed -->
              <div className="flex items-center gap-3 p-3 bg-background-50 rounded-large border border-neutral-200 shadow-custom">
                <div className="w-8 h-8 bg-tertiary-100 rounded-small flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-tertiary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">74 <span className="text-xs font-normal text-neutral-500">wpm</span></p>
                  <p className="text-xs text-neutral-500">Speed</p>
                </div>
              </div>
            </div>
          </div>

          <!-- SECTION 6: Insert Options -->
          <div className="px-6 py-4 bg-background-50" style={{maxHeight: 120}}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading text-sm font-semibold text-neutral-800">Insert Options</h3>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer">
                <div className="w-4 h-4 rounded-small bg-primary-500 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-neutral-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <span className="text-xs text-neutral-700 font-medium">Auto-punctuate</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <div className="w-4 h-4 rounded-small bg-primary-500 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-neutral-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <span className="text-xs text-neutral-700 font-medium">Fix grammar</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <div className="w-4 h-4 rounded-small border-2 border-neutral-300 flex-shrink-0 bg-background-50"></div>
                <span className="text-xs text-neutral-600">Append to existing</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <div className="w-4 h-4 rounded-small border-2 border-neutral-300 flex-shrink-0 bg-background-50"></div>
                <span className="text-xs text-neutral-600">Replace selection</span>
              </label>
            </div>
          </div>

        </div>

        <!-- PANEL FOOTER -->
        <div className="flex-shrink-0 border-t border-neutral-200 bg-background-50 px-6 py-4">
          <div className="flex items-center gap-3">

            <!-- Discard -->
            <button className="flex items-center gap-2 border border-neutral-200 text-neutral-600 hover:bg-background-100 font-medium text-sm py-2.5 px-4 rounded-small transition-colors shadow-custom flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
              Discard
            </button>

            <!-- Copy text -->
            <button className="flex items-center gap-2 border border-neutral-200 text-neutral-600 hover:bg-background-100 font-medium text-sm py-2.5 px-4 rounded-small transition-colors shadow-custom flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              Copy
            </button>

            <!-- Insert into Email (primary CTA) -->
            <button className="flex-1 flex items-center justify-center gap-2 ai-gradient-bg text-neutral-50 font-semibold text-sm py-2.5 px-5 rounded-small transition-all shadow-custom hover:shadow-custom-hover">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              Insert into Email
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
            <a href="/api/copilot/prototype/3af3e7e8-faf3-4b36-a888-633eb80526b0/ai-remix-panel" className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-primary-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              AI Remix
            </a>
            <span className="text-neutral-300">·</span>
            <span className="flex items-center gap-1.5 text-xs text-primary-600 font-semibold">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
              AI Dictate
            </span>
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

export default AIDictateMode;