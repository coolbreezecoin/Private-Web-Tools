<script lang="ts">
  import type { Locale } from "@/i18n/config";
  import { t as getStrings } from "@/i18n/strings";
  import { caseStyles } from "@/utils/caseTransforms";

  let {
    locale = "en",
  }: {
    locale?: Locale;
  } = $props();

  const t = $derived(getStrings(locale).caseConverter);

  let input = $state("");
  let copiedId = $state("");
  let message = $state("");
  let initialized = $state(false);

  const results = $derived(caseStyles.map((style) => ({ ...style, value: style.transform(input) })));

  async function copyText(styleId: string, value: string) {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      copiedId = styleId;
      message = t.copiedStatus;
      window.setTimeout(() => {
        if (copiedId === styleId) copiedId = "";
      }, 1500);
    } catch {
      message = t.copyFailed;
    }
  }

  function clearInput() {
    input = "";
    message = t.cleared;
  }

  $effect(() => {
    if (!initialized) {
      input = t.initialText;
      initialized = true;
    }
  });
</script>

<section class="case-tool panel" aria-labelledby="case-tool-title">
  <div class="tool-head">
    <div>
      <p class="privacy-pill">{t.privacy}</p>
      <h2 id="case-tool-title">{t.title}</h2>
    </div>
    <button type="button" class="clear-button" onclick={clearInput} disabled={!input}>{t.clear}</button>
  </div>

  <label class="input-label" for="case-input">{t.inputLabel}</label>
  <textarea
    id="case-input"
    bind:value={input}
    rows="5"
    maxlength="2000"
    placeholder={t.placeholder}
  ></textarea>

  <div class="results" aria-label={t.resultsLabel}>
    {#each results as result}
      <article class="result-card">
        <div class="result-meta">
          <div>
            <h3>{result.label}</h3>
            <p>{result.description}</p>
          </div>
          <button
            type="button"
            onclick={() => copyText(result.id, result.value)}
            disabled={!result.value}
            aria-label={t.copyLabel.replace("{style}", result.label)}
          >
            {copiedId === result.id ? t.copied : t.copy}
          </button>
        </div>
        <output>{result.value || t.emptyResult}</output>
      </article>
    {/each}
  </div>

  <p class="status" aria-live="polite">{message}</p>
</section>

<style>
  .case-tool {
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
  h3,
  p {
    margin: 0;
  }

  h2 {
    color: var(--color-text);
    font-size: clamp(24px, 4vw, 32px);
    line-height: 1.1;
    letter-spacing: -0.03em;
  }

  .clear-button,
  .result-meta button {
    min-width: 74px;
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

  .result-meta button {
    border-color: var(--color-accent);
    background: var(--color-accent);
    color: #fff;
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.48;
  }

  .input-label {
    display: block;
    margin-bottom: 8px;
    color: var(--color-text);
    font-size: 13px;
    font-weight: 800;
  }

  textarea {
    display: block;
    width: 100%;
    min-height: 170px;
    resize: vertical;
    border: 1px solid var(--color-input-border);
    border-radius: 15px;
    background: var(--color-bg);
    color: var(--color-text);
    font-size: 17px;
    line-height: 1.6;
    outline: none;
    padding: 16px;
  }

  textarea:focus {
    border-color: var(--color-accent);
  }

  .results {
    display: grid;
    gap: 14px;
    margin-top: 22px;
  }

  .result-card {
    border: 1px solid var(--color-border);
    border-radius: 16px;
    background: var(--color-bg);
    padding: 16px;
  }

  .result-meta {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }

  h3 {
    color: var(--color-text);
    font-size: 16px;
    letter-spacing: -0.01em;
  }

  .result-meta p {
    margin-top: 4px;
    color: var(--color-muted);
    font-size: 13px;
    line-height: 1.45;
  }

  output {
    display: block;
    width: 100%;
    margin-top: 14px;
    overflow-wrap: anywhere;
    border-radius: 12px;
    background: var(--color-surface);
    color: var(--color-text);
    font-size: 18px;
    line-height: 1.55;
    padding: 14px;
  }

  .status {
    min-height: 18px;
    margin-top: 12px;
    color: var(--color-accent-soft-text);
    font-size: 13px;
    font-weight: 800;
  }

  @media (max-width: 560px) {
    .case-tool {
      padding: 18px;
    }

    .tool-head,
    .result-meta {
      flex-direction: column;
    }

    .clear-button,
    .result-meta button {
      width: 100%;
    }
  }
</style>
