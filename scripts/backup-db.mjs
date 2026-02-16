/**
 * Miyomi Database Backup Script
 * Exports all public table data from Supabase to a timestamped JSON file.
 *
 * Usage:
 *   node scripts/backup-db.mjs                  # backup all tables
 *   node scripts/backup-db.mjs --tables apps,extensions  # backup specific tables
 *   node scripts/backup-db.mjs --output my-backup.json   # custom output file
 */

import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

dotenv.config({ path: path.join(ROOT, ".env") });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error(
        "❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env"
    );
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
});

const ALL_TABLES = [
    "user_roles",
    "admins",
    "apps",
    "extensions",
    "guides",
    "faqs",
    "likes",
    "submissions",
    "notices",
    "themes",
    "settings",
    "admin_logs",
    "admin_sessions",
];

const args = process.argv.slice(2);
let tablesToBackup = ALL_TABLES;
let outputFile = null;

for (let i = 0; i < args.length; i++) {
    if (args[i] === "--tables" && args[i + 1]) {
        tablesToBackup = args[++i].split(",").map((t) => t.trim());
    } else if (args[i] === "--output" && args[i + 1]) {
        outputFile = args[++i];
    }
}

async function fetchAllRows(table) {
    const PAGE_SIZE = 1000;
    let allRows = [];
    let from = 0;
    let hasMore = true;

    while (hasMore) {
        const { data, error } = await supabase
            .from(table)
            .select("*")
            .range(from, from + PAGE_SIZE - 1)
            .order("id", { ascending: true, nullsFirst: false });

        if (error) {
            // Some tables (like settings) use 'key' as PK, not 'id'
            if (error.message?.includes("id")) {
                const { data: fallbackData, error: fallbackError } = await supabase
                    .from(table)
                    .select("*")
                    .range(from, from + PAGE_SIZE - 1);

                if (fallbackError) throw fallbackError;
                allRows = allRows.concat(fallbackData || []);
                hasMore = (fallbackData?.length || 0) === PAGE_SIZE;
            } else {
                throw error;
            }
        } else {
            allRows = allRows.concat(data || []);
            hasMore = (data?.length || 0) === PAGE_SIZE;
        }

        from += PAGE_SIZE;
    }

    return allRows;
}

async function backup() {
    console.log("🔄 Starting Miyomi database backup...");
    console.log(`   URL: ${SUPABASE_URL}`);
    console.log(`   Tables: ${tablesToBackup.join(", ")}\n`);

    const backupData = {
        metadata: {
            created_at: new Date().toISOString(),
            supabase_url: SUPABASE_URL,
            tables: [],
            total_rows: 0,
        },
        tables: {},
    };

    for (const table of tablesToBackup) {
        try {
            const rows = await fetchAllRows(table);
            backupData.tables[table] = rows;
            backupData.metadata.tables.push({
                name: table,
                row_count: rows.length,
            });
            backupData.metadata.total_rows += rows.length;
            console.log(`   ✅ ${table}: ${rows.length} rows`);
        } catch (err) {
            console.error(`   ❌ ${table}: ${err.message}`);
            backupData.tables[table] = [];
            backupData.metadata.tables.push({
                name: table,
                row_count: 0,
                error: err.message,
            });
        }
    }

    const backupsDir = path.join(ROOT, "backups");
    if (!fs.existsSync(backupsDir)) {
        fs.mkdirSync(backupsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const filename = outputFile || `backup-${timestamp}.json`;
    const filepath = path.isAbsolute(filename)
        ? filename
        : path.join(backupsDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2), "utf-8");

    console.log(`\n🎉 Backup complete!`);
    console.log(`   📁 File: ${filepath}`);
    console.log(
        `   📊 Total: ${backupData.metadata.total_rows} rows across ${backupData.metadata.tables.length} tables`
    );
}

backup().catch((err) => {
    console.error("💥 Backup failed:", err.message);
    process.exit(1);
});
