
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
  </ul>

  <!-- Step 3 -->
  <h2 style="color: var(--text-primary); font-size: 20px; font-weight: 700; margin-bottom: 16px;">Step 3: Install the App</h2>
  <ul style="list-style: none; padding: 0; margin-bottom: 32px;">
    <li style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
        <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: var(--brand); margin-top: 9px; flex-shrink: 0; opacity: 0.8;"></span>
        <span>Open your downloads folder and tap on the APK file</span>
    </li>
    <li style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
        <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: var(--brand); margin-top: 9px; flex-shrink: 0; opacity: 0.8;"></span>
        <span>Tap <strong>Install</strong> and wait for completion</span>
    </li>
  </ul>

</div>',
  NOW(),
  '{"readTime": "5 min read"}'::jsonb
) ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content, status = EXCLUDED.status, metadata = EXCLUDED.metadata;
