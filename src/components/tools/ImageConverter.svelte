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

  const t = $derived(getStrings(locale).imageConverter);

  let sourceFile = $state<File | null>(null);
  let sourceSize = $state("");
  let sourceFormat = $state("");
  let sourceDimensions = $state("");
  let outputFormat = $state<ImageOutputFormat>("webp");
  let quality = $state(82);
  let outputBlob = $state<Blob | null>(null);
  let outputUrl = $state("");
  let outputSize = $state("");
  let status = $state(t.emptyStatus);
  let busy = $state(false);
  let job = 0;

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

  function nativeFormatLabel(type: string) {
    if (type === "image/png") return "PNG";
    if (type === "image/jpeg") return "JPEG";
    if (type === "image/webp") return "WebP";
    return type || t.unknownFormat;
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
        const mime = getOutputMime(outputFormat);
        const blob = await canvasToBlob(canvas, mime, outputFormat === "png" ? undefined : quality / 100);

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
      sourceSize = "";
      sourceFormat = "";
      sourceDimensions = "";
      revokeOutput();
      status = t.tooLarge.replace("{size}", formatBytes(maxImageBytes));
      return;
    }

    sourceFile = file;
    sourceSize = formatBytes(file.size);
    sourceFormat = nativeFormatLabel(file.type);

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
    link.download = `${fileStem(sourceFile.name)}.${extension(outputFormat)}`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  $effect(() => () => revokeOutput());
</script>

<section class="image-tool panel" aria-labelledby="image-converter-title">
  <div class="tool-head">
    <div>
      <p class="privacy-pill">{t.privacy}</p>
      <h2 id="image-converter-title">{t.title}</h2>
    </div>
  </div>

  <ImageDropzone locale={locale} onFile={handleFile} />

  <div class="meta-grid" aria-label={t.sourceLabel}>
    <article>
      <span>{t.sourceFormat}</span>
      <strong>{sourceFormat || t.notReady}</strong>
    </article>
    <article>
      <span>{t.sourceSize}</span>
      <strong>{sourceSize || t.notReady}</strong>
    </article>
    <article>
      <span>{t.dimensions}</span>
      <strong>{sourceDimensions || t.notReady}</strong>
    </article>
    <article>
      <span>{t.outputSize}</span>
      <strong>{outputSize || t.notReady}</strong>
    </article>
  </div>

  <div class="controls">
    <label for="converter-format">
      <span>{t.outputFormat}</span>
      <select id="converter-format" bind:value={outputFormat} onchange={() => void processImage()}>
        <option value="png">PNG</option>
        <option value="jpeg">JPEG</option>
        <option value="webp">WebP</option>
      </select>
    </label>
    <label for="converter-quality" class:muted={outputFormat === "png"}>
      <span>{t.quality}: {quality}%</span>
      <input id="converter-quality" type="range" min="10" max="100" step="1" bind:value={quality} disabled={outputFormat === "png"} oninput={() => void processImage()} />
    </label>
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

  .meta-grid,
  .controls {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-top: 16px;
  }

  .controls {
    grid-template-columns: minmax(160px, 0.6fr) minmax(220px, 1fr);
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

    .meta-grid,
    .controls {
      grid-template-columns: 1fr;
    }

    .actions button {
      width: 100%;
    }
  }
</style>
