
-- Update 1: Getting Started
INSERT INTO guides (title, slug, category, author, status, tags, content, updated_at, metadata) VALUES (
  'Getting Started with Miyomi',
  'getting-started',
  'Installation',
  'Team Miyomi',
  'published',
  ARRAY['setup', 'beginner', 'installation'],
  '<h1>Getting Started with Miyomi</h1>
<p class="lead">Welcome to the ultimate manga and anime tracking experience. This guide will walk you through installing the app and setting it up for the first time.</p>

<h2>1. Choose Your Version</h2>
<p>Miyomi supports multiple variants based on your needs. Only download from our official <a href="/software">Software page</a>.</p>
<ul>
  <li><strong>Mihon</strong>: Best for Manga reading only. Stable and fast.</li>
  <li><strong>Aniyomi</strong>: Supports both Anime and Manga. The all-in-one solution.</li>
  <li><strong>TachiyomiSY</strong>: Advanced fork with extra features like custom layouts.</li>
</ul>

<h2>2. Installation Steps</h2>
<ol>
  <li>Download the <strong>APK file</strong> for your chosen version.</li>
  <li>Open the file on your Android device.</li>
  <li>If prompted, allow installation from "Unknown Sources" in your browser settings.</li>
  <li>Tap <strong>Install</strong> and wait for the process to finish.</li>
</ol>

<blockquote>
  <strong>Note:</strong> If you are updating an existing installation, simply install the new APK over the old one. Your data will be preserved.
</blockquote>

<h2>3. Initial Setup</h2>
<p>When you open the app for the first time, you will be asked to grant <strong>Storage Permissions</strong>. This is crucial for:</p>
<ul>
  <li>Saving downloaded chapters/episodes.</li>
  <li>Creating and restoring backups.</li>
  <li>Saving cover images for your library.</li>
</ul>
<p>Tap <strong>Allow</strong> to proceed.</p>

<h2>4. What''s Next?</h2>
<p>Your library is currently empty. To start reading, you need to add <strong>Extensions</strong>. Check out our <a href="/guides/adding-extension-repos">Extension Guide</a> to continue.</p>',
  NOW(),
  '{"readTime": "5 min read"}'::jsonb
) ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content, status = EXCLUDED.status, metadata = EXCLUDED.metadata;

-- Update 2: Extension Repos
INSERT INTO guides (title, slug, category, author, status, tags, content, updated_at, metadata) VALUES (
  'Adding Extension Repositories',
  'adding-extension-repos',
  'Configuration',
  'Team Miyomi',
  'published',
  ARRAY['extensions', 'repos', 'keiyoushi'],
  '<h1>Adding Extension Repositories</h1>
<p>By default, the app does not come with any content sources. You must add a third-party repository to find and install extensions.</p>

<h2>The Keiyoushi Repo</h2>
<p>We recommend the <strong>Keiyoushi</strong> repository, which is community-maintained and safe.</p>

<h3>How to Add via URL</h3>
<ol>
  <li>Open Miyomi and go to the <strong>Browse</strong> tab.</li>
  <li>Tap on <strong>Extensions</strong> at the top.</li>
  <li>Tap the <strong>Extension Repos</strong> button (or "Repos" in the menu).</li>
  <li>Tap <strong>Add</strong> and enter this URL:</li>
</ol>
<pre><code>https://raw.githubusercontent.com/keiyoushi/extensions/repo/index.min.json</code></pre>

<h3>How to Add via Website</h3>
<p>Alternatively, you can visit the <a href="https://keiyoushi.github.io/extensions/" target="_blank">Keiyoushi Website</a> and click "Add to Mihon".</p>

<h2>Trusting Extensions</h2>
<p>After adding the repo, you will see a list of available extensions. When you install one, you must <strong>Trust</strong> it:</p>
<ol>
  <li>Tap <strong>Install</strong> on an extension (e.g., Mangadex).</li>
  <li>Once installed, tap on it again in the list.</li>
  <li>Tap <strong>Trust</strong> in the popup dialog.</li>
</ol>
<p>Now you can browse content from that source!</p>',
  NOW(),
  '{"readTime": "4 min read"}'::jsonb
) ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content, status = EXCLUDED.status, metadata = EXCLUDED.metadata;

