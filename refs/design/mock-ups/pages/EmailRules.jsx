import React from 'react';

const EmailRules = () => {
  return (
    <>
      

<div className="flex" style={{minHeight: 1100}}>

  <!-- LEFT SIDEBAR — Main App Nav -->
  <aside className="hidden lg:flex flex-col w-64 bg-background-50 border-r border-neutral-200 flex-shrink-0">

    <!-- Logo -->
    <div className="flex items-center gap-3 px-6 py-5 border-b border-neutral-200">
      <div className="w-8 h-8 bg-primary-500 rounded-small flex items-center justify-center flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-neutral-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
      </div>
      <span className="font-heading font-semibold text-neutral-900 text-lg">MailFlow</span>
    </div>

    <!-- Back to Inbox -->
    <div className="px-4 py-4 border-b border-neutral-200">
      <a href="#" className="w-full flex items-center gap-2 text-neutral-600 hover:text-neutral-800 text-sm font-medium px-3 py-2.5 rounded-small hover:bg-background-100 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"></path></svg>
        Back to Inbox
      </a>
    </div>

    <!-- Settings Navigation -->
    <nav className="flex-1 px-3 py-4 overflow-y-auto">
      <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-3 mb-2">Account</p>
      <ul className="space-y-0.5 mb-5">
        <li>
          <div className="settings-nav-item flex items-center gap-3 px-3 py-2.5 rounded-small text-neutral-600 text-sm cursor-pointer transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            Profile
          </div>
        </li>
        <li>
          <div className="settings-nav-item flex items-center gap-3 px-3 py-2.5 rounded-small text-neutral-600 text-sm cursor-pointer transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            Security
          </div>
        </li>
        <li>
          <div className="settings-nav-item flex items-center gap-3 px-3 py-2.5 rounded-small text-neutral-600 text-sm cursor-pointer transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            Notifications
          </div>
        </li>
      </ul>

      <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-3 mb-2">Email Settings</p>
      <ul className="space-y-0.5 mb-5">
        <li>
          <a href="/api/copilot/prototype/d89480c5-0916-4680-aaf2-4fa058f57fdd/signature-management" className="settings-nav-item flex items-center gap-3 px-3 py-2.5 rounded-small text-neutral-600 text-sm cursor-pointer transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
            Signatures
          </a>
        </li>
        <li>
          <a href="/api/copilot/prototype/d89480c5-0916-4680-aaf2-4fa058f57fdd/email-rules" className="flex items-center gap-3 px-3 py-2.5 rounded-small bg-primary-50 text-primary-700 font-semibold text-sm cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
            Email Rules
          </a>
        </li>
        <li>
          <div className="settings-nav-item flex items-center gap-3 px-3 py-2.5 rounded-small text-neutral-600 text-sm cursor-pointer transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
            Filters & Sorting
          </div>
        </li>
        <li>
          <div className="settings-nav-item flex items-center gap-3 px-3 py-2.5 rounded-small text-neutral-600 text-sm cursor-pointer transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            Vacation Responder
          </div>
        </li>
        <li>
          <div className="settings-nav-item flex items-center gap-3 px-3 py-2.5 rounded-small text-neutral-600 text-sm cursor-pointer transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path></svg>
            Themes & Display
          </div>
        </li>
      </ul>

      <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-3 mb-2">Integrations</p>
      <ul className="space-y-0.5">
        <li>
          <div className="settings-nav-item flex items-center gap-3 px-3 py-2.5 rounded-small text-neutral-600 text-sm cursor-pointer transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
            Connected Apps
          </div>
        </li>
        <li>
          <div className="settings-nav-item flex items-center gap-3 px-3 py-2.5 rounded-small text-neutral-600 text-sm cursor-pointer transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            AI Preferences
          </div>
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

    <!-- TOP HEADER -->
    <header className="flex items-center justify-between px-6 py-4 bg-background-50 border-b border-neutral-200 flex-shrink-0" style={{maxHeight: 72}}>
      <div className="flex items-center gap-3">
        <div>
          <h1 className="font-heading font-semibold text-neutral-900 text-xl">Email Rules</h1>
          <p className="text-xs text-neutral-500 mt-0.5">Automate email handling with conditions and actions</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button onclick="document.getElementById('new-rule-modal').classList.remove('hidden')" className="flex items-center gap-2 ai-gradient-bg text-neutral-50 font-semibold text-sm py-2.5 px-4 rounded-small compose-btn-glow transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg>
          New Rule
        </button>
      </div>
    </header>

    <!-- CONTENT AREA -->
    <div className="flex-1 px-6 py-5 overflow-y-auto" style={{maxHeight: 1060}}>

      <!-- Stats Bar -->
      <section className="grid grid-cols-3 gap-4 mb-5" style={{maxHeight: 100}}>
        <div className="bg-background-50 rounded-large shadow-custom px-5 py-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-primary-100 rounded-small flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
          </div>
          <div>
            <p className="text-2xl font-heading font-bold text-neutral-900">6</p>
            <p className="text-xs text-neutral-500">Total Rules</p>
          </div>
        </div>
        <div className="bg-background-50 rounded-large shadow-custom px-5 py-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-tertiary-100 rounded-small flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-tertiary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div>
            <p className="text-2xl font-heading font-bold text-neutral-900">4</p>
            <p className="text-xs text-neutral-500">Active Rules</p>
          </div>
        </div>
        <div className="bg-background-50 rounded-large shadow-custom px-5 py-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-secondary-100 rounded-small flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <div>
            <p className="text-2xl font-heading font-bold text-neutral-900">248</p>
            <p className="text-xs text-neutral-500">Emails Processed</p>
          </div>
        </div>
      </section>

      <!-- Rules List Header -->
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h2 className="font-heading font-semibold text-neutral-800 text-base">All Rules</h2>
          <span className="bg-neutral-100 text-neutral-600 text-xs font-semibold px-2 py-0.5 rounded-small border border-neutral-200">6 rules</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input type="text" placeholder="Search rules…" className="pl-8 pr-3 py-1.5 text-xs bg-background-50 border border-neutral-200 rounded-small text-neutral-700 placeholder-neutral-400 focus:outline-none focus:border-primary-300 w-44 transition-colors">
          </div>
          <select className="text-xs text-neutral-600 bg-background-50 border border-neutral-200 rounded-small px-2.5 py-1.5 focus:outline-none focus:border-primary-300">
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
      </div>

      <!-- Priority note -->
      <div className="flex items-center gap-2 mb-3 px-1">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <p className="text-xs text-neutral-400">Rules are applied in priority order (top to bottom). Drag to reorder.</p>
      </div>

      <!-- RULES LIST -->
      <div className="space-y-3">

        <!-- Rule 1 — Active, Priority 1 -->
        <div className="rule-card bg-background-50 rounded-large shadow-custom border border-neutral-200 overflow-hidden transition-colors" style={{maxHeight: 160}}>
          <div className="flex items-start gap-0">
            <!-- Drag Handle + Priority -->
            <div className="flex flex-col items-center justify-center px-3 py-4 bg-background-100 border-r border-neutral-200 self-stretch gap-2 flex-shrink-0">
              <span className="text-xs font-bold text-neutral-400">#1</span>
              <button className="drag-handle text-neutral-300 cursor-grab active:cursor-grabbing transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 8h16M4 16h16"></path></svg>
              </button>
            </div>
            <!-- Rule Content -->
            <div className="flex-1 px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-neutral-900">Work Newsletters → Archive</span>
                    <span className="inline-flex items-center gap-1 bg-tertiary-100 text-tertiary-700 text-xs font-semibold px-2 py-0.5 rounded-small border border-tertiary-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                      Active
                    </span>
                  </div>
                  <!-- Conditions -->
                  <div className="flex items-center flex-wrap gap-1.5 mb-2">
                    <span className="text-xs text-neutral-500 font-medium mr-0.5">IF</span>
                    <span className="condition-chip bg-background-200 text-neutral-700 border border-neutral-200">Subject contains "newsletter"</span>
                    <span className="text-xs text-neutral-400 font-medium">OR</span>
                    <span className="condition-chip bg-background-200 text-neutral-700 border border-neutral-200">Subject contains "digest"</span>
                  </div>
                  <!-- Actions -->
                  <div className="flex items-center flex-wrap gap-1.5">
                    <span className="text-xs text-neutral-500 font-medium mr-0.5">THEN</span>
                    <span className="action-chip bg-primary-100 text-primary-700 border border-primary-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                      Archive
                    </span>
                    <span className="action-chip bg-secondary-100 text-secondary-700 border border-secondary-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                      Label: Newsletters
                    </span>
                  </div>
                </div>
                <!-- Controls -->
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-neutral-400 mb-1">142 emails</p>
                  </div>
                  <button id="toggle-r1" onclick="toggleRule(this)" className="toggle-on relative inline-flex w-11 h-6 rounded-small transition-colors flex-shrink-0 cursor-pointer">
                    <span className="translate-x-5 inline-block w-5 h-5 mt-0.5 ml-0.5 bg-background-50 rounded-small shadow-custom transition-transform"></span>
                  </button>
                  <button onclick="document.getElementById('edit-rule-modal').classList.remove('hidden')" className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-background-200 rounded-small transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                  </button>
                  <button className="p-1.5 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-small transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Rule 2 — Active, Priority 2 -->
        <div className="rule-card bg-background-50 rounded-large shadow-custom border border-neutral-200 overflow-hidden transition-colors" style={{maxHeight: 160}}>
          <div className="flex items-start gap-0">
            <div className="flex flex-col items-center justify-center px-3 py-4 bg-background-100 border-r border-neutral-200 self-stretch gap-2 flex-shrink-0">
              <span className="text-xs font-bold text-neutral-400">#2</span>
              <button className="drag-handle text-neutral-300 cursor-grab active:cursor-grabbing transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 8h16M4 16h16"></path></svg>
              </button>
            </div>
            <div className="flex-1 px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-neutral-900">VIP Clients → Priority Label</span>
                    <span className="inline-flex items-center gap-1 bg-tertiary-100 text-tertiary-700 text-xs font-semibold px-2 py-0.5 rounded-small border border-tertiary-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                      Active
                    </span>
                  </div>
                  <div className="flex items-center flex-wrap gap-1.5 mb-2">
                    <span className="text-xs text-neutral-500 font-medium mr-0.5">IF</span>
                    <span className="condition-chip bg-background-200 text-neutral-700 border border-neutral-200">From: @acmecorp.com</span>
                    <span className="text-xs text-neutral-400 font-medium">OR</span>
                    <span className="condition-chip bg-background-200 text-neutral-700 border border-neutral-200">From: @bigclient.io</span>
                  </div>
                  <div className="flex items-center flex-wrap gap-1.5">
                    <span className="text-xs text-neutral-500 font-medium mr-0.5">THEN</span>
                    <span className="action-chip bg-primary-100 text-primary-700 border border-primary-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                      Label: VIP
                    </span>
                    <span className="action-chip bg-tertiary-100 text-tertiary-700 border border-tertiary-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                      Mark Important
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-neutral-400 mb-1">38 emails</p>
                  </div>
                  <button id="toggle-r2" onclick="toggleRule(this)" className="toggle-on relative inline-flex w-11 h-6 rounded-small transition-colors flex-shrink-0 cursor-pointer">
                    <span className="translate-x-5 inline-block w-5 h-5 mt-0.5 ml-0.5 bg-background-50 rounded-small shadow-custom transition-transform"></span>
                  </button>
                  <button onclick="document.getElementById('edit-rule-modal').classList.remove('hidden')" className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-background-200 rounded-small transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                  </button>
                  <button className="p-1.5 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-small transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Rule 3 — Active, Priority 3 -->
        <div className="rule-card bg-background-50 rounded-large shadow-custom border border-neutral-200 overflow-hidden transition-colors" style={{maxHeight: 160}}>
          <div className="flex items-start gap-0">
            <div className="flex flex-col items-center justify-center px-3 py-4 bg-background-100 border-r border-neutral-200 self-stretch gap-2 flex-shrink-0">
              <span className="text-xs font-bold text-neutral-400">#3</span>
              <button className="drag-handle text-neutral-300 cursor-grab active:cursor-grabbing transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 8h16M4 16h16"></path></svg>
              </button>
            </div>
            <div className="flex-1 px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-neutral-900">GitHub Notifications → Label</span>
                    <span className="inline-flex items-center gap-1 bg-tertiary-100 text-tertiary-700 text-xs font-semibold px-2 py-0.5 rounded-small border border-tertiary-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                      Active
                    </span>
                  </div>
                  <div className="flex items-center flex-wrap gap-1.5 mb-2">
                    <span className="text-xs text-neutral-500 font-medium mr-0.5">IF</span>
                    <span className="condition-chip bg-background-200 text-neutral-700 border border-neutral-200">From: noreply@github.com</span>
                  </div>
                  <div className="flex items-center flex-wrap gap-1.5">
                    <span className="text-xs text-neutral-500 font-medium mr-0.5">THEN</span>
                    <span className="action-chip bg-neutral-100 text-neutral-700 border border-neutral-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                      Label: Dev
                    </span>
                    <span className="action-chip bg-background-200 text-neutral-600 border border-neutral-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                      Skip Inbox
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-neutral-400 mb-1">54 emails</p>
                  </div>
                  <button id="toggle-r3" onclick="toggleRule(this)" className="toggle-on relative inline-flex w-11 h-6 rounded-small transition-colors flex-shrink-0 cursor-pointer">
                    <span className="translate-x-5 inline-block w-5 h-5 mt-0.5 ml-0.5 bg-background-50 rounded-small shadow-custom transition-transform"></span>
                  </button>
                  <button onclick="document.getElementById('edit-rule-modal').classList.remove('hidden')" className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-background-200 rounded-small transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                  </button>
                  <button className="p-1.5 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-small transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Rule 4 — Active, Priority 4 (Forward) -->
        <div className="rule-card bg-background-50 rounded-large shadow-custom border border-neutral-200 overflow-hidden transition-colors" style={{maxHeight: 160}}>
          <div className="flex items-start gap-0">
            <div className="flex flex-col items-center justify-center px-3 py-4 bg-background-100 border-r border-neutral-200 self-stretch gap-2 flex-shrink-0">
              <span className="text-xs font-bold text-neutral-400">#4</span>
              <button className="drag-handle text-neutral-300 cursor-grab active:cursor-grabbing transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 8h16M4 16h16"></path></svg>
              </button>
            </div>
            <div className="flex-1 px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-neutral-900">Invoices → Forward to Finance</span>
                    <span className="inline-flex items-center gap-1 bg-tertiary-100 text-tertiary-700 text-xs font-semibold px-2 py-0.5 rounded-small border border-tertiary-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                      Active
                    </span>
                  </div>
                  <div className="flex items-center flex-wrap gap-1.5 mb-2">
                    <span className="text-xs text-neutral-500 font-medium mr-0.5">IF</span>
                    <span className="condition-chip bg-background-200 text-neutral-700 border border-neutral-200">Subject contains "invoice"</span>
                    <span className="text-xs text-neutral-400 font-medium">OR</span>
                    <span className="condition-chip bg-background-200 text-neutral-700 border border-neutral-200">Keywords: "payment", "billing"</span>
                  </div>
                  <div className="flex items-center flex-wrap gap-1.5">
                    <span className="text-xs text-neutral-500 font-medium mr-0.5">THEN</span>
                    <span className="action-chip bg-secondary-100 text-secondary-700 border border-secondary-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                      Forward: finance@mailflow.io
                    </span>
                    <span className="action-chip bg-primary-100 text-primary-700 border border-primary-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                      Label: Finance
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-neutral-400 mb-1">14 emails</p>
                  </div>
                  <button id="toggle-r4" onclick="toggleRule(this)" className="toggle-on relative inline-flex w-11 h-6 rounded-small transition-colors flex-shrink-0 cursor-pointer">
                    <span className="translate-x-5 inline-block w-5 h-5 mt-0.5 ml-0.5 bg-background-50 rounded-small shadow-custom transition-transform"></span>
                  </button>
                  <button onclick="document.getElementById('edit-rule-modal').classList.remove('hidden')" className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-background-200 rounded-small transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                  </button>
                  <button className="p-1.5 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-small transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Rule 5 — Inactive, Priority 5 -->
        <div className="rule-card bg-background-100 rounded-large border border-neutral-200 overflow-hidden transition-colors opacity-70" style={{maxHeight: 160}}>
          <div className="flex items-start gap-0">
            <div className="flex flex-col items-center justify-center px-3 py-4 bg-background-200 border-r border-neutral-200 self-stretch gap-2 flex-shrink-0">
              <span className="text-xs font-bold text-neutral-300">#5</span>
              <button className="drag-handle text-neutral-200 cursor-grab active:cursor-grabbing transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 8h16M4 16h16"></path></svg>
              </button>
            </div>
            <div className="flex-1 px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-neutral-600">Spam Keywords → Delete</span>
                    <span className="inline-flex items-center gap-1 bg-neutral-100 text-neutral-500 text-xs font-semibold px-2 py-0.5 rounded-small border border-neutral-200">Inactive</span>
                  </div>
                  <div className="flex items-center flex-wrap gap-1.5 mb-2">
                    <span className="text-xs text-neutral-400 font-medium mr-0.5">IF</span>
                    <span className="condition-chip bg-background-200 text-neutral-500 border border-neutral-200">Subject contains "free offer"</span>
                    <span className="text-xs text-neutral-300 font-medium">OR</span>
                    <span className="condition-chip bg-background-200 text-neutral-500 border border-neutral-200">Subject contains "click here"</span>
                  </div>
                  <div className="flex items-center flex-wrap gap-1.5">
                    <span className="text-xs text-neutral-400 font-medium mr-0.5">THEN</span>
                    <span className="action-chip bg-neutral-100 text-neutral-500 border border-neutral-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      Delete
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-neutral-300 mb-1">0 emails</p>
                  </div>
                  <button id="toggle-r5" onclick="toggleRule(this)" className="toggle-off relative inline-flex w-11 h-6 rounded-small transition-colors flex-shrink-0 cursor-pointer">
                    <span className="translate-x-0 inline-block w-5 h-5 mt-0.5 ml-0.5 bg-background-50 rounded-small shadow-custom transition-transform"></span>
                  </button>
                  <button onclick="document.getElementById('edit-rule-modal').classList.remove('hidden')" className="p-1.5 text-neutral-300 hover:text-neutral-600 hover:bg-background-200 rounded-small transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                  </button>
                  <button className="p-1.5 text-neutral-300 hover:text-primary-600 hover:bg-primary-50 rounded-small transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Rule 6 — Inactive, Priority 6 -->
        <div className="rule-card bg-background-100 rounded-large border border-neutral-200 overflow-hidden transition-colors opacity-70" style={{maxHeight: 160}}>
          <div className="flex items-start gap-0">
            <div className="flex flex-col items-center justify-center px-3 py-4 bg-background-200 border-r border-neutral-200 self-stretch gap-2 flex-shrink-0">
              <span className="text-xs font-bold text-neutral-300">#6</span>
              <button className="drag-handle text-neutral-200 cursor-grab active:cursor-grabbing transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 8h16M4 16h16"></path></svg>
              </button>
            </div>
            <div className="flex-1 px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-neutral-600">Team Updates → Work Label</span>
                    <span className="inline-flex items-center gap-1 bg-neutral-100 text-neutral-500 text-xs font-semibold px-2 py-0.5 rounded-small border border-neutral-200">Inactive</span>
                  </div>
                  <div className="flex items-center flex-wrap gap-1.5 mb-2">
                    <span className="text-xs text-neutral-400 font-medium mr-0.5">IF</span>
                    <span className="condition-chip bg-background-200 text-neutral-500 border border-neutral-200">From: @mailflow.io</span>
                    <span className="text-xs text-neutral-300 font-medium">AND</span>
                    <span className="condition-chip bg-background-200 text-neutral-500 border border-neutral-200">Subject contains "update"</span>
                  </div>
                  <div className="flex items-center flex-wrap gap-1.5">
                    <span className="text-xs text-neutral-400 font-medium mr-0.5">THEN</span>
                    <span className="action-chip bg-neutral-100 text-neutral-500 border border-neutral-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                      Label: Work
                    </span>
                    <span className="action-chip bg-neutral-100 text-neutral-500 border border-neutral-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                      Skip Inbox
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-neutral-300 mb-1">0 emails</p>
                  </div>
                  <button id="toggle-r6" onclick="toggleRule(this)" className="toggle-off relative inline-flex w-11 h-6 rounded-small transition-colors flex-shrink-0 cursor-pointer">
                    <span className="translate-x-0 inline-block w-5 h-5 mt-0.5 ml-0.5 bg-background-50 rounded-small shadow-custom transition-transform"></span>
                  </button>
                  <button onclick="document.getElementById('edit-rule-modal').classList.remove('hidden')" className="p-1.5 text-neutral-300 hover:text-neutral-600 hover:bg-background-200 rounded-small transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                  </button>
                  <button className="p-1.5 text-neutral-300 hover:text-primary-600 hover:bg-primary-50 rounded-small transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Add New Rule Button -->
        <button onclick="document.getElementById('new-rule-modal').classList.remove('hidden')" className="w-full flex items-center justify-center gap-2 text-sm text-neutral-500 hover:text-primary-600 font-medium py-3 px-4 rounded-large border border-dashed border-neutral-300 hover:border-primary-300 hover:bg-primary-50 transition-colors bg-background-50">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg>
          Add New Rule
        </button>

      </div>
    </div>
  </div>
</div>

<!-- NEW RULE MODAL -->
<div id="new-rule-modal" className="hidden fixed inset-0 z-50 flex items-center justify-center bg-neutral-900 bg-opacity-40">
  <div className="bg-background-50 rounded-large shadow-custom-hover w-full max-w-2xl mx-4 overflow-hidden">
    <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
      <div>
        <h3 className="font-heading font-semibold text-neutral-900 text-base">Create New Rule</h3>
        <p className="text-xs text-neutral-500 mt-0.5">Define conditions and actions for automatic email handling</p>
      </div>
      <button onclick="document.getElementById('new-rule-modal').classList.add('hidden')" className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-background-100 rounded-small transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
    </div>
    <div className="px-6 py-5 space-y-5">

      <!-- Rule Name -->
      <div>
        <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-1.5">Rule Name</label>
        <input type="text" placeholder="e.g. VIP Clients, Newsletter Filter…" className="w-full px-3 py-2.5 text-sm bg-background-100 border border-neutral-200 rounded-small text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-primary-300 focus:bg-background-50 transition-colors">
      </div>

      <!-- Conditions -->
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider">Conditions</label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500">Match</span>
            <select className="text-xs text-neutral-700 bg-background-100 border border-neutral-200 rounded-small px-2 py-1 focus:outline-none focus:border-primary-300">
              <option>ANY condition</option>
              <option>ALL conditions</option>
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <select className="text-sm text-neutral-700 bg-background-100 border border-neutral-200 rounded-small px-3 py-2 focus:outline-none focus:border-primary-300 flex-shrink-0">
              <option>From (sender)</option>
              <option>Subject</option>
              <option>Keywords</option>
              <option>Has attachment</option>
              <option>To (recipient)</option>
            </select>
            <select className="text-sm text-neutral-700 bg-background-100 border border-neutral-200 rounded-small px-3 py-2 focus:outline-none focus:border-primary-300 flex-shrink-0">
              <option>contains</option>
              <option>does not contain</option>
              <option>is exactly</option>
              <option>starts with</option>
            </select>
            <input type="text" placeholder="Enter value…" className="flex-1 px-3 py-2 text-sm bg-background-100 border border-neutral-200 rounded-small text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-primary-300 focus:bg-background-50 transition-colors">
            <button className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-small transition-colors flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <select className="text-sm text-neutral-700 bg-background-100 border border-neutral-200 rounded-small px-3 py-2 focus:outline-none focus:border-primary-300 flex-shrink-0">
              <option>Subject</option>
              <option>From (sender)</option>
              <option>Keywords</option>
              <option>Has attachment</option>
            </select>
            <select className="text-sm text-neutral-700 bg-background-100 border border-neutral-200 rounded-small px-3 py-2 focus:outline-none focus:border-primary-300 flex-shrink-0">
              <option>contains</option>
              <option>does not contain</option>
              <option>is exactly</option>
            </select>
            <input type="text" placeholder="Enter value…" className="flex-1 px-3 py-2 text-sm bg-background-100 border border-neutral-200 rounded-small text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-primary-300 focus:bg-background-50 transition-colors">
            <button className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-small transition-colors flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <button className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium px-1 py-1 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg>
            Add condition
          </button>
        </div>
      </div>

      <!-- Actions -->
      <div>
        <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-2">Actions</label>
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 bg-background-100 border border-neutral-200 rounded-small px-3 py-2">
              <select className="text-sm text-neutral-700 bg-transparent focus:outline-none">
                <option>Apply label</option>
                <option>Archive</option>
                <option>Delete</option>
                <option>Forward to</option>
                <option>Mark as read</option>
                <option>Mark important</option>
                <option>Skip inbox</option>
              </select>
              <input type="text" placeholder="Label name…" className="text-sm bg-transparent text-neutral-800 placeholder-neutral-400 focus:outline-none w-28">
              <button className="p-1 text-neutral-400 hover:text-primary-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="flex items-center gap-2 bg-background-100 border border-neutral-200 rounded-small px-3 py-2">
              <select className="text-sm text-neutral-700 bg-transparent focus:outline-none">
                <option>Archive</option>
                <option>Apply label</option>
                <option>Delete</option>
                <option>Forward to</option>
                <option>Mark as read</option>
              </select>
              <button className="p-1 text-neutral-400 hover:text-primary-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
          </div>
          <button className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium px-1 py-1 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg>
            Add action
          </button>
        </div>
      </div>

      <!-- Enable toggle -->
      <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
        <div>
          <p className="text-sm font-medium text-neutral-800">Enable rule immediately</p>
          <p className="text-xs text-neutral-500 mt-0.5">Rule will start processing incoming emails right away</p>
        </div>
        <button id="modal-toggle" onclick="this.classList.toggle('toggle-on'); this.classList.toggle('toggle-off'); this.querySelector('span').classList.toggle('translate-x-5'); this.querySelector('span').classList.toggle('translate-x-0');" className="toggle-on relative inline-flex w-11 h-6 rounded-small transition-colors flex-shrink-0 cursor-pointer">
          <span className="translate-x-5 inline-block w-5 h-5 mt-0.5 ml-0.5 bg-background-50 rounded-small shadow-custom transition-transform"></span>
        </button>
      </div>

    </div>
    <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between">
      <button className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-700 font-medium px-3 py-2 rounded-small hover:bg-background-100 transition-colors border border-neutral-200">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
        Test Rule
      </button>
      <div className="flex items-center gap-3">
        <button onclick="document.getElementById('new-rule-modal').classList.add('hidden')" className="px-4 py-2 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-small hover:bg-background-100 transition-colors shadow-custom">
          Cancel
        </button>
        <button onclick="document.getElementById('new-rule-modal').classList.add('hidden')" className="px-4 py-2 text-sm font-semibold ai-gradient-bg text-neutral-50 rounded-small compose-btn-glow transition-all">
          Create Rule
        </button>
      </div>
    </div>
  </div>
</div>

<!-- EDIT RULE MODAL -->
<div id="edit-rule-modal" className="hidden fixed inset-0 z-50 flex items-center justify-center bg-neutral-900 bg-opacity-40">
  <div className="bg-background-50 rounded-large shadow-custom-hover w-full max-w-2xl mx-4 overflow-hidden">
    <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
      <div>
        <h3 className="font-heading font-semibold text-neutral-900 text-base">Edit Rule</h3>
        <p className="text-xs text-neutral-500 mt-0.5">Modify conditions and actions for this rule</p>
      </div>
      <button onclick="document.getElementById('edit-rule-modal').classList.add('hidden')" className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-background-100 rounded-small transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
    </div>
    <div className="px-6 py-5 space-y-5">
      <!-- Rule Name -->
      <div>
        <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-1.5">Rule Name</label>
        <input type="text" value="Work Newsletters → Archive" className="w-full px-3 py-2.5 text-sm bg-background-100 border border-neutral-200 rounded-small text-neutral-800 focus:outline-none focus:border-primary-300 focus:bg-background-50 transition-colors">
      </div>
      <!-- Conditions -->
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider">Conditions</label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500">Match</span>
            <select className="text-xs text-neutral-700 bg-background-100 border border-neutral-200 rounded-small px-2 py-1 focus:outline-none focus:border-primary-300">
              <option selected="">ANY condition</option>
              <option>ALL conditions</option>
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <select className="text-sm text-neutral-700 bg-background-100 border border-neutral-200 rounded-small px-3 py-2 focus:outline-none focus:border-primary-300 flex-shrink-0">
              <option selected="">Subject</option>
              <option>From (sender)</option>
              <option>Keywords</option>
            </select>
            <select className="text-sm text-neutral-700 bg-background-100 border border-neutral-200 rounded-small px-3 py-2 focus:outline-none focus:border-primary-300 flex-shrink-0">
              <option selected="">contains</option>
              <option>does not contain</option>
            </select>
            <input type="text" value="newsletter" className="flex-1 px-3 py-2 text-sm bg-background-100 border border-primary-300 rounded-small text-neutral-800 focus:outline-none focus:bg-background-50 transition-colors">
            <button className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-small transition-colors flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <select className="text-sm text-neutral-700 bg-background-100 border border-neutral-200 rounded-small px-3 py-2 focus:outline-none focus:border-primary-300 flex-shrink-0">
              <option selected="">Subject</option>
              <option>From (sender)</option>
              <option>Keywords</option>
            </select>
            <select className="text-sm text-neutral-700 bg-background-100 border border-neutral-200 rounded-small px-3 py-2 focus:outline-none focus:border-primary-300 flex-shrink-0">
              <option selected="">contains</option>
              <option>does not contain</option>
            </select>
            <input type="text" value="digest" className="flex-1 px-3 py-2 text-sm bg-background-100 border border-neutral-200 rounded-small text-neutral-800 focus:outline-none focus:border-primary-300 focus:bg-background-50 transition-colors">
            <button className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-small transition-colors flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        </div>
      </div>
      <!-- Actions -->
      <div>
        <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-2">Actions</label>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-primary-50 border border-primary-200 rounded-small px-3 py-2">
            <select className="text-sm text-primary-700 bg-transparent focus:outline-none font-medium">
              <option selected="">Archive</option>
              <option>Apply label</option>
              <option>Delete</option>
              <option>Forward to</option>
            </select>
            <button className="p-1 text-primary-400 hover:text-primary-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <div className="flex items-center gap-2 bg-secondary-50 border border-secondary-200 rounded-small px-3 py-2">
            <select className="text-sm text-secondary-700 bg-transparent focus:outline-none font-medium">
              <option selected="">Apply label</option>
              <option>Archive</option>
              <option>Delete</option>
            </select>
            <input type="text" value="Newsletters" className="text-sm bg-transparent text-secondary-700 focus:outline-none w-24 font-medium">
            <button className="p-1 text-secondary-400 hover:text-secondary-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between">
      <button className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-700 font-medium px-3 py-2 rounded-small hover:bg-background-100 transition-colors border border-neutral-200">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
        Test Rule
      </button>
      <div className="flex items-center gap-3">
        <button onclick="document.getElementById('edit-rule-modal').classList.add('hidden')" className="px-4 py-2 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-small hover:bg-background-100 transition-colors shadow-custom">
          Cancel
        </button>
        <button onclick="document.getElementById('edit-rule-modal').classList.add('hidden')" className="px-4 py-2 text-sm font-semibold ai-gradient-bg text-neutral-50 rounded-small compose-btn-glow transition-all">
          Save Changes
        </button>
      </div>
    </div>
  </div>
</div>







    </>
  );
};

export default EmailRules;