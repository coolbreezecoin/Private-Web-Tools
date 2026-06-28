<script lang="ts">
  import ImageDropzone from "@/components/tools/ImageDropzone.svelte";
  import type { Locale } from "@/i18n/config";
  import { t as getStrings } from "@/i18n/strings";
  import { computeResizeDimensions, formatBytes, getOutputMime, type ImageOutputFormat } from "@/utils/image";

  type ResizeMode = "dimensions" | "percent";

  const maxImageBytes = 25 * 1024 * 1024;

  let {
    locale = "en",
  }: {
    locale?: Locale;
  } = $props();

  const t = $derived(getStrings(locale).imageResizer);

  let sourceFile = $state<File | null>(null);
  let sourceWidth = $state(0);
  let sourceHeight = $state(0);
  let width = $state(0);
  let height = $state(0);
  let percent = $state(50);
  let lockAspect = $state(true);
  let resizeMode = $state<ResizeMode>("dimensions");
  let outputFormat = $state<ImageOutputFormat>("png");
  let quality = $state(82);
  let outputBlob = $state<Blob | null>(null);
  let outputUrl = $state("");
  let outputSize = $state("");
  let status = $state(t.emptyStatus);
  let busy = $state(false);
  let job = 0;

  const resultDimensions = $derived(
    sourceWidth && sourceHeight
      ? computeResizeDimensions(
          sourceWidth,
          sourceHeight,
          resizeMode === "percent" ? { percent } : { targetW: width, targetH: height, lockAspect },
        )
      : { width: 0, height: 0 },
  );
  const resultLabel = $derived(resultDimensions.width ? `${resultDimensions.width} x ${resultDimensions.height}` : t.notReady);

  function revokeOutput() {
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    outputUrl = "";
    outputBlob = null;
    outputSize = "";
  }

  function fileStem(name: string) {
    return name.replace(/\.[^.]+$/, "") || "image";
  }

  function extension(format: ImageOutputFormat) {
    return format === "jpeg" ? "jpg" : format;
  }

  function formatFromType(type: string): ImageOutputFormat {
    if (type === "image/jpeg") return "jpeg";
    if (type === "image/webp") return "webp";
    return "png";
  }

  async function loadDrawable(file: File) {
    if ("createImageBitmap" in window) {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" } as ImageBitmapOptions);
      return { drawable: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() };
    }

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.decoding = "async";
    try {
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(t.loadError));
        img.src = url;
      });
    } finally {
      URL.revokeObjectURL(url);
    }
    return { drawable: img, width: img.naturalWidth, height: img.naturalHeight, close: () => undefined };
  }

  function canvasToBlob(canvas: HTMLCanvasElement, mime: string, imageQuality?: number) {
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error(t.encodeError));
        },
        mime,
        imageQuality,
      );
    });
  }

  async function processImage() {
    if (!sourceFile || !resultDimensions.width || !resultDimensions.height) return;

    const currentJob = ++job;
    busy = true;
    status = t.processing;

    try {
      const loaded = await loadDrawable(sourceFile);
      try {
        const canvas = document.createElement("canvas");
        canvas.width = resultDimensions.width;
        canvas.height = resultDimensions.height;
        const context = canvas.getContext("2d");
        if (!context) throw new Error(t.canvasError);

        context.imageSmoothingQuality = "high";
        context.drawImage(loaded.drawable, 0, 0, resultDimensions.width, resultDimensions.height);
        const blob = await canvasToBlob(canvas, getOutputMime(outputFormat), outputFormat === "png" ? undefined : quality / 100);

        if (currentJob !== job) return;
        revokeOutput();
        outputBlob = blob;
        outputUrl = URL.createObjectURL(blob);
        outputSize = formatBytes(blob.size);
        status = t.readyStatus.replace("{width}", String(resultDimensions.width)).replace("{height}", String(resultDimensions.height));
      } finally {
        loaded.close();
      }
    } catch (error) {
      if (currentJob === job) {
        revokeOutput();
        status = error instanceof Error ? error.message : t.loadError;
      }
    } finally {
      if (currentJob === job) busy = false;
    }
  }

  async function handleFile(file: File) {
    if (file.size > maxImageBytes) {
      sourceFile = null;
      sourceWidth = 0;
      sourceHeight = 0;
      width = 0;
      height = 0;
      revokeOutput();
      status = t.tooLarge.replace("{size}", formatBytes(maxImageBytes));
      return;
    }

    sourceFile = file;
    outputFormat = formatFromType(file.type);

    try {
      const loaded = await loadDrawable(file);
      sourceWidth = loaded.width;
      sourceHeight = loaded.height;
      width = Math.max(1, Math.round(loaded.width / 2));
      height = Math.max(1, Math.round(loaded.height / 2));
      loaded.close();
      await processImage();
    } catch (error) {
      status = error instanceof Error ? error.message : t.loadError;
    }
  }

  function updateWidth(value: number) {
    width = Math.max(1, Math.round(Number(value) || 1));
    if (lockAspect && sourceWidth && sourceHeight) height = computeResizeDimensions(sourceWidth, sourceHeight, { targetW: width, lockAspect }).height;
    void processImage();
  }

  function updateHeight(value: number) {
    height = Math.max(1, Math.round(Number(value) || 1));
    if (lockAspect && sourceWidth && sourceHeight) width = computeResizeDimensions(sourceWidth, sourceHeight, { targetH: height, lockAspect }).width;
    void processImage();
  }

  function downloadOutput() {
    if (!outputBlob || !sourceFile) return;

    const url = URL.createObjectURL(outputBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileStem(sourceFile.name)}-${resultDimensions.width}x${resultDimensions.height}.${extension(outputFormat)}`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  $effect(() => () => revokeOutput());
</script>

<section class="image-tool panel" aria-labelledby="image-resizer-title">
  <div class="tool-head">
    <div>
      <p class="privacy-pill">{t.privacy}</p>
      <h2 id="image-resizer-title">{t.title}</h2>
    </div>
  </div>

  <ImageDropzone locale={locale} onFile={handleFile} />

  <fieldset>
    <legend>{t.modeLabel}</legend>
    <div class="segmented">
      <button type="button" aria-pressed={resizeMode === "dimensions"} onclick={() => { resizeMode = "dimensions"; void processImage(); }}>{t.dimensionsMode}</button>
      <button type="button" aria-pressed={resizeMode === "percent"} onclick={() => { resizeMode = "percent"; void processImage(); }}>{t.percentMode}</button>
    </div>
  </fieldset>

  {#if resizeMode === "dimensions"}
    <div class="controls">
      <label for="resize-width">
        <span>{t.widthLabel}</span>
        <input id="resize-width" type="number" min="1" value={width} oninput={(event) => updateWidth(event.currentTarget.valueAsNumber)} />
      </label>
      <label for="resize-height">
        <span>{t.heightLabel}</span>
        <input id="resize-height" type="number" min="1" value={height} oninput={(event) => updateHeight(event.currentTarget.valueAsNumber)} />
      </label>
      <label class="check-option">
        <input type="checkbox" bind:checked={lockAspect} onchange={() => void processImage()} />
        <span>{t.lockAspect}</span>
      </label>
    </div>
  {:else}
    <label class="percent-control" for="resize-percent">
      <span>{t.percentLabel}: {percent}%</span>
      <input id="resize-percent" type="range" min="1" max="200" step="1" bind:value={percent} oninput={() => void processImage()} />
    </label>
  {/if}

  <div class="controls format-controls">
    <label for="resizer-format">
      <span>{t.outputFormat}</span>
      <select id="resizer-format" bind:value={outputFormat} onchange={() => void processImage()}>
        <option value="png">PNG</option>
        <option value="jpeg">JPEG</option>
        <option value="webp">WebP</option>
      </select>
    </label>
    <label for="resizer-quality" class:muted={outputFormat === "png"}>
      <span>{t.quality}: {quality}%</span>
      <input id="resizer-quality" type="range" min="10" max="100" step="1" bind:value={quality} disabled={outputFormat === "png"} oninput={() => void processImage()} />
    </label>
  </div>

  <div class="meta-grid" aria-label={t.resultLabel}>
    <article>
      <span>{t.sourceDimensions}</span>
      <strong>{sourceWidth ? `${sourceWidth} x ${sourceHeight}` : t.notReady}</strong>
    </article>
    <article>
      <span>{t.resultDimensions}</span>
      <strong>{resultLabel}</strong>
    </article>
    <article>
      <span>{t.outputSize}</span>
      <strong>{outputSize || t.notReady}</strong>
    </article>
  </div>

  <div class="preview" aria-label={t.previewLabel}>
    {#if outputUrl}
      <img src={outputUrl} alt={t.previewAlt} />
    {:else}
      <p>{t.previewEmpty}</p>
    {/if}
  </div>

  <div class="actions">
    <button type="button" onclick={downloadOutput} disabled={!outputBlob || busy}>{busy ? t.processing : t.download}</button>
  </div>
  <p class="status" aria-live="polite">{status}</p>
</section>

<style>
  .image-tool {
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

  fieldset {
    margin: 18px 0 0;
    border: 0;
    padding: 0;
  }

  legend,
  label span,
  article span {
    display: block;
    margin-bottom: 8px;
    color: var(--color-muted);
    font-size: 12px;
    font-weight: 800;
  }

  .segmented {
    display: inline-grid;
    grid-template-columns: repeat(2, minmax(120px, 1fr));
    gap: 8px;
  }

  .controls,
  .meta-grid {
    display: grid;
    gap: 12px;
    margin-top: 16px;
  }

  .controls {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    align-items: end;
  }

  .format-controls,
  .meta-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .percent-control {
    display: block;
    margin-top: 16px;
  }

  input,
  select {
    width: 100%;
    min-height: 44px;
    border: 1px solid var(--color-input-border);
    border-radius: 14px;
    background: var(--color-bg);
    color: var(--color-text);
    padding: 10px 12px;
  }

  input[type="range"] {
    padding: 0;
    accent-color: var(--color-accent);
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
    min-height: 18px;
    accent-color: var(--color-accent);
  }

  .check-option span {
    margin: 0;
  }

  article {
    border: 1px solid var(--color-border);
    border-radius: 14px;
    background: var(--color-bg);
    padding: 12px;
  }

  article strong {
    color: var(--color-text);
    font-size: 15px;
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
    padding: 8px 14px;
  }

  button[aria-pressed="true"],
  .actions button {
    border-color: var(--color-accent);
    background: var(--color-accent);
    color: #fff;
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  .muted {
    opacity: 0.62;
  }

  .preview {
    display: grid;
    min-height: 260px;
    margin-top: 18px;
    place-items: center;
    overflow: hidden;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-panel);
    background: var(--color-bg);
    padding: 16px;
  }

  .preview img {
    max-width: 100%;
    max-height: 360px;
    border-radius: 12px;
  }

  .preview p,
  .status {
    color: var(--color-muted);
    font-size: 14px;
    line-height: 1.5;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 14px;
  }

  .status {
    min-height: 20px;
    margin-top: 12px;
    font-weight: 700;
  }

  @media (max-width: 760px) {
    .controls,
    .format-controls,
    .meta-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 560px) {
    .image-tool {
      padding: 18px;
    }

    .segmented,
    .actions button {
      width: 100%;
    }
  }
</style>
