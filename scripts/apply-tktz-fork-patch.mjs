import { readFile, writeFile } from "node:fs/promises";

async function readText(path) {
  return readFile(path, "utf8");
}

async function writeText(path, text) {
  await writeFile(path, text, "utf8");
}

function replaceOnce(text, search, replacement, label) {
  if (!text.includes(search)) {
    throw new Error(`Missing expected snippet for ${label}`);
  }
  return text.replace(search, replacement);
}

function insertAfter(text, anchor, addition, label) {
  if (text.includes(addition.trim())) return text;
  if (!text.includes(anchor)) {
    throw new Error(`Missing anchor for ${label}`);
  }
  return text.replace(anchor, `${anchor}${addition}`);
}

async function patchMainTs() {
  const path = "src/main.ts";
  let text = await readText(path);

  text = insertAfter(
    text,
    "    routineFolder: string;\n",
    "    routineSectionHeadingLevel: number;\n",
    "settings interface"
  );

  text = insertAfter(
    text,
    "    routineFolder: 'routine',\n",
    "    routineSectionHeadingLevel: 3,\n",
    "default settings"
  );

  text = insertAfter(
    text,
    "        'settings.routineFolder.desc': 'Folder for repeat-task routine notes. You can pick from suggestions. Only direct child .md files are targeted.',\n",
    "        'settings.routineSectionHeadingLevel.name': 'Routine section heading level',\n" +
      "        'settings.routineSectionHeadingLevel.desc': 'Choose the heading level used when inserting routine sections.',\n" +
      "        'settings.routineSectionHeadingLevel.option.none': 'None',\n" +
      "        'settings.routineSectionHeadingLevel.option.h1': 'H1',\n" +
      "        'settings.routineSectionHeadingLevel.option.h2': 'H2',\n" +
      "        'settings.routineSectionHeadingLevel.option.h3': 'H3',\n" +
      "        'settings.routineSectionHeadingLevel.option.h4': 'H4',\n" +
      "        'settings.routineSectionHeadingLevel.option.h5': 'H5',\n" +
      "        'settings.routineSectionHeadingLevel.option.h6': 'H6',\n",
    "english translations"
  );

  text = insertAfter(
    text,
    "        'settings.routineFolder.desc': 'リピートタスク（ルーチンノート）を置くフォルダ。候補から選択できます。対象はこのフォルダ直下の .md のみです。',\n",
    "        'settings.routineSectionHeadingLevel.name': 'ルーチンセクションの見出しレベル',\n" +
      "        'settings.routineSectionHeadingLevel.desc': 'ルーチン挿入時に使う見出しレベルを選びます。',\n" +
      "        'settings.routineSectionHeadingLevel.option.none': 'なし',\n" +
      "        'settings.routineSectionHeadingLevel.option.h1': 'H1',\n" +
      "        'settings.routineSectionHeadingLevel.option.h2': 'H2',\n" +
      "        'settings.routineSectionHeadingLevel.option.h3': 'H3',\n" +
      "        'settings.routineSectionHeadingLevel.option.h4': 'H4',\n" +
      "        'settings.routineSectionHeadingLevel.option.h5': 'H5',\n" +
      "        'settings.routineSectionHeadingLevel.option.h6': 'H6',\n",
    "japanese translations"
  );

  text = insertAfter(
    text,
    "function normalizeRoutineFolder(value: unknown): string {\n    const asText = typeof value === 'string' ? value : '';\n    const normalizedPath = normalizePath(asText.trim()).replace(/^\\/+/, '').replace(/\\/+$/, '');\n    return normalizedPath || DEFAULT_ROUTINE_FOLDER;\n}\n",
    "\nfunction normalizeRoutineSectionHeadingLevel(value: unknown): number {\n    if (value === 0 || value === '0') return 0;\n    const parsed = Number(value);\n    if (!Number.isInteger(parsed)) return DEFAULT_SETTINGS.routineSectionHeadingLevel;\n    if (parsed < 1 || parsed > 6) return DEFAULT_SETTINGS.routineSectionHeadingLevel;\n    return parsed;\n}\n",
    "heading level normalizer"
  );

  text = insertAfter(
    text,
    "        merged.sectionDefinitions = normalizeSectionDefinitions(loaded?.sectionDefinitions ?? merged.sectionDefinitions);\n",
    "        merged.routineSectionHeadingLevel = normalizeRoutineSectionHeadingLevel(\n" +
      "            loaded?.routineSectionHeadingLevel ?? merged.routineSectionHeadingLevel\n" +
      "        );\n",
    "load settings"
  );

  text = insertAfter(
    text,
    "    getSectionDefinitions(): SectionDefinition[] {\n        return this.settings.sectionDefinitions.map((x) => ({ ...x }));\n    }\n",
    "\n    getRoutineSectionHeadingLevel(): number {\n        return normalizeRoutineSectionHeadingLevel(this.settings.routineSectionHeadingLevel);\n    }\n",
    "heading getter"
  );

  text = insertAfter(
    text,
    "    async setSectionDefinitions(definitions: SectionDefinition[]): Promise<void> {\n        this.settings.sectionDefinitions = normalizeSectionDefinitions(definitions);\n        await this.saveSettings();\n        this.debugLog('Section definitions updated', { sectionDefinitions: this.settings.sectionDefinitions });\n    }\n",
    "\n    async setRoutineSectionHeadingLevel(level: unknown): Promise<void> {\n        const normalized = normalizeRoutineSectionHeadingLevel(level);\n        if (normalized === this.settings.routineSectionHeadingLevel) return;\n        this.settings.routineSectionHeadingLevel = normalized;\n        await this.saveSettings();\n        this.debugLog('Routine section heading level updated', { routineSectionHeadingLevel: normalized });\n    }\n",
    "heading setter"
  );

  if (!text.includes("const headingLevel = this.getRoutineSectionHeadingLevel();")) {
    text = replaceOnce(
      text,
      "    private getRoutineSectionHeading(section: number | undefined): string | null {\n        if (typeof section !== 'number' || !Number.isFinite(section)) return null;\n        const boundaries = this.getSortedSectionBoundaries();\n",
      "    private getRoutineSectionHeading(section: number | undefined): string | null {\n        if (typeof section !== 'number' || !Number.isFinite(section)) return null;\n        const headingLevel = this.getRoutineSectionHeadingLevel();\n        if (headingLevel === 0) return null;\n        const boundaries = this.getSortedSectionBoundaries();\n",
      "heading function prelude"
    );
  }

  text = replaceOnce(
    text,
    "        return selected ? `# ${selected.label}` : null;\n",
    "        return selected ? `${'#'.repeat(headingLevel)} ${selected.label}` : null;\n",
    "heading function return"
  );

  text = insertAfter(
    text,
    "        new Setting(containerEl)\n            .setName(this.plugin.t('settings.routineFolder.name'))\n            .setDesc(this.plugin.t('settings.routineFolder.desc'))\n            .addSearch((search) => {\n                search.setPlaceholder(DEFAULT_ROUTINE_FOLDER).setValue(this.routineFolderDraft);\n                const folderSuggest = new FolderPathSuggest(this.app, search.inputEl);\n                const resolveCommittedFolderPath = (): string | null => {\n                    const query = search.getValue().trim();\n                    const normalized = normalizeRoutineFolder(query);\n                    const exact = this.app.vault.getFolderByPath(normalized);\n                    if (exact) return exact.path;\n                    if (!query) return this.plugin.getRoutineFolder();\n                    const first = folderSuggest.getFirstSuggestion(query);\n                    if (!first) return null;\n                    const q = query.toLowerCase();\n                    if (!first.path.toLowerCase().startsWith(q)) return null;\n                    return first.path;\n                };\n                folderSuggest.onSelect((folder) => {\n                    this.routineFolderDraft = folder.path;\n                    search.setValue(folder.path);\n                    void commitRoutineFolder();\n                });\n                search.onChange((value) => {\n                    this.routineFolderDraft = value;\n                });\n                search.inputEl.addEventListener('keydown', (ev) => {\n                    if (ev.isComposing || ev.key !== 'Enter') return;\n                    ev.preventDefault();\n                    const resolved = resolveCommittedFolderPath();\n                    if (!resolved) return;\n                    this.routineFolderDraft = resolved;\n                    search.setValue(resolved);\n                    folderSuggest.close();\n                    void commitRoutineFolder();\n                });\n                search.inputEl.addEventListener('blur', () => {\n                    const resolved = resolveCommittedFolderPath();\n                    if (!resolved) {\n                        search.setValue(this.plugin.getRoutineFolder());\n                        this.routineFolderDraft = this.plugin.getRoutineFolder();\n                        return;\n                    }\n                    this.routineFolderDraft = resolved;\n                    search.setValue(resolved);\n                    void commitRoutineFolder();\n                });\n            });\n",
    "\n        new Setting(containerEl)\n            .setName(this.plugin.t('settings.routineSectionHeadingLevel.name'))\n            .setDesc(this.plugin.t('settings.routineSectionHeadingLevel.desc'))\n            .addDropdown((dropdown) => {\n                dropdown\n                    .addOption('0', this.plugin.t('settings.routineSectionHeadingLevel.option.none'))\n                    .addOption('1', this.plugin.t('settings.routineSectionHeadingLevel.option.h1'))\n                    .addOption('2', this.plugin.t('settings.routineSectionHeadingLevel.option.h2'))\n                    .addOption('3', this.plugin.t('settings.routineSectionHeadingLevel.option.h3'))\n                    .addOption('4', this.plugin.t('settings.routineSectionHeadingLevel.option.h4'))\n                    .addOption('5', this.plugin.t('settings.routineSectionHeadingLevel.option.h5'))\n                    .addOption('6', this.plugin.t('settings.routineSectionHeadingLevel.option.h6'))\n                    .setValue(String(this.plugin.getRoutineSectionHeadingLevel()))\n                    .onChange(async (value) => {\n                        await this.plugin.setRoutineSectionHeadingLevel(value);\n                    });\n            });\n",
    "settings dropdown"
  );

  await writeText(path, text);
}

