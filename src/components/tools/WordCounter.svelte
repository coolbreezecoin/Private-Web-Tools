<script lang="ts">
  import type { Locale } from "@/i18n/config";
  import { t as getStrings } from "@/i18n/strings";

  let {
    locale = "en",
  }: {
    locale?: Locale;
  } = $props();

  const t = $derived(getStrings(locale).wordCounter);

  let text = $state("");
  let message = $state("");
  let initialized = $state(false);

  const words = $derived(text.trim().match(/[A-Za-z0-9]+(?:'[A-Za-z0-9]+)?/g) ?? []);
  const sentences = $derived(text.match(/[^.!?\n]+[.!?]+|[^.!?\n]+$/g)?.filter((item) => item.trim()) ?? []);
  const paragraphs = $derived(text.split(/\n{2,}/).filter((item) => item.trim()));
  const lines = $derived(text ? text.split(/\n/).length : 0);
  const characters = $derived([...text].length);
  const charactersNoSpaces = $derived([...text.replace(/\s/g, "")].length);
  const readingMinutes = $derived(words.length === 0 ? 0 : Math.max(1, Math.ceil(words.length / 200)));

  const stats = $derived([
    { label: t.stats.words, value: words.length },
    { label: t.stats.characters, value: characters },
    { label: t.stats.noSpaces, value: charactersNoSpaces },
    { label: t.stats.sentences, value: sentences.length },
    { label: t.stats.paragraphs, value: paragraphs.length },
    { label: t.stats.lines, value: lines },
    { label: t.stats.readingTime, value: readingMinutes === 0 ? `0 ${t.minutesSuffix}` : `${readingMinutes} ${t.minutesSuffix}` },
  ]);

  function clearText() {
    text = "";
    message = t.cleared;
  }

  async function copyText() {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      message = t.copiedStatus;
    } catch {
      message = t.copyFailed;
    }
  }

  $effect(() => {
    if (!initialized) {
      text = t.initialText;
      initialized = true;
    }
  });
</script>

<section class="counter-tool panel" aria-labelledby="counter-tool-title">
  <div class="tool-head">
    <div>
      <p class="privacy-pill">{t.privacy}</p>
      <h2 id="counter-tool-title">{t.title}</h2>
    </div>
    <div class="actions">
      <button type="button" onclick={copyText} disabled={!text}>{t.copyText}</button>
      <button type="button" class="secondary" onclick={clearText} disabled={!text}>{t.clear}</button>
    </div>
  </div>

  <label class="input-label" for="counter-input">{t.inputLabel}</label>
  <textarea
    id="counter-input"
    bind:value={text}
    rows="10"
    placeholder={t.placeholder}
  ></textarea>

  <div class="stats" aria-label={t.statsLabel}>
    {#each stats as stat}
      <article>
        <strong>{stat.value}</strong>
        <span>{stat.label}</span>
      </article>
    {/each}
  </div>

  <p class="status" aria-live="polite">{message}</p>
</section>

<style>
  .counter-tool {
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
  p {
    margin: 0;
  }

  h2 {
    color: var(--color-text);
    font-size: clamp(24px, 4vw, 32px);
    line-height: 1.1;
    letter-spacing: -0.03em;
  }

  .actions {
    display: flex;
    gap: 10px;
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

  button.secondary {
    border-color: var(--color-border);
    background: var(--color-surface);
    color: var(--color-text);
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.48;
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
    min-height: 250px;
    resize: vertical;
    border: 1px solid var(--color-input-border);
    border-radius: 15px;
    background: var(--color-bg);
    color: var(--color-text);
    font-size: 17px;
    line-height: 1.65;
    outline: none;
    padding: 16px;
  }

  textarea:focus {
    border-color: var(--color-accent);
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-top: 18px;
  }

  article {
    border: 1px solid var(--color-border);
    border-radius: 16px;
    background: var(--color-bg);
    padding: 16px;
  }

  strong {
    display: block;
    color: var(--color-text);
    font-size: clamp(24px, 4vw, 34px);
    line-height: 1;
    letter-spacing: -0.03em;
  }

  span {
    display: block;
    margin-top: 8px;
    color: var(--color-muted);
    font-size: 12.5px;
    font-weight: 800;
  }

  .status {
    min-height: 18px;
    margin-top: 12px;
    color: var(--color-accent-soft-text);
    font-size: 13px;
    font-weight: 800;
  }

  @media (max-width: 760px) {
    .stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 560px) {
    .counter-tool {
      padding: 18px;
    }

    .tool-head,
    .actions {
      flex-direction: column;
    }

    .actions,
    button {
      width: 100%;
    }
  }
</style>
