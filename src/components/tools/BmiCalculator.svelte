<script lang="ts">
  import type { Locale } from "@/i18n/config";
  import { t as getStrings } from "@/i18n/strings";
  import { bmi, bmiFromImperial } from "@/utils/bmi";

  type UnitMode = "metric" | "imperial";

  let {
    locale = "en",
  }: {
    locale?: Locale;
  } = $props();

  const t = $derived(getStrings(locale).bmiCalculator);

  let unitMode = $state<UnitMode>("metric");
  let weight = $state("70");
  let height = $state("175");
  let copied = $state(false);
  let message = $state("");

  function parseNumber(value: string) {
    return value.trim() === "" ? Number.NaN : Number(value);
  }

  function formatNumber(value: number, maximumFractionDigits = 1) {
    return new Intl.NumberFormat(locale, { maximumFractionDigits }).format(value);
  }

  function calculate() {
    const weightValue = parseNumber(weight);
    const heightValue = parseNumber(height);
    return unitMode === "metric" ? bmi(weightValue, heightValue / 100) : bmiFromImperial(weightValue, heightValue);
  }

  const result = $derived(calculate());
  const bmiText = $derived(result.value === null || result.error ? t.emptyResult : formatNumber(result.value));
  const categoryText = $derived(result.category ? t.categories[result.category] : result.error ? t.invalidInput : t.emptyResult);
  const copyText = $derived(result.value === null || result.error ? "" : `${t.bmiLabel}: ${bmiText}\n${t.categoryLabel}: ${categoryText}`);

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

<section class="calculator-tool panel" aria-labelledby="bmi-calculator-title">
  <div class="tool-head">
    <p class="privacy-pill">{t.privacy}</p>
    <h2 id="bmi-calculator-title">{t.title}</h2>
  </div>

  <fieldset>
    <legend>{t.unitLabel}</legend>
    <div class="segmented">
      <button type="button" aria-pressed={unitMode === "metric"} onclick={() => (unitMode = "metric")}>{t.metric}</button>
      <button type="button" aria-pressed={unitMode === "imperial"} onclick={() => (unitMode = "imperial")}>{t.imperial}</button>
    </div>
  </fieldset>

  <div class="field-grid">
    <label for="bmi-weight">
      <span>{unitMode === "metric" ? t.weightKg : t.weightLb}</span>
      <input id="bmi-weight" type="number" inputmode="decimal" min="0" bind:value={weight} />
    </label>
    <label for="bmi-height">
      <span>{unitMode === "metric" ? t.heightCm : t.heightIn}</span>
      <input id="bmi-height" type="number" inputmode="decimal" min="0" bind:value={height} />
    </label>
  </div>

  <div class:error={Boolean(result.error)} class="result-grid" aria-label={t.resultLabel} aria-live="polite">
    <article>
      <span>{t.bmiLabel}</span>
      <strong>{bmiText}</strong>
    </article>
    <article>
      <span>{t.categoryLabel}</span>
      <strong>{categoryText}</strong>
    </article>
  </div>

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
    margin: 0;
    border: 0;
    padding: 0;
  }

  legend,
  label span,
  article span {
    display: block;
    margin-bottom: 8px;
    color: var(--color-text);
    font-size: 13px;
    font-weight: 800;
  }

  .segmented,
  .field-grid,
  .result-grid {
    display: grid;
    gap: 10px;
  }

  .segmented,
  .field-grid,
  .result-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .field-grid,
  .result-grid {
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

  article {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-panel);
    background: var(--color-bg);
    padding: 18px;
  }

  article strong {
    color: var(--color-text);
    font-size: clamp(24px, 5vw, 36px);
    line-height: 1.1;
    overflow-wrap: anywhere;
  }

  .result-grid.error strong {
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
    .field-grid,
    .result-grid {
      grid-template-columns: 1fr;
    }

    .actions button {
      width: 100%;
    }
  }
</style>
