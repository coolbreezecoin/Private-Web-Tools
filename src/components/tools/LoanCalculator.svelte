<script lang="ts">
  import type { Locale } from "@/i18n/config";
  import { t as getStrings } from "@/i18n/strings";
  import { monthlyPayment } from "@/utils/loan";

  type TermMode = "months" | "years";

  let {
    locale = "en",
  }: {
    locale?: Locale;
  } = $props();

  const t = $derived(getStrings(locale).loanCalculator);

  let principal = $state("100000");
  let annualRate = $state("6");
  let term = $state("10");
  let termMode = $state<TermMode>("years");
  let copied = $state(false);
  let message = $state("");

  function parseNumber(value: string) {
    return value.trim() === "" ? Number.NaN : Number(value);
  }

  function formatMoney(value: number) {
    return new Intl.NumberFormat(locale, { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(value);
  }

  function termMonths() {
    const rawTerm = parseNumber(term);
    return termMode === "years" ? rawTerm * 12 : rawTerm;
  }

  const result = $derived(monthlyPayment(parseNumber(principal), parseNumber(annualRate), termMonths()));
  const copyText = $derived(
    result.monthlyPayment === null || result.error
      ? ""
      : `${t.monthlyPayment}: ${formatMoney(result.monthlyPayment)}\n${t.totalInterest}: ${formatMoney(result.totalInterest ?? 0)}\n${t.totalPayment}: ${formatMoney(result.totalPayment ?? 0)}`,
  );

  async function copyResult() {
    if (!copyText) return;

    try {
      await navigator.clipboard.writeText(copyText);
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

<section class="calculator-tool panel" aria-labelledby="loan-calculator-title">
  <div class="tool-head">
    <p class="privacy-pill">{t.privacy}</p>
    <h2 id="loan-calculator-title">{t.title}</h2>
  </div>

  <div class="field-grid">
    <label for="loan-principal">
      <span>{t.principalLabel}</span>
      <input id="loan-principal" type="number" inputmode="decimal" min="0" bind:value={principal} />
    </label>
    <label for="loan-rate">
      <span>{t.annualRateLabel}</span>
      <input id="loan-rate" type="number" inputmode="decimal" min="0" bind:value={annualRate} />
    </label>
    <label for="loan-term">
      <span>{t.termLabel}</span>
      <input id="loan-term" type="number" inputmode="decimal" min="0" bind:value={term} />
    </label>
  </div>

  <fieldset>
    <legend>{t.termModeLabel}</legend>
    <div class="segmented">
      <button type="button" aria-pressed={termMode === "years"} onclick={() => (termMode = "years")}>{t.termYears}</button>
      <button type="button" aria-pressed={termMode === "months"} onclick={() => (termMode = "months")}>{t.termMonths}</button>
    </div>
  </fieldset>

  {#if result.error}
    <div class="result-card error" aria-live="polite">
      <span>{t.resultLabel}</span>
      <strong>{t.invalidInput}</strong>
    </div>
  {:else if result.monthlyPayment !== null}
    <div class="result-grid" aria-label={t.resultLabel} aria-live="polite">
      <article class="featured">
        <span>{t.monthlyPayment}</span>
        <strong>{formatMoney(result.monthlyPayment)}</strong>
      </article>
      <article>
        <span>{t.totalInterest}</span>
        <strong>{formatMoney(result.totalInterest ?? 0)}</strong>
      </article>
      <article>
        <span>{t.totalPayment}</span>
        <strong>{formatMoney(result.totalPayment ?? 0)}</strong>
      </article>
    </div>
  {:else}
    <div class="result-card" aria-live="polite">
      <span>{t.resultLabel}</span>
      <strong>{t.emptyResult}</strong>
    </div>
  {/if}

  <p class="note">{t.notAdvice}</p>

  <div class="actions">
    <button type="button" onclick={copyResult} disabled={!copyText} aria-label={t.copyLabel}>{copied ? t.copied : t.copy}</button>
  </div>
  <p class="status" aria-live="polite">{message}</p>
</section>

<style>
  .calculator-tool {
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

  fieldset {
    margin: 16px 0 0;
    border: 0;
    padding: 0;
  }

  legend,
  label span,
  article span,
  .result-card span {
    display: block;
    margin-bottom: 8px;
    color: var(--color-text);
    font-size: 13px;
    font-weight: 800;
  }

  .field-grid,
  .segmented,
  .result-grid {
    display: grid;
    gap: 10px;
  }

  .field-grid,
  .result-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .segmented {
    grid-template-columns: repeat(2, minmax(120px, 1fr));
  }

  .result-grid,
  .result-card {
    margin-top: 16px;
  }

  input {
    width: 100%;
    min-height: 44px;
    border: 1px solid var(--color-input-border);
    border-radius: 14px;
    background: var(--color-bg);
    color: var(--color-text);
    font-size: 15px;
    padding: 10px 12px;
  }

  article,
  .result-card {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-panel);
    background: var(--color-bg);
    padding: 18px;
  }

  article.featured {
    border-color: var(--color-accent-soft-border);
    background: var(--color-accent-soft-bg);
  }

  article strong,
  .result-card strong {
    color: var(--color-text);
    font-size: clamp(20px, 4vw, 30px);
    line-height: 1.1;
    overflow-wrap: anywhere;
  }

  .result-card.error strong {
    color: var(--color-danger, #b42318);
    font-size: 16px;
    line-height: 1.4;
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

  .note,
  .status {
    color: var(--color-muted);
    font-size: 14px;
    font-weight: 700;
    line-height: 1.5;
  }

  .note {
    margin-top: 12px;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 14px;
  }

  .status {
    min-height: 20px;
    margin-top: 12px;
  }

  @media (max-width: 760px) {
    .field-grid,
    .result-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 560px) {
    .calculator-tool {
      padding: 18px;
    }

    .segmented,
    .actions button {
      width: 100%;
    }
  }
</style>
