<script lang="ts">
  import type { Locale } from "@/i18n/config";
  import { t as getStrings } from "@/i18n/strings";
  import { convertUnit, unitOptionsByCategory, type UnitCategory } from "@/utils/units";

  const categoryOrder: UnitCategory[] = ["length", "mass", "temperature", "data"];

  let {
    locale = "en",
  }: {
    locale?: Locale;
  } = $props();

  const t = $derived(getStrings(locale).unitConverter);

  let category = $state<UnitCategory>("length");
  let input = $state("1");
  let fromUnit = $state("m");
  let toUnit = $state("ft");
  let copied = $state(false);
  let message = $state("");

  const units = $derived(unitOptionsByCategory[category]);
  const numericInput = $derived(input.trim() ? Number(input) : Number.NaN);
  const result = $derived(convertUnit(numericInput, fromUnit, toUnit, category));
  const output = $derived(result.error ? "" : formatNumber(result.value));

  function formatNumber(value: number) {
    if (!Number.isFinite(value)) return "";

    const rounded = Number(value.toPrecision(12));
    return Object.is(rounded, -0) ? "0" : String(rounded);
  }

  function unitLabel(unit: string) {
    return t.units[unit as keyof typeof t.units] ?? unit;
  }

  function updateCategory(value: string) {
    category = value as UnitCategory;
    const nextUnits = unitOptionsByCategory[category];
    fromUnit = nextUnits[0]?.value ?? "";
    toUnit = nextUnits[1]?.value ?? nextUnits[0]?.value ?? "";
  }

  function swapUnits() {
    const previous = fromUnit;
    fromUnit = toUnit;
    toUnit = previous;
  }

  async function copyResult() {
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

  $effect(() => {
    message = result.error ? t.invalidStatus : t.readyStatus;
  });
</script>

<section class="unit-tool panel" aria-labelledby="unit-tool-title">
  <div class="tool-head">
    <div>
      <p class="privacy-pill">{t.privacy}</p>
      <h2 id="unit-tool-title">{t.title}</h2>
    </div>
  </div>

  <div class="controls">
    <label for="unit-category">
      <span>{t.categoryLabel}</span>
      <select id="unit-category" value={category} onchange={(event) => updateCategory(event.currentTarget.value)}>
        {#each categoryOrder as item}
          <option value={item}>{t.categories[item]}</option>
        {/each}
      </select>
    </label>

    <label for="unit-value">
      <span>{t.valueLabel}</span>
      <input
        id="unit-value"
        type="number"
        inputmode="decimal"
        bind:value={input}
        placeholder={t.valuePlaceholder}
        aria-describedby="unit-status"
        aria-invalid={Boolean(result.error)}
      />
    </label>
  </div>

  <div class="conversion-row">
    <label for="unit-from">
      <span>{t.fromLabel}</span>
      <select id="unit-from" bind:value={fromUnit}>
        {#each units as unit}
          <option value={unit.value}>{unitLabel(unit.value)}</option>
        {/each}
      </select>
    </label>

    <button type="button" class="swap-button" onclick={swapUnits} aria-label={t.swapLabel}>{t.swap}</button>

    <label for="unit-to">
      <span>{t.toLabel}</span>
      <select id="unit-to" bind:value={toUnit}>
        {#each units as unit}
          <option value={unit.value}>{unitLabel(unit.value)}</option>
        {/each}
      </select>
    </label>
  </div>

  <label class="output-label" for="unit-output">
    <span>{t.resultLabel}</span>
    <output id="unit-output">{output || t.emptyResult}</output>
  </label>

  <div class="actions">
    <button type="button" onclick={copyResult} disabled={!output} aria-label={t.copyLabel}>{copied ? t.copied : t.copy}</button>
  </div>

  <p id="unit-status" class:error={Boolean(result.error)} class="status" aria-live="polite">{message}</p>
</section>

<style>
  .unit-tool {
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

  .controls,
  .conversion-row {
    display: grid;
    gap: 14px;
    align-items: end;
  }

  .controls {
    grid-template-columns: 220px minmax(0, 1fr);
  }

  .conversion-row {
    grid-template-columns: minmax(0, 1fr) 88px minmax(0, 1fr);
    margin-top: 16px;
  }

  label span,
  .output-label > span {
    display: block;
    margin-bottom: 8px;
    color: var(--color-text);
    font-size: 13px;
    font-weight: 800;
  }

  input,
  select,
  output {
    width: 100%;
    min-height: 48px;
    border: 1px solid var(--color-input-border);
    border-radius: 15px;
    background: var(--color-bg);
    color: var(--color-text);
    font-size: 16px;
    outline: none;
    padding: 13px 14px;
  }

  output {
    display: block;
    overflow-wrap: anywhere;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  }

  input:focus,
  select:focus,
  button:focus {
    border-color: var(--color-accent);
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

  .swap-button,
  .actions button {
    border-color: var(--color-accent);
    background: var(--color-accent);
    color: #fff;
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.55;
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

  .status.error {
    color: var(--color-danger, #b42318);
  }

  @media (max-width: 560px) {
    .unit-tool {
      padding: 18px;
    }

    .controls,
    .conversion-row {
      grid-template-columns: 1fr;
    }

    .swap-button,
    .actions button {
      width: 100%;
    }
  }
</style>
