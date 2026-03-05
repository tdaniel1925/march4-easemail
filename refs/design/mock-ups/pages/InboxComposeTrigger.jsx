import React from 'react';

const InboxComposeTrigger = () => {
  return (
    <>
      

<div className="flex" style={{minHeight: 900}}>

  <!-- LEFT SIDEBAR -->
  <aside className="hidden lg:flex flex-col w-64 bg-background-50 border-r border-neutral-200 flex-shrink-0">

    <!-- Logo -->
    <div className="flex items-center gap-3 px-6 py-5 border-b border-neutral-200">
      <div className="w-8 h-8 bg-primary-500 rounded-small flex items-center justify-center flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-neutral-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
      </div>
      <span className="font-heading font-semibold text-neutral-900 text-lg">MailFlow</span>
    </div>

    <!-- Compose Button (Primary CTA) -->
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
          <a href="/api/copilot/prototype/3af3e7e8-faf3-4b36-a888-633eb80526b0/inbox-compose-trigger" className="flex items-center gap-3 px-3 py-2.5 rounded-small bg-primary-50 text-primary-700 font-semibold text-sm cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
            Inbox
            <span className="ml-auto bg-primary-500 text-neutral-50 text-xs font-semibold px-2 py-0.5 rounded-small">12</span>
          </a>
        </li>
        <li>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-small text-neutral-600 hover:bg-background-100 text-sm cursor-pointer transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
            Starred
            <span className="ml-auto bg-neutral-200 text-neutral-600 text-xs font-semibold px-2 py-0.5 rounded-small">4</span>
          </div>
        </li>
        <li>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-small text-neutral-600 hover:bg-background-100 text-sm cursor-pointer transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
            Sent
          </div>
        </li>
        <li>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-small text-neutral-600 hover:bg-background-100 text-sm cursor-pointer transition-colors">
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
        <li>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-small text-neutral-600 hover:bg-background-100 text-sm cursor-pointer transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            Trash
          </div>
        </li>
      </ul>

      <!-- Labels -->
      <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-3 mb-2">Labels</p>
      <ul className="space-y-0.5 mb-5">
        <li>
          <div className="flex items-center gap-3 px-3 py-2 rounded-small text-neutral-600 hover:bg-background-100 text-sm cursor-pointer transition-colors">
            <span className="w-2.5 h-2.5 rounded-small bg-primary-400 flex-shrink-0"></span>
            Work
            <span className="ml-auto bg-neutral-200 text-neutral-600 text-xs font-semibold px-2 py-0.5 rounded-small">7</span>
          </div>
        </li>
        <li>
          <div className="flex items-center gap-3 px-3 py-2 rounded-small text-neutral-600 hover:bg-background-100 text-sm cursor-pointer transition-colors">
            <span className="w-2.5 h-2.5 rounded-small bg-tertiary-400 flex-shrink-0"></span>
            Personal
            <span className="ml-auto bg-neutral-200 text-neutral-600 text-xs font-semibold px-2 py-0.5 rounded-small">2</span>
          </div>
        </li>
        <li>
          <div className="flex items-center gap-3 px-3 py-2 rounded-small text-neutral-600 hover:bg-background-100 text-sm cursor-pointer transition-colors">
            <span className="w-2.5 h-2.5 rounded-small bg-secondary-400 flex-shrink-0"></span>
            Newsletters
          </div>
        </li>
      </ul>

      <!-- AI Features -->
      <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-3 mb-2">AI Tools</p>
      <ul className="space-y-0.5">
        <li>
          <a href="/api/copilot/prototype/3af3e7e8-faf3-4b36-a888-633eb80526b0/email-composer-window" className="flex items-center gap-3 px-3 py-2 rounded-small text-neutral-600 hover:bg-primary-50 hover:text-primary-700 text-sm cursor-pointer transition-colors">
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
  <div className="flex flex-col flex-1">

    <!-- TOP HEADER BAR -->
    <header className="flex items-center justify-between px-6 py-4 bg-background-50 border-b border-neutral-200 flex-shrink-0" style={{maxHeight: 72}}>
      <div className="flex items-center gap-4">
        <h1 className="font-heading font-semibold text-neutral-900 text-xl">Inbox</h1>
        <span className="bg-primary-100 text-primary-700 text-xs font-semibold px-2.5 py-1 rounded-small">12 unread</span>
      </div>
      <div className="flex items-center gap-3">
        <!-- Search -->
        <div className="relative hidden md:block">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input type="text" placeholder="Search emails…" className="pl-9 pr-4 py-2 text-sm bg-background-100 border border-neutral-200 rounded-small text-neutral-700 placeholder-neutral-400 focus:outline-none focus:border-primary-300 focus:bg-background-50 w-64 transition-colors">
        </div>
        <!-- Filter -->
        <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-neutral-600 border border-neutral-200 rounded-small hover:bg-background-100 transition-colors shadow-custom">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
          Filter
        </button>
        <!-- Notification -->
        <button className="relative p-2 text-neutral-500 hover:text-neutral-700 hover:bg-background-100 rounded-small transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-small"></span>
        </button>
      </div>
    </header>

    <!-- AI COMPOSE BANNER -->
    <div className="mx-6 mt-4 mb-2 flex-shrink-0" style={{maxHeight: 80}}>
      <div className="flex items-center justify-between bg-primary-50 border border-primary-200 rounded-large px-5 py-3 shadow-custom">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 ai-gradient-bg rounded-small flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-neutral-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-primary-800">AI-Powered Email Composer</p>
            <p className="text-xs text-primary-600">Write smarter with AI Remix, Dictate, and Voice Recording</p>
          </div>
        </div>
        <a href="/api/copilot/prototype/3af3e7e8-faf3-4b36-a888-633eb80526b0/email-composer-window" className="flex items-center gap-2 ai-gradient-bg text-neutral-50 font-semibold text-sm py-2 px-4 rounded-small compose-btn-glow transition-all flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg>
          New Email
        </a>
      </div>
    </div>

    <!-- EMAIL LIST TABS -->
    <div className="px-6 pt-3 pb-0 flex-shrink-0" style={{maxHeight: 52}}>
      <div className="flex items-center gap-1 border-b border-neutral-200">
        <button className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-primary-600 border-b-2 border-primary-500 -mb-px transition-colors">
          All
          <span className="bg-primary-100 text-primary-700 text-xs font-bold px-1.5 py-0.5 rounded-small">12</span>
        </button>
        <button className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-neutral-500 hover:text-neutral-700 border-b-2 border-transparent -mb-px transition-colors">
          Unread
          <span className="bg-neutral-200 text-neutral-600 text-xs font-bold px-1.5 py-0.5 rounded-small">8</span>
        </button>
        <button className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-neutral-500 hover:text-neutral-700 border-b-2 border-transparent -mb-px transition-colors">
          Flagged
        </button>
        <button className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-neutral-500 hover:text-neutral-700 border-b-2 border-transparent -mb-px transition-colors">
          Attachments
        </button>
        <div className="ml-auto flex items-center gap-2 pb-1">
          <button className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-700 px-2 py-1 rounded-small hover:bg-background-100 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"></path></svg>
            Newest
          </button>
        </div>
      </div>
    </div>

    <!-- EMAIL LIST -->
    <div className="flex-1 overflow-y-auto bg-background-50" style={{maxHeight: 760}}>

      <!-- Email Row 1 — Unread, High Priority -->
      <div className="email-row flex items-start gap-4 px-6 py-4 border-b border-neutral-100 cursor-pointer transition-colors bg-background-50">
        <div className="flex flex-col items-center gap-2 pt-1 flex-shrink-0">
          <div className="unread-dot"></div>
          <button className="star-icon text-neutral-300 hover:text-secondary-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
          </button>
        </div>
        <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face" alt="Sarah Chen" className="w-10 h-10 rounded-small object-cover flex-shrink-0 mt-0.5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-neutral-900">Sarah Chen</span>
              <span className="tag-chip bg-primary-100 text-primary-700 border border-primary-200">Work</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-neutral-400">10:32 AM</span>
            </div>
          </div>
          <p className="text-sm font-semibold text-neutral-800 truncate mb-0.5">Q3 Design Review — Action Items & Next Steps</p>
          <p className="text-sm text-neutral-500 truncate">Hi Alex, following up on our design sync from last week. I wanted to share the key action items and confirm everyone is aligned before the deadline…</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="flex items-center gap-1 text-xs text-neutral-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
              2 attachments
            </span>
          </div>
        </div>
      </div>

      <!-- Email Row 2 — Unread -->
      <div className="email-row flex items-start gap-4 px-6 py-4 border-b border-neutral-100 cursor-pointer transition-colors bg-background-50">
        <div className="flex flex-col items-center gap-2 pt-1 flex-shrink-0">
          <div className="unread-dot"></div>
          <button className="star-icon text-secondary-400 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
          </button>
        </div>
        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face" alt="David Park" className="w-10 h-10 rounded-small object-cover flex-shrink-0 mt-0.5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-neutral-900">David Park</span>
              <span className="tag-chip bg-primary-100 text-primary-700 border border-primary-200">Work</span>
            </div>
            <span className="text-xs text-neutral-400 flex-shrink-0">9:15 AM</span>
          </div>
          <p className="text-sm font-semibold text-neutral-800 truncate mb-0.5">Re: Sprint Planning — Velocity & Capacity</p>
          <p className="text-sm text-neutral-500 truncate">Thanks for the update! I've reviewed the capacity sheet and I think we can realistically commit to 42 story points this sprint. Let me know if you want to…</p>
        </div>
      </div>

      <!-- Email Row 3 — Unread -->
      <div className="email-row flex items-start gap-4 px-6 py-4 border-b border-neutral-100 cursor-pointer transition-colors bg-background-50">
        <div className="flex flex-col items-center gap-2 pt-1 flex-shrink-0">
          <div className="unread-dot"></div>
          <button className="star-icon text-neutral-300 hover:text-secondary-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
          </button>
        </div>
        <div className="w-10 h-10 rounded-small bg-tertiary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-sm font-bold text-tertiary-700">MF</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-neutral-900">MailFlow Team</span>
              <span className="tag-chip bg-tertiary-100 text-tertiary-700 border border-tertiary-200">Update</span>
            </div>
            <span className="text-xs text-neutral-400 flex-shrink-0">8:00 AM</span>
          </div>
          <p className="text-sm font-semibold text-neutral-800 truncate mb-0.5">🎉 New Feature: AI Remix is now available!</p>
          <p className="text-sm text-neutral-500 truncate">We're thrilled to announce that AI Remix is now live for all MailFlow users. Rewrite, rephrase, and transform your emails with one click…</p>
        </div>
      </div>

      <!-- Email Row 4 — Read -->
      <div className="email-row flex items-start gap-4 px-6 py-4 border-b border-neutral-100 cursor-pointer transition-colors">
        <div className="flex flex-col items-center gap-2 pt-1 flex-shrink-0">
          <div className="w-2 h-2 flex-shrink-0"></div>
          <button className="star-icon text-neutral-300 hover:text-secondary-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
          </button>
        </div>
        <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face" alt="Priya Nair" className="w-10 h-10 rounded-small object-cover flex-shrink-0 mt-0.5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-neutral-700">Priya Nair</span>
              <span className="tag-chip bg-primary-100 text-primary-700 border border-primary-200">Work</span>
            </div>
            <span className="text-xs text-neutral-400 flex-shrink-0">Yesterday</span>
          </div>
          <p className="text-sm font-medium text-neutral-700 truncate mb-0.5">Onboarding Deck — Final Review Request</p>
          <p className="text-sm text-neutral-400 truncate">Hey Alex, I've finished the final version of the onboarding deck. Could you take a look before I send it to the client? I've incorporated all the feedback from…</p>
        </div>
      </div>

      <!-- Email Row 5 — Read -->
      <div className="email-row flex items-start gap-4 px-6 py-4 border-b border-neutral-100 cursor-pointer transition-colors">
        <div className="flex flex-col items-center gap-2 pt-1 flex-shrink-0">
          <div className="w-2 h-2 flex-shrink-0"></div>
          <button className="star-icon text-neutral-300 hover:text-secondary-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
          </button>
        </div>
        <div className="w-10 h-10 rounded-small bg-secondary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-sm font-bold text-secondary-700">JL</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-neutral-700">James Liu</span>
              <span className="tag-chip bg-neutral-100 text-neutral-600 border border-neutral-200">Personal</span>
            </div>
            <span className="text-xs text-neutral-400 flex-shrink-0">Yesterday</span>
          </div>
          <p className="text-sm font-medium text-neutral-700 truncate mb-0.5">Weekend hiking trip — are you in?</p>
          <p className="text-sm text-neutral-400 truncate">Hey! A few of us are planning a hike up to Eagle Peak this Saturday. Weather looks perfect. Let me know if you're free — we're leaving at 7am from…</p>
        </div>
      </div>

      <!-- Email Row 6 — Unread -->
      <div className="email-row flex items-start gap-4 px-6 py-4 border-b border-neutral-100 cursor-pointer transition-colors bg-background-50">
        <div className="flex flex-col items-center gap-2 pt-1 flex-shrink-0">
          <div className="unread-dot"></div>
          <button className="star-icon text-neutral-300 hover:text-secondary-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
          </button>
        </div>
        <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" alt="Tom Bradley" className="w-10 h-10 rounded-small object-cover flex-shrink-0 mt-0.5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-neutral-900">Tom Bradley</span>
              <span className="tag-chip bg-primary-100 text-primary-700 border border-primary-200">Work</span>
            </div>
            <span className="text-xs text-neutral-400 flex-shrink-0">Mon</span>
          </div>
          <p className="text-sm font-semibold text-neutral-800 truncate mb-0.5">Budget Approval — Q4 Marketing Campaign</p>
          <p className="text-sm text-neutral-500 truncate">Alex, the finance team has reviewed the Q4 marketing budget proposal. They've approved $48,000 for the digital campaign but need additional justification for…</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="flex items-center gap-1 text-xs text-neutral-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
              1 attachment
            </span>
          </div>
        </div>
      </div>

      <!-- Email Row 7 — Read -->
      <div className="email-row flex items-start gap-4 px-6 py-4 border-b border-neutral-100 cursor-pointer transition-colors">
        <div className="flex flex-col items-center gap-2 pt-1 flex-shrink-0">
          <div className="w-2 h-2 flex-shrink-0"></div>
          <button className="star-icon text-neutral-300 hover:text-secondary-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
          </button>
        </div>
        <div className="w-10 h-10 rounded-small bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-sm font-bold text-primary-700">GH</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-neutral-700">GitHub</span>
              <span className="tag-chip bg-neutral-100 text-neutral-600 border border-neutral-200">Notification</span>
            </div>
            <span className="text-xs text-neutral-400 flex-shrink-0">Mon</span>
          </div>
          <p className="text-sm font-medium text-neutral-700 truncate mb-0.5">[mailflow/app] Pull request #142 merged</p>
          <p className="text-sm text-neutral-400 truncate">Your pull request "feat: add AI dictate transcription panel" has been successfully merged into main by @sarah-chen…</p>
        </div>
      </div>

      <!-- Email Row 8 — Read -->
      <div className="email-row flex items-start gap-4 px-6 py-4 border-b border-neutral-100 cursor-pointer transition-colors">
        <div className="flex flex-col items-center gap-2 pt-1 flex-shrink-0">
          <div className="w-2 h-2 flex-shrink-0"></div>
          <button className="star-icon text-neutral-300 hover:text-secondary-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
          </button>
        </div>
        <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face" alt="Lisa Wong" className="w-10 h-10 rounded-small object-cover flex-shrink-0 mt-0.5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-neutral-700">Lisa Wong</span>
              <span className="tag-chip bg-primary-100 text-primary-700 border border-primary-200">Work</span>
            </div>
            <span className="text-xs text-neutral-400 flex-shrink-0">Sun</span>
          </div>
          <p className="text-sm font-medium text-neutral-700 truncate mb-0.5">User Research Summary — October Sessions</p>
          <p className="text-sm text-neutral-400 truncate">Hi Alex, I've compiled the findings from our October user research sessions. Key themes include navigation confusion in the settings panel and strong positive…</p>
        </div>
      </div>

      <!-- Load more -->
      <div className="flex items-center justify-center py-5">
        <button className="flex items-center gap-2 text-sm text-neutral-500 hover:text-primary-600 font-medium px-4 py-2 rounded-small hover:bg-primary-50 transition-colors border border-neutral-200 shadow-custom">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"></path></svg>
          Load more emails
        </button>
      </div>

    </div>

  </div>

</div>

<!-- FLOATING COMPOSE BUTTON (mobile) -->
<div className="fixed bottom-6 right-6 lg:hidden z-50">
  <a href="/api/copilot/prototype/3af3e7e8-faf3-4b36-a888-633eb80526b0/email-composer-window" className="flex items-center gap-2 ai-gradient-bg text-neutral-50 font-semibold text-sm py-3.5 px-5 rounded-large compose-btn-glow transition-all">
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg>
    Compose
  </a>
</div>




    </>
  );
};

export default InboxComposeTrigger;