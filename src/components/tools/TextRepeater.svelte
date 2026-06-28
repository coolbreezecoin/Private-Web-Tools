<script lang="ts">
  import type { Locale } from "@/i18n/config";
  import { t as getStrings } from "@/i18n/strings";
  import { clampRepeatCount, MAX_REPEAT_COUNT, repeatText } from "@/utils/textRepeater";

  type SeparatorMode = "newline" | "space" | "comma" | "custom";

  let {
    locale = "en",
  }: {
    locale?: Locale;
  } = $props();

  const t = $derived(getStrings(locale).textRepeater);

  let input = $state(t.initialInput);
  let count = $state(5);
  let separatorMode = $state<SeparatorMode>("newline");
  let customSeparator = $state(t.initialCustomSeparator);
  let numbered = $state(false);
  let copied = $state(false);
  let message = $state("");

  const separator = $derived(
    separatorMode === "newline" ? "\n" : separatorMode === "space" ? " " : separatorMode === "comma" ? ", " : customSeparator,
  );
  const safeCount = $derived(clampRepeatCount(Number(count)));
  const output = $derived(repeatText(input, Number(count), { separator, numbered }));
  const countStatus = $derived(
    Number(count) > MAX_REPEAT_COUNT ? t.clampedStatus.replace("{max}", String(MAX_REPEAT_COUNT)) : t.countStatus.replace("{count}", String(safeCount)),
  );

  async function copyOutput() {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      copied = true;
      message = t.copiedStatus;
      window.setTimeout(() => {
        copied = false;
      }, 1500);
    } catch {
      message = t.copyFailed;
    }
  }
</script>

<section class="repeater-tool panel" aria-labelledby="repeater-tool-title">
  <div class="tool-head">
    <div>
      <p class="privacy-pill">{t.privacy}</p>
      <h2 id="repeater-tool-title">{t.title}</h2>
    </div>
  </div>

  <label for="repeater-input">
    <span>{t.inputLabel}</span>
    <textarea id="repeater-input" bind:value={input} rows="5" placeholder={t.placeholder}></textarea>
  </label>

  <div class="controls">
    <label for="repeat-count">
      <span>{t.countLabel}</span>
      <input id="repeat-count" type="number" min="0" max={MAX_REPEAT_COUNT} bind:value={count} />
    </label>
    <label for="repeat-separator">
      <span>{t.separatorLabel}</span>
      <select id="repeat-separator" bind:value={separatorMode}>
        <option value="newline">{t.separatorNewline}</option>
        <option value="space">{t.separatorSpace}</option>
        <option value="comma">{t.separatorComma}</option>
        <option value="custom">{t.separatorCustom}</option>
      </select>
    </label>
    {#if separatorMode === "custom"}
      <label for="repeat-custom">
        <span>{t.customSeparatorLabel}</span>
        <input id="repeat-custom" type="text" bind:value={customSeparator} />
      </label>
    {/if}
  </div>

  <label class="check-option">
    <input type="checkbox" bind:checked={numbered} />
    <span>{t.numbered}</span>
  </label>

  <p class="count" aria-live="polite">{countStatus}</p>

  <label class="output-label" for="repeater-output">
    <span>{t.outputLabel}</span>
    <textarea id="repeater-output" readonly rows="8" value={output}></textarea>
  </label>

  <div class="actions">
    <button type="button" onclick={copyOutput} disabled={!output} aria-label={t.copyLabel}>{copied ? t.copied : t.copy}</button>
  </div>

  <p class="status" aria-live="polite">{message}</p>
</section>

<style>
  .repeater-tool {
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

  label span,
  .output-label > span {
    display: block;
    margin-bottom: 8px;
    color: var(--color-text);
    font-size: 13px;
    font-weight: 800;
  }

  input,
  select,
  textarea {
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

  select,
  input {
    min-height: 48px;
  }

  textarea {
    min-height: 130px;
    resize: vertical;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  }

  input:focus,
  select:focus,
  textarea:focus,
  button:focus {
    border-color: var(--color-accent);
  }

  .controls {
    display: grid;
    grid-template-columns: minmax(120px, 0.5fr) minmax(160px, 0.7fr) minmax(180px, 1fr);
    gap: 12px;
    margin-top: 16px;
  }

  .check-option {
    display: flex;
    width: fit-content;
    min-height: 48px;
    align-items: center;
    gap: 10px;
    margin-top: 14px;
    border: 1px solid var(--color-border);
    border-radius: 14px;
    background: var(--color-bg);
    padding: 10px 12px;
  }

  .check-option span {
    margin: 0;
  }

  .count,
  .status {
    margin-top: 12px;
    color: var(--color-muted);
    font-size: 14px;
    font-weight: 700;
  }

  .output-label {
    display: block;
    margin-top: 16px;
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

  .actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 12px;
  }

  @media (max-width: 560px) {
    .repeater-tool {
      padding: 18px;
    }

    .controls {
      grid-template-columns: 1fr;
    }

    .check-option,
    .actions button {
      width: 100%;
    }
  }
</style>
