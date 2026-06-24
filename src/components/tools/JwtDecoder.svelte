<script lang="ts">
  import type { Locale } from "@/i18n/config";
  import { t as getStrings } from "@/i18n/strings";
  import { decodeJwt, getUnixClaimDate } from "@/utils/jwt";

  let {
    locale = "en",
  }: {
    locale?: Locale;
  } = $props();

  const t = $derived(getStrings(locale).jwtDecoder);

  let input = $state("");
  let copiedId = $state("");
  let message = $state("");

  const decoded = $derived(decodeJwt(input));
  const headerJson = $derived(decoded.header ? JSON.stringify(decoded.header, null, 2) : "");
  const payloadJson = $derived(decoded.payload ? JSON.stringify(decoded.payload, null, 2) : "");
  const dateRows = $derived(
    (["exp", "iat", "nbf"] as const)
      .map((claim) => ({
        claim,
        label: t.dateLabels[claim],
        value: getUnixClaimDate(decoded.payload, claim),
      }))
      .filter((row) => row.value),
  );

  async function copyJson(id: "header" | "payload", value: string) {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      copiedId = id;
      message = id === "header" ? t.copiedHeaderStatus : t.copiedPayloadStatus;
      window.setTimeout(() => {
        if (copiedId === id) copiedId = "";
      }, 1500);
    } catch {
      message = t.copyFailed;
    }
  }

  $effect(() => {
    if (!input.trim()) {
      message = "";
    } else {
      message = decoded.error ? t.invalidStatus : t.validStatus;
    }
  });
</script>

<section class="jwt-tool panel" aria-labelledby="jwt-tool-title">
  <div class="tool-head">
    <div>
      <p class="privacy-pill">{t.privacy}</p>
      <h2 id="jwt-tool-title">{t.title}</h2>
    </div>
  </div>

  <p class="note">{t.note}</p>

  <label class="input-label" for="jwt-input">{t.inputLabel}</label>
  <textarea id="jwt-input" bind:value={input} rows="6" maxlength="20000" placeholder={t.placeholder} aria-describedby="jwt-status"></textarea>

  <div class="outputs">
    <article class="output-card">
      <div class="result-head">
        <h3>{t.headerLabel}</h3>
        <button type="button" onclick={() => copyJson("header", headerJson)} disabled={!headerJson} aria-label={t.copyHeaderLabel}>
          {copiedId === "header" ? t.copied : t.copy}
        </button>
      </div>
      <textarea readonly rows="8" value={headerJson} placeholder={t.emptyResult}></textarea>
    </article>

    <article class="output-card">
      <div class="result-head">
        <h3>{t.payloadLabel}</h3>
        <button type="button" onclick={() => copyJson("payload", payloadJson)} disabled={!payloadJson} aria-label={t.copyPayloadLabel}>
          {copiedId === "payload" ? t.copied : t.copy}
        </button>
      </div>
      <textarea readonly rows="8" value={payloadJson} placeholder={t.emptyResult}></textarea>
    </article>
  </div>

  {#if dateRows.length}
    <section class="dates" aria-labelledby="jwt-dates-title">
      <h3 id="jwt-dates-title">{t.datesTitle}</h3>
      <dl>
        {#each dateRows as row}
          <div>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        {/each}
      </dl>
    </section>
  {/if}

  <p id="jwt-status" class:error={Boolean(decoded.error && input.trim())} class="status" aria-live="polite">{message}</p>
</section>

<style>
  .jwt-tool {
    padding: 24px;
  }

  .tool-head,
  .result-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }

  .tool-head {
    margin-bottom: 14px;
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
  p,
  dl,
  dd {
    margin: 0;
  }

  h2 {
    color: var(--color-text);
    font-size: clamp(24px, 4vw, 32px);
    line-height: 1.1;
    letter-spacing: -0.03em;
  }

  .note {
    margin-bottom: 18px;
    border: 1px solid var(--color-accent-soft-border);
    border-radius: 14px;
    background: var(--color-accent-soft-bg);
    color: var(--color-accent-soft-text);
    font-size: 14px;
    font-weight: 800;
    line-height: 1.5;
    padding: 12px 14px;
  }

  .input-label {
    display: block;
    margin-bottom: 8px;
    color: var(--color-text);
    font-size: 13px;
    font-weight: 800;
  }

  textarea {
    display: block;
    width: 100%;
    min-height: 170px;
    resize: vertical;
    border: 1px solid var(--color-input-border);
    border-radius: 15px;
    background: var(--color-bg);
    color: var(--color-text);
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
    font-size: 14px;
    line-height: 1.6;
    outline: none;
    padding: 16px;
  }

  textarea:focus {
    border-color: var(--color-accent);
  }

  textarea[readonly] {
    margin-top: 10px;
    background: var(--color-surface);
  }

  .outputs {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    margin-top: 18px;
  }

  .output-card,
  .dates {
    border: 1px solid var(--color-border);
    border-radius: 16px;
    background: var(--color-bg);
    padding: 16px;
  }

  h3 {
    color: var(--color-text);
    font-size: 16px;
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

  .dates {
    margin-top: 16px;
  }

  .dates dl {
    display: grid;
    gap: 10px;
    margin-top: 12px;
  }

  .dates div {
    display: grid;
    grid-template-columns: 120px minmax(0, 1fr);
    gap: 12px;
  }

  dt {
    color: var(--color-muted);
    font-size: 13px;
    font-weight: 800;
  }

  dd {
    color: var(--color-text);
    font-size: 14px;
    overflow-wrap: anywhere;
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
    .outputs {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 560px) {
    .jwt-tool {
      padding: 18px;
    }

    .result-head,
    .dates div {
      grid-template-columns: 1fr;
      flex-direction: column;
    }

    button {
      width: 100%;
    }
  }
</style>
