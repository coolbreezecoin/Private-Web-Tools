<script lang="ts">
  import type { Locale } from "@/i18n/config";
  import { t as getStrings } from "@/i18n/strings";
  import { formatBytes } from "@/utils/image";

  let {
    locale = "en",
    onFile,
  }: {
    locale?: Locale;
    onFile?: (file: File) => void;
  } = $props();

  const t = $derived(getStrings(locale).imageDropzone);

  let input: HTMLInputElement;
  let fileName = $state("");
  let fileSize = $state("");
  let message = $state("");
  let dragging = $state(false);

  function acceptFile(file: File | undefined) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      message = t.invalidType;
      return;
    }

    fileName = file.name;
    fileSize = formatBytes(file.size);
    message = t.loadedStatus.replace("{name}", file.name).replace("{size}", fileSize);
    onFile?.(file);
  }

  function openPicker() {
    input?.click();
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPicker();
    }
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    dragging = false;
    acceptFile(event.dataTransfer?.files?.[0]);
  }

  function handlePaste(event: ClipboardEvent) {
    const file = Array.from(event.clipboardData?.files ?? []).find((item) => item.type.startsWith("image/"));
    if (file) {
      acceptFile(file);
    }
  }
</script>

<section
  class:dragging
  class="dropzone"
  role="button"
  tabindex="0"
  aria-label={t.ariaLabel}
  onkeydown={handleKeydown}
  onclick={openPicker}
  ondragenter={(event) => {
    event.preventDefault();
    dragging = true;
  }}
  ondragover={(event) => event.preventDefault()}
  ondragleave={() => (dragging = false)}
  ondrop={handleDrop}
  onpaste={handlePaste}
>
  <input
    bind:this={input}
    type="file"
    accept="image/*"
    tabindex="-1"
    onchange={(event) => acceptFile(event.currentTarget.files?.[0])}
  />
  <div class="drop-icon" aria-hidden="true">
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path d="M12 16V4m0 0 4.5 4.5M12 4 7.5 8.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
    </svg>
  </div>
  <div>
    <h3>{t.title}</h3>
    <p>{t.hint}</p>
    {#if fileName}
      <p class="file-meta">{fileName} · {fileSize}</p>
    {/if}
  </div>
  <p class="status" aria-live="polite">{message}</p>
</section>

<style>
  .dropzone {
    display: grid;
    gap: 12px;
    place-items: center;
    border: 1.5px dashed var(--color-input-border);
    border-radius: var(--radius-panel);
    background: var(--color-bg);
    color: var(--color-text);
    cursor: pointer;
    outline: none;
    padding: 28px 18px;
    text-align: center;
  }

  .dropzone:focus,
  .dropzone:hover,
  .dropzone.dragging {
    border-color: var(--color-accent);
    background: var(--color-accent-soft-bg);
  }

  input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }

  .drop-icon {
    display: inline-flex;
    width: 52px;
    height: 52px;
    align-items: center;
    justify-content: center;
    border-radius: 16px;
    background: var(--color-accent-soft-bg);
    color: var(--color-accent);
  }

  h3,
  p {
    margin: 0;
  }

  h3 {
    font-size: 17px;
    line-height: 1.25;
  }

  p {
    margin-top: 6px;
    color: var(--color-muted);
    font-size: 14px;
    line-height: 1.5;
  }

  .file-meta,
  .status {
    font-weight: 800;
  }

  .status {
    min-height: 20px;
    color: var(--color-accent-soft-text);
  }
</style>
