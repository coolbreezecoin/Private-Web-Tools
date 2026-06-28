<script lang="ts">
  import ImageDropzone from "@/components/tools/ImageDropzone.svelte";
  import type { Locale } from "@/i18n/config";
  import { t as getStrings } from "@/i18n/strings";
  import { clampCropRect, formatBytes, getOutputMime, type CropRect, type ImageOutputFormat } from "@/utils/image";

  type AspectPreset = "free" | "1:1" | "4:3" | "16:9";

  const maxImageBytes = 25 * 1024 * 1024;
  const minCropSize = 24;

  let {
    locale = "en",
  }: {
    locale?: Locale;
  } = $props();

  const t = $derived(getStrings(locale).imageCropper);

  let sourceFile = $state<File | null>(null);
  let sourceUrl = $state("");
  let sourceWidth = $state(0);
  let sourceHeight = $state(0);
  let cropRect = $state<CropRect>({ x: 0, y: 0, width: 0, height: 0 });
  let aspectPreset = $state<AspectPreset>("free");
  let outputFormat = $state<ImageOutputFormat>("png");
  let quality = $state(86);
  let outputBlob = $state<Blob | null>(null);
  let outputUrl = $state("");
  let outputSize = $state("");
  let status = $state(t.emptyStatus);
  let busy = $state(false);
  let previewImage: HTMLImageElement;
  let job = 0;
  let interaction:
    | {
        mode: "drag" | "resize";
        startX: number;
        startY: number;
        startRect: CropRect;
      }
    | null = null;

  const cropStyle = $derived(
    sourceWidth && sourceHeight
      ? `left:${(cropRect.x / sourceWidth) * 100}%;top:${(cropRect.y / sourceHeight) * 100}%;width:${(cropRect.width / sourceWidth) * 100}%;height:${(cropRect.height / sourceHeight) * 100}%;`
      : "",
  );
  const cropLabel = $derived(cropRect.width ? `${cropRect.width} x ${cropRect.height}` : t.notReady);

  function revokeOutput() {
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    outputUrl = "";
    outputBlob = null;
    outputSize = "";
  }

  function revokeSource() {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    sourceUrl = "";
  }

  function fileStem(name: string) {
    return name.replace(/\.[^.]+$/, "") || "image";
  }

  function extension(format: ImageOutputFormat) {
    return format === "jpeg" ? "jpg" : format;
  }

  function aspectRatio() {
    if (aspectPreset === "1:1") return 1;
    if (aspectPreset === "4:3") return 4 / 3;
    if (aspectPreset === "16:9") return 16 / 9;
    return 0;
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

  function sourcePoint(event: PointerEvent) {
    const box = previewImage.getBoundingClientRect();
    return {
      x: Math.min(sourceWidth, Math.max(0, ((event.clientX - box.left) / box.width) * sourceWidth)),
      y: Math.min(sourceHeight, Math.max(0, ((event.clientY - box.top) / box.height) * sourceHeight)),
    };
  }

  function startInteraction(event: PointerEvent, mode: "drag" | "resize") {
    if (!sourceWidth || !sourceHeight) return;
    event.preventDefault();
    event.stopPropagation();
    const point = sourcePoint(event);
    interaction = {
      mode,
      startX: point.x,
      startY: point.y,
      startRect: { ...cropRect },
    };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopInteraction, { once: true });
  }

  function handlePointerMove(event: PointerEvent) {
    if (!interaction) return;
    const point = sourcePoint(event);
    const ratio = aspectRatio();

    if (interaction.mode === "drag") {
      cropRect = clampCropRect(
        {
          ...interaction.startRect,
          x: interaction.startRect.x + point.x - interaction.startX,
          y: interaction.startRect.y + point.y - interaction.startY,
        },
        { width: sourceWidth, height: sourceHeight },
      );
      return;
    }

    let nextWidth = Math.max(minCropSize, point.x - interaction.startRect.x);
    let nextHeight = Math.max(minCropSize, point.y - interaction.startRect.y);
    if (ratio) nextHeight = nextWidth / ratio;
    cropRect = clampCropRect(
      {
        x: interaction.startRect.x,
        y: interaction.startRect.y,
        width: nextWidth,
        height: nextHeight,
      },
      { width: sourceWidth, height: sourceHeight },
    );
  }

  function stopInteraction() {
    interaction = null;
    window.removeEventListener("pointermove", handlePointerMove);
    void processImage();
  }

  function handleCropKeydown(event: KeyboardEvent) {
    if (!sourceWidth || !sourceHeight) return;

    const step = event.shiftKey ? 10 : 1;
    const offsets: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const offset = offsets[event.key];
    if (!offset) return;

    event.preventDefault();
    cropRect = clampCropRect(
      {
        ...cropRect,
        x: cropRect.x + offset[0],
        y: cropRect.y + offset[1],
      },
      { width: sourceWidth, height: sourceHeight },
    );
    void processImage();
  }

  function resetCrop(widthValue: number, heightValue: number) {
    const initialWidth = Math.max(minCropSize, Math.round(widthValue * 0.8));
    const initialHeight = Math.max(minCropSize, Math.round(heightValue * 0.8));
    cropRect = clampCropRect(
      {
        x: Math.round((widthValue - initialWidth) / 2),
        y: Math.round((heightValue - initialHeight) / 2),
        width: initialWidth,
        height: initialHeight,
      },
      { width: widthValue, height: heightValue },
    );
  }

  function applyPreset() {
    if (!sourceWidth || !sourceHeight || aspectPreset === "free") {
      void processImage();
      return;
    }

    const ratio = aspectRatio();
    let nextWidth = cropRect.width || Math.round(sourceWidth * 0.8);
    let nextHeight = nextWidth / ratio;
    if (nextHeight > sourceHeight) {
      nextHeight = Math.round(sourceHeight * 0.8);
      nextWidth = nextHeight * ratio;
    }
    cropRect = clampCropRect(
      {
        x: cropRect.x + (cropRect.width - nextWidth) / 2,
        y: cropRect.y + (cropRect.height - nextHeight) / 2,
        width: nextWidth,
        height: nextHeight,
      },
      { width: sourceWidth, height: sourceHeight },
    );
    void processImage();
  }

  async function processImage() {
    if (!sourceFile || !cropRect.width || !cropRect.height) return;

    const currentJob = ++job;
    busy = true;
    status = t.processing;

    try {
      const loaded = await loadDrawable(sourceFile);
      try {
        const rect = clampCropRect(cropRect, { width: loaded.width, height: loaded.height });
        const canvas = document.createElement("canvas");
        canvas.width = rect.width;
        canvas.height = rect.height;
        const context = canvas.getContext("2d");
        if (!context) throw new Error(t.canvasError);

        context.drawImage(loaded.drawable, rect.x, rect.y, rect.width, rect.height, 0, 0, rect.width, rect.height);
        const blob = await canvasToBlob(canvas, getOutputMime(outputFormat), outputFormat === "png" ? undefined : quality / 100);

        if (currentJob !== job) return;
        revokeOutput();
        outputBlob = blob;
        outputUrl = URL.createObjectURL(blob);
        outputSize = formatBytes(blob.size);
        status = t.readyStatus.replace("{size}", outputSize);
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
      cropRect = { x: 0, y: 0, width: 0, height: 0 };
      revokeSource();
      revokeOutput();
      status = t.tooLarge.replace("{size}", formatBytes(maxImageBytes));
      return;
    }

    sourceFile = file;
    outputFormat = formatFromType(file.type);
    revokeSource();
    sourceUrl = URL.createObjectURL(file);

    try {
      const loaded = await loadDrawable(file);
      sourceWidth = loaded.width;
      sourceHeight = loaded.height;
      resetCrop(loaded.width, loaded.height);
      loaded.close();
      await processImage();
    } catch (error) {
      status = error instanceof Error ? error.message : t.loadError;
    }
  }

  function downloadOutput() {
    if (!outputBlob || !sourceFile) return;

    const url = URL.createObjectURL(outputBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileStem(sourceFile.name)}-crop.${extension(outputFormat)}`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  $effect(() => () => {
    revokeSource();
    revokeOutput();
    window.removeEventListener("pointermove", handlePointerMove);
  });
</script>

<section class="image-tool panel" aria-labelledby="image-cropper-title">
  <div class="tool-head">
    <div>
      <p class="privacy-pill">{t.privacy}</p>
      <h2 id="image-cropper-title">{t.title}</h2>
    </div>
  </div>

  <ImageDropzone locale={locale} onFile={handleFile} />

  <div class="crop-area">
    <div class="source-preview" aria-label={t.cropAreaLabel}>
      {#if sourceUrl}
        <div class="image-frame">
          <img bind:this={previewImage} src={sourceUrl} alt={t.sourceAlt} draggable="false" />
          <div
            class="crop-rect"
            style={cropStyle}
            role="button"
            tabindex="0"
            aria-label={t.cropRectLabel}
            onkeydown={handleCropKeydown}
            onpointerdown={(event) => startInteraction(event, "drag")}
          >
            <button type="button" class="resize-handle" aria-label={t.resizeHandle} onpointerdown={(event) => startInteraction(event, "resize")}></button>
          </div>
        </div>
      {:else}
        <p>{t.previewEmpty}</p>
      {/if}
    </div>
  </div>

  <div class="controls">
    <label for="crop-aspect">
      <span>{t.aspectLabel}</span>
      <select id="crop-aspect" bind:value={aspectPreset} onchange={applyPreset}>
        <option value="free">{t.aspectFree}</option>
        <option value="1:1">{t.aspectSquare}</option>
        <option value="4:3">4:3</option>
        <option value="16:9">16:9</option>
      </select>
    </label>
    <label for="crop-format">
      <span>{t.outputFormat}</span>
      <select id="crop-format" bind:value={outputFormat} onchange={() => void processImage()}>
        <option value="png">PNG</option>
        <option value="jpeg">JPEG</option>
        <option value="webp">WebP</option>
      </select>
    </label>
    <label for="crop-quality" class:muted={outputFormat === "png"}>
      <span>{t.quality}: {quality}%</span>
      <input id="crop-quality" type="range" min="10" max="100" step="1" bind:value={quality} disabled={outputFormat === "png"} oninput={() => void processImage()} />
    </label>
  </div>

  <div class="meta-grid" aria-label={t.resultLabel}>
    <article>
      <span>{t.sourceDimensions}</span>
      <strong>{sourceWidth ? `${sourceWidth} x ${sourceHeight}` : t.notReady}</strong>
    </article>
    <article>
      <span>{t.cropDimensions}</span>
      <strong>{cropLabel}</strong>
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
      <p>{t.outputPreviewEmpty}</p>
    {/if}
  </div>

  <div class="actions">
    <button type="button" onclick={() => void processImage()} disabled={!sourceFile || busy}>{t.exportSelection}</button>
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

  .crop-area,
  .preview {
    margin-top: 18px;
  }

  .source-preview {
    position: relative;
    display: grid;
    min-height: 280px;
    place-items: center;
    overflow: hidden;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-panel);
    background: var(--color-bg);
    padding: 14px;
    touch-action: none;
  }

  .image-frame {
    position: relative;
    display: inline-block;
    max-width: 100%;
    line-height: 0;
  }

  .image-frame img {
    display: block;
    max-width: 100%;
    max-height: 460px;
    user-select: none;
  }

  .crop-rect {
    position: absolute;
    border: 2px solid #fff;
    box-shadow:
      0 0 0 9999px rgba(0, 0, 0, 0.48),
      0 0 0 1px rgba(0, 0, 0, 0.4);
    cursor: move;
  }

  .resize-handle {
    position: absolute;
    right: -10px;
    bottom: -10px;
    width: 24px;
    min-height: 24px;
    border: 2px solid #fff;
    border-radius: 50%;
    background: var(--color-accent);
    cursor: nwse-resize;
    padding: 0;
  }

  .controls,
  .meta-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-top: 16px;
  }

  label span,
  article span {
    display: block;
    margin-bottom: 8px;
    color: var(--color-muted);
    font-size: 12px;
    font-weight: 800;
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

  .muted {
    opacity: 0.62;
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

  .preview {
    display: grid;
    min-height: 220px;
    place-items: center;
    overflow: hidden;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-panel);
    background: var(--color-bg);
    padding: 16px;
  }

  .preview img {
    max-width: 100%;
    max-height: 300px;
    border-radius: 12px;
  }

  .source-preview p,
  .preview p,
  .status {
    color: var(--color-muted);
    font-size: 14px;
    line-height: 1.5;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 14px;
  }

  .actions button {
    min-height: 44px;
    border: 1px solid var(--color-accent);
    border-radius: 12px;
    background: var(--color-accent);
    color: #fff;
    cursor: pointer;
    font-size: 13px;
    font-weight: 800;
    padding: 8px 14px;
  }

  .actions button:first-child {
    border-color: var(--color-border);
    background: var(--color-surface);
    color: var(--color-text);
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  .status {
    min-height: 20px;
    margin-top: 12px;
    font-weight: 700;
  }

  @media (max-width: 760px) {
    .controls,
    .meta-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 560px) {
    .image-tool {
      padding: 18px;
    }

    .actions button {
      width: 100%;
    }
  }
</style>
