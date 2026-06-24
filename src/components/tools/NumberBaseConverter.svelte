<script lang="ts">
  import type { Locale } from "@/i18n/config";
  import { t as getStrings } from "@/i18n/strings";
  import { convertNumberBase, type SupportedBase } from "@/utils/numberBase";

  let {
    locale = "en",
  }: {
    locale?: Locale;
  } = $props();

  const t = $derived(getStrings(locale).numberBase);

  let input = $state("255");
  let sourceBase = $state<SupportedBase>(10);
  let copiedId = $state("");
  let message = $state("");

  const result = $derived(convertNumberBase(input, sourceBase));
  const rows = $derived(
    result.value
      ? [
          { id: "binary", label: t.bases.binary, value: result.value.binary },
          { id: "octal", label: t.bases.octal, value: result.value.octal },
          { id: "decimal", label: t.bases.decimal, value: result.value.decimal },
          { id: "hex", label: t.bases.hex, value: result.value.hex },
        ]
      : [],
  );

  async function copyValue(id: string, label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      copiedId = id;
      message = t.copiedStatus.replace("{base}", label);
      window.setTimeout(() => {
        if (copiedId === id) copiedId = "";
      }, 1500);
    } catch {
      message = t.copyFailed;
    }
  }

  function updateSourceBase(value: string) {
    sourceBase = Number(value) as SupportedBase;
  }

  $effect(() => {
    message = result.error ? t.invalidStatus : t.validStatus;
  });
</script>

<section class="number-tool panel" aria-labelledby="number-tool-title">
  <div class="tool-head">
    <div>
      <p class="privacy-pill">{t.privacy}</p>
      <h2 id="number-tool-title">{t.title}</h2>
    </div>
  </div>

  <div class="controls">
    <label for="number-input">
      <span>{t.inputLabel}</span>
      <input
        id="number-input"
        type="text"
        bind:value={input}
        placeholder={t.inputPlaceholder}
        aria-describedby="number-status"
        aria-invalid={Boolean(result.error)}
      />
    </label>

    <label for="number-base">
      <span>{t.sourceBaseLabel}</span>
      <select id="number-base" value={sourceBase} onchange={(event) => updateSourceBase(event.currentTarget.value)}>
        <option value="2">{t.bases.binary}</option>
        <option value="8">{t.bases.octal}</option>
        <option value="10">{t.bases.decimal}</option>
        <option value="16">{t.bases.hex}</option>
      </select>
    </label>
  </div>

  <div class="results" aria-label={t.resultsLabel}>
    {#each rows as row}
      <article class="result-card">
        <div>
          <h3>{row.label}</h3>
          <output>{row.value}</output>
        </div>
        <button
          type="button"
          onclick={() => copyValue(row.id, row.label, row.value)}
          aria-label={t.copyLabel.replace("{base}", row.label)}
        >
          {copiedId === row.id ? t.copied : t.copy}
        </button>
      </article>
    {/each}
  </div>

  <p id="number-status" class:error={Boolean(result.error)} class="status" aria-live="polite">{message}</p>
</section>

<style>
  .number-tool {
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

  .controls {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 190px;
    gap: 14px;
    align-items: end;
  }

  label span {
    display: block;
    margin-bottom: 8px;
    color: var(--color-text);
    font-size: 13px;
    font-weight: 800;
  }

  input,
  select {
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

  input:focus,
  select:focus,
  button:focus {
    border-color: var(--color-accent);
  }

  .results {
    display: grid;
    gap: 12px;
    margin-top: 22px;
  }

  .result-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    border: 1px solid var(--color-border);
    border-radius: 16px;
    background: var(--color-bg);
    padding: 16px;
  }

  h3 {
    color: var(--color-text);
    font-size: 15px;
  }

  output {
    display: block;
    margin-top: 6px;
    overflow-wrap: anywhere;
    color: var(--color-text);
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
    font-size: 15px;
    line-height: 1.5;
  }

  button {
    min-width: 74px;
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
    .number-tool {
      padding: 18px;
    }

    .controls,
    .result-card {
      grid-template-columns: 1fr;
    }

    .controls {
      display: grid;
    }

    .result-card {
      align-items: stretch;
      flex-direction: column;
    }

    button {
      width: 100%;
    }
  }
</style>
