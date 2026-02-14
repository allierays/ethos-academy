import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

/**
 * Pages that fetch data on the server must declare `export const dynamic = "force-dynamic"`
 * or Next.js will pre-render them as static HTML at build time, baking stale or empty data.
 *
 * This test scans all page.tsx files for server-side data fetching patterns
 * (async function + import from lib/api) and verifies they include force-dynamic.
 */

const APP_DIR = join(__dirname, "../app");

function findPageFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...findPageFiles(full));
    } else if (entry === "page.tsx") {
      results.push(full);
    }
  }
  return results;
}

function isServerDataFetching(content: string): boolean {
  // Client components do their own fetching, no force-dynamic needed
  if (content.trimStart().startsWith('"use client"') || content.trimStart().startsWith("'use client'")) {
    return false;
  }

  const importsFromApi = /import\s+.*from\s+["'].*lib\/api["']/.test(content);
  const hasAsyncDefault = /export\s+default\s+async\s+function/.test(content);

  return importsFromApi && hasAsyncDefault;
}

describe("force-dynamic on server data-fetching pages", () => {
  const pageFiles = findPageFiles(APP_DIR);

  it("finds page files to scan", () => {
    expect(pageFiles.length).toBeGreaterThan(0);
  });

  const serverPages = pageFiles.filter((f) => isServerDataFetching(readFileSync(f, "utf-8")));

  it.each(serverPages)("%s declares force-dynamic", (filePath) => {
    const content = readFileSync(filePath, "utf-8");
    expect(content).toContain('export const dynamic = "force-dynamic"');
  });
});
