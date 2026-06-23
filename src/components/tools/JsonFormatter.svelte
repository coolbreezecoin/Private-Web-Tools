<script lang="ts">
  import type { Locale } from "@/i18n/config";
  import { t as getStrings } from "@/i18n/strings";
  import { formatJson, minifyJson, type JsonIndent } from "@/utils/json";

  let {
    locale = "en",
  }: {
    locale?: Locale;
  } = $props();

  const t = $derived(getStrings(locale).jsonFormatter);

  let input = $state("");
  let indent = $state<JsonIndent>(2);
  let action = $state<"format" | "minify">("format");
  let copied = $state(false);
  let message = $state("");
  let initialized = $state(false);

  const result = $derived(action === "minify" ? minifyJson(input) : formatJson(input, indent));
  const status = $derived(
    result.error
      ? t.invalidStatus.replace("{message}", result.error)
      : input.trim()
        ? message || t.validStatus
        : message,
  );

  function setAction(nextAction: "format" | "minify") {
    action = nextAction;
    copied = false;
    message = "";
  }

  async function copyResult() {
    if (!result.value || result.error) return;

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
    if (!initialized) {
      input = t.initialText;
      initialized = true;
    }
  });
</script>

<section class="json-tool panel" aria-labelledby="json-tool-title">
  <div class="tool-head">
    <div>
      <p class="privacy-pill">{t.privacy}</p>
      <h2 id="json-tool-title">{t.title}</h2>
    </div>
    <button type="button" onclick={copyResult} disabled={!result.value || Boolean(result.error)} aria-label={t.copyLabel}>
      {copied ? t.copied : t.copy}
    </button>
  </div>

  <div class="controls">
    <label for="json-indent">
      <span>{t.indentLabel}</span>
      <select id="json-indent" bind:value={indent} disabled={action === "minify"}>
        <option value={2}>{t.indentOptions.two}</option>
        <option value={4}>{t.indentOptions.four}</option>
        <option value={"\t"}>{t.indentOptions.tab}</option>
      </select>
    </label>

    <div class="toggle-group" aria-label="Choose JSON output mode">
      <button type="button" class:active={action === "format"} aria-pressed={action === "format"} onclick={() => setAction("format")}>
        {t.format}
      </button>
      <button type="button" class:active={action === "minify"} aria-pressed={action === "minify"} onclick={() => setAction("minify")}>
        {t.minify}
      </button>
    </div>
  </div>

  <label class="input-label" for="json-input">{t.inputLabel}</label>
  <textarea id="json-input" bind:value={input} rows="8" maxlength="20000" placeholder={t.placeholder} aria-describedby="json-status"></textarea>

  <label class="output-label" for="json-output">{t.outputLabel}</label>
  <textarea
    id="json-output"
    class:error={Boolean(result.error)}
    readonly
    rows="8"
    value={result.value}
    placeholder={result.error ? status : t.emptyResult}
    aria-invalid={Boolean(result.error)}
  ></textarea>

  <p id="json-status" class:error={Boolean(result.error)} class="status" aria-live="polite">{status}</p>
</section>

<style>
  .json-tool {
    padding: 24px;
  }

  .tool-head,
  .controls {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }

  .tool-head {
    margin-bottom: 18px;
  }

  .controls {
    align-items: end;
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

  button:disabled,
  select:disabled {
    cursor: not-allowed;
    opacity: 0.48;
  }

  .toggle-group {
    display: inline-grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px;
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

  label span,
  .input-label,
  .output-label {
    display: block;
    margin-bottom: 8px;
    color: var(--color-text);
    font-size: 13px;
    font-weight: 800;
  }

  select,
  textarea {
    width: 100%;
    border: 1px solid var(--color-input-border);
    border-radius: 15px;
    background: var(--color-bg);
    color: var(--color-text);
    font-size: 16px;
    outline: none;
    padding: 13px 14px;
  }

  select:focus,
  textarea:focus {
    border-color: var(--color-accent);
  }

  textarea {
    display: block;
    min-height: 210px;
    resize: vertical;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
    line-height: 1.6;
    margin-bottom: 16px;
  }

  textarea[readonly] {
    background: var(--color-surface);
  }

  textarea.error {
    border-color: #dc2626;
  }

  .status {
    min-height: 18px;
    color: var(--color-accent-soft-text);
    font-size: 13px;
    font-weight: 800;
  }

  .status.error {
    color: #b91c1c;
  }

  @media (max-width: 560px) {
    .json-tool {
      padding: 18px;
    }

    .tool-head,
    .controls {
      flex-direction: column;
    }

    button,
    .toggle-group,
    .controls label {
      width: 100%;
    }
  }
</style>
