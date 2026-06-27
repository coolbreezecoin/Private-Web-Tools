<script lang="ts">
  import type { Locale } from "@/i18n/config";
  import { t as getStrings } from "@/i18n/strings";
  import { decode, encode } from "@/utils/htmlEntity";

  type Direction = "encode" | "decode";

  let {
    locale = "en",
  }: {
    locale?: Locale;
  } = $props();

  const t = $derived(getStrings(locale).htmlEntity);

  let direction = $state<Direction>("encode");
  let nonAscii = $state(false);
  let input = $state('Tom & Jerry <strong>"Hello"</strong>');
  let copied = $state(false);
  let message = $state("");

  const result = $derived(direction === "encode" ? encode(input, { nonAscii }) : decode(input));
  const placeholder = $derived(direction === "encode" ? t.inputPlaceholderEncode : t.inputPlaceholderDecode);

  function setDirection(nextDirection: Direction) {
    direction = nextDirection;
    input = nextDirection === "encode" ? t.inputPlaceholderEncode : t.inputPlaceholderDecode;
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
    if (!message) message = t.readyStatus;
  });
</script>

<section class="entity-tool panel" aria-labelledby="entity-tool-title">
  <div class="tool-head">
    <div>
      <p class="privacy-pill">{t.privacy}</p>
      <h2 id="entity-tool-title">{t.title}</h2>
    </div>
  </div>

  <div class="controls">
    <fieldset>
      <legend>{t.directionLabel}</legend>
      <div class="segmented">
        <button type="button" aria-pressed={direction === "encode"} onclick={() => setDirection("encode")}>{t.encode}</button>
        <button type="button" aria-pressed={direction === "decode"} onclick={() => setDirection("decode")}>{t.decode}</button>
      </div>
    </fieldset>

    {#if direction === "encode"}
      <label class="toggle">
        <input type="checkbox" bind:checked={nonAscii} />
        <span>{t.nonAsciiLabel}</span>
      </label>
    {/if}
  </div>

  <div class="editor-grid">
    <label for="entity-input">
      <span>{t.inputLabel}</span>
      <textarea id="entity-input" bind:value={input} rows="8" placeholder={placeholder}></textarea>
    </label>

    <label for="entity-output">
      <span>{t.outputLabel}</span>
      <textarea id="entity-output" readonly rows="8" value={result.value || t.emptyResult}></textarea>
    </label>
  </div>

  <div class="actions">
    <button type="button" onclick={copyOutput} disabled={!result.value} aria-label={t.copyLabel}>
      {copied ? t.copied : t.copy}
    </button>
  </div>

  <p class="status" aria-live="polite">{message}</p>
</section>

<style>
  .entity-tool {
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
    grid-template-columns: minmax(0, 1fr) minmax(210px, 0.65fr);
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
  label > span {
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

  .toggle {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 44px;
    border: 1px solid var(--color-border);
    border-radius: 12px;
    background: var(--color-surface);
    color: var(--color-text);
    cursor: pointer;
    font-size: 13.5px;
    font-weight: 800;
    padding: 9px 12px;
  }

  .toggle input {
    width: 18px;
    height: 18px;
    accent-color: var(--color-accent);
  }

  .toggle span {
    margin: 0;
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
    min-height: 220px;
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

  @media (max-width: 560px) {
    .entity-tool {
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
