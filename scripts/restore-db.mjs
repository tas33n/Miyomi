/**
 * Miyomi Database Restore Script
 * Restores data from a backup JSON file into Supabase.
 *
 * Usage:
 *   node scripts/restore-db.mjs backups/backup-2026-02-16.json
 *   node scripts/restore-db.mjs backups/backup-2026-02-16.json --tables apps,extensions
 *   node scripts/restore-db.mjs backups/backup-2026-02-16.json --mode upsert   (default)
 *   node scripts/restore-db.mjs backups/backup-2026-02-16.json --mode clean     (deletes existing data first)
 *   node scripts/restore-db.mjs backups/backup-2026-02-16.json --dry-run        (preview only)
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

const TABLE_PK = {
    settings: "key",
};

const RESTORE_ORDER = [
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

const DELETE_ORDER = [...RESTORE_ORDER].reverse();

const args = process.argv.slice(2);
const backupFile = args.find((a) => !a.startsWith("--"));
let tablesToRestore = null;
let mode = "upsert";
let dryRun = false;

for (let i = 0; i < args.length; i++) {
    if (args[i] === "--tables" && args[i + 1]) {
        tablesToRestore = args[++i].split(",").map((t) => t.trim());
    } else if (args[i] === "--mode" && args[i + 1]) {
        mode = args[++i];
    } else if (args[i] === "--dry-run") {
        dryRun = true;
    }
}

if (!backupFile) {
    console.error("❌ Usage: node scripts/restore-db.mjs <backup-file> [options]");
    console.error("   Options:");
    console.error("     --tables apps,extensions    Restore specific tables only");
    console.error("     --mode upsert|clean         Restore mode (default: upsert)");
    console.error("     --dry-run                   Preview without writing");
    process.exit(1);
}

const filepath = path.isAbsolute(backupFile)
    ? backupFile
    : path.resolve(ROOT, backupFile);

if (!fs.existsSync(filepath)) {
    console.error(`❌ Backup file not found: ${filepath}`);
    process.exit(1);
}

async function upsertBatch(table, rows) {
    const BATCH_SIZE = 500;
    let totalUpserted = 0;
    const pk = TABLE_PK[table] || "id";

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from(table).upsert(batch, {
            onConflict: pk,
            ignoreDuplicates: false,
        });

        if (error) {
            throw new Error(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${error.message}`);
        }
        totalUpserted += batch.length;
    }

    return totalUpserted;
}

async function deleteAllRows(table) {
    const pk = TABLE_PK[table] || "id";

    if (pk === "key") {
        const { error } = await supabase
            .from(table)
            .delete()
            .neq("key", "__nonexistent__");
        if (error) throw error;
    } else {
        const { error } = await supabase
            .from(table)
            .delete()
            .neq("id", "00000000-0000-0000-0000-000000000000");
        if (error) throw error;
    }
}

async function restore() {
    console.log("🔄 Starting Miyomi database restore...");
    console.log(`   📁 File: ${filepath}`);
    console.log(`   🔗 URL: ${SUPABASE_URL}`);
    console.log(`   📋 Mode: ${mode}${dryRun ? " (DRY RUN)" : ""}\n`);

    const raw = fs.readFileSync(filepath, "utf-8");
    const backupData = JSON.parse(raw);

    if (!backupData.tables || !backupData.metadata) {
        console.error("❌ Invalid backup file format.");
        process.exit(1);
    }

    console.log(
        `   Backup from: ${backupData.metadata.created_at} (${backupData.metadata.total_rows} total rows)\n`
    );

    const tables = (tablesToRestore || RESTORE_ORDER).filter(
        (t) => backupData.tables[t] !== undefined
    );

    if (tables.length === 0) {
        console.error("❌ No matching tables found in backup.");
        process.exit(1);
    }

    if (dryRun) {
        console.log("   📋 Dry run — no changes will be made:\n");
        for (const table of tables) {
            const rows = backupData.tables[table] || [];
            console.log(`   ${table}: ${rows.length} rows would be restored`);
        }
        console.log("\n✅ Dry run complete. Remove --dry-run to apply.");
        return;
    }

    if (mode === "clean") {
        console.log("   🗑️  Cleaning existing data...\n");
        const deleteTargets = DELETE_ORDER.filter((t) => tables.includes(t));
        for (const table of deleteTargets) {
            try {
                await deleteAllRows(table);
                console.log(`   🗑️  ${table}: cleared`);
            } catch (err) {
                console.error(`   ⚠️  ${table}: ${err.message}`);
            }
        }
        console.log("");
    }

    console.log("   📥 Restoring data...\n");
    let totalRestored = 0;

    for (const table of tables) {
        const rows = backupData.tables[table] || [];
        if (rows.length === 0) {
            console.log(`   ⏭️  ${table}: empty, skipping`);
            continue;
        }

        try {
            const count = await upsertBatch(table, rows);
            totalRestored += count;
            console.log(`   ✅ ${table}: ${count} rows restored`);
        } catch (err) {
            console.error(`   ❌ ${table}: ${err.message}`);
        }
    }

    console.log(`\n🎉 Restore complete! ${totalRestored} rows restored.`);
}

restore().catch((err) => {
    console.error("💥 Restore failed:", err.message);
    process.exit(1);
});
