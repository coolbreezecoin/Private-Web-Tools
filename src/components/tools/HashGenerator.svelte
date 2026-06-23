<script lang="ts">
  import type { Locale } from "@/i18n/config";
  import { t as getStrings } from "@/i18n/strings";
  import { generateHashes, hashAlgorithms, type HashAlgorithm } from "@/utils/hash";

  let {
    locale = "en",
  }: {
    locale?: Locale;
  } = $props();

  const t = $derived(getStrings(locale).hashGenerator);

  let input = $state("");
  let hashes = $state<Record<HashAlgorithm, string>>({
    "SHA-1": "",
    "SHA-256": "",
    "SHA-384": "",
    "SHA-512": "",
  });
  let copiedId = $state("");
  let message = $state("");
  let initialized = $state(false);
  let requestId = 0;

  async function copyHash(algorithm: HashAlgorithm, value: string) {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      copiedId = algorithm;
      message = t.copiedStatus;
      window.setTimeout(() => {
        if (copiedId === algorithm) copiedId = "";
      }, 1500);
    } catch {
      message = t.copyFailed;
    }
  }

  $effect(() => {
    if (!initialized) {
      input = t.initialText;
      initialized = true;
    }
  });

  $effect(() => {
    const currentRequest = ++requestId;
    input;

    generateHashes(input).then((nextHashes) => {
      if (currentRequest === requestId) {
        hashes = nextHashes;
      }
    });
  });
</script>

<section class="hash-tool panel" aria-labelledby="hash-tool-title">
  <div class="tool-head">
    <div>
      <p class="privacy-pill">{t.privacy}</p>
      <h2 id="hash-tool-title">{t.title}</h2>
    </div>
  </div>

  <label class="input-label" for="hash-input">{t.inputLabel}</label>
  <textarea id="hash-input" bind:value={input} rows="6" maxlength="20000" placeholder={t.placeholder} aria-describedby="hash-status"></textarea>

  <div class="results" aria-label={t.resultsLabel}>
    {#each hashAlgorithms as algorithm}
      <article class="result-card">
        <div class="result-meta">
          <h3>{t.algorithms[algorithm]}</h3>
          <button
            type="button"
            onclick={() => copyHash(algorithm, hashes[algorithm])}
            disabled={!hashes[algorithm]}
            aria-label={t.copyLabel.replace("{algorithm}", t.algorithms[algorithm])}
          >
            {copiedId === algorithm ? t.copied : t.copy}
          </button>
        </div>
        <output>{hashes[algorithm] || t.emptyResult}</output>
      </article>
    {/each}
  </div>

  <p id="hash-status" class="status" aria-live="polite">{message || t.readyStatus}</p>
</section>

<style>
  .hash-tool {
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
    font-size: 16px;
    line-height: 1.6;
    outline: none;
    padding: 16px;
  }

  textarea:focus {
    border-color: var(--color-accent);
  }

  .results {
    display: grid;
    gap: 14px;
    margin-top: 22px;
  }

  .result-card {
    border: 1px solid var(--color-border);
    border-radius: 16px;
    background: var(--color-bg);
    padding: 16px;
  }

  .result-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  h3 {
    color: var(--color-text);
    font-size: 16px;
    letter-spacing: -0.01em;
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

  output {
    display: block;
    width: 100%;
    margin-top: 14px;
    overflow-wrap: anywhere;
    border-radius: 12px;
    background: var(--color-surface);
    color: var(--color-text);
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
    font-size: 14px;
    line-height: 1.55;
    padding: 14px;
  }

  .status {
    min-height: 18px;
    margin-top: 12px;
    color: var(--color-accent-soft-text);
    font-size: 13px;
    font-weight: 800;
  }

  @media (max-width: 560px) {
    .hash-tool {
      padding: 18px;
    }

    .result-meta {
      flex-direction: column;
      align-items: stretch;
    }

    button {
      width: 100%;
    }
  }
</style>
