<script lang="ts">
  import type { Locale } from "@/i18n/config";
  import { t as getStrings } from "@/i18n/strings";
  import { diffLines, formatDiffText } from "@/utils/diff";

  let {
    locale = "en",
  }: {
    locale?: Locale;
  } = $props();

  const t = $derived(getStrings(locale).diffChecker);

  let original = $state("Alpha\nBeta\nGamma");
  let changed = $state("Alpha\nBeta updated\nGamma\nDelta");
  let ignoreCase = $state(false);
  let ignoreWhitespace = $state(false);
  let normalizeEol = $state(true);
  let copiedId = $state("");
  let message = $state("");

  const canCompare = $derived(Boolean(original.trim() && changed.trim()));
  const result = $derived(diffLines(original, changed, { ignoreCase, ignoreWhitespace, normalizeEol }));
  const diffText = $derived(formatDiffText(result.segments));

  function swapSides() {
    const nextOriginal = changed;
    changed = original;
    original = nextOriginal;
  }

  async function copyText(id: string, label: string, value: string) {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      copiedId = id;
      message = t.copiedStatus.replace("{label}", label);
      window.setTimeout(() => {
        if (copiedId === id) copiedId = "";
      }, 1500);
    } catch {
      message = t.copyFailed;
    }
  }
</script>

<section class="diff-tool panel" aria-labelledby="diff-tool-title">
  <div class="tool-head">
    <div>
      <p class="privacy-pill">{t.privacy}</p>
      <h2 id="diff-tool-title">{t.title}</h2>
    </div>
    <button type="button" class="secondary-button" onclick={swapSides}>{t.swap}</button>
  </div>

  <div class="editor-grid">
    <label for="diff-original">
      <span>{t.originalLabel}</span>
      <textarea id="diff-original" rows="8" bind:value={original} placeholder={t.originalPlaceholder}></textarea>
    </label>
    <label for="diff-changed">
      <span>{t.changedLabel}</span>
      <textarea id="diff-changed" rows="8" bind:value={changed} placeholder={t.changedPlaceholder}></textarea>
    </label>
  </div>

  <fieldset>
    <legend>{t.optionsLabel}</legend>
    <label><input type="checkbox" bind:checked={ignoreCase} /> <span>{t.ignoreCase}</span></label>
    <label><input type="checkbox" bind:checked={ignoreWhitespace} /> <span>{t.ignoreWhitespace}</span></label>
    <label><input type="checkbox" bind:checked={normalizeEol} /> <span>{t.normalizeEol}</span></label>
  </fieldset>

  <div class="actions">
    <button type="button" onclick={() => copyText("original", t.copyOriginal, original)} disabled={!original}>
      {copiedId === "original" ? t.copied : t.copyOriginal}
    </button>
    <button type="button" onclick={() => copyText("changed", t.copyChanged, changed)} disabled={!changed}>
      {copiedId === "changed" ? t.copied : t.copyChanged}
    </button>
    <button type="button" onclick={() => copyText("diff", t.copyDiff, diffText)} disabled={!canCompare}>
      {copiedId === "diff" ? t.copied : t.copyDiff}
    </button>
  </div>

  <div class="summary" aria-label={t.summaryLabel}>
    <span class="added">+ {result.counts.added} {t.labels.added}</span>
    <span class="removed">- {result.counts.removed} {t.labels.removed}</span>
    <span>{result.counts.unchanged} {t.labels.unchanged}</span>
  </div>

  <div class="diff-output" aria-label={t.resultsLabel}>
    {#if !canCompare}
      <p class="empty">{t.emptyHint}</p>
    {:else if result.counts.added === 0 && result.counts.removed === 0}
      <p class="empty">{t.noChanges}</p>
    {:else}
      {#each result.segments as segment}
        <pre class={segment.type}><span>{segment.type === "added" ? "+" : segment.type === "removed" ? "-" : " "}</span>{segment.line || " "}</pre>
      {/each}
    {/if}
  </div>

  <p class="status" aria-live="polite">{message}</p>
</section>

<style>
  .diff-tool {
    padding: 24px;
  }

  .tool-head,
  .actions,
  .summary {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    justify-content: space-between;
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
  p {
    margin: 0;
  }

  h2 {
    color: var(--color-text);
    font-size: clamp(24px, 4vw, 32px);
    line-height: 1.1;
    letter-spacing: -0.03em;
  }

  .editor-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  label span,
  legend {
    display: block;
    margin-bottom: 8px;
    color: var(--color-text);
    font-size: 13px;
    font-weight: 800;
  }

  textarea {
    width: 100%;
    min-height: 210px;
    resize: vertical;
    border: 1px solid var(--color-input-border);
    border-radius: 15px;
    background: var(--color-bg);
    color: var(--color-text);
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
    font-size: 14px;
    line-height: 1.55;
    outline: none;
    padding: 14px;
  }

  textarea:focus,
  button:focus {
    border-color: var(--color-accent);
  }

  fieldset {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin: 16px 0 0;
    border: 0;
    padding: 0;
  }

  fieldset label {
    display: flex;
    min-height: 44px;
    align-items: center;
    gap: 8px;
    border: 1px solid var(--color-border);
    border-radius: 12px;
    background: var(--color-surface);
    padding: 8px 12px;
  }

  fieldset input {
    width: 18px;
    height: 18px;
    accent-color: var(--color-accent);
  }

  fieldset span {
    margin: 0;
  }

  button {
    min-height: 44px;
    border: 1px solid var(--color-accent);
    border-radius: 12px;
    background: var(--color-accent);
    color: #fff;
    cursor: pointer;
    font-size: 13.5px;
    font-weight: 800;
    padding: 9px 14px;
  }

  .secondary-button {
    border-color: var(--color-border);
    background: var(--color-surface);
    color: var(--color-text);
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.48;
  }

  .actions {
    justify-content: flex-end;
    margin-top: 14px;
  }

  .summary {
    justify-content: flex-start;
    flex-wrap: wrap;
    margin-top: 18px;
  }

  .summary span {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-pill);
    background: var(--color-surface);
    color: var(--color-text);
    font-size: 13px;
    font-weight: 800;
    padding: 7px 10px;
  }

  .summary .added {
    color: #067647;
  }

  .summary .removed {
    color: #b42318;
  }

  .diff-output {
    display: grid;
    gap: 2px;
    max-height: 520px;
    margin-top: 14px;
    overflow: auto;
    border: 1px solid var(--color-border);
    border-radius: 15px;
    background: var(--color-bg);
    padding: 10px;
  }

  pre {
    margin: 0;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
    border-radius: 8px;
    color: var(--color-text);
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
    font-size: 13.5px;
    line-height: 1.55;
    padding: 5px 8px;
  }

  pre span {
    display: inline-block;
    width: 20px;
    font-weight: 900;
  }

  pre.added {
    background: color-mix(in srgb, #12b76a 14%, transparent);
  }

  pre.removed {
    background: color-mix(in srgb, #f04438 14%, transparent);
  }

  .empty {
    color: var(--color-muted);
    font-size: 14px;
    line-height: 1.6;
    padding: 10px;
  }

  .status {
    min-height: 18px;
    margin-top: 12px;
    color: var(--color-accent-soft-text);
    font-size: 13px;
    font-weight: 800;
  }

  @media (max-width: 560px) {
    .diff-tool {
      padding: 18px;
    }

    .tool-head,
    .editor-grid,
    .actions {
      display: grid;
      grid-template-columns: 1fr;
    }

    button {
      width: 100%;
    }
  }
</style>
