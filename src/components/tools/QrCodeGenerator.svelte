<script lang="ts">
  import type { QRCodeErrorCorrectionLevel } from "qrcode";
  import type { Locale } from "@/i18n/config";
  import { t as getStrings } from "@/i18n/strings";

  let {
    locale = "en",
  }: {
    locale?: Locale;
  } = $props();

  const t = $derived(getStrings(locale).qrCode);

  let input = $state("");
  let size = $state(256);
  let errorCorrectionLevel = $state<QRCodeErrorCorrectionLevel>("M");
  let message = $state("");
  let initialized = $state(false);
  let canvas: HTMLCanvasElement;
  let renderId = 0;
  let qrModule: typeof import("qrcode") | null = null;

  async function getQrModule() {
    qrModule ??= await import("qrcode");
    return qrModule;
  }

  async function renderQrCode() {
    const currentRender = ++renderId;

    if (!canvas) return;

    const value = input.trim();
    if (!value) {
      const context = canvas.getContext("2d");
      context?.clearRect(0, 0, canvas.width, canvas.height);
      message = t.emptyState;
      return;
    }

    message = t.rendering;

    try {
      const QRCode = await getQrModule();
      if (currentRender !== renderId) return;

      await QRCode.toCanvas(canvas, value, {
        width: size,
        margin: 2,
        errorCorrectionLevel,
      });

      if (currentRender === renderId) {
        message = t.readyStatus;
      }
    } catch {
      if (currentRender === renderId) {
        message = t.renderFailed;
      }
    }
  }

  function downloadPng() {
    if (!canvas || !input.trim()) return;

    const link = document.createElement("a");
    link.download = "qr-code.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  $effect(() => {
    if (!initialized) {
      input = t.initialText;
      initialized = true;
    }
  });

  $effect(() => {
    input;
    size;
    errorCorrectionLevel;
    renderQrCode();
  });
</script>

<section class="qr-tool panel" aria-labelledby="qr-tool-title">
  <div class="tool-head">
    <div>
      <p class="privacy-pill">{t.privacy}</p>
      <h2 id="qr-tool-title">{t.title}</h2>
    </div>
    <button type="button" onclick={downloadPng} disabled={!input.trim()} aria-label={t.downloadLabel}>{t.download}</button>
  </div>

  <div class="qr-layout">
    <div class="form-column">
      <label class="input-label" for="qr-input">{t.inputLabel}</label>
      <textarea id="qr-input" bind:value={input} rows="6" maxlength="2000" placeholder={t.placeholder} aria-describedby="qr-status"></textarea>

      <div class="controls">
        <label for="qr-size">
          <span>{t.sizeLabel}</span>
          <strong>{size}px</strong>
          <input id="qr-size" type="range" min="128" max="512" step="32" bind:value={size} />
        </label>

        <label for="qr-error-correction">
          <span>{t.errorCorrectionLabel}</span>
          <select id="qr-error-correction" bind:value={errorCorrectionLevel}>
            <option value="L">{t.levels.L}</option>
            <option value="M">{t.levels.M}</option>
            <option value="Q">{t.levels.Q}</option>
            <option value="H">{t.levels.H}</option>
          </select>
        </label>
      </div>
    </div>

    <div class="preview-column">
      <p class="preview-label">{t.outputLabel}</p>
      <div class:empty={!input.trim()} class="canvas-frame">
        {#if !input.trim()}
          <span>{t.emptyState}</span>
        {/if}
        <canvas bind:this={canvas} width={size} height={size} aria-label={t.outputLabel}></canvas>
      </div>
    </div>
  </div>

  <p id="qr-status" class="status" aria-live="polite">{message}</p>
</section>

<style>
  .qr-tool {
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

  button:disabled {
    cursor: not-allowed;
    opacity: 0.48;
  }

  .qr-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(220px, 320px);
    gap: 22px;
    align-items: start;
  }

  .form-column,
  .controls {
    display: grid;
    gap: 16px;
  }

  .input-label,
  label span,
  .preview-label {
    display: block;
    margin-bottom: 8px;
    color: var(--color-text);
    font-size: 13px;
    font-weight: 800;
  }

  label strong {
    float: right;
    color: var(--color-muted);
    font-size: 13px;
  }

  textarea,
  select {
    width: 100%;
    border: 1px solid var(--color-input-border);
    border-radius: 15px;
    background: var(--color-bg);
    color: var(--color-text);
    font-size: 16px;
    outline: none;
    padding: 13px 14px;
  }

  textarea {
    display: block;
    min-height: 170px;
    resize: vertical;
    line-height: 1.6;
  }

  textarea:focus,
  select:focus,
  input:focus {
    border-color: var(--color-accent);
  }

  input[type="range"] {
    width: 100%;
    accent-color: var(--color-accent);
  }

  .canvas-frame {
    display: grid;
    place-items: center;
    min-height: 320px;
    border: 1px solid var(--color-border);
    border-radius: 16px;
    background: var(--color-bg);
    padding: 18px;
    position: relative;
  }

  .canvas-frame.empty canvas {
    opacity: 0;
  }

  .canvas-frame span {
    position: absolute;
    max-width: 220px;
    color: var(--color-muted);
    font-size: 14px;
    font-weight: 700;
    line-height: 1.5;
    text-align: center;
  }

  canvas {
    width: min(100%, 280px);
    height: auto;
    image-rendering: pixelated;
  }

  .status {
    min-height: 18px;
    margin-top: 12px;
    color: var(--color-accent-soft-text);
    font-size: 13px;
    font-weight: 800;
  }

  @media (max-width: 760px) {
    .qr-layout {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 560px) {
    .qr-tool {
      padding: 18px;
    }

    .tool-head {
      flex-direction: column;
    }

    button {
      width: 100%;
    }

    .canvas-frame {
      min-height: 260px;
    }
  }
</style>
