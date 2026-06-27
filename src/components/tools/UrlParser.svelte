<script lang="ts">
  import type { Locale } from "@/i18n/config";
  import { t as getStrings } from "@/i18n/strings";
  import { buildUrl, parseUrl, type UrlParam } from "@/utils/urlParse";

  let {
    locale = "en",
  }: {
    locale?: Locale;
  } = $props();

  const t = $derived(getStrings(locale).urlParser);

  let urlInput = $state("https://example.com/search?q=private+tools&page=1#results");
  let baseInput = $state("");
  let params = $state<UrlParam[]>([]);
  let lastParsedHref = $state("");
  let nextId = $state(100);
  let copied = $state(false);
  let message = $state("");

  const parsed = $derived(parseUrl(urlInput, baseInput));
  const rebuilt = $derived(parsed.value ? buildUrl(parsed.value, params) : "");
  const parts = $derived(
    parsed.value
      ? [
          { id: "protocol", label: t.fields.protocol, value: parsed.value.protocol },
          { id: "host", label: t.fields.host, value: parsed.value.host },
          { id: "hostname", label: t.fields.hostname, value: parsed.value.hostname },
          { id: "port", label: t.fields.port, value: parsed.value.port || "-" },
          { id: "pathname", label: t.fields.pathname, value: parsed.value.pathname },
          { id: "search", label: t.fields.search, value: parsed.value.search || "-" },
          { id: "hash", label: t.fields.hash, value: parsed.value.hash || "-" },
          { id: "origin", label: t.fields.origin, value: parsed.value.origin },
        ]
      : [],
  );

  function updateParam(id: number, updates: Partial<UrlParam>) {
    params = params.map((param) => (param.id === id ? { ...param, ...updates } : param));
  }

  function addParam() {
    params = [...params, { id: nextId, key: "", value: "" }];
    nextId += 1;
  }

  function removeParam(id: number) {
    params = params.filter((param) => param.id !== id);
  }

  async function copyUrl() {
    if (!rebuilt) return;

    try {
      await navigator.clipboard.writeText(rebuilt);
      copied = true;
      message = t.copiedStatus;
      window.setTimeout(() => {
        copied = false;
      }, 1500);
    } catch {
      message = t.copyFailed;
    }
  }

  $effect(() => {
    if (parsed.value && parsed.value.href !== lastParsedHref) {
      params = parsed.value.params;
      lastParsedHref = parsed.value.href;
    }
  });
</script>

<section class="url-tool panel" aria-labelledby="url-tool-title">
  <div class="tool-head">
    <div>
      <p class="privacy-pill">{t.privacy}</p>
      <h2 id="url-tool-title">{t.title}</h2>
    </div>
  </div>

  <div class="input-grid">
    <label for="url-input">
      <span>{t.urlLabel}</span>
      <input id="url-input" type="text" bind:value={urlInput} placeholder={t.urlPlaceholder} aria-invalid={Boolean(parsed.error)} />
    </label>
    <label for="url-base">
      <span>{t.baseLabel}</span>
      <input id="url-base" type="text" bind:value={baseInput} placeholder={t.basePlaceholder} />
    </label>
  </div>

  {#if parsed.error}
    <p class="error" aria-live="polite">{t.invalidUrl}</p>
  {:else if parsed.value}
    <section class="parts" aria-labelledby="url-parts-title">
      <h3 id="url-parts-title">{t.partsLabel}</h3>
      <div>
        {#each parts as part}
          <article>
            <span>{part.label}</span>
            <output>{part.value}</output>
          </article>
        {/each}
      </div>
    </section>

    <section class="params" aria-labelledby="url-params-title">
      <div class="params-head">
        <h3 id="url-params-title">{t.paramsLabel}</h3>
        <button type="button" onclick={addParam}>{t.addParam}</button>
      </div>

      {#if params.length === 0}
        <p class="empty">{t.emptyParams}</p>
      {:else}
        <div class="param-list">
          {#each params as param}
            <article>
              <label>
                <span>{t.keyLabel}</span>
                <input type="text" value={param.key} oninput={(event) => updateParam(param.id, { key: event.currentTarget.value })} />
              </label>
              <label>
                <span>{t.valueLabel}</span>
                <input type="text" value={param.value} oninput={(event) => updateParam(param.id, { value: event.currentTarget.value })} />
              </label>
              <button type="button" onclick={() => removeParam(param.id)}>{t.removeParam}</button>
            </article>
          {/each}
        </div>
      {/if}
    </section>

    <label class="rebuilt" for="url-output">
      <span>{t.rebuiltLabel}</span>
      <textarea id="url-output" readonly rows="3" value={rebuilt}></textarea>
    </label>

    <div class="actions">
      <button type="button" onclick={copyUrl} disabled={!rebuilt} aria-label={t.copyLabel}>{copied ? t.copied : t.copy}</button>
    </div>
  {/if}

  <p class="status" aria-live="polite">{message}</p>
</section>

<style>
  .url-tool {
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

  .input-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
    gap: 14px;
  }

  label span,
  h3 {
    display: block;
    margin-bottom: 8px;
    color: var(--color-text);
    font-size: 13px;
    font-weight: 800;
  }

  input,
  textarea {
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
    min-height: 82px;
    resize: vertical;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  }

  input:focus,
  textarea:focus,
  button:focus {
    border-color: var(--color-accent);
  }

  .error {
    margin-top: 12px;
    color: #b42318;
    font-size: 13px;
    font-weight: 800;
  }

  .parts,
  .params,
  .rebuilt {
    display: block;
    margin-top: 18px;
  }

  .parts > div {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .parts article,
  .param-list article {
    border: 1px solid var(--color-border);
    border-radius: 14px;
    background: var(--color-bg);
    padding: 12px;
  }

  .parts article span {
    display: block;
    color: var(--color-muted);
    font-size: 12px;
    font-weight: 800;
  }

  output {
    display: block;
    margin-top: 4px;
    overflow-wrap: anywhere;
    color: var(--color-text);
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
    font-size: 13px;
  }

  .params-head,
  .actions {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
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

  .empty {
    color: var(--color-muted);
    font-size: 14px;
    line-height: 1.6;
  }

  .param-list {
    display: grid;
    gap: 10px;
  }

  .param-list article {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 96px;
    gap: 10px;
    align-items: end;
  }

  textarea[readonly] {
    background: var(--color-surface);
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
    .url-tool {
      padding: 18px;
    }

    .input-grid,
    .parts > div,
    .param-list article {
      grid-template-columns: 1fr;
    }

    .params-head {
      align-items: stretch;
      flex-direction: column;
    }

    button,
    .actions button {
      width: 100%;
    }
  }
</style>
