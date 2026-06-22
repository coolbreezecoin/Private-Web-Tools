<script lang="ts">
  import type { Locale } from "@/i18n/config";
  import { t as getStrings } from "@/i18n/strings";
  import { base64Decode, base64Encode, urlDecode, urlEncode } from "@/utils/encoding";

  let {
    scheme,
    locale = "en",
  }: {
    scheme: "base64" | "url";
    locale?: Locale;
  } = $props();

  const strings = $derived(getStrings(locale).encoderDecoder);

  let direction = $state<"encode" | "decode">("encode");
  let input = $state("");
  let copied = $state(false);
  let message = $state("");
  let initialized = $state(false);

  function text() {
    return strings[scheme];
  }

  const result = $derived(
    scheme === "base64"
      ? direction === "encode"
        ? base64Encode(input)
        : base64Decode(input)
      : direction === "encode"
        ? urlEncode(input)
        : urlDecode(input),
  );

  $effect(() => {
    if (!initialized) {
      input = text().initialText;
      initialized = true;
    }
  });

  function setDirection(nextDirection: "encode" | "decode") {
    direction = nextDirection;
    copied = false;
    message = "";
  }

  function clearInput() {
    input = "";
    copied = false;
    message = strings.cleared;
  }

  async function copyResult() {
    if (!result.value || result.error) return;

    try {
      await navigator.clipboard.writeText(result.value);
      copied = true;
      message = strings.copiedStatus;
      window.setTimeout(() => {
        copied = false;
      }, 1500);
    } catch {
      message = strings.copyFailed;
    }
  }
</script>

<section class="encoder-tool panel" aria-labelledby="encoder-tool-title">
  <div class="tool-head">
    <div>
      <p class="privacy-pill">{text().privacy}</p>
      <h2 id="encoder-tool-title">{text().title}</h2>
    </div>
    <button type="button" class="secondary-button" onclick={clearInput} disabled={!input}>{strings.clear}</button>
  </div>

  <div class="toggle-group" aria-label="Choose conversion direction">
    <button
      type="button"
      class:active={direction === "encode"}
      aria-pressed={direction === "encode"}
      onclick={() => setDirection("encode")}
    >
      {strings.encode}
    </button>
    <button
      type="button"
      class:active={direction === "decode"}
      aria-pressed={direction === "decode"}
      onclick={() => setDirection("decode")}
    >
      {strings.decode}
    </button>
  </div>

  <label class="input-label" for={`${scheme}-input`}>{text().inputLabel}</label>
  <textarea
    id={`${scheme}-input`}
    bind:value={input}
    rows="7"
    maxlength="5000"
    placeholder={text().placeholder}
    aria-describedby={`${scheme}-status`}
  ></textarea>

  <div class="result-head">
    <label for={`${scheme}-output`}>{text().outputLabel}</label>
    <button
      type="button"
      onclick={copyResult}
      disabled={!result.value || Boolean(result.error)}
      aria-label={text().copyLabel}
    >
      {copied ? strings.copied : strings.copy}
    </button>
  </div>
  <textarea
    id={`${scheme}-output`}
    class:error={Boolean(result.error)}
    readonly
    rows="7"
    value={result.error ? result.error : result.value}
    placeholder={text().emptyResult}
    aria-invalid={Boolean(result.error)}
  ></textarea>

  <p id={`${scheme}-status`} class:error={Boolean(result.error)} class="status" aria-live="polite">
    {result.error || message}
  </p>
</section>

<style>
  .encoder-tool {
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

  .toggle-group {
    display: inline-grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px;
    margin-bottom: 18px;
    border: 1px solid var(--color-border);
    border-radius: 14px;
    background: var(--color-bg);
    padding: 5px;
  }

  .toggle-group button {
    border-color: transparent;
    background: transparent;
    color: var(--color-muted);
  }

  .toggle-group button.active {
    border-color: var(--color-accent);
    background: var(--color-accent);
    color: #fff;
  }

  .input-label,
  .result-head label {
    display: block;
    margin-bottom: 8px;
    color: var(--color-text);
    font-size: 13px;
    font-weight: 800;
  }

  textarea {
    display: block;
    width: 100%;
    min-height: 180px;
    resize: vertical;
    border: 1px solid var(--color-input-border);
    border-radius: 15px;
    background: var(--color-bg);
    color: var(--color-text);
    font-size: 16px;
    line-height: 1.6;
    outline: none;
    overflow-wrap: anywhere;
    padding: 16px;
  }

  textarea:focus {
    border-color: var(--color-accent);
  }

  textarea[readonly] {
    margin-top: 8px;
    background: var(--color-surface);
  }

  textarea.error {
    border-color: #dc2626;
    color: #991b1b;
  }

  .result-head {
    align-items: center;
    margin-top: 18px;
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

  @media (max-width: 560px) {
    .encoder-tool {
      padding: 18px;
    }

    .tool-head,
    .result-head {
      flex-direction: column;
    }

    .toggle-group,
    button {
      width: 100%;
    }
  }
</style>
