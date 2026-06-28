<script lang="ts">
  import type { Locale } from "@/i18n/config";
  import { t as getStrings } from "@/i18n/strings";
  import { findReplace, type FindReplaceMode } from "@/utils/findReplace";

  let {
    locale = "en",
  }: {
    locale?: Locale;
  } = $props();

  const t = $derived(getStrings(locale).findReplace);

  let input = $state(t.initialInput);
  let find = $state(t.initialFind);
  let replacement = $state(t.initialReplace);
  let mode = $state<FindReplaceMode>("plain");
  let caseInsensitive = $state(true);
  let wholeWord = $state(true);
  let copied = $state(false);
  let message = $state("");

  const result = $derived(findReplace(input, find, replacement, { mode, caseInsensitive, wholeWord: mode === "plain" && wholeWord }));
  const countLabel = $derived(t.countLabel.replace("{count}", String(result.count)));

  async function copyOutput() {
    if (!result.output) return;

    try {
      await navigator.clipboard.writeText(result.output);
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

<section class="find-tool panel" aria-labelledby="find-tool-title">
  <div class="tool-head">
    <div>
      <p class="privacy-pill">{t.privacy}</p>
      <h2 id="find-tool-title">{t.title}</h2>
    </div>
  </div>

  <label for="find-input">
    <span>{t.inputLabel}</span>
    <textarea id="find-input" rows="8" bind:value={input} placeholder={t.inputPlaceholder}></textarea>
  </label>

  <div class="field-grid">
    <label for="find-text">
      <span>{t.findLabel}</span>
      <input id="find-text" type="text" bind:value={find} placeholder={t.findPlaceholder} aria-invalid={Boolean(result.error)} />
    </label>
    <label for="replace-text">
      <span>{t.replaceLabel}</span>
      <input id="replace-text" type="text" bind:value={replacement} placeholder={t.replacePlaceholder} />
    </label>
  </div>

  <fieldset>
    <legend>{t.modeLabel}</legend>
    <div class="segmented">
      <button type="button" aria-pressed={mode === "plain"} onclick={() => (mode = "plain")}>{t.plainMode}</button>
      <button type="button" aria-pressed={mode === "regex"} onclick={() => (mode = "regex")}>{t.regexMode}</button>
    </div>
  </fieldset>

  <div class="options" aria-label={t.optionsLabel}>
    <label class="check-option">
      <input type="checkbox" bind:checked={caseInsensitive} />
      <span>{t.caseInsensitive}</span>
    </label>
    {#if mode === "plain"}
      <label class="check-option">
        <input type="checkbox" bind:checked={wholeWord} />
        <span>{t.wholeWord}</span>
      </label>
    {/if}
  </div>

  {#if result.error}
    <p class="error" aria-live="polite">{t.invalidRegex.replace("{message}", result.error)}</p>
  {:else}
    <p class="count" aria-live="polite">{countLabel}</p>
  {/if}

  <label class="output-label" for="find-output">
    <span>{t.outputLabel}</span>
    <textarea id="find-output" readonly rows="8" value={result.output}></textarea>
  </label>

  <div class="actions">
    <button type="button" onclick={copyOutput} disabled={!result.output} aria-label={t.copyLabel}>{copied ? t.copied : t.copy}</button>
  </div>

  <p class="status" aria-live="polite">{message}</p>
</section>

<style>
  .find-tool {
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

  label,
  fieldset,
  .output-label {
    display: block;
    margin-top: 16px;
  }

  label span,
  legend {
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
    min-height: 150px;
    resize: vertical;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  }

  input:focus,
  textarea:focus,
  button:focus {
    border-color: var(--color-accent);
  }

  .field-grid,
  .options {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .segmented {
    display: inline-grid;
    grid-template-columns: repeat(2, minmax(120px, 1fr));
    gap: 8px;
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

  button {
    min-height: 44px;
    border: 1px solid var(--color-border);
    border-radius: 12px;
    background: var(--color-surface);
    color: var(--color-text);
    cursor: pointer;
    font-size: 13px;
    font-weight: 800;
    padding: 8px 12px;
  }

  button[aria-pressed="true"],
  .actions button {
    border-color: var(--color-accent);
    background: var(--color-accent);
    color: #fff;
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  .count,
  .status,
  .error {
    margin-top: 12px;
    color: var(--color-muted);
    font-size: 14px;
    font-weight: 700;
  }

  .error {
    color: var(--color-danger, #b42318);
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 12px;
  }

  @media (max-width: 560px) {
    .find-tool {
      padding: 18px;
    }

    .field-grid,
    .options,
    .segmented {
      grid-template-columns: 1fr;
    }

    .actions button {
      width: 100%;
    }
  }
</style>
