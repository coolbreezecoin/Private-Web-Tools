<script lang="ts">
  import type { Locale } from "@/i18n/config";
  import { t as getStrings } from "@/i18n/strings";
  import { csvToJson, jsonToCsv } from "@/utils/csv";

  type Direction = "csvToJson" | "jsonToCsv";
  type DelimiterKey = "comma" | "semicolon" | "tab";

  const delimiters: Record<DelimiterKey, string> = {
    comma: ",",
    semicolon: ";",
    tab: "\t",
  };

  let {
    locale = "en",
  }: {
    locale?: Locale;
  } = $props();

  const t = $derived(getStrings(locale).csvJson);

  let direction = $state<Direction>("csvToJson");
  let delimiterKey = $state<DelimiterKey>("comma");
  let input = $state("name,email\nAlex,alex@example.com\nSam,sam@example.com");
  let copied = $state(false);
  let message = $state("");

  const delimiter = $derived(delimiters[delimiterKey]);
  const result = $derived(direction === "csvToJson" ? csvToJson(input, { delimiter }) : jsonToCsv(input, { delimiter }));
  const placeholder = $derived(direction === "csvToJson" ? t.inputPlaceholderCsv : t.inputPlaceholderJson);

  function setDirection(nextDirection: Direction) {
    direction = nextDirection;
    input = nextDirection === "csvToJson" ? t.inputPlaceholderCsv : t.inputPlaceholderJson;
  }

  async function copyOutput() {
    if (!result.value) return;

    try {
      await navigator.clipboard.writeText(result.value);
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
    if (result.error) {
      message = direction === "csvToJson" ? t.invalidCsvStatus : t.invalidJsonStatus;
    } else {
      message = t.validStatus;
    }
  });
</script>

<section class="csv-tool panel" aria-labelledby="csv-tool-title">
  <div class="tool-head">
    <div>
      <p class="privacy-pill">{t.privacy}</p>
      <h2 id="csv-tool-title">{t.title}</h2>
    </div>
  </div>

  <div class="controls">
    <fieldset>
      <legend>{t.directionLabel}</legend>
      <div class="segmented">
        <button type="button" aria-pressed={direction === "csvToJson"} onclick={() => setDirection("csvToJson")}>{t.csvToJson}</button>
        <button type="button" aria-pressed={direction === "jsonToCsv"} onclick={() => setDirection("jsonToCsv")}>{t.jsonToCsv}</button>
      </div>
    </fieldset>

    <label for="csv-delimiter">
      <span>{t.delimiterLabel}</span>
      <select id="csv-delimiter" bind:value={delimiterKey}>
        <option value="comma">{t.delimiters.comma}</option>
        <option value="semicolon">{t.delimiters.semicolon}</option>
        <option value="tab">{t.delimiters.tab}</option>
      </select>
    </label>
  </div>

  <div class="editor-grid">
    <label for="csv-input">
      <span>{t.inputLabel}</span>
      <textarea
        id="csv-input"
        bind:value={input}
        rows="10"
        placeholder={placeholder}
        aria-describedby="csv-status"
        aria-invalid={Boolean(result.error)}
      ></textarea>
    </label>

    <label for="csv-output">
      <span>{t.outputLabel}</span>
      <textarea id="csv-output" readonly rows="10" value={result.value || t.emptyResult}></textarea>
    </label>
  </div>

  <div class="actions">
    <button type="button" onclick={copyOutput} disabled={!result.value} aria-label={t.copyLabel}>
      {copied ? t.copied : t.copy}
    </button>
  </div>

  <p id="csv-status" class:error={Boolean(result.error)} class="status" aria-live="polite">{message}</p>
</section>

<style>
  .csv-tool {
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

  .controls {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 180px;
    gap: 16px;
    align-items: end;
  }

  fieldset {
    min-width: 0;
    margin: 0;
    border: 0;
    padding: 0;
  }

  legend,
  label span {
    display: block;
    margin-bottom: 8px;
    color: var(--color-text);
    font-size: 13px;
    font-weight: 800;
  }

  .segmented {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  button,
  select {
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
    opacity: 0.48;
  }

  select {
    width: 100%;
  }

  .editor-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    margin-top: 18px;
  }

  textarea {
    display: block;
    width: 100%;
    min-height: 250px;
    resize: vertical;
    border: 1px solid var(--color-input-border);
    border-radius: 15px;
    background: var(--color-bg);
    color: var(--color-text);
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
    font-size: 14px;
    line-height: 1.55;
    outline: none;
    padding: 14px;
  }

  textarea:focus,
  select:focus,
  button:focus {
    border-color: var(--color-accent);
  }

  textarea[readonly] {
    background: var(--color-surface);
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
    .csv-tool {
      padding: 18px;
    }

    .controls,
    .editor-grid {
      grid-template-columns: 1fr;
    }

    .actions button {
      width: 100%;
    }
  }
</style>
