<script lang="ts">
  import type { Locale } from "@/i18n/config";
  import { t as getStrings } from "@/i18n/strings";
  import { buildGradientCss, type GradientStop, type GradientType } from "@/utils/gradient";

  interface Stop extends GradientStop {
    id: number;
  }

  let {
    locale = "en",
  }: {
    locale?: Locale;
  } = $props();

  const t = $derived(getStrings(locale).cssGradient);

  let type = $state<GradientType>("linear");
  let angle = $state(90);
  let stops = $state<Stop[]>([
    { id: 1, color: "#4f46e5", position: 0 },
    { id: 2, color: "#06b6d4", position: 100 },
  ]);
  let nextId = $state(3);
  let copied = $state(false);
  let message = $state("");

  const gradient = $derived(buildGradientCss({ type, angle, stops }));
  const css = $derived(`background: ${gradient};`);

  function updateStop(id: number, updates: Partial<GradientStop>) {
    stops = stops.map((stop) => (stop.id === id ? { ...stop, ...updates } : stop));
  }

  function addStop() {
    stops = [...stops, { id: nextId, color: "#f97316", position: 50 }];
    nextId += 1;
  }

  function removeStop(id: number) {
    if (stops.length <= 2) {
      message = t.minStopsStatus;
      return;
    }

    stops = stops.filter((stop) => stop.id !== id);
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

<section class="gradient-tool panel" aria-labelledby="gradient-tool-title">
  <div class="tool-head">
    <div>
      <p class="privacy-pill">{t.privacy}</p>
      <h2 id="gradient-tool-title">{t.title}</h2>
    </div>
  </div>

  <div class="controls">
    <fieldset>
      <legend>{t.typeLabel}</legend>
      <div class="segmented">
        <button type="button" aria-pressed={type === "linear"} onclick={() => (type = "linear")}>{t.linear}</button>
        <button type="button" aria-pressed={type === "radial"} onclick={() => (type = "radial")}>{t.radial}</button>
      </div>
    </fieldset>

    {#if type === "linear"}
      <label for="gradient-angle">
        <span>{t.angleLabel}: {angle}deg</span>
        <input id="gradient-angle" type="range" min="0" max="360" step="1" bind:value={angle} />
      </label>
    {/if}
  </div>

  <section class="stops" aria-labelledby="gradient-stops-title">
    <div class="stops-head">
      <h3 id="gradient-stops-title">{t.stopsLabel}</h3>
      <button type="button" class="ghost-button" onclick={addStop}>{t.addStop}</button>
    </div>

    <div class="stop-list">
      {#each stops as stop, index}
        <article class="stop-row" aria-label={t.stopLabel.replace("{index}", String(index + 1))}>
          <label>
            <span>{t.colorLabel}</span>
            <input type="color" value={stop.color} oninput={(event) => updateStop(stop.id, { color: event.currentTarget.value })} />
          </label>

          <label>
            <span>{t.positionLabel}</span>
            <input
              type="number"
              min="0"
              max="100"
              value={stop.position}
              oninput={(event) => updateStop(stop.id, { position: Number(event.currentTarget.value) })}
            />
          </label>

          <button type="button" class="remove-button" onclick={() => removeStop(stop.id)} disabled={stops.length <= 2}>{t.removeStop}</button>
        </article>
      {/each}
    </div>
  </section>

  <div class="preview-block">
    <p>{t.previewLabel}</p>
    <div class="preview" style={`background: ${gradient}`}></div>
  </div>

  <label for="gradient-output" class="output-label">
    <span>{t.outputLabel}</span>
    <textarea id="gradient-output" readonly rows="3" value={css}></textarea>
  </label>

  <div class="actions">
    <button type="button" onclick={copyCss} aria-label={t.copyLabel}>{copied ? t.copied : t.copy}</button>
  </div>

  <p class="status" aria-live="polite">{message}</p>
</section>

<style>
  .gradient-tool {
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

  .controls {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(220px, 0.8fr);
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
  label span,
  .preview-block p {
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

  input[type="range"] {
    width: 100%;
    accent-color: var(--color-accent);
  }

  .stops {
    margin-top: 22px;
  }

  .stops-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
  }

  h3 {
    color: var(--color-text);
    font-size: 16px;
  }

  .stop-list {
    display: grid;
    gap: 10px;
  }

  .stop-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 120px 130px;
    gap: 12px;
    align-items: end;
    border: 1px solid var(--color-border);
    border-radius: 16px;
    background: var(--color-bg);
    padding: 14px;
  }

  input[type="color"],
  input[type="number"] {
    width: 100%;
    min-height: 46px;
    border: 1px solid var(--color-input-border);
    border-radius: 13px;
    background: var(--color-bg);
    color: var(--color-text);
    outline: none;
    padding: 8px 10px;
  }

  input[type="color"] {
    padding: 4px;
  }

  input:focus,
  button:focus,
  textarea:focus {
    border-color: var(--color-accent);
  }

  .preview-block {
    margin-top: 22px;
  }

  .preview {
    min-height: 180px;
    border: 1px solid var(--color-border);
    border-radius: 18px;
  }

  .output-label {
    display: block;
    margin-top: 18px;
  }

  textarea {
    display: block;
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
    .gradient-tool {
      padding: 18px;
    }

    .controls,
    .stop-row {
      grid-template-columns: 1fr;
    }

    .stops-head {
      align-items: stretch;
      flex-direction: column;
    }

    .ghost-button,
    .remove-button,
    .actions button {
      width: 100%;
    }
  }
</style>
