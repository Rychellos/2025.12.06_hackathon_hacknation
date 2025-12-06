#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import https from "node:https";

//
// -----------------------------
// CLI ARGUMENT PARSING
// -----------------------------
const { values, positionals } = parseArgs({
    options: {
        input: { type: "string", short: "i" },
        output: { type: "string", short: "o" }
    },
    allowPositionals: true
});

// allow positional fallback
const inputDir = values.input || positionals[0];
const outputDir = values.output || positionals[1];

if (!inputDir || !outputDir) {
    console.error("Usage:");
    console.error("  node mirror-docs.mjs --input ./docs --output ./out");
    console.error("  OR");
    console.error("  node mirror-docs.mjs ./docs ./out");
    process.exit(1);
}

// Cache to avoid re-downloading files
const downloadCache = new Map();

//
// -----------------------------
// UTILS
// -----------------------------

async function ensureDir(dir) {
    await fs.mkdir(dir, { recursive: true });
}

/**
 * Recursively find all markdown files
 */
async function getAllMarkdownFiles(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const results = [];

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            results.push(...await getAllMarkdownFiles(fullPath));
        } else if (entry.isFile() && fullPath.match(/\.(md|mdx|markdown)$/i)) {
            results.push(fullPath);
        }
    }
    return results;
}

/**
 * Extract URLs from markdown links: [text](URL)
 */
function extractUrls(markdown) {
    const urlPattern = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g;
    const urls = [];
    let match;

    while ((match = urlPattern.exec(markdown)) !== null) {
        urls.push({
            text: match[1],
            url: match[2],
            fullMatch: match[0]
        });
    }

    return urls;
}

/**
 * Convert URL to local file path
 */
function urlToLocalPath(url) {
    try {
        const urlObj = new URL(url);
        // Extract path and ensure it ends with .md
        let urlPath = urlObj.pathname;

        // Remove leading slash
        if (urlPath.startsWith('/')) {
            urlPath = urlPath.substring(1);
        }

        // Ensure .md extension
        if (!urlPath.endsWith('.md')) {
            urlPath += '.md';
        }

        return path.join('downloads', urlPath);
    } catch (e) {
        console.warn(`⚠️  Invalid URL: ${url}`);
        return null;
    }
}

/**
 * Download file from URL
 */
function downloadFile(url, localPath) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            // Follow redirects
            if (response.statusCode === 301 || response.statusCode === 302) {
                const redirectUrl = response.headers.location;
                console.log(`  ↪️  Following redirect to: ${redirectUrl}`);
                downloadFile(redirectUrl, localPath).then(resolve).catch(reject);
                return;
            }

            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
                return;
            }

            let data = '';
            response.setEncoding('utf8');
            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                resolve(data);
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

/**
 * Process markdown content and download remote files
 */
async function transformMarkdown(sourceMd) {
    const urls = extractUrls(sourceMd);

    if (urls.length === 0) {
        return sourceMd;
    }

    console.log(`  📥 Found ${urls.length} URLs to process`);

    let transformedMd = sourceMd;

    for (const { text, url, fullMatch } of urls) {
        // Only process URLs from specific domains (e.g., pixijs.com)
        if (!url.includes('pixijs.com')) {
            continue;
        }

        const localPath = urlToLocalPath(url);
        if (!localPath) {
            continue;
        }

        const fullLocalPath = path.join(outputDir, localPath);

        // Check if already downloaded in this session
        if (!downloadCache.has(url)) {
            try {
                console.log(`  ⬇️  Downloading: ${url}`);

                // Ensure directory exists
                await ensureDir(path.dirname(fullLocalPath));

                // Download file
                const content = await downloadFile(url, fullLocalPath);

                // Save file
                await fs.writeFile(fullLocalPath, content, 'utf8');

                // Cache it
                downloadCache.set(url, localPath);

                console.log(`  ✅ Saved to: ${localPath}`);
            } catch (err) {
                console.error(`  ❌ Failed to download ${url}: ${err.message}`);
                continue;
            }
        } else {
            console.log(`  ♻️  Using cached: ${localPath}`);
        }

        // Replace URL with local path in markdown
        const newLink = `[${text}](${localPath})`;
        transformedMd = transformedMd.replace(fullMatch, newLink);
    }

    return transformedMd;
}

//
// -----------------------------
// MAIN SCRIPT
// -----------------------------
async function main() {
    console.log(`📂 Reading from: ${inputDir}`);
    console.log(`📁 Output to:    ${outputDir}`);

    const mdFiles = await getAllMarkdownFiles(inputDir);

    console.log(`📄 Found ${mdFiles.length} Markdown files`);

    for (const filePath of mdFiles) {
        const relPath = path.relative(inputDir, filePath);
        const outPath = path.join(outputDir, relPath);

        console.log(`→ Processing: ${relPath}`);

        // ensure containing directory exists
        await ensureDir(path.dirname(outPath));

        // read file safely
        const content = await fs.readFile(filePath, "utf8");

        // transform (now async)
        const newContent = await transformMarkdown(content);

        // write file
        await fs.writeFile(outPath, newContent, "utf8");
    }

    console.log("✅ Done! All markdown mirrored and transformed.");
    console.log(`📊 Downloaded ${downloadCache.size} unique files`);
}

main().catch((err) => {
    console.error("❌ ERROR:", err);
    process.exit(1);
});
