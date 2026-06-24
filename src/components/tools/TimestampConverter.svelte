<script lang="ts">
  import type { Locale } from "@/i18n/config";
  import { t as getStrings } from "@/i18n/strings";
  import { currentUnixSeconds, dateToTimestamp, timestampToDate } from "@/utils/timestamp";

  let {
    locale = "en",
  }: {
    locale?: Locale;
  } = $props();

  const t = $derived(getStrings(locale).timestampConverter);

  let currentTime = $state("");
  let timestampInput = $state("");
  let dateInput = $state("");
  let copiedId = $state("");
  let message = $state("");
  let initialized = $state(false);

  const timestampResult = $derived(timestampToDate(timestampInput));
  const dateResult = $derived(dateToTimestamp(dateInput));
  const timestampRows = $derived(
    timestampResult.value
      ? [
          { id: "iso", label: t.labels.iso, value: timestampResult.value.iso },
          { id: "utc", label: t.labels.utc, value: timestampResult.value.utc },
          { id: "local", label: t.labels.local, value: timestampResult.value.local },
        ]
      : [],
  );
  const dateRows = $derived(
    dateResult.value
      ? [
          { id: "seconds", label: t.labels.seconds, value: dateResult.value.seconds },
          { id: "milliseconds", label: t.labels.milliseconds, value: dateResult.value.milliseconds },
        ]
      : [],
  );
  const hasTimestampError = $derived(Boolean(timestampInput.trim() && timestampResult.error));
  const hasDateError = $derived(Boolean(dateInput.trim() && dateResult.error));

  async function copyValue(id: string, label: string, value: string) {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      copiedId = id;
      message = t.copiedStatus.replace("{label}", label);
      window.setTimeout(() => {
        if (copiedId === id) copiedId = "";
      }, 1500);
    } catch {
      message = t.copyFailed;
    }
  }

  $effect(() => {
    if (!initialized) {
      currentTime = currentUnixSeconds();
      timestampInput = currentTime;
      dateInput = new Date().toISOString();
      initialized = true;
    }

    const timer = window.setInterval(() => {
      currentTime = currentUnixSeconds();
    }, 1000);

    return () => window.clearInterval(timer);
  });

  $effect(() => {
    if (timestampInput.trim() && timestampResult.error) {
      message = t.timestampError;
    } else if (dateInput.trim() && dateResult.error) {
      message = t.dateError;
    } else if (!copiedId) {
      message = "";
    }
  });
</script>

<section class="timestamp-tool panel" aria-labelledby="timestamp-tool-title">
  <div class="tool-head">
    <div>
      <p class="privacy-pill">{t.privacy}</p>
      <h2 id="timestamp-tool-title">{t.title}</h2>
    </div>
  </div>

  <section class="current-card" aria-labelledby="current-time-title">
    <div>
      <p id="current-time-title">{t.currentTitle}</p>
      <output aria-label={t.currentLabel}>{currentTime}</output>
    </div>
    <button type="button" onclick={() => copyValue("current", t.currentLabel, currentTime)} disabled={!currentTime} aria-label={t.copyCurrentLabel}>
      {copiedId === "current" ? t.copied : t.copy}
    </button>
  </section>

  <div class="converter-grid">
    <section class="converter-card" aria-labelledby="timestamp-to-date-title">
      <label class="input-label" id="timestamp-to-date-title" for="timestamp-input">{t.timestampInputLabel}</label>
      <input
        id="timestamp-input"
        type="text"
        bind:value={timestampInput}
        placeholder={t.timestampPlaceholder}
        aria-describedby="timestamp-status"
        aria-invalid={Boolean(timestampInput.trim() && timestampResult.error)}
      />

      <div class="results" aria-label={t.timestampResultsLabel}>
        {#each timestampRows as row}
          <article class="result-row">
            <div>
              <h3>{row.label}</h3>
              <output>{row.value}</output>
            </div>
            <button
              type="button"
              onclick={() => copyValue(row.id, row.label, row.value)}
              aria-label={t.copyLabel.replace("{label}", row.label)}
            >
              {copiedId === row.id ? t.copied : t.copy}
            </button>
          </article>
        {/each}
      </div>
    </section>

    <section class="converter-card" aria-labelledby="date-to-timestamp-title">
      <label class="input-label" id="date-to-timestamp-title" for="date-input">{t.dateInputLabel}</label>
      <input
        id="date-input"
        type="text"
        bind:value={dateInput}
        placeholder={t.datePlaceholder}
        aria-describedby="timestamp-status"
        aria-invalid={Boolean(dateInput.trim() && dateResult.error)}
      />

      <div class="results" aria-label={t.dateResultsLabel}>
        {#each dateRows as row}
          <article class="result-row">
            <div>
              <h3>{row.label}</h3>
              <output>{row.value}</output>
            </div>
            <button
              type="button"
              onclick={() => copyValue(row.id, row.label, row.value)}
              aria-label={t.copyLabel.replace("{label}", row.label)}
            >
              {copiedId === row.id ? t.copied : t.copy}
            </button>
          </article>
        {/each}
      </div>
    </section>
  </div>

  <p id="timestamp-status" class:error={hasTimestampError || hasDateError} class="status" aria-live="polite">{message}</p>
</section>

<style>
  .timestamp-tool {
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

  .current-card,
  .converter-card,
  .result-row {
    border: 1px solid var(--color-border);
    border-radius: 16px;
    background: var(--color-bg);
  }

  .current-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;
    padding: 16px;
  }

  .current-card p,
  .input-label,
  h3 {
    color: var(--color-text);
    font-size: 13px;
    font-weight: 800;
  }

  .current-card output,
  .result-row output {
    display: block;
    margin-top: 6px;
    overflow-wrap: anywhere;
    color: var(--color-text);
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
    font-size: 15px;
    line-height: 1.5;
  }

  .converter-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .converter-card {
    padding: 16px;
  }

  .input-label {
    display: block;
    margin-bottom: 8px;
  }

  input[type="text"] {
    width: 100%;
    min-height: 48px;
    border: 1px solid var(--color-input-border);
    border-radius: 15px;
    background: var(--color-surface);
    color: var(--color-text);
    font-size: 16px;
    outline: none;
    padding: 13px 14px;
  }

  input:focus {
    border-color: var(--color-accent);
  }

  .results {
    display: grid;
    gap: 12px;
    margin-top: 14px;
  }

  .result-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    background: var(--color-surface);
    padding: 14px;
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

  button:disabled {
    cursor: not-allowed;
    opacity: 0.48;
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
    .converter-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 560px) {
    .timestamp-tool {
      padding: 18px;
    }

    .current-card,
    .result-row {
      flex-direction: column;
      align-items: stretch;
    }

    button {
      width: 100%;
    }
  }
</style>
