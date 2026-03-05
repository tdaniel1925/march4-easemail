import React from 'react';

const SignatureManagement = () => {
  return (
    <>
      

<div className="flex" style={{minHeight: 960}}>

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
          <a href="/api/copilot/prototype/d89480c5-0916-4680-aaf2-4fa058f57fdd/signature-management" className="flex items-center gap-3 px-3 py-2.5 rounded-small bg-primary-50 text-primary-700 font-semibold text-sm cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
            Signatures
          </a>
        </li>
        <li>
          <a href="/api/copilot/prototype/d89480c5-0916-4680-aaf2-4fa058f57fdd/email-rules" className="settings-nav-item flex items-center gap-3 px-3 py-2.5 rounded-small text-neutral-600 text-sm cursor-pointer transition-colors">
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
          <h1 className="font-heading font-semibold text-neutral-900 text-xl">Signature Management</h1>
          <p className="text-xs text-neutral-500 mt-0.5">Manage your email signatures and assignment rules</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button onclick="document.getElementById('new-sig-modal').classList.remove('hidden')" className="flex items-center gap-2 ai-gradient-bg text-neutral-50 font-semibold text-sm py-2.5 px-4 rounded-small compose-btn-glow transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg>
          New Signature
        </button>
      </div>
    </header>

    <!-- CONTENT AREA -->
    <div className="flex flex-1 overflow-hidden">

      <!-- SIGNATURE LIST PANEL -->
      <div className="w-80 flex-shrink-0 bg-background-50 border-r border-neutral-200 flex flex-col" style={{maxHeight: 900, overflowY: 'auto'}}>
        <div className="px-4 py-3 border-b border-neutral-200 flex items-center justify-between flex-shrink-0">
          <span className="text-sm font-semibold text-neutral-700">Saved Signatures</span>
          <span className="bg-neutral-100 text-neutral-600 text-xs font-semibold px-2 py-0.5 rounded-small">3</span>
        </div>

        <!-- Signature Card 1 — Active/Selected -->
        <div className="sig-card sig-card-active border-l-4 border-primary-500 px-4 py-4 border-b border-neutral-200 cursor-pointer transition-colors" id="sig1">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-neutral-900">Professional</span>
                <span className="inline-flex items-center gap-1 bg-tertiary-100 text-tertiary-700 text-xs font-semibold px-2 py-0.5 rounded-small border border-tertiary-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                  Default
                </span>
              </div>
              <p className="text-xs text-neutral-500">Used for new emails</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
              <button className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-background-200 rounded-small transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
              </button>
              <button className="p-1.5 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-small transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
          </div>
          <!-- Preview -->
          <div className="bg-background-50 border border-primary-200 rounded-large p-3 mt-2">
            <p className="text-xs text-neutral-800 font-medium">Alex Morgan</p>
            <p className="text-xs text-neutral-500">Product Designer · MailFlow</p>
            <p className="text-xs text-primary-600">alex@mailflow.io</p>
            <div className="flex items-center gap-1 mt-1">
              <div className="w-12 h-1 bg-primary-400 rounded-small"></div>
            </div>
          </div>
        </div>

        <!-- Signature Card 2 -->
        <div className="sig-card px-4 py-4 border-b border-neutral-200 cursor-pointer transition-colors" id="sig2">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-neutral-900">Casual</span>
                <span className="inline-flex items-center gap-1 bg-secondary-100 text-secondary-700 text-xs font-semibold px-2 py-0.5 rounded-small border border-secondary-200">Replies</span>
              </div>
              <p className="text-xs text-neutral-500">Used for replies & forwards</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
              <button className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-background-200 rounded-small transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
              </button>
              <button className="p-1.5 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-small transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
          </div>
          <div className="bg-background-100 border border-neutral-200 rounded-large p-3 mt-2">
            <p className="text-xs text-neutral-800 font-medium">— Alex</p>
            <p className="text-xs text-neutral-500">alex@mailflow.io</p>
          </div>
        </div>

        <!-- Signature Card 3 -->
        <div className="sig-card px-4 py-4 border-b border-neutral-200 cursor-pointer transition-colors" id="sig3">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-neutral-900">Marketing</span>
                <span className="inline-flex items-center gap-1 bg-neutral-100 text-neutral-600 text-xs font-semibold px-2 py-0.5 rounded-small border border-neutral-200">Manual</span>
              </div>
              <p className="text-xs text-neutral-500">Manually assigned</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
              <button className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-background-200 rounded-small transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
              </button>
              <button className="p-1.5 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-small transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
          </div>
          <div className="bg-background-100 border border-neutral-200 rounded-large p-3 mt-2">
            <p className="text-xs text-neutral-800 font-medium">Alex Morgan</p>
            <p className="text-xs text-neutral-500">Product Designer · MailFlow</p>
            <p className="text-xs text-primary-600">alex@mailflow.io · mailflow.io</p>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="w-4 h-4 bg-primary-500 rounded-small flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5 text-neutral-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              </div>
              <div className="w-4 h-4 bg-neutral-700 rounded-small flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5 text-neutral-50" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path></svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Add New Signature Button -->
        <div className="px-4 py-3">
          <button onclick="document.getElementById('new-sig-modal').classList.remove('hidden')" className="w-full flex items-center justify-center gap-2 text-sm text-neutral-500 hover:text-primary-600 font-medium py-2.5 px-4 rounded-small border border-dashed border-neutral-300 hover:border-primary-300 hover:bg-primary-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg>
            Add New Signature
          </button>
        </div>
      </div>

      <!-- EDITOR PANEL -->
      <div className="flex-1 flex flex-col bg-background-100 overflow-y-auto" style={{maxHeight: 900}}>

        <!-- Editor Header -->
        <div className="px-6 py-4 bg-background-50 border-b border-neutral-200 flex items-center justify-between flex-shrink-0" style={{maxHeight: 68}}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-100 rounded-small flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
            </div>
            <div>
              <h2 className="font-heading font-semibold text-neutral-900 text-base">Professional</h2>
              <p className="text-xs text-neutral-500">Editing signature</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-neutral-600 border border-neutral-200 rounded-small hover:bg-background-100 transition-colors shadow-custom">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
              Preview
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold ai-gradient-bg text-neutral-50 rounded-small compose-btn-glow transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
              Save Changes
            </button>
          </div>
        </div>

        <!-- Editor Body -->
        <div className="flex-1 px-6 py-5 space-y-5">

          <!-- Signature Name -->
          <section className="bg-background-50 rounded-large shadow-custom p-5" style={{maxHeight: 120}}>
            <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-2">Signature Name</label>
            <input type="text" value="Professional" className="w-full px-3 py-2.5 text-sm bg-background-100 border border-neutral-200 rounded-small text-neutral-800 focus:outline-none focus:border-primary-300 focus:bg-background-50 transition-colors">
          </section>

          <!-- Rich Text Editor -->
          <section className="bg-background-50 rounded-large shadow-custom overflow-hidden" style={{maxHeight: 420}}>
            <div className="px-4 py-2.5 border-b border-neutral-200 flex items-center gap-1 flex-wrap">
              <!-- Formatting Toolbar -->
              <div className="flex items-center gap-0.5 pr-2 border-r border-neutral-200 mr-1">
                <button className="editor-toolbar-btn w-7 h-7 flex items-center justify-center rounded-small text-neutral-600 transition-colors font-bold text-sm">B</button>
                <button className="editor-toolbar-btn w-7 h-7 flex items-center justify-center rounded-small text-neutral-600 transition-colors italic text-sm">I</button>
                <button className="editor-toolbar-btn w-7 h-7 flex items-center justify-center rounded-small text-neutral-600 transition-colors underline text-sm">U</button>
              </div>
              <div className="flex items-center gap-0.5 pr-2 border-r border-neutral-200 mr-1">
                <button className="editor-toolbar-btn w-7 h-7 flex items-center justify-center rounded-small text-neutral-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h7"></path></svg>
                </button>
                <button className="editor-toolbar-btn w-7 h-7 flex items-center justify-center rounded-small text-neutral-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                </button>
                <button className="editor-toolbar-btn w-7 h-7 flex items-center justify-center rounded-small text-neutral-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h8M4 18h16"></path></svg>
                </button>
              </div>
              <div className="flex items-center gap-0.5 pr-2 border-r border-neutral-200 mr-1">
                <button className="editor-toolbar-btn w-7 h-7 flex items-center justify-center rounded-small text-neutral-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                </button>
                <button className="editor-toolbar-btn w-7 h-7 flex items-center justify-center rounded-small text-neutral-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </button>
              </div>
              <div className="flex items-center gap-0.5">
                <select className="text-xs text-neutral-600 bg-background-100 border border-neutral-200 rounded-small px-2 py-1 focus:outline-none focus:border-primary-300">
                  <option>Work Sans</option>
                  <option>Poppins</option>
                  <option>Arial</option>
                  <option>Georgia</option>
                </select>
                <select className="text-xs text-neutral-600 bg-background-100 border border-neutral-200 rounded-small px-2 py-1 focus:outline-none focus:border-primary-300 ml-1">
                  <option>12</option>
                  <option>13</option>
                  <option selected="">14</option>
                  <option>16</option>
                  <option>18</option>
                </select>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <button className="editor-toolbar-btn flex items-center gap-1 px-2 py-1 rounded-small text-xs text-neutral-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                  HTML
                </button>
              </div>
            </div>
            <!-- Editor Content Area -->
            <div className="p-5 min-h-48 bg-background-50" contentEditable="true" style={{outline: 'none', minHeight: 200}}>
              <p className="text-sm text-neutral-800 font-semibold mb-0.5">Alex Morgan</p>
              <p className="text-sm text-neutral-600 mb-0.5">Product Designer · MailFlow</p>
              <p className="text-sm text-primary-600 mb-2">alex@mailflow.io</p>
              <div className="w-16 h-0.5 bg-primary-400 mb-2 rounded-small"></div>
              <p className="text-xs text-neutral-500">📍 San Francisco, CA</p>
              <p className="text-xs text-neutral-500">🌐 mailflow.io</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-neutral-400">Follow us:</span>
                <a href="#" className="text-xs text-primary-600 hover:underline">LinkedIn</a>
                <a href="#" className="text-xs text-primary-600 hover:underline">Twitter</a>
              </div>
            </div>
          </section>

          <!-- Assignment Controls -->
          <section className="bg-background-50 rounded-large shadow-custom p-5" style={{maxHeight: 280}}>
            <h3 className="font-heading font-semibold text-neutral-800 text-sm mb-4">Assignment Controls</h3>
            <div className="space-y-4">

              <!-- Default for new emails -->
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-sm font-medium text-neutral-800">Default for new emails</p>
                  <p className="text-xs text-neutral-500 mt-0.5">Automatically append to all new composed emails</p>
                </div>
                <button id="toggle1" onclick="this.classList.toggle('toggle-on'); this.classList.toggle('toggle-off'); this.querySelector('span').classList.toggle('translate-x-5'); this.querySelector('span').classList.toggle('translate-x-0');" className="toggle-on relative inline-flex w-11 h-6 rounded-small transition-colors flex-shrink-0 cursor-pointer">
                  <span className="translate-x-5 inline-block w-5 h-5 mt-0.5 ml-0.5 bg-background-50 rounded-small shadow-custom transition-transform"></span>
                </button>
              </div>

              <!-- Default for replies -->
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-sm font-medium text-neutral-800">Default for replies & forwards</p>
                  <p className="text-xs text-neutral-500 mt-0.5">Append to reply and forwarded email threads</p>
                </div>
                <button id="toggle2" onclick="this.classList.toggle('toggle-on'); this.classList.toggle('toggle-off'); this.querySelector('span').classList.toggle('translate-x-5'); this.querySelector('span').classList.toggle('translate-x-0');" className="toggle-off relative inline-flex w-11 h-6 rounded-small transition-colors flex-shrink-0 cursor-pointer">
                  <span className="translate-x-0 inline-block w-5 h-5 mt-0.5 ml-0.5 bg-background-50 rounded-small shadow-custom transition-transform"></span>
                </button>
              </div>

              <!-- Account assignment -->
              <div className="flex items-start justify-between pt-1 border-t border-neutral-100">
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-sm font-medium text-neutral-800">Assign to account</p>
                  <p className="text-xs text-neutral-500 mt-0.5">Apply this signature to a specific email account</p>
                </div>
                <select className="text-sm text-neutral-700 bg-background-100 border border-neutral-200 rounded-small px-3 py-1.5 focus:outline-none focus:border-primary-300 flex-shrink-0">
                  <option>All accounts</option>
                  <option selected="">alex@mailflow.io</option>
                  <option>alex.morgan@work.com</option>
                </select>
              </div>

            </div>
          </section>

          <!-- Live Preview -->
          <section className="bg-background-50 rounded-large shadow-custom overflow-hidden" style={{maxHeight: 260}}>
            <div className="px-5 py-3 border-b border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                <span className="text-sm font-semibold text-neutral-700">Live Preview</span>
              </div>
              <span className="text-xs text-neutral-400">How it appears in emails</span>
            </div>
            <div className="p-5 bg-background-100">
              <!-- Simulated email context -->
              <div className="bg-background-50 rounded-large border border-neutral-200 p-4">
                <p className="text-xs text-neutral-400 mb-3 pb-2 border-b border-neutral-100">— Your message above —</p>
                <div className="border-l-2 border-neutral-200 pl-3">
                  <p className="text-sm text-neutral-800 font-semibold">Alex Morgan</p>
                  <p className="text-sm text-neutral-600">Product Designer · MailFlow</p>
                  <p className="text-sm text-primary-600">alex@mailflow.io</p>
                  <div className="w-12 h-0.5 bg-primary-400 my-1.5 rounded-small"></div>
                  <p className="text-xs text-neutral-500">📍 San Francisco, CA &nbsp;·&nbsp; 🌐 mailflow.io</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs text-neutral-400">Follow us:</span>
                    <span className="text-xs text-primary-600">LinkedIn</span>
                    <span className="text-xs text-primary-600">Twitter</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>

    </div>
  </div>
</div>

<!-- NEW SIGNATURE MODAL -->
<div id="new-sig-modal" className="hidden fixed inset-0 z-50 flex items-center justify-center bg-neutral-900 bg-opacity-40">
  <div className="bg-background-50 rounded-large shadow-custom-hover w-full max-w-md mx-4 overflow-hidden">
    <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
      <h3 className="font-heading font-semibold text-neutral-900 text-base">Create New Signature</h3>
      <button onclick="document.getElementById('new-sig-modal').classList.add('hidden')" className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-background-100 rounded-small transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
    </div>
    <div className="px-6 py-5 space-y-4">
      <div>
        <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-1.5">Signature Name</label>
        <input type="text" placeholder="e.g. Professional, Casual, Marketing…" className="w-full px-3 py-2.5 text-sm bg-background-100 border border-neutral-200 rounded-small text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-primary-300 focus:bg-background-50 transition-colors">
      </div>
      <div>
        <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-1.5">Start From</label>
        <div className="grid grid-cols-2 gap-3">
          <button className="flex flex-col items-center gap-2 p-3 border-2 border-primary-300 bg-primary-50 rounded-large text-center cursor-pointer transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            <span className="text-xs font-semibold text-primary-700">Blank</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-3 border border-neutral-200 bg-background-100 rounded-large text-center cursor-pointer hover:border-primary-200 hover:bg-primary-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            <span className="text-xs font-semibold text-neutral-600">Copy Existing</span>
          </button>
        </div>
      </div>
    </div>
    <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-end gap-3">
      <button onclick="document.getElementById('new-sig-modal').classList.add('hidden')" className="px-4 py-2 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-small hover:bg-background-100 transition-colors shadow-custom">
        Cancel
      </button>
      <button onclick="document.getElementById('new-sig-modal').classList.add('hidden')" className="px-4 py-2 text-sm font-semibold ai-gradient-bg text-neutral-50 rounded-small compose-btn-glow transition-all">
        Create Signature
      </button>
    </div>
  </div>
</div>





    </>
  );
};

export default SignatureManagement;