<script lang="ts">
  import type { Locale } from "@/i18n/config";
  import { t as getStrings } from "@/i18n/strings";
  import { testRegex } from "@/utils/regex";

  const flagKeys = ["g", "i", "m", "s", "u", "y"] as const;
  type FlagKey = (typeof flagKeys)[number];

  let {
    locale = "en",
  }: {
    locale?: Locale;
  } = $props();

  const t = $derived(getStrings(locale).regexTester);

  let pattern = $state("\\b(?<name>\\w+)@(?<domain>\\w+\\.com)\\b");
  let enabledFlags = $state<FlagKey[]>(["g"]);
  let testString = $state("Contact alex@example.com and sam@example.com for details.");
  let replacement = $state("$<name> at $<domain>");
  let copied = $state(false);
  let message = $state("");

  const flags = $derived(flagKeys.filter((flag) => enabledFlags.includes(flag)).join(""));
  const result = $derived(testRegex(pattern, flags, testString, replacement));
  const pieces = $derived.by(() => {
    if (result.error || result.matches.length === 0) return [{ text: testString, match: false }];
    const output: { text: string; match: boolean }[] = [];
    let cursor = 0;
    for (const match of result.matches) {
      if (match.index > cursor) output.push({ text: testString.slice(cursor, match.index), match: false });
      output.push({ text: testString.slice(match.index, match.end), match: true });
      cursor = match.end;
    }
    if (cursor < testString.length) output.push({ text: testString.slice(cursor), match: false });
    return output;
  });

  function toggleFlag(flag: FlagKey) {
    enabledFlags = enabledFlags.includes(flag) ? enabledFlags.filter((item) => item !== flag) : [...enabledFlags, flag];
  }

  async function copyReplacement() {
    if (!result.replacement) return;

    try {
      await navigator.clipboard.writeText(result.replacement);
      copied = true;
      message = t.copiedStatus;
      window.setTimeout(() => {
        copied = false;
      }, 1500);
    } catch {
      message = t.copyFailed;
    }
  }
</script>

