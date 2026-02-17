
INSERT INTO guides (title, slug, category, author, status, tags, content, updated_at, metadata) VALUES
(
  'Getting Started with Miyomi',
  'getting-started',
  'Installation',
  'Team Miyomi',
  'approved',
  ARRAY['setup', 'beginner'],
  '<h1>Getting Started</h1><p>Welcome to the ultimate guide for setting up your manga and anime hub. Miyomi connects you to the best sources using a familiar interface.</p><h2>Step 1: Installation</h2><p>Download the latest APK from the <a href="/software">Software</a> page. We recommend <strong>Mihon</strong> for manga and <strong>Aniyomi</strong> for anime.</p><h2>Step 2: Permissions</h2><p>On first launch, grant storage permissions so the app can save your downloads and backups.</p><img src="https://placehold.co/600x400?text=Setup+Wizard" alt="Setup Wizard" />',
  NOW(),
  '{"readTime": "3 min read"}'::jsonb
),
(
  'Adding Extension Repositories',
  'adding-extension-repos',
  'Configuration',
  'Team Miyomi',
  'approved',
  ARRAY['extensions', 'repos'],
  '<h1>Adding Extension Repos</h1><p>Extensions are plugins that provide content. You need to add a repository first.</p><h3>Recommended Repo</h3><p>The most reliable repository is <a href="https://keiyoushi.github.io/extensions/" target="_blank">Keiyoushi</a>.</p><ol><li>Go to <strong>Browse</strong> > <strong>Extensions</strong>.</li><li>Tap <strong>Extension Repos</strong>.</li><li>Add the URL: <code>https://raw.githubusercontent.com/keiyoushi/extensions/repo/index.min.json</code></li></ol>',
  NOW(),
  '{"readTime": "4 min read"}'::jsonb
),
(
  'Installing Extensions',
  'installing-extensions',
  'Configuration',
  'Team Miyomi',
  'approved',
  ARRAY['extensions', 'sources'],
  '<h1>Installing Extensions</h1><p>Once you have a repo, you can install extensions.</p><p>Go to the <strong>Extensions</strong> tab and find your favorite sources like <em>Mangadex</em>, <em>Mangasee</em>, or <em>Gogoanime</em>.</p><p>Tap <strong>Install</strong> and then <strong>Trust</strong> when prompted.</p><img src="https://placehold.co/600x400?text=Extensions+List" alt="Extensions List" />',
  NOW(),
  '{"readTime": "2 min read"}'::jsonb
),
(
  'Tracking your Progress',
  'tracking-progress',
  'Features',
  'Team Miyomi',
  'approved',
  ARRAY['tracking', 'anilist', 'mal'],
  '<h1>Tracking with MAL & AniList</h1><p>Keep your reading list synced automatically.</p><h2>Setup</h2><ol><li>Go to <strong>Settings</strong> > <strong>Tracking</strong>.</li><li>Select your service (MyAnimeList, AniList, Kitsu).</li><li>Log in to authorize.</li></ol><p>Now, when you add a manga to your library, you can link it to the tracker.</p>',
  NOW(),
  '{"readTime": "5 min read"}'::jsonb
),
(
  'Backing Up Your Library',
  'backup-restore',
  'Maintenance',
  'Team Miyomi',
  'approved',
  ARRAY['backup', 'restore'],
  '<h1>Backups are Critical</h1><p>Don''t lose your library!</p><h2>Creating a Backup</h2><p>Go to <strong>Settings</strong> > <strong>Data and Storage</strong> > <strong>Create Backup</strong>.</p><p>We recommend enabling <strong>Automatic Backups</strong> to run every 12 hours.</p>',
  NOW(),
  '{"readTime": "3 min read"}'::jsonb
),
(
  'Migrating from Tachiyomi',
  'migrating-from-tachiyomi',
  'Migration',
  'Team Miyomi',
  'approved',
  ARRAY['migration', 'tachiyomi'],
  '<h1>Migrating to Miyomi/Mihon</h1><p>Moving from the legacy Tachiyomi app is easy.</p><ol><li>In Tachiyomi, create a backup.</li><li>Install Mihon/Aniyomi.</li><li>Go to Settings > Data and Storage > Restore Backup.</li><li>Select your Tachiyomi backup file.</li></ol><p>All your categories and chapters will be restored.</p>',
  NOW(),
  '{"readTime": "6 min read"}'::jsonb
),
(
  'Advanced Search & Filtering',
  'advanced-search',
  'Features',
  'Team Miyomi',
  'approved',
  ARRAY['search', 'filtering'],
  '<h1>Mastering Search</h1><p>Find exactly what you want.</p><p>In the browse view, tap the <strong>Filter</strong> icon. You can filter by:</p><ul><li>Genre (Include/Exclude)</li><li>Status (Ongoing/Completed)</li><li>Sort Order</li></ul>',
  NOW(),
  '{"readTime": "4 min read"}'::jsonb
),
(
  'Downloading for Offline Reading',
  'offline-reading',
  'Features',
  'Team Miyomi',
  'approved',
  ARRAY['download', 'offline'],
  '<h1>Reading Offline</h1><p>Perfect for traveling.</p><p>Open a manga info page and tap the <strong>Download</strong> icon next to a chapter. You can also download entire categories by long-pressing a manga in your library.</p>',
  NOW(),
  '{"readTime": "3 min read"}'::jsonb
),
(
  'Organizing with Categories',
  'organizing-categories',
  'Organization',
  'Team Miyomi',
  'approved',
  ARRAY['categories', 'library'],
  '<h1>Using Categories</h1><p>Keep your library tidy.</p><p>Go to <strong>More</strong> > <strong>Categories</strong>. Create categories like "Reading", "Plan to Read", "Completed".</p><p>Assign manga to categories from the library view.</p>',
  NOW(),
  '{"readTime": "4 min read"}'::jsonb
),
(
  'Troubleshooting: Cloudflare Issues',
  'troubleshooting-cloudflare',
  'Troubleshooting',
  'Team Miyomi',
  'approved',
  ARRAY['cloudflare', 'webview'],
  '<h1>Cloudflare Protection</h1><p>If a source shows "Cloudflare protection", follow these steps:</p><ol><li>Open the manga in WebView (Globe icon).</li><li>Solve the Captcha manually.</li><li>Go back to the app.</li></ol><p>The source should now work.</p>',
  NOW(),
  '{"readTime": "3 min read"}'::jsonb
),
(
  'Troubleshooting: HTTP Errors',
  'troubleshooting-http-errors',
  'Troubleshooting',
  'Team Miyomi',
  'approved',
  ARRAY['http', 'error'],
  '<h1>Common HTTP Errors</h1><ul><li><strong>403 Forbidden</strong>: Usually Cloudflare. Solve captcha in WebView.</li><li><strong>404 Not Found</strong>: The manga might have been removed from the source. Migrate to a different source.</li><li><strong>500 Server Error</strong>: The source website is down. Try again later.</li></ul>',
  NOW(),
  '{"readTime": "5 min read"}'::jsonb
),
(
  'Mihon vs Aniyomi vs TachiyomiSY',
  'app-comparison',
  'General',
  'Team Miyomi',
  'approved',
  ARRAY['comparison', 'apps'],
  '<h1>Which App Should You Choose?</h1><ul><li><strong>Mihon</strong>: The direct successor to Tachiyomi. Stable, manga-focused.</li><li><strong>Aniyomi</strong>: Adds Anime support. Best for all-in-one usage.</li><li><strong>TachiyomiSY</strong>: A fork with extra features like EH support and custom layouts.</li></ul>',
  NOW(),
  '{"readTime": "7 min read"}'::jsonb
),
(
  'Featured App: Dantots',
  'featured-dantots',
  'Spotlight',
  'Team Miyomi',
  'approved',
  ARRAY['dantots', 'anime'],
  '<h1>Spotlight: Dantots</h1><p>Dantots is a modern client for Anilist. It is sleek, fast, and focused on tracking.</p><p>Key Features:</p><ul><li>Beautiful Material You Design</li><li>Deep Anilist Integration</li><li>Offline Support</li></ul>',
  NOW(),
  '{"readTime": "4 min read"}'::jsonb
),
(
  'Featured App: Kotatsu',
  'featured-kotatsu',
  'Spotlight',
  'Team Miyomi',
  'approved',
  ARRAY['kotatsu', 'manga'],
  '<h1>Spotlight: Kotatsu</h1><p>A lightweight manga reader for Android.</p><p>Why use Kotatsu?</p><ul><li>Simple interface</li><li>Fast loading</li><li>No extensions needed (built-in sources)</li></ul>',
  NOW(),
  '{"readTime": "3 min read"}'::jsonb
),
(
  'Installation on PC (Waydroid)',
  'pc-installation-waydroid',
  'Installation',
  'Team Miyomi',
  'approved',
  ARRAY['pc', 'waydroid', 'linux'],
  '<h1>Miyomi on Linux</h1><p>You can run Android apps on Linux using Waydroid.</p><p>1. Install Waydroid.<br>2. Initialize it.<br>3. Install the APK: <code>waydroid app install miyomi.apk</code></p>',
  NOW(),
  '{"readTime": "8 min read"}'::jsonb
),
(
  'Global Updates',
  'global-updates',
  'Features',
  'Team Miyomi',
  'approved',
  ARRAY['updates', 'library'],
  '<h1>Keeping Up to Date</h1><p>Update your entire library in one click.</p><p>Go to <strong>Updates</strong> tab and pull down to refresh. This will check for new chapters for all manga in your library.</p>',
  NOW(),
  '{"readTime": "2 min read"}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  category = EXCLUDED.category,
  tags = EXCLUDED.tags,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();
