
INSERT INTO guides (title, slug, category, author, status, tags, content, updated_at, metadata) VALUES (
  'Installing Mihon for Android',
  'installing-mihon-android',
  'Installation',
  'Team Miyomi',
  'published',
  ARRAY['getting-started', 'mihon', 'android'],
  '<!-- Container Card -->
<div class="not-prose" style="background-color: var(--bg-elev-1); border-radius: 12px; padding: 32px; border: 1px solid var(--divider); color: var(--text-secondary); font-family: Inter, sans-serif;">
  
  <p style="margin-bottom: 24px; font-size: 16px; line-height: 1.6; color: var(--text-primary);">
    Mihon is a free and open-source manga reader for Android, forked from Tachiyomi. This guide will walk you through the installation process step by step.
  </p>

  <!-- Prerequisites -->
  <h2 style="color: var(--text-primary); font-size: 24px; font-weight: 700; margin-bottom: 16px; margin-top: 0;">Prerequisites</h2>
  <ul style="list-style: none; padding: 0; margin-bottom: 32px;">
    <li style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
        <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: var(--brand); margin-top: 8px; flex-shrink: 0;"></span>
        <span>An Android device running Android 6.0 or higher</span>
    </li>
    <li style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
        <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: var(--brand); margin-top: 8px; flex-shrink: 0;"></span>
        <span>Sufficient storage space (at least 50MB free)</span>
    </li>
    <li style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
        <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: var(--brand); margin-top: 8px; flex-shrink: 0;"></span>
        <span>Permission to install apps from unknown sources (we''ll set this up)</span>
    </li>
  </ul>

  <!-- Step 1 -->
  <h2 style="color: var(--text-primary); font-size: 20px; font-weight: 700; margin-bottom: 16px;">Step 1: Enable Unknown Sources</h2>
  <p style="margin-bottom: 16px;">Before installing Mihon, you need to allow installation from unknown sources:</p>
  <ul style="list-style: none; padding: 0; margin-bottom: 32px;">
    <li style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
        <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: var(--brand); margin-top: 9px; flex-shrink: 0; opacity: 0.8;"></span>
        <span>Go to <strong>Settings > Security</strong> (or Privacy)</span>
    </li>
    <li style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
        <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: var(--brand); margin-top: 9px; flex-shrink: 0; opacity: 0.8;"></span>
        <span>Find "Install unknown apps" or "Unknown sources"</span>
    </li>
    <li style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
        <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: var(--brand); margin-top: 9px; flex-shrink: 0; opacity: 0.8;"></span>
        <span>Select your browser (Chrome, Firefox, etc.)</span>
    </li>
    <li style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
        <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: var(--brand); margin-top: 9px; flex-shrink: 0; opacity: 0.8;"></span>
        <span>Toggle "Allow from this source"</span>
    </li>
  </ul>
  
  <div style="background-color: var(--chip-bg); border-left: 4px solid var(--brand); padding: 16px; border-radius: 4px; font-style: italic; margin-bottom: 32px; color: var(--text-secondary);">
    Note: The exact steps may vary depending on your Android version and device manufacturer.
  </div>

  <!-- Step 2 -->
  <h2 style="color: var(--text-primary); font-size: 20px; font-weight: 700; margin-bottom: 16px;">Step 2: Download Mihon</h2>
  <ul style="list-style: none; padding: 0; margin-bottom: 32px;">
    <li style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
        <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: var(--brand); margin-top: 9px; flex-shrink: 0; opacity: 0.8;"></span>
        <span>Visit the official <a href="#" style="color: var(--brand); text-decoration: none;">GitHub releases page</a></span>
    </li>
    <li style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
        <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: var(--brand); margin-top: 9px; flex-shrink: 0; opacity: 0.8;"></span>
        <span>Download the latest <code>.apk</code> file</span>
    </li>
    <li style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
        <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: var(--brand); margin-top: 9px; flex-shrink: 0; opacity: 0.8;"></span>
        <span>Wait for the download to complete</span>
    </li>
  </ul>

  <!-- Step 3 -->
  <h2 style="color: var(--text-primary); font-size: 20px; font-weight: 700; margin-bottom: 16px;">Step 3: Install the App</h2>
  <ul style="list-style: none; padding: 0; margin-bottom: 32px;">
    <li style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
        <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: var(--brand); margin-top: 9px; flex-shrink: 0; opacity: 0.8;"></span>
        <span>Open your downloads folder or notification</span>
    </li>
    <li style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
        <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: var(--brand); margin-top: 9px; flex-shrink: 0; opacity: 0.8;"></span>
        <span>Tap on the Mihon <code>.apk</code> file</span>
    </li>
    <li style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
        <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: var(--brand); margin-top: 9px; flex-shrink: 0; opacity: 0.8;"></span>
        <span>Tap "Install" when prompted</span>
    </li>
    <li style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
        <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: var(--brand); margin-top: 9px; flex-shrink: 0; opacity: 0.8;"></span>
        <span>Wait for installation to complete</span>
    </li>
    <li style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
        <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: var(--brand); margin-top: 9px; flex-shrink: 0; opacity: 0.8;"></span>
        <span>Tap "Open" to launch Mihon</span>
    </li>
  </ul>

  <!-- Step 4 -->
  <h2 style="color: var(--text-primary); font-size: 20px; font-weight: 700; margin-bottom: 16px;">Step 4: Initial Setup</h2>
  <p style="margin-bottom: 16px;">After launching Mihon for the first time:</p>
  <ul style="list-style: none; padding: 0; margin-bottom: 32px;">
    <li style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
        <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: var(--brand); margin-top: 9px; flex-shrink: 0; opacity: 0.8;"></span>
        <span>Grant storage permissions when prompted</span>
    </li>
    <li style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
        <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: var(--brand); margin-top: 9px; flex-shrink: 0; opacity: 0.8;"></span>
        <span>Choose your preferred theme (Light/Dark)</span>
    </li>
    <li style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
        <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: var(--brand); margin-top: 9px; flex-shrink: 0; opacity: 0.8;"></span>
        <span>Browse the built-in extension repos</span>
    </li>
    <li style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
        <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: var(--brand); margin-top: 9px; flex-shrink: 0; opacity: 0.8;"></span>
        <span style="font-weight: 600; color: var(--text-primary);">You''re ready to start reading!</span>
    </li>
  </ul>

  <!-- Next Steps -->
  <div style="margin-top: 40px; padding-top: 32px; border-top: 1px solid var(--divider);">
      <h2 style="color: var(--text-primary); font-size: 20px; font-weight: 700; margin-bottom: 16px;">Next Steps</h2>
      <p style="margin-bottom: 16px;">Now that Mihon is installed, you can:</p>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
          <a href="/guides/adding-extension-repos" style="display: block; padding: 16px; background-color: var(--chip-bg); border-radius: 8px; text-decoration: none; color: var(--text-primary); border: 1px solid var(--divider); transition: border-color 0.2s;">
              <span style="font-weight: 600; font-size: 15px; display: block; margin-bottom: 4px;">Add Extensions</span>
              <span style="font-size: 13px; color: var(--text-secondary);">Find sources for manga</span>
          </a>
          <a href="#" style="display: block; padding: 16px; background-color: var(--chip-bg); border-radius: 8px; text-decoration: none; color: var(--text-primary); border: 1px solid var(--divider); transition: border-color 0.2s;">
              <span style="font-weight: 600; font-size: 15px; display: block; margin-bottom: 4px;">Configure Tracking</span>
              <span style="font-size: 13px; color: var(--text-secondary);">Sync with MAL / AniList</span>
          </a>
          <a href="#" style="display: block; padding: 16px; background-color: var(--chip-bg); border-radius: 8px; text-decoration: none; color: var(--text-primary); border: 1px solid var(--divider); transition: border-color 0.2s;">
              <span style="font-weight: 600; font-size: 15px; display: block; margin-bottom: 4px;">Automatic Backups</span>
              <span style="font-size: 13px; color: var(--text-secondary);">Secure your library</span>
          </a>
          <a href="#" style="display: block; padding: 16px; background-color: var(--chip-bg); border-radius: 8px; text-decoration: none; color: var(--text-primary); border: 1px solid var(--divider); transition: border-color 0.2s;">
              <span style="font-weight: 600; font-size: 15px; display: block; margin-bottom: 4px;">Settings</span>
              <span style="font-size: 13px; color: var(--text-secondary);">Customize reader</span>
          </a>
      </div>
  </div>

</div>',
  NOW(),
  '{"readTime": "8 min read"}'::jsonb
) ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content, status = EXCLUDED.status, metadata = EXCLUDED.metadata;
