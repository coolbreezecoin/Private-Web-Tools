<script lang="ts">
  import type { Locale } from "@/i18n/config";
  import { t as getStrings } from "@/i18n/strings";
  import { wordFrequency } from "@/utils/wordFrequency";

  let {
    locale = "en",
  }: {
    locale?: Locale;
  } = $props();

  const t = $derived(getStrings(locale).wordFrequency);

  let input = $state(t.initialInput);
  let caseInsensitive = $state(true);
  let minLength = $state(1);
  let ignoreStopwords = $state(true);
  let copied = $state<"text" | "csv" | "">("");
  let message = $state("");

  const rows = $derived(wordFrequency(input, { caseInsensitive, minLength, ignoreStopwords }));
  const total = $derived(rows.reduce((sum, row) => sum + row.count, 0));
  const summary = $derived(t.summary.replace("{count}", String(total)).replace("{unique}", String(rows.length)));

  function asText() {
    return rows.map((row) => `${row.word}\t${row.count}\t${row.percent.toFixed(2)}%`).join("\n");
  }

  function asCsv() {
    const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const header = [t.wordHeader, t.countHeader, t.percentHeader].map(escape).join(",");
    return [header, ...rows.map((row) => `${escape(row.word)},${row.count},${row.percent.toFixed(2)}`)].join("\n");
  }

  async function copyRows(format: "text" | "csv") {
    if (rows.length === 0) return;

    try {
      await navigator.clipboard.writeText(format === "csv" ? asCsv() : asText());
      copied = format;
      message = format === "csv" ? t.copiedCsvStatus : t.copiedTextStatus;
      window.setTimeout(() => {
        copied = "";
      }, 1500);
    } catch {
      message = t.copyFailed;
    }
  }
</script>

<section class="frequency-tool panel" aria-labelledby="frequency-tool-title">
  <div class="tool-head">
    <div>
      <p class="privacy-pill">{t.privacy}</p>
      <h2 id="frequency-tool-title">{t.title}</h2>
    </div>
  </div>

  <label for="frequency-input">
    <span>{t.inputLabel}</span>
    <textarea id="frequency-input" bind:value={input} rows="8" placeholder={t.placeholder}></textarea>
  </label>

  <div class="options" aria-label={t.optionsLabel}>
    <label class="check-option"><input type="checkbox" bind:checked={caseInsensitive} /> <span>{t.caseInsensitive}</span></label>
    <label class="check-option"><input type="checkbox" bind:checked={ignoreStopwords} /> <span>{t.ignoreStopwords}</span></label>
    <label for="frequency-min">
      <span>{t.minLengthLabel}</span>
      <input id="frequency-min" type="number" min="1" max="50" bind:value={minLength} />
    </label>
  </div>

  <p class="summary" aria-live="polite">{summary}</p>

  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>{t.wordHeader}</th>
          <th>{t.countHeader}</th>
          <th>{t.percentHeader}</th>
        </tr>
      </thead>
      <tbody>
        {#if rows.length > 0}
          {#each rows as row}
            <tr>
              <td>{row.word}</td>
              <td>{row.count}</td>
              <td>{row.percent.toFixed(2)}%</td>
            </tr>
          {/each}
        {:else}
          <tr>
            <td colspan="3">{t.emptyResult}</td>
          </tr>
        {/if}
      </tbody>
    </table>
  </div>

  <div class="actions">
    <button type="button" onclick={() => copyRows("text")} disabled={rows.length === 0} aria-label={t.copyTextLabel}>
      {copied === "text" ? t.copied : t.copyText}
    </button>
    <button type="button" onclick={() => copyRows("csv")} disabled={rows.length === 0} aria-label={t.copyCsvLabel}>
      {copied === "csv" ? t.copied : t.copyCsv}
    </button>
  </div>

  <p class="status" aria-live="polite">{message}</p>
</section>

<style>
  .frequency-tool {
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

  label span {
    display: block;
    margin-bottom: 8px;
    color: var(--color-text);
    font-size: 13px;
    font-weight: 800;
  }

  textarea,
  input {
    width: 100%;
    border: 1px solid var(--color-input-border);
    border-radius: 15px;
    background: var(--color-bg);
    color: var(--color-text);
    font-size: 15px;
    line-height: 1.55;
    outline: none;
    padding: 13px 14px;
  }

  textarea {
    min-height: 150px;
    resize: vertical;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  }

  input:focus,
  textarea:focus,
  button:focus {
    border-color: var(--color-accent);
  }

  .options {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-top: 16px;
  }

  .check-option {
    display: flex;
    min-height: 48px;
    align-items: center;
    gap: 10px;
    border: 1px solid var(--color-border);
    border-radius: 14px;
    background: var(--color-bg);
    padding: 10px 12px;
  }

  .check-option span {
    margin: 0;
  }

  .summary,
  .status {
    margin-top: 12px;
    color: var(--color-muted);
    font-size: 14px;
    font-weight: 700;
  }

  .table-wrap {
    overflow-x: auto;
    margin-top: 16px;
    border: 1px solid var(--color-border);
    border-radius: 15px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    background: var(--color-bg);
    color: var(--color-text);
    font-size: 14px;
  }

  th,
  td {
    border-bottom: 1px solid var(--color-border);
    padding: 10px 12px;
    text-align: left;
  }

  tbody tr:last-child td {
    border-bottom: 0;
  }

  th {
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 12px;
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

  @media (max-width: 560px) {
    .frequency-tool {
      padding: 18px;
    }

    .options {
      grid-template-columns: 1fr;
    }

    .actions button {
      width: 100%;
    }
  }
</style>
