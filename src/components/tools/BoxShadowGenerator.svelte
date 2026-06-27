<script lang="ts">
  import type { Locale } from "@/i18n/config";
  import { t as getStrings } from "@/i18n/strings";
  import { serializeBoxShadows, type BoxShadow } from "@/utils/boxShadow";

  interface Shadow extends BoxShadow {
    id: number;
  }

  let {
    locale = "en",
  }: {
    locale?: Locale;
  } = $props();

  const t = $derived(getStrings(locale).boxShadow);

  let shadows = $state<Shadow[]>([
    { id: 1, inset: false, x: 0, y: 16, blur: 34, spread: -14, color: "#111827", alpha: 0.28 },
  ]);
  let nextId = $state(2);
  let background = $state("#f8fafc");
  let copied = $state(false);
  let message = $state("");

  const shadowCss = $derived(serializeBoxShadows(shadows));
  const css = $derived(`box-shadow: ${shadowCss};`);

  function updateShadow(id: number, updates: Partial<BoxShadow>) {
    shadows = shadows.map((shadow) => (shadow.id === id ? { ...shadow, ...updates } : shadow));
  }

  function addShadow() {
    shadows = [...shadows, { id: nextId, inset: false, x: 0, y: 8, blur: 18, spread: -8, color: "#4f46e5", alpha: 0.22 }];
    nextId += 1;
  }

  function removeShadow(id: number) {
    if (shadows.length <= 1) {
      message = t.minShadowStatus;
      return;
    }

    shadows = shadows.filter((shadow) => shadow.id !== id);
  }

  function moveShadow(id: number, direction: -1 | 1) {
    const index = shadows.findIndex((shadow) => shadow.id === id);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= shadows.length) return;

    const next = [...shadows];
    const [item] = next.splice(index, 1);
    next.splice(nextIndex, 0, item);
    shadows = next;
  }

  async function copyCss() {
    try {
      await navigator.clipboard.writeText(css);
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

<section class="shadow-tool panel" aria-labelledby="shadow-tool-title">
  <div class="tool-head">
    <div>
      <p class="privacy-pill">{t.privacy}</p>
      <h2 id="shadow-tool-title">{t.title}</h2>
    </div>
    <button type="button" class="ghost-button" onclick={addShadow}>{t.addShadow}</button>
  </div>

  <label class="background-control" for="shadow-background">
    <span>{t.backgroundLabel}</span>
    <input id="shadow-background" type="color" bind:value={background} />
  </label>

  <div class="shadow-list">
    {#each shadows as shadow, index}
      <article class="shadow-card" aria-label={t.shadowLabel.replace("{index}", String(index + 1))}>
        <div class="shadow-card-head">
          <h3>{t.shadowLabel.replace("{index}", String(index + 1))}</h3>
          <div>
            <button type="button" onclick={() => moveShadow(shadow.id, -1)} disabled={index === 0}>{t.moveUp}</button>
            <button type="button" onclick={() => moveShadow(shadow.id, 1)} disabled={index === shadows.length - 1}>{t.moveDown}</button>
            <button type="button" onclick={() => removeShadow(shadow.id)} disabled={shadows.length <= 1}>{t.removeShadow}</button>
          </div>
        </div>

        <label class="toggle">
          <input type="checkbox" checked={shadow.inset} onchange={(event) => updateShadow(shadow.id, { inset: event.currentTarget.checked })} />
          <span>{t.inset}</span>
        </label>

        <div class="control-grid">
          <label>
            <span>{t.x}: {shadow.x}px</span>
            <input type="range" min="-80" max="80" value={shadow.x} oninput={(event) => updateShadow(shadow.id, { x: Number(event.currentTarget.value) })} />
          </label>
          <label>
            <span>{t.y}: {shadow.y}px</span>
            <input type="range" min="-80" max="80" value={shadow.y} oninput={(event) => updateShadow(shadow.id, { y: Number(event.currentTarget.value) })} />
          </label>
          <label>
            <span>{t.blur}: {shadow.blur}px</span>
            <input type="range" min="0" max="120" value={shadow.blur} oninput={(event) => updateShadow(shadow.id, { blur: Number(event.currentTarget.value) })} />
          </label>
          <label>
            <span>{t.spread}: {shadow.spread}px</span>
            <input type="range" min="-80" max="80" value={shadow.spread} oninput={(event) => updateShadow(shadow.id, { spread: Number(event.currentTarget.value) })} />
          </label>
          <label>
            <span>{t.color}</span>
            <input type="color" value={shadow.color} oninput={(event) => updateShadow(shadow.id, { color: event.currentTarget.value })} />
          </label>
          <label>
            <span>{t.alpha}: {shadow.alpha.toFixed(2)}</span>
            <input type="range" min="0" max="1" step="0.01" value={shadow.alpha} oninput={(event) => updateShadow(shadow.id, { alpha: Number(event.currentTarget.value) })} />
          </label>
        </div>
      </article>
    {/each}
  </div>

  <div class="preview-block">
    <p>{t.previewLabel}</p>
    <div class="preview" style={`background: ${background}`}>
      <div style={`box-shadow: ${shadowCss}`}></div>
    </div>
  </div>

  <label class="output-label" for="shadow-output">
    <span>{t.outputLabel}</span>
    <textarea id="shadow-output" readonly rows="3" value={css}></textarea>
  </label>

  <div class="actions">
    <button type="button" onclick={copyCss} aria-label={t.copyLabel}>{copied ? t.copied : t.copy}</button>
  </div>

  <p class="status" aria-live="polite">{message}</p>
</section>

<style>
  .shadow-tool {
    padding: 24px;
  }

  .tool-head,
  .shadow-card-head,
  .actions {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    justify-content: space-between;
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

  label span,
  .preview-block p,
  h3 {
    display: block;
    margin-bottom: 8px;
    color: var(--color-text);
    font-size: 13px;
    font-weight: 800;
  }

  button {
    min-height: 44px;
    border: 1px solid var(--color-border);
    border-radius: 12px;
    background: var(--color-surface);
    color: var(--color-text);
    cursor: pointer;
    font-size: 13px;
    font-weight: 800;
    padding: 8px 12px;
  }

  .actions button {
    border-color: var(--color-accent);
    background: var(--color-accent);
    color: #fff;
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.48;
  }

  input[type="range"] {
    width: 100%;
    accent-color: var(--color-accent);
  }

  input[type="color"] {
    width: 100%;
    min-height: 46px;
    border: 1px solid var(--color-input-border);
    border-radius: 13px;
    background: var(--color-bg);
    cursor: pointer;
    padding: 4px;
  }

  input:focus,
  button:focus,
  textarea:focus {
    border-color: var(--color-accent);
  }

  .background-control {
    display: block;
    max-width: 220px;
  }

  .shadow-list {
    display: grid;
    gap: 12px;
    margin-top: 18px;
  }

  .shadow-card {
    border: 1px solid var(--color-border);
    border-radius: 16px;
    background: var(--color-bg);
    padding: 16px;
  }

  .shadow-card-head div {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: flex-end;
  }

  .toggle {
    display: inline-flex;
    min-height: 44px;
    align-items: center;
    gap: 8px;
    border: 1px solid var(--color-border);
    border-radius: 12px;
    background: var(--color-surface);
    padding: 8px 12px;
  }

  .toggle input {
    width: 18px;
    height: 18px;
    accent-color: var(--color-accent);
  }

  .toggle span {
    margin: 0;
  }

  .control-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
    margin-top: 14px;
  }

  .preview-block {
    margin-top: 22px;
  }

  .preview {
    display: grid;
    min-height: 220px;
    place-items: center;
    border: 1px solid var(--color-border);
    border-radius: 18px;
    padding: 28px;
  }

  .preview div {
    width: min(280px, 72%);
    aspect-ratio: 1.45;
    border-radius: 18px;
    background: var(--color-surface);
  }

  .output-label {
    display: block;
    margin-top: 18px;
  }

  textarea {
    width: 100%;
    min-height: 82px;
    resize: vertical;
    border: 1px solid var(--color-input-border);
    border-radius: 15px;
    background: var(--color-surface);
    color: var(--color-text);
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
    font-size: 14px;
    line-height: 1.55;
    outline: none;
    padding: 14px;
  }

  .actions {
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
    .shadow-tool {
      padding: 18px;
    }

    .tool-head,
    .shadow-card-head,
    .actions {
      display: grid;
      grid-template-columns: 1fr;
    }

    .shadow-card-head div,
    .control-grid {
      display: grid;
      grid-template-columns: 1fr;
    }

    button,
    .background-control {
      width: 100%;
      max-width: none;
    }
  }
</style>