async function patchManifest() {
  const path = "manifest.json";
  const json = JSON.parse(await readText(path));
  json.version = "0.2.2";
  await writeText(path, `${JSON.stringify(json, null, 4)}\n`);
}

async function patchPackageJson() {
  const path = "package.json";
  const json = JSON.parse(await readText(path));
  json.version = "0.2.2";
  await writeText(path, `${JSON.stringify(json, null, 2)}\n`);
}

async function patchPackageLock() {
  const path = "package-lock.json";
  const json = JSON.parse(await readText(path));
  json.version = "0.2.2";
  if (json.packages?.[""]) {
    json.packages[""].version = "0.2.2";
  }
  await writeText(path, `${JSON.stringify(json, null, 2)}\n`);
}

async function patchVersions() {
  const path = "versions.json";
  const json = JSON.parse(await readText(path));
  json["0.2.2"] = "1.7.2";
  await writeText(path, `${JSON.stringify(json, null, 2)}\n`);
}

async function patchGitignore() {
  const path = ".gitignore";
  let text = await readText(path);
  text = text.replace("/main.js\n", "");
  await writeText(path, text);
}

async function patchChangelog() {
  const path = "docs/CHANGELOG.md";
  let text = await readText(path);
  const section =
    "## 0.2.2 (2026-05-29)\n\n" +
    "### Fork\n\n" +
    "- Sync `tktz-tokyo/llr` with upstream `0.2.1`.\n" +
    "- Keep the configurable routine section heading level setting for BRAT builds.\n\n" +
    "---\n\n";
  if (!text.includes("## 0.2.2 (2026-05-29)")) {
    text = text.replace("---\n\n", `---\n\n${section}`);
  }
  await writeText(path, text);
}

await patchMainTs();
await patchManifest();
await patchPackageJson();
await patchPackageLock();
await patchVersions();
await patchGitignore();
await patchChangelog();
