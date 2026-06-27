<script lang="ts">
  import type { Locale } from "@/i18n/config";
  import { t as getStrings } from "@/i18n/strings";
  import { slugify, type SlugifyOptions } from "@/utils/slugify";

  type Separator = NonNullable<SlugifyOptions["separator"]>;

  let {
    locale = "en",
  }: {
    locale?: Locale;
  } = $props();

  const t = $derived(getStrings(locale).slugifyTool);

  let input = $state("Crème Brûlée & Product Launch 2026!");
  let separator = $state<Separator>("-");
  let lowercase = $state(true);
  let copied = $state(false);
  let message = $state("");

  const output = $derived(slugify(input, { separator, lowercase }));

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

<section class="slug-tool panel" aria-labelledby="slug-tool-title">
  <div class="tool-head">
    <div>
      <p class="privacy-pill">{t.privacy}</p>
      <h2 id="slug-tool-title">{t.title}</h2>
    </div>
  </div>

  <label for="slug-input">
    <span>{t.inputLabel}</span>
    <textarea id="slug-input" bind:value={input} rows="5" placeholder={t.placeholder}></textarea>
  </label>

  <div class="options">
    <fieldset>
      <legend>{t.separatorLabel}</legend>
      <div class="segmented">
        <button type="button" aria-pressed={separator === "-"} onclick={() => (separator = "-")}>{t.hyphen}</button>
        <button type="button" aria-pressed={separator === "_"} onclick={() => (separator = "_")}>{t.underscore}</button>
      </div>
    </fieldset>

    <label class="check-option">
      <input type="checkbox" bind:checked={lowercase} />
      <span>{t.lowercase}</span>
    </label>
  </div>

  <label class="output-label" for="slug-output">
    <span>{t.outputLabel}</span>
    <output id="slug-output">{output || t.emptyResult}</output>
  </label>

  <div class="actions">
    <button type="button" onclick={copyOutput} disabled={!output} aria-label={t.copyLabel}>{copied ? t.copied : t.copy}</button>
  </div>

  <p class="status" aria-live="polite">{message}</p>
</section>

<style>
  .slug-tool {
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
    letter-spacing: -0.03em;
  }

  label span,
  legend,
  .output-label > span {
    display: block;
    margin-bottom: 8px;
    color: var(--color-text);
    font-size: 13px;
    font-weight: 800;
  }

  textarea,
  output {
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
    min-height: 116px;
    resize: vertical;
  }

  output {
    display: block;
    min-height: 52px;
    overflow-wrap: anywhere;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  }

  textarea:focus,
  button:focus,
  input:focus {
    border-color: var(--color-accent);
  }

  .options {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(220px, 0.7fr);
    gap: 14px;
    align-items: end;
    margin-top: 16px;
  }

  fieldset {
    min-width: 0;
    margin: 0;
    border: 0;
    padding: 0;
  }

  .segmented {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  button {
    min-height: 44px;
    border: 1px solid var(--color-border);
    border-radius: 12px;
    background: var(--color-surface);
    color: var(--color-text);
    cursor: pointer;
    font-size: 13.5px;
    font-weight: 800;
    padding: 9px 14px;
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

  .check-option input {
    width: 18px;
    height: 18px;
    accent-color: var(--color-accent);
  }

  .check-option span {
    margin: 0;
  }

  .output-label {
    display: block;
    margin-top: 18px;
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
    .slug-tool {
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
