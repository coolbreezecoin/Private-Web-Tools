<script lang="ts">
  import type { Locale } from "@/i18n/config";
  import { t as getStrings } from "@/i18n/strings";
  import { convertColor } from "@/utils/color";

  let {
    locale = "en",
  }: {
    locale?: Locale;
  } = $props();

  const t = $derived(getStrings(locale).colorConverter);

  let input = $state("#4f46e5");
  let swatch = $state("#4f46e5");
  let copiedId = $state("");
  let message = $state("");

  const result = $derived(convertColor(input));
  const rows = $derived(
    result.value
      ? [
          { id: "hex", label: t.formats.hex, value: result.value.hex },
          { id: "rgb", label: t.formats.rgb, value: result.value.rgb },
          { id: "hsl", label: t.formats.hsl, value: result.value.hsl },
        ]
      : [],
  );

  function setFromPicker(value: string) {
    input = value;
    swatch = value;
  }

  async function copyValue(id: string, label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      copiedId = id;
      message = t.copiedStatus.replace("{format}", label);
      window.setTimeout(() => {
        if (copiedId === id) copiedId = "";
      }, 1500);
    } catch {
      message = t.copyFailed;
    }
  }

  $effect(() => {
    if (result.value) {
      swatch = result.value.hex;
      message = t.validStatus;
    } else if (input.trim()) {
      message = t.invalidStatus;
    }
  });
</script>

<section class="color-tool panel" aria-labelledby="color-tool-title">
  <div class="tool-head">
    <div>
      <p class="privacy-pill">{t.privacy}</p>
      <h2 id="color-tool-title">{t.title}</h2>
    </div>
  </div>

  <div class="color-layout">
    <div class="inputs">
      <label for="color-input">
        <span>{t.inputLabel}</span>
        <input
          id="color-input"
          type="text"
          bind:value={input}
          placeholder={t.inputPlaceholder}
          aria-describedby="color-status"
          aria-invalid={Boolean(result.error && input.trim())}
        />
      </label>

      <label for="color-picker">
        <span>{t.pickerLabel}</span>
        <input id="color-picker" type="color" value={swatch} oninput={(event) => setFromPicker(event.currentTarget.value)} />
      </label>
    </div>

    <div class="preview">
      <p>{t.previewLabel}</p>
      <div class="swatch" style={`background: ${swatch}`}></div>
    </div>
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
          aria-label={t.copyLabel.replace("{format}", row.label)}
        >
          {copiedId === row.id ? t.copied : t.copy}
        </button>
      </article>
    {/each}
  </div>

  <p id="color-status" class:error={Boolean(result.error && input.trim())} class="status" aria-live="polite">{message}</p>
</section>

<style>
  .color-tool {
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

  .color-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 180px;
    gap: 18px;
    align-items: end;
  }

  .inputs {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 130px;
    gap: 14px;
    align-items: end;
  }

  label span,
  .preview p {
    display: block;
    margin-bottom: 8px;
    color: var(--color-text);
    font-size: 13px;
    font-weight: 800;
  }

  input[type="text"] {
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

  input[type="color"] {
    width: 100%;
    height: 48px;
    border: 1px solid var(--color-input-border);
    border-radius: 15px;
    background: var(--color-bg);
    cursor: pointer;
    padding: 4px;
  }

  input:focus {
    border-color: var(--color-accent);
  }

  .swatch {
    height: 48px;
    border: 1px solid var(--color-border);
    border-radius: 15px;
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
    color: #b91c1c;
  }

  @media (max-width: 760px) {
    .color-layout,
    .inputs {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 560px) {
    .color-tool {
      padding: 18px;
    }

    .result-card {
      flex-direction: column;
      align-items: stretch;
    }

    button {
      width: 100%;
    }
  }
</style>
