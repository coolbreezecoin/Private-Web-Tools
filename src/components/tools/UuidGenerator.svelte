<script lang="ts">
  import type { Locale } from "@/i18n/config";
  import { t as getStrings } from "@/i18n/strings";
  import { generateUuids } from "@/utils/uuid";

  let {
    locale = "en",
  }: {
    locale?: Locale;
  } = $props();

  const t = $derived(getStrings(locale).uuidGenerator);

  let count = $state(5);
  let uppercase = $state(false);
  let uuids = $state<string[]>([]);
  let copiedId = $state("");
  let message = $state("");

  function regenerate() {
    uuids = generateUuids(count, { uppercase });
    copiedId = "";
  }

  async function copyText(id: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      copiedId = id;
      message = t.copiedStatus;
      window.setTimeout(() => {
        if (copiedId === id) copiedId = "";
      }, 1500);
    } catch {
      message = t.copyFailed;
    }
  }

  async function copyAll() {
    if (!uuids.length) return;

    try {
      await navigator.clipboard.writeText(uuids.join("\n"));
      copiedId = "all";
      message = t.copiedAllStatus;
      window.setTimeout(() => {
        if (copiedId === "all") copiedId = "";
      }, 1500);
    } catch {
      message = t.copyFailed;
    }
  }

  $effect(() => {
    count;
    uppercase;
    regenerate();
  });
</script>

<section class="uuid-tool panel" aria-labelledby="uuid-tool-title">
  <div class="tool-head">
    <div>
      <p class="privacy-pill">{t.privacy}</p>
      <h2 id="uuid-tool-title">{t.title}</h2>
    </div>
    <div class="head-actions">
      <button type="button" class="secondary-button" onclick={regenerate}>{t.regenerate}</button>
      <button type="button" onclick={copyAll} disabled={!uuids.length} aria-label={t.copyAllLabel}>
        {copiedId === "all" ? t.copied : t.copyAll}
      </button>
    </div>
  </div>

  <div class="controls">
    <label for="uuid-count">
      <span>{t.countLabel}</span>
      <input id="uuid-count" type="number" min="1" max="50" bind:value={count} />
    </label>

    <label class="checkbox-label">
      <input type="checkbox" bind:checked={uppercase} />
      <span>{t.uppercase}</span>
    </label>
  </div>

  <div class="results" aria-label={t.resultsLabel}>
    {#each uuids as uuid, index}
      <article class="result-card">
        <output>{uuid || t.emptyResult}</output>
        <button
          type="button"
          onclick={() => copyText(uuid, uuid)}
          disabled={!uuid}
          aria-label={t.copyUuidLabel.replace("{index}", (index + 1).toString())}
        >
          {copiedId === uuid ? t.copied : t.copy}
        </button>
      </article>
    {/each}
  </div>

  <p class="status" aria-live="polite">{message}</p>
</section>

<style>
  .uuid-tool {
    padding: 24px;
  }

  .tool-head,
  .head-actions,
  .controls,
  .result-card {
    display: flex;
    gap: 16px;
  }

  .tool-head {
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 18px;
  }

  .head-actions,
  .result-card {
    align-items: center;
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

  button {
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

  .secondary-button {
    border-color: var(--color-border);
    background: var(--color-surface);
    color: var(--color-text);
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.48;
  }

  .controls {
    align-items: end;
    margin-bottom: 20px;
  }

  label span {
    display: block;
    margin-bottom: 8px;
    color: var(--color-text);
    font-size: 13px;
    font-weight: 800;
  }

  input[type="number"] {
    width: 150px;
    border: 1px solid var(--color-input-border);
    border-radius: 15px;
    background: var(--color-bg);
    color: var(--color-text);
    font-size: 16px;
    outline: none;
    padding: 13px 14px;
  }

  input:focus {
    border-color: var(--color-accent);
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 44px;
    border: 1px solid var(--color-border);
    border-radius: 15px;
    background: var(--color-bg);
    padding: 10px 12px;
  }

  .checkbox-label span {
    margin: 0;
  }

  .results {
    display: grid;
    gap: 12px;
  }

  .result-card {
    justify-content: space-between;
    border: 1px solid var(--color-border);
    border-radius: 16px;
    background: var(--color-bg);
    padding: 14px;
  }

  output {
    overflow-wrap: anywhere;
    color: var(--color-text);
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
    font-size: 15px;
    line-height: 1.5;
  }

  .status {
    min-height: 18px;
    margin-top: 12px;
    color: var(--color-accent-soft-text);
    font-size: 13px;
    font-weight: 800;
  }

  @media (max-width: 560px) {
    .uuid-tool {
      padding: 18px;
    }

    .tool-head,
    .head-actions,
    .controls,
    .result-card {
      flex-direction: column;
      align-items: stretch;
    }

    input[type="number"],
    button {
      width: 100%;
    }
  }
</style>
