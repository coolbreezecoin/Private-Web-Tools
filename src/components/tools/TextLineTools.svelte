<script lang="ts">
  import type { Locale } from "@/i18n/config";
  import { t as getStrings } from "@/i18n/strings";
  import { dedupeLines, removeEmptyLines, reverseLines, sortLines, trimLines, type SortOrder } from "@/utils/textLines";

  type SortMode = "none" | SortOrder;

  let {
    locale = "en",
  }: {
    locale?: Locale;
  } = $props();

  const t = $derived(getStrings(locale).textLineTools);

  let input = $state("Orange\napple\nBanana\napple\n\nkiwi");
  let sortMode = $state<SortMode>("none");
  let ignoreCase = $state(true);
  let removeDuplicates = $state(true);
  let reverse = $state(false);
  let trim = $state(true);
  let removeEmpty = $state(true);
  let copied = $state(false);
  let message = $state("");

  const output = $derived(transformLines(input));
  const beforeCount = $derived(countLines(input));
  const afterCount = $derived(countLines(output));

  function transformLines(value: string) {
    let result = value;

    if (trim) result = trimLines(result);
    if (removeEmpty) result = removeEmptyLines(result);
    if (removeDuplicates) result = dedupeLines(result, { caseInsensitive: ignoreCase, trim });
    if (sortMode !== "none") result = sortLines(result, { order: sortMode, caseInsensitive: ignoreCase });
    if (reverse) result = reverseLines(result);

    return result;
  }

  function countLines(value: string) {
    return value.length ? value.replace(/\r\n?/g, "\n").split("\n").length : 0;
  }

  function lineLabel(count: number) {
    const unit = count === 1 ? t.lineSingular : t.linePlural;
    return `${count} ${unit}`;
  }

  async function copyOutput() {
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

<section class="line-tool panel" aria-labelledby="line-tool-title">
  <div class="tool-head">
    <div>
      <p class="privacy-pill">{t.privacy}</p>
      <h2 id="line-tool-title">{t.title}</h2>
    </div>
  </div>

  <label for="line-input">
    <span>{t.inputLabel}</span>
    <textarea id="line-input" bind:value={input} rows="8" placeholder={t.placeholder}></textarea>
  </label>

  <div class="options" aria-label={t.optionsLabel}>
    <label for="line-sort">
      <span>{t.sortLabel}</span>
      <select id="line-sort" bind:value={sortMode}>
        <option value="none">{t.sortNone}</option>
        <option value="asc">{t.sortAsc}</option>
        <option value="desc">{t.sortDesc}</option>
      </select>
    </label>

    <label class="check-option">
      <input type="checkbox" bind:checked={ignoreCase} />
      <span>{t.ignoreCase}</span>
    </label>

    <label class="check-option">
      <input type="checkbox" bind:checked={removeDuplicates} />
      <span>{t.removeDuplicates}</span>
    </label>

    <label class="check-option">
      <input type="checkbox" bind:checked={reverse} />
      <span>{t.reverse}</span>
    </label>

    <label class="check-option">
      <input type="checkbox" bind:checked={trim} />
      <span>{t.trim}</span>
    </label>

    <label class="check-option">
      <input type="checkbox" bind:checked={removeEmpty} />
      <span>{t.removeEmpty}</span>
    </label>
  </div>

  <div class="counts" aria-label={t.countsLabel}>
    <span>{t.beforeCount}: {lineLabel(beforeCount)}</span>
    <span>{t.afterCount}: {lineLabel(afterCount)}</span>
  </div>

  <label class="output-label" for="line-output">
    <span>{t.outputLabel}</span>
    <textarea id="line-output" readonly rows="8" value={output}></textarea>
  </label>

  <div class="actions">
    <button type="button" onclick={copyOutput} aria-label={t.copyLabel}>{copied ? t.copied : t.copy}</button>
  </div>

  <p class="status" aria-live="polite">{message}</p>
</section>

<style>
  .line-tool {
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

  label span,
  .output-label > span {
    display: block;
    margin-bottom: 8px;
    color: var(--color-text);
    font-size: 13px;
    font-weight: 800;
  }

  textarea,
  select {
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

  select {
    min-height: 48px;
  }

  textarea:focus,
  select:focus,
  button:focus,
  input:focus {
    border-color: var(--color-accent);
  }

  .options {
    display: grid;
    grid-template-columns: minmax(180px, 0.9fr) repeat(2, minmax(160px, 1fr));
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

  .check-option input {
    width: 18px;
    height: 18px;
    accent-color: var(--color-accent);
  }

  .check-option span {
    margin: 0;
  }

  .counts {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 14px;
  }

  .counts span {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-pill);
    background: var(--color-surface);
    color: var(--color-muted);
    font-size: 13px;
    font-weight: 800;
    padding: 7px 10px;
  }

  .output-label {
    display: block;
    margin-top: 18px;
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
    .line-tool {
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
