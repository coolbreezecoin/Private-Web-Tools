<script lang="ts">
  import type { Locale } from "@/i18n/config";
  import { t as getStrings } from "@/i18n/strings";
  import { percentChange, percentOf, whatPercent, type PercentageError } from "@/utils/percentage";

  type PercentageMode = "percentOf" | "whatPercent" | "percentChange";

  let {
    locale = "en",
  }: {
    locale?: Locale;
  } = $props();

  const t = $derived(getStrings(locale).percentageCalculator);

  let mode = $state<PercentageMode>("percentOf");
  let firstValue = $state("15");
  let secondValue = $state("200");
  let copied = $state(false);
  let message = $state("");

  function parseNumber(value: string) {
    return value.trim() === "" ? Number.NaN : Number(value);
  }

  function formatNumber(value: number, maximumFractionDigits = 4) {
    return new Intl.NumberFormat(locale, { maximumFractionDigits }).format(value);
  }

  function calculate() {
    const first = parseNumber(firstValue);
    const second = parseNumber(secondValue);
    if (mode === "percentOf") return percentOf(first, second);
    if (mode === "whatPercent") return whatPercent(first, second);
    return percentChange(first, second);
  }

  function firstLabel() {
    if (mode === "percentOf") return t.percentLabel;
    if (mode === "whatPercent") return t.valueLabel;
    return t.fromLabel;
  }

  function secondLabel() {
    if (mode === "percentOf") return t.numberLabel;
    if (mode === "whatPercent") return t.totalLabel;
    return t.toLabel;
  }

  function errorText(error: PercentageError | null) {
    if (error === "divideByZero") return t.divideByZero;
    if (error === "invalid") return t.invalidInput;
    return "";
  }

  const result = $derived(calculate());
  const resultText = $derived(
    result.error
      ? errorText(result.error)
      : result.value === null
        ? t.emptyResult
        : mode === "percentOf"
          ? formatNumber(result.value)
          : `${formatNumber(result.value)}%`,
  );

  async function copyResult() {
    if (result.value === null || result.error) return;

    try {
      await navigator.clipboard.writeText(resultText);
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

<section class="calculator-tool panel" aria-labelledby="percentage-calculator-title">
  <div class="tool-head">
    <p class="privacy-pill">{t.privacy}</p>
    <h2 id="percentage-calculator-title">{t.title}</h2>
  </div>

  <fieldset>
    <legend>{t.modeLabel}</legend>
    <div class="segmented">
      <button type="button" aria-pressed={mode === "percentOf"} onclick={() => (mode = "percentOf")}>{t.modes.percentOf}</button>
      <button type="button" aria-pressed={mode === "whatPercent"} onclick={() => (mode = "whatPercent")}>{t.modes.whatPercent}</button>
      <button type="button" aria-pressed={mode === "percentChange"} onclick={() => (mode = "percentChange")}>{t.modes.percentChange}</button>
    </div>
  </fieldset>

  <div class="field-grid">
    <label for="percentage-first">
      <span>{firstLabel()}</span>
      <input id="percentage-first" type="number" inputmode="decimal" bind:value={firstValue} />
    </label>
    <label for="percentage-second">
      <span>{secondLabel()}</span>
      <input id="percentage-second" type="number" inputmode="decimal" bind:value={secondValue} />
    </label>
  </div>

  <div class:error={Boolean(result.error)} class="result-card" aria-live="polite">
    <span>{t.resultLabel}</span>
    <strong>{resultText}</strong>
  </div>

  <div class="actions">
    <button type="button" onclick={copyResult} disabled={result.value === null || Boolean(result.error)} aria-label={t.copyLabel}>
      {copied ? t.copied : t.copy}
    </button>
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
    margin: 0;
    border: 0;
    padding: 0;
  }

  legend,
  label span,
  .result-card span {
    display: block;
    margin-bottom: 8px;
    color: var(--color-text);
    font-size: 13px;
    font-weight: 800;
  }

  .segmented,
  .field-grid {
    display: grid;
    gap: 10px;
  }

  .segmented {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .field-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
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

  .result-card {
    margin-top: 18px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-panel);
    background: var(--color-bg);
    padding: 18px;
  }

  .result-card strong {
    color: var(--color-text);
    font-size: clamp(28px, 6vw, 42px);
    line-height: 1.05;
    overflow-wrap: anywhere;
  }

  .result-card.error strong {
    color: var(--color-danger, #b42318);
    font-size: 16px;
    line-height: 1.4;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 14px;
  }

  .status {
    min-height: 20px;
    margin-top: 12px;
    color: var(--color-muted);
    font-size: 14px;
    font-weight: 700;
  }

  @media (max-width: 560px) {
    .calculator-tool {
      padding: 18px;
    }

    .segmented,
    .field-grid {
      grid-template-columns: 1fr;
    }

    .actions button {
      width: 100%;
    }
  }
</style>
