<script lang="ts">
  import type { Locale } from "@/i18n/config";
  import { t as getStrings } from "@/i18n/strings";
  import { cleanText } from "@/utils/whitespace";

  let {
    locale = "en",
  }: {
    locale?: Locale;
  } = $props();

  const t = $derived(getStrings(locale).whitespaceCleaner);

  let input = $state(t.initialInput);
  let collapseSpaces = $state(true);
  let removeLineBreaks = $state(false);
  let removeBlankLines = $state(true);
  let removeTabs = $state(true);
  let trimLines = $state(true);
  let trim = $state(true);
  let copied = $state(false);
  let message = $state("");

  const output = $derived(cleanText(input, { collapseSpaces, removeLineBreaks, removeBlankLines, removeTabs, trimLines, trim }));
  const beforeCount = $derived([...input].length);
  const afterCount = $derived([...output].length);

  async function copyOutput() {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
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

<section class="whitespace-tool panel" aria-labelledby="whitespace-tool-title">
  <div class="tool-head">
    <div>
      <p class="privacy-pill">{t.privacy}</p>
      <h2 id="whitespace-tool-title">{t.title}</h2>
    </div>
  </div>

  <label for="whitespace-input">
    <span>{t.inputLabel}</span>
    <textarea id="whitespace-input" bind:value={input} rows="8" placeholder={t.placeholder}></textarea>
  </label>

  <div class="options" aria-label={t.optionsLabel}>
    <label class="check-option"><input type="checkbox" bind:checked={collapseSpaces} /> <span>{t.collapseSpaces}</span></label>
    <label class="check-option"><input type="checkbox" bind:checked={removeLineBreaks} /> <span>{t.removeLineBreaks}</span></label>
    <label class="check-option"><input type="checkbox" bind:checked={removeBlankLines} /> <span>{t.removeBlankLines}</span></label>
    <label class="check-option"><input type="checkbox" bind:checked={removeTabs} /> <span>{t.removeTabs}</span></label>
    <label class="check-option"><input type="checkbox" bind:checked={trimLines} /> <span>{t.trimLines}</span></label>
    <label class="check-option"><input type="checkbox" bind:checked={trim} /> <span>{t.trimText}</span></label>
  </div>

  <div class="counts" aria-label={t.countsLabel}>
    <span>{t.beforeCount}: {beforeCount}</span>
    <span>{t.afterCount}: {afterCount}</span>
  </div>

  <label class="output-label" for="whitespace-output">
    <span>{t.outputLabel}</span>
    <textarea id="whitespace-output" readonly rows="8" value={output}></textarea>
  </label>

  <div class="actions">
    <button type="button" onclick={copyOutput} disabled={!output} aria-label={t.copyLabel}>{copied ? t.copied : t.copy}</button>
  </div>

  <p class="status" aria-live="polite">{message}</p>
</section>

<style>
  .whitespace-tool {
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
  p {
    margin: 0;
  }

  h2 {
    color: var(--color-text);
    font-size: clamp(24px, 4vw, 32px);
    line-height: 1.1;
  }

  label span,
  .output-label > span {
    display: block;
    margin-bottom: 8px;
    color: var(--color-text);
    font-size: 13px;
    font-weight: 800;
  }

  textarea {
    width: 100%;
    border: 1px solid var(--color-input-border);
    border-radius: 15px;
    background: var(--color-bg);
    color: var(--color-text);
    font-size: 15px;
    line-height: 1.55;
    min-height: 150px;
    outline: none;
    padding: 13px 14px;
    resize: vertical;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  }

  textarea:focus,
  button:focus,
  input:focus {
    border-color: var(--color-accent);
  }

  .options {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-top: 16px;
  }

  .check-option {
    display: flex;
    min-height: 48px;
    align-items: center;
    gap: 10px;
    border: 1px solid var(--color-border);
    border-radius: 14px;
    background: var(--color-bg);
    padding: 10px 12px;
  }

  .check-option span {
    margin: 0;
  }

  .counts {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 14px;
    color: var(--color-muted);
    font-size: 13px;
    font-weight: 800;
  }

  .output-label {
    display: block;
    margin-top: 16px;
  }

  button {
    min-height: 44px;
    border: 1px solid var(--color-accent);
    border-radius: 12px;
    background: var(--color-accent);
    color: #fff;
    cursor: pointer;
    font-size: 13px;
    font-weight: 800;
    padding: 8px 12px;
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 12px;
  }

  .status {
    margin-top: 12px;
    color: var(--color-muted);
    font-size: 14px;
    font-weight: 700;
  }

  @media (max-width: 560px) {
    .whitespace-tool {
      padding: 18px;
    }

    .options {
      grid-template-columns: 1fr;
    }

    .actions button {
      width: 100%;
    }
  }
</style>
