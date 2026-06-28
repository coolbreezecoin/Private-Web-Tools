<script lang="ts">
  import type { Locale } from "@/i18n/config";
  import { t as getStrings } from "@/i18n/strings";
  import { ageBetween, type AgeError } from "@/utils/age";

  let {
    locale = "en",
  }: {
    locale?: Locale;
  } = $props();

  const t = $derived(getStrings(locale).ageCalculator);

  let birthDate = $state("");
  let asOfDate = $state(todayIso());
  let copied = $state(false);
  let message = $state("");

  function todayIso() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function formatInteger(value: number) {
    return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);
  }

  function calculate() {
    if (!birthDate) {
      return { value: null, error: null };
    }

    return ageBetween(birthDate, asOfDate || todayIso());
  }

  function errorText(error: AgeError | null) {
    if (error === "futureDate") return t.futureDate;
    if (error === "invalidDate") return t.invalidDate;
    return "";
  }

  const result = $derived(calculate());
  const value = $derived(result.value);
  const copyText = $derived(
    value
      ? `${t.years}: ${formatInteger(value.years)}\n${t.months}: ${formatInteger(value.months)}\n${t.days}: ${formatInteger(value.days)}\n${t.totalDays}: ${formatInteger(value.totalDays)}\n${t.totalWeeks}: ${formatInteger(value.totalWeeks)}\n${t.totalMonths}: ${formatInteger(value.totalMonths)}`
      : "",
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

<section class="calculator-tool panel" aria-labelledby="age-calculator-title">
  <div class="tool-head">
    <p class="privacy-pill">{t.privacy}</p>
    <h2 id="age-calculator-title">{t.title}</h2>
  </div>

  <div class="field-grid">
    <label for="age-birth-date">
      <span>{t.birthDateLabel}</span>
      <input id="age-birth-date" type="date" bind:value={birthDate} />
    </label>
    <label for="age-as-of-date">
      <span>{t.asOfDateLabel}</span>
      <input id="age-as-of-date" type="date" bind:value={asOfDate} />
    </label>
  </div>

  {#if result.error}
    <div class="result-card error" aria-live="polite">
      <span>{t.resultLabel}</span>
      <strong>{errorText(result.error)}</strong>
    </div>
  {:else if value}
    <div class="result-grid" aria-label={t.resultLabel} aria-live="polite">
      <article>
        <span>{t.years}</span>
        <strong>{formatInteger(value.years)}</strong>
      </article>
      <article>
        <span>{t.months}</span>
        <strong>{formatInteger(value.months)}</strong>
      </article>
      <article>
        <span>{t.days}</span>
        <strong>{formatInteger(value.days)}</strong>
      </article>
      <article>
        <span>{t.totalDays}</span>
        <strong>{formatInteger(value.totalDays)}</strong>
      </article>
      <article>
        <span>{t.totalWeeks}</span>
        <strong>{formatInteger(value.totalWeeks)}</strong>
      </article>
      <article>
        <span>{t.totalMonths}</span>
        <strong>{formatInteger(value.totalMonths)}</strong>
      </article>
    </div>
  {:else}
    <div class="result-card" aria-live="polite">
      <span>{t.resultLabel}</span>
      <strong>{t.emptyResult}</strong>
    </div>
  {/if}

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
  .result-grid {
    display: grid;
    gap: 10px;
  }

  .field-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .result-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
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

  .result-card {
    margin-top: 16px;
  }

  article strong,
  .result-card strong {
    color: var(--color-text);
    font-size: clamp(22px, 5vw, 34px);
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
    margin-top: 14px;
  }

  .status {
    min-height: 20px;
    margin-top: 12px;
    color: var(--color-muted);
    font-size: 14px;
    font-weight: 700;
  }

  @media (max-width: 760px) {
    .result-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 560px) {
    .calculator-tool {
      padding: 18px;
    }

    .field-grid,
    .result-grid {
      grid-template-columns: 1fr;
    }

    .actions button {
      width: 100%;
    }
  }
</style>