-- Update 3: Tracking
INSERT INTO guides (title, slug, category, author, status, tags, content, updated_at, metadata) VALUES (
  'Tracking your Progress',
  'tracking-progress',
  'Features',
  'Team Miyomi',
  'published',
  ARRAY['tracking', 'anilist', 'mal', 'kitsu'],
  '<h1>Tracking Anime & Manga</h1>
<p>Sync your reading progress automatically with services like MyAnimeList (MAL), AniList, and Kitsu.</p>

<h2>Setting up Tracking</h2>
<ol>
  <li>Go to <strong>Settings</strong> > <strong>Tracking</strong>.</li>
  <li>Select your preferred service (e.g., <strong>AniList</strong>).</li>
  <li>Tap <strong>Login</strong>. This will open a browser window.</li>
  <li>Log in to your account and authorize the application.</li>
</ol>

<h2>Linking Content</h2>
<p>Once logged in, open any manga or anime in your library:</p>
<ol>
  <li>Tap the <strong>Tracking</strong> icon (usually a graph or list icon).</li>
  <li>Tap the service name (e.g., AniList).</li>
  <li>Search for the series title if it''s not found automatically.</li>
  <li>Select the correct entry linking it to your library item.</li>
</ol>

<h2>Automatic Updates</h2>
<p>Now, whenever you finish a chapter or episode, Miyomi will automatically update your status on the tracking site.</p>
<ul>
  <li><strong>Score:</strong> You can set your score directly in the app.</li>
  <li><strong>Status:</strong> Changing status to "Completed" in app updates the tracker.</li>
</ul>',
  NOW(),
  '{"readTime": "6 min read"}'::jsonb
) ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content, status = EXCLUDED.status, metadata = EXCLUDED.metadata;

-- Update 4: Troubleshooting
INSERT INTO guides (title, slug, category, author, status, tags, content, updated_at, metadata) VALUES (
  'Troubleshooting Common Errors',
  'troubleshooting-common-errors',
  'Troubleshooting',
  'Team Miyomi',
  'published',
  ARRAY['error', 'http', '403', 'webview'],
  '<h1>Troubleshooting Guide</h1>
<p>Encountering issues? Here are the most common errors and how to fix them.</p>

<h2>HTTP 403 / Cloudflare Protection</h2>
<p>This is the most common error. It means the source website is checking if you are a real human (Cloudflare CAPTCHA).</p>
<h3>The Fix:</h3>
<ol>
  <li>Open the manga in the app.</li>
  <li>Tap the <strong>WebView</strong> icon (Globe icon) in the toolbar.</li>
  <li>Wait for the page to load.</li>
  <li>If there represents a CAPTCHA or "Verify you are human" button, click it.</li>
  <li>Once the site content loads successfully, go back to the app.</li>
  <li>Refresh the chapter list.</li>
</ol>

<h2>HTTP 404: Not Found</h2>
<p>The manga or chapter has been removed from the source website.</p>
<ul>
  <li><strong>Solution:</strong> Use the "Migrate" feature to switch this manga to a different source (extension) that still has it.</li>
</ul>

<h2>"No Results Found"</h2>
<p>If search returns nothing:</p>
<ul>
  <li>Check your internet connection.</li>
  <li>Verify the specific extension is working by opening it in WebView.</li>
  <li>Update your extensions in the <strong>Extensions</strong> tab.</li>
</ul>',
  NOW(),
  '{"readTime": "5 min read"}'::jsonb
) ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content, status = EXCLUDED.status, metadata = EXCLUDED.metadata;

-- Update 5: Backup
INSERT INTO guides (title, slug, category, author, status, tags, content, updated_at, metadata) VALUES (
  'Backing Up Your Library',
  'backup-restore',
  'Maintenance',
  'Team Miyomi',
  'published',
  ARRAY['backup', 'security'],
  '<h1>Backups: Don''t Lose Your Data</h1>
<p>Your library, reading history, and categories are valuable. Creating regular backups is essential.</p>

<h2>Creating a Backup</h2>
<ol>
  <li>Go to <strong>Settings</strong> > <strong>Data and Storage</strong>.</li>
  <li>Tap <strong>Create Backup</strong>.</li>
  <li>Choose where to save the file. We recommend saving it to a cloud storage folder (like Google Drive) if possible.</li>
</ol>

<h2>Automatic Backups (Highly Recommended)</h2>
<p>You can set the app to backup automatically.</p>
<ol>
  <li>In <strong>Data and Storage</strong>, tap <strong>Automatic Backups</strong>.</li>
  <li>Set the frequency (e.g., Every 12 hours).</li>
  <li>Set the number of backups to keep (e.g., 2).</li>
</ol>

<h2>Restoring</h2>
<p>To restore data (e.g., on a new phone):</p>
<ol>
  <li>Install the app and extensions.</li>
  <li>Go to <strong>Settings</strong> > <strong>Data and Storage</strong> > <strong>Restore Backup</strong>.</li>
  <li>Select your <code>.proto.gz</code> backup file.</li>
</ol>',
  NOW(),
  '{"readTime": "3 min read"}'::jsonb
) ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content, status = EXCLUDED.status, metadata = EXCLUDED.metadata;

-- General Updates for others to set status=published content=... (simplified)
UPDATE guides SET status = 'published' WHERE status = 'approved';