<section class="regex-tool panel" aria-labelledby="regex-tool-title">
  <div class="tool-head">
    <div>
      <p class="privacy-pill">{t.privacy}</p>
      <h2 id="regex-tool-title">{t.title}</h2>
    </div>
  </div>

  <label for="regex-pattern">
    <span>{t.patternLabel}</span>
    <input id="regex-pattern" type="text" bind:value={pattern} placeholder={t.patternPlaceholder} aria-invalid={Boolean(result.error)} />
  </label>

  <fieldset>
    <legend>{t.flagsLabel}</legend>
    <div class="flag-grid">
      {#each flagKeys as flag}
        <button type="button" aria-pressed={enabledFlags.includes(flag)} onclick={() => toggleFlag(flag)}>
          {flag} <span>{t.flags[flag]}</span>
        </button>
      {/each}
    </div>
  </fieldset>

  <label for="regex-test">
    <span>{t.testStringLabel}</span>
    <textarea id="regex-test" rows="7" bind:value={testString} placeholder={t.testStringPlaceholder}></textarea>
  </label>

  {#if result.error}
    <p class="error" aria-live="polite">{t.invalidPattern.replace("{message}", result.error)}</p>
  {:else}
    <div class="highlight" aria-label={t.highlightedLabel}>
      {#each pieces as piece}
        {#if piece.match}<mark>{piece.text}</mark>{:else}<span>{piece.text}</span>{/if}
      {/each}
    </div>
  {/if}

  <section class="matches" aria-labelledby="regex-matches-title">
    <h3 id="regex-matches-title">{t.matchesLabel}</h3>
    {#if !result.error && result.matches.length > 0}
      <p class="count">{t.matchCount.replace("{count}", String(result.matches.length))}</p>
      <div class="match-list">
        {#each result.matches as match, index}
          <article>
            <h4>#{index + 1} <code>{match.value}</code></h4>
            <p>{match.index} - {match.end}</p>
            {#if match.groups.length > 0}
              <ul>
                {#each match.groups as group}
                  <li><span>{Number.isNaN(Number(group.label)) ? t.namedGroupLabel.replace("{name}", group.label) : t.groupLabel.replace("{index}", group.label)}</span><code>{group.value}</code></li>
                {/each}
              </ul>
            {/if}
          </article>
        {/each}
      </div>
    {:else if !result.error}
      <p class="empty">{t.noMatches}</p>
    {/if}
  </section>

  <label for="regex-replacement">
    <span>{t.replacementLabel}</span>
    <input id="regex-replacement" type="text" bind:value={replacement} placeholder={t.replacementPlaceholder} />
  </label>

  <label for="regex-output">
    <span>{t.replacementResultLabel}</span>
    <textarea id="regex-output" readonly rows="4" value={result.replacement}></textarea>
  </label>

  <div class="actions">
    <button type="button" onclick={copyReplacement} disabled={!result.replacement} aria-label={t.copyReplacementLabel}>
      {copied ? t.copied : t.copy}
    </button>
  </div>

  <p class="status" aria-live="polite">{message}</p>
</section>

<style>
  .regex-tool {
    padding: 24px;
  }

  .tool-head {
    margin-bottom: 18px;
  }

  .privacy-pill {
    display: inline-flex;
    width: fit-content;
    margin: 0 0 10px;
    border: 1px solid var(--color-accent-soft-border);
    border-radius: var(--radius-pill);
    background: var(--color-accent-soft-bg);
    color: var(--color-accent-soft-text);
    font-size: 12px;
    font-weight: 800;
    padding: 6px 10px;
  }

  h2,
  h3,
  h4,
  p {
    margin: 0;
  }

  h2 {
    color: var(--color-text);
    font-size: clamp(24px, 4vw, 32px);
    line-height: 1.1;
    letter-spacing: -0.03em;
  }

  label,
  fieldset {
    display: block;
    margin-top: 16px;
  }

  label span,
  legend,
  h3 {
    display: block;
    margin-bottom: 8px;
    color: var(--color-text);
    font-size: 13px;
    font-weight: 800;
  }

  fieldset {
    border: 0;
    padding: 0;
  }

  input,
  textarea {
    width: 100%;
    border: 1px solid var(--color-input-border);
    border-radius: 15px;
    background: var(--color-bg);
    color: var(--color-text);
    font-size: 15px;
    line-height: 1.55;
    outline: none;
    padding: 13px 14px;
  }

  textarea {
    min-height: 140px;
    resize: vertical;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  }

  input:focus,
  textarea:focus,
  button:focus {
    border-color: var(--color-accent);
  }

  .flag-grid {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 8px;
  }

  button {
    min-height: 44px;
    border: 1px solid var(--color-border);
    border-radius: 12px;
    background: var(--color-surface);
    color: var(--color-text);
    cursor: pointer;
    font-size: 13px;
    font-weight: 800;
    padding: 8px 10px;
  }

  button span {
    display: block;
    margin: 2px 0 0;
    color: var(--color-muted);
    font-size: 10px;
    font-weight: 700;
  }

  button[aria-pressed="true"],
  .actions button {
    border-color: var(--color-accent);
    background: var(--color-accent);
    color: #fff;
  }

  button[aria-pressed="true"] span {
    color: #fff;
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.48;
  }

  .highlight,
  .matches,
  textarea[readonly] {
    border: 1px solid var(--color-border);
    border-radius: 15px;
    background: var(--color-surface);
  }

  .highlight {
    min-height: 100px;
    margin-top: 16px;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
    color: var(--color-text);
    font-size: 14px;
    line-height: 1.6;
    padding: 14px;
  }

  mark {
    border-radius: 5px;
    background: color-mix(in srgb, var(--color-accent) 22%, transparent);
    color: var(--color-text);
    padding: 1px 2px;
  }

  .error {
    margin-top: 12px;
    color: #b42318;
    font-size: 13px;
    font-weight: 800;
  }

  .matches {
    margin-top: 16px;
    padding: 14px;
  }

  .count,
  .empty {
    color: var(--color-muted);
    font-size: 13px;
  }

  .match-list {
    display: grid;
    gap: 10px;
    margin-top: 12px;
  }

  article {
    border: 1px solid var(--color-border);
    border-radius: 12px;
    background: var(--color-bg);
    padding: 12px;
  }

  h4 {
    color: var(--color-text);
    font-size: 14px;
  }

  code {
    overflow-wrap: anywhere;
    color: var(--color-text);
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  }

  article p,
  li span {
    color: var(--color-muted);
    font-size: 12px;
  }

  ul {
    display: grid;
    gap: 5px;
    margin: 10px 0 0;
    padding: 0;
    list-style: none;
  }

  li {
    display: grid;
    grid-template-columns: 90px minmax(0, 1fr);
    gap: 10px;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 14px;
  }

  .status {
    min-height: 18px;
    margin-top: 12px;
    color: var(--color-accent-soft-text);
    font-size: 13px;
    font-weight: 800;
  }

  @media (max-width: 560px) {
    .regex-tool {
      padding: 18px;
    }

    .flag-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    li {
      grid-template-columns: 1fr;
    }

    .actions button {
      width: 100%;
    }
  }
</style>
