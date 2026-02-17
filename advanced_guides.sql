
-- Advanced Update for Getting Started
UPDATE guides 
SET 
  content = '
<div class="not-prose space-y-8 font-sans text-foreground">
  
  <!-- Hero Section -->
  <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600/20 via-transparent to-transparent p-8 md:p-12 border border-white/5">
    <div class="relative z-10">
        <span class="inline-flex items-center rounded-full bg-violet-500/10 px-3 py-1 text-sm font-medium text-violet-400 ring-1 ring-inset ring-violet-500/20 mb-6">
            New Version v2.0
        </span>
        <h1 class="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Getting Started with Miyomi
        </h1>
        <p class="text-lg text-gray-300 max-w-2xl">
            Welcome to the ultimate manga and anime tracking experience. Follow this guide to jumpstart your library in minutes.
        </p>
    </div>
    <div class="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl"></div>
  </div>

  <!-- Quick Actions Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="p-6 rounded-2xl bg-card border border-border hover:bg-accent/50 transition-colors group cursor-pointer">
        <div class="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-500"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </div>
        <h3 class="text-lg font-semibold mb-2">Download App</h3>
        <p class="text-sm text-muted-foreground">Get the latest APK from our verified software page.</p>
    </div>
    <div class="p-6 rounded-2xl bg-card border border-border hover:bg-accent/50 transition-colors group cursor-pointer">
        <div class="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-orange-500"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        </div>
        <h3 class="text-lg font-semibold mb-2">Pricing</h3>
        <p class="text-sm text-muted-foreground">Miyomi is forever free and open source.</p>
    </div>
  </div>

  <!-- Step by Step -->
  <div class="border-t border-border pt-8">
      <h2 class="text-2xl font-bold mb-6 flex items-center gap-3">
        Installation Steps
        <span class="text-xs font-normal px-2 py-1 bg-secondary rounded text-muted-foreground">3 min setup</span>
      </h2>
      
      <div class="space-y-4">
        <!-- Step 1 -->
        <div class="flex gap-4 p-4 rounded-xl bg-secondary/20 border border-border/50">
            <div class="flex-none flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">1</div>
            <div>
                <h4 class="font-medium text-foreground">Download the APK</h4>
                <p class="text-sm text-muted-foreground mt-1">Choose between <strong>Mihon</strong> (Manga only) or <strong>Aniyomi</strong> (Anime + Manga).</p>
            </div>
        </div>

        <!-- Step 2 -->
        <div class="flex gap-4 p-4 rounded-xl bg-secondary/20 border border-border/50">
            <div class="flex-none flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">2</div>
            <div>
                <h4 class="font-medium text-foreground">Enable "Unknown Sources"</h4>
                <p class="text-sm text-muted-foreground mt-1">Your device will ask for permission to install apps from your browser. Tap <strong>Allow</strong>.</p>
            </div>
        </div>

        <!-- Step 3 -->
        <div class="flex gap-4 p-4 rounded-xl bg-secondary/20 border border-border/50">
            <div class="flex-none flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">3</div>
            <div>
                <h4 class="font-medium text-foreground">Install & Launch</h4>
                <p class="text-sm text-muted-foreground mt-1">Once installed, open the app and grant <strong>Storage Permissions</strong> to save your library.</p>
            </div>
        </div>
      </div>
  </div>

  <!-- Warning Alert -->
  <div class="p-6 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-4 items-start">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-500 shrink-0 mt-1"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    <div>
        <h4 class="font-bold text-amber-500 mb-1">Important Note</h4>
        <p class="text-sm text-amber-200/80">
            Never download Miyomi from unauthorized websites. Only use our official links or the GitHub repository to ensure you get a safe, malware-free version.
        </p>
    </div>
  </div>

</div>'
WHERE slug = 'getting-started';

-- Advanced Update for Extension Repos
UPDATE guides 
SET 
  content = '
<div class="not-prose space-y-8 font-sans text-foreground">

  <div class="flex flex-col md:flex-row gap-8 items-start">
    <div class="flex-1 space-y-6">
        <h1 class="text-3xl font-bold">Extension Repositories</h1>
        <p class="text-lg text-muted-foreground">
            Miyomi requires external repositories to find and install content sources. Without extensions, your library will be empty.
        </p>

        <div class="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <h3 class="font-semibold text-blue-400 mb-2">Why Keiyoushi?</h3>
            <p class="text-sm text-blue-200/70">We recommend the <strong>Keiyoushi</strong> repository as it is community-maintained, frequently updated, and contains thousands of reliable sources.</p>
        </div>
    </div>
    
    <div class="w-full md:w-80 p-6 rounded-2xl bg-card border border-border shadow-2xl shrink-0">
        <h4 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Quick Stats</h4>
        <div class="space-y-4">
            <div class="flex justify-between items-center pb-2 border-b border-border">
                <span>Sources</span>
                <span class="font-mono font-bold">2,000+</span>
            </div>
            <div class="flex justify-between items-center pb-2 border-b border-border">
                <span>Updates</span>
                <span class="font-mono font-bold text-green-500">Daily</span>
            </div>
            <div class="flex justify-between items-center">
                <span>Trust Level</span>
                <span class="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-bold">Verified</span>
            </div>
        </div>
    </div>
  </div>

  <div class="border-t border-border pt-8">
    <h2 class="text-2xl font-bold mb-6">How to Add the Repo</h2>
    
    <div class="grid gap-6">
        <div class="relative group">
            <div class="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl opacity-75 group-hover:opacity-100 transition duration-200 blur"></div>
            <div class="relative p-6 bg-black rounded-xl border border-white/10">
                <div class="flex justify-between items-center mb-4">
                    <span class="text-xs font-mono text-gray-400">repo.json</span>
                    <button class="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition">Copy URL</button>
                </div>
                <code class="block font-mono text-sm text-pink-300 break-all mb-4">
                    https://raw.githubusercontent.com/keiyoushi/extensions/repo/index.min.json
                </code>
                <div class="text-sm text-gray-400">
                    Go to <strong>Miyomi > Browse > Extensions > Repos > Add</strong> and paste this URL.
                </div>
            </div>
        </div>
    </div>
  </div>

</div>'
WHERE slug = 'adding-extension-repos';
