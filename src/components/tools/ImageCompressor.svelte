<script lang="ts">
  import ImageDropzone from "@/components/tools/ImageDropzone.svelte";
  import type { Locale } from "@/i18n/config";
  import { t as getStrings } from "@/i18n/strings";
  import { formatBytes, getOutputMime, type ImageOutputFormat } from "@/utils/image";

  const maxImageBytes = 25 * 1024 * 1024;

  let {
    locale = "en",
  }: {
    locale?: Locale;
  } = $props();

  const t = $derived(getStrings(locale).imageCompressor);

  let sourceFile = $state<File | null>(null);
  let sourceSizeBytes = $state(0);
  let sourceSize = $state("");
  let sourceDimensions = $state("");
  let outputFormat = $state<ImageOutputFormat>("webp");
  let quality = $state(72);
  let outputBlob = $state<Blob | null>(null);
  let outputUrl = $state("");
  let outputSize = $state("");
  let reduction = $state("");
  let status = $state(t.emptyStatus);
  let busy = $state(false);
  let job = 0;

  function revokeOutput() {
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    outputUrl = "";
    outputBlob = null;
    outputSize = "";
    reduction = "";
  }

  function fileStem(name: string) {
    return name.replace(/\.[^.]+$/, "") || "image";
  }

  function extension(format: ImageOutputFormat) {
    return format === "jpeg" ? "jpg" : format;
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
    if (!sourceFile) return;

    const currentJob = ++job;
    busy = true;
    status = t.processing;

    try {
      const loaded = await loadDrawable(sourceFile);
      try {
        const canvas = document.createElement("canvas");
        canvas.width = loaded.width;
        canvas.height = loaded.height;
        const context = canvas.getContext("2d");
        if (!context) throw new Error(t.canvasError);

        context.drawImage(loaded.drawable, 0, 0);
        const blob = await canvasToBlob(canvas, getOutputMime(outputFormat), quality / 100);

        if (currentJob !== job) return;
        revokeOutput();
        outputBlob = blob;
        outputUrl = URL.createObjectURL(blob);
        outputSize = formatBytes(blob.size);
        const percent = sourceSizeBytes > 0 ? Math.max(-999, ((sourceSizeBytes - blob.size) / sourceSizeBytes) * 100) : 0;
        reduction = `${percent.toFixed(1)}%`;
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
      sourceSizeBytes = 0;
      sourceSize = "";
      sourceDimensions = "";
      revokeOutput();
      status = t.tooLarge.replace("{size}", formatBytes(maxImageBytes));
      return;
    }

    sourceFile = file;
    sourceSizeBytes = file.size;
    sourceSize = formatBytes(file.size);
    outputFormat = file.type === "image/jpeg" ? "jpeg" : "webp";

    try {
      const loaded = await loadDrawable(file);
      sourceDimensions = `${loaded.width} x ${loaded.height}`;
      loaded.close();
    } catch {
      sourceDimensions = t.unknownDimensions;
    }

    await processImage();
  }

  function downloadOutput() {
    if (!outputBlob || !sourceFile) return;

    const url = URL.createObjectURL(outputBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileStem(sourceFile.name)}-compressed.${extension(outputFormat)}`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  $effect(() => () => revokeOutput());
</script>

<section class="image-tool panel" aria-labelledby="image-compressor-title">
  <div class="tool-head">
    <div>
      <p class="privacy-pill">{t.privacy}</p>
      <h2 id="image-compressor-title">{t.title}</h2>
    </div>
  </div>

  <ImageDropzone locale={locale} onFile={handleFile} />

  <div class="controls">
    <label for="compressor-format">
      <span>{t.outputFormat}</span>
      <select id="compressor-format" bind:value={outputFormat} onchange={() => void processImage()}>
        <option value="webp">WebP</option>
        <option value="jpeg">JPEG</option>
      </select>
    </label>
    <label for="compressor-quality">
      <span>{t.quality}: {quality}%</span>
      <input id="compressor-quality" type="range" min="10" max="100" step="1" bind:value={quality} oninput={() => void processImage()} />
    </label>
  </div>

  <div class="meta-grid" aria-label={t.resultLabel}>
    <article>
      <span>{t.sourceSize}</span>
      <strong>{sourceSize || t.notReady}</strong>
    </article>
    <article>
      <span>{t.outputSize}</span>
      <strong>{outputSize || t.notReady}</strong>
    </article>
    <article>
      <span>{t.reduction}</span>
      <strong>{reduction || t.notReady}</strong>
    </article>
    <article>
      <span>{t.dimensions}</span>
      <strong>{sourceDimensions || t.notReady}</strong>
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

  .controls,
  .meta-grid {
    display: grid;
    gap: 12px;
    margin-top: 16px;
  }

  .controls {
    grid-template-columns: minmax(160px, 0.6fr) minmax(220px, 1fr);
  }

  .meta-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  article {
    border: 1px solid var(--color-border);
    border-radius: 14px;
    background: var(--color-bg);
    padding: 12px;
  }

  article span,
  label span {
    display: block;
    margin-bottom: 8px;
    color: var(--color-muted);
    font-size: 12px;
    font-weight: 800;
  }

  article strong {
    color: var(--color-text);
    font-size: 15px;
  }

  select,
  input[type="range"] {
    width: 100%;
    min-height: 44px;
    accent-color: var(--color-accent);
  }

  select {
    border: 1px solid var(--color-input-border);
    border-radius: 14px;
    background: var(--color-bg);
    color: var(--color-text);
    padding: 10px 12px;
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

  button {
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
    .meta-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 560px) {
    .image-tool {
      padding: 18px;
    }

    .controls,
    .meta-grid {
      grid-template-columns: 1fr;
    }

    .actions button {
      width: 100%;
    }
  }
</style>
