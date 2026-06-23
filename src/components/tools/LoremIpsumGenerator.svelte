<script lang="ts">
  import type { Locale } from "@/i18n/config";
  import { t as getStrings } from "@/i18n/strings";
  import { generateLoremIpsum, type LoremUnit } from "@/utils/lorem";

  let {
    locale = "en",
  }: {
    locale?: Locale;
  } = $props();

  const t = $derived(getStrings(locale).loremIpsum);

  let count = $state(3);
  let unit = $state<LoremUnit>("paragraphs");
  let startWithLorem = $state(true);
  let copied = $state(false);
  let message = $state("");

  const output = $derived(generateLoremIpsum({ count, unit, startWithLorem }));

  async function copyText() {
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

<section class="lorem-tool panel" aria-labelledby="lorem-tool-title">
  <div class="tool-head">
    <div>
      <p class="privacy-pill">{t.privacy}</p>
      <h2 id="lorem-tool-title">{t.title}</h2>
    </div>
    <button type="button" onclick={copyText} disabled={!output} aria-label={t.copyLabel}>
      {copied ? t.copied : t.copy}
    </button>
  </div>

  <div class="controls">
    <label for="lorem-count">
      <span>{t.countLabel}</span>
      <input id="lorem-count" type="number" min="1" max="500" bind:value={count} />
    </label>

    <label for="lorem-unit">
      <span>{t.unitLabel}</span>
      <select id="lorem-unit" bind:value={unit}>
        <option value="paragraphs">{t.units.paragraphs}</option>
        <option value="sentences">{t.units.sentences}</option>
        <option value="words">{t.units.words}</option>
      </select>
    </label>

    <label class="checkbox-label">
      <input type="checkbox" bind:checked={startWithLorem} />
      <span>{t.startWithLorem}</span>
    </label>
  </div>

  <label class="output-label" for="lorem-output">{t.outputLabel}</label>
  <textarea id="lorem-output" readonly rows="12" value={output} placeholder={t.emptyResult}></textarea>

  <p class="status" aria-live="polite">{message}</p>
</section>

<style>
  .lorem-tool {
    padding: 24px;
  }

  .tool-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
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

  button:disabled {
    cursor: not-allowed;
    opacity: 0.48;
  }

  .controls {
    display: grid;
    grid-template-columns: minmax(120px, 0.6fr) minmax(160px, 1fr) minmax(220px, 1.5fr);
    gap: 14px;
    margin-bottom: 18px;
  }

  label span,
  .output-label {
    display: block;
    margin-bottom: 8px;
    color: var(--color-text);
    font-size: 13px;
    font-weight: 800;
  }

  input[type="number"],
  select,
  textarea {
    width: 100%;
    border: 1px solid var(--color-input-border);
    border-radius: 15px;
    background: var(--color-bg);
    color: var(--color-text);
    font-size: 16px;
    outline: none;
    padding: 13px 14px;
  }

  input:focus,
  select:focus,
  textarea:focus {
    border-color: var(--color-accent);
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 44px;
    align-self: end;
    border: 1px solid var(--color-border);
    border-radius: 15px;
    background: var(--color-bg);
    padding: 10px 12px;
  }

  .checkbox-label span {
    margin: 0;
  }

  textarea {
    display: block;
    min-height: 300px;
    resize: vertical;
    font-size: 16px;
    line-height: 1.65;
  }

  .status {
    min-height: 18px;
    margin-top: 12px;
    color: var(--color-accent-soft-text);
    font-size: 13px;
    font-weight: 800;
  }

  @media (max-width: 760px) {
    .controls {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 560px) {
    .lorem-tool {
      padding: 18px;
    }

    .tool-head {
      flex-direction: column;
    }

    button {
      width: 100%;
    }
  }
</style>
