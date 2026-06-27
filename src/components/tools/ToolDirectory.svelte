<script lang="ts">
  import type { Locale } from "@/i18n/config";
  import { t as getStrings } from "@/i18n/strings";

  type DirectoryTool = {
    id: string;
    name: string;
    category: string;
    description: string;
    route?: string;
    status: "available" | "comingSoon";
  };

  let {
    tools = [],
    comingSoon = [],
    locale = "en",
  }: { tools: DirectoryTool[]; comingSoon: DirectoryTool[]; locale?: Locale } = $props();

  let query = $state("");
  let activeCategory = $state("All");

  const t = $derived(getStrings(locale).directory);
  const categories = $derived(t.categories);
  const categoryLabels = $derived(Object.fromEntries(categories.map((category) => [category.value, category.label])));

  let combined = $derived([...tools, ...comingSoon]);
  let filtered = $derived(
    combined.filter((tool) => {
      const matchesCategory = activeCategory === "All" || tool.category === activeCategory;
      const haystack = `${tool.name} ${tool.description}`.toLowerCase();
      return matchesCategory && (!query.trim() || haystack.includes(query.trim().toLowerCase()));
    }),
  );
  let grouped = $derived(
    categories
      .filter((category) => category.value !== "All")
      .map((category) => ({
        value: category.value,
        label: category.label,
        tools: filtered.filter((tool) => tool.category === category.value),
      }))
      .filter((group) => group.tools.length > 0),
  );

  function iconLabel(name: string) {
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("");
  }
</script>

<section class="directory" aria-labelledby="tool-directory-title">
  <div class="directory-head">
    <h2 id="tool-directory-title">{t.title}</h2>
    <p>{t.intro}</p>
  </div>

  <label class="search">
    <span class="sr-only">{t.searchLabel}</span>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"></circle>
      <path d="m20 20-3-3" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
    </svg>
    <input bind:value={query} placeholder={t.searchPlaceholder} autocomplete="off" />
  </label>

  <div class="chips" aria-label={t.filterLabel}>
    {#each categories as category}
      <button
        type="button"
        class:active={activeCategory === category.value}
        aria-pressed={activeCategory === category.value}
        onclick={() => (activeCategory = category.value)}
      >
        {category.label}
      </button>
    {/each}
  </div>

  {#if grouped.length > 0}
    <div class="grouped-grid">
      {#each grouped as group}
        <section class="tool-group" aria-labelledby={`tool-group-${group.value}`}>
          <h3 id={`tool-group-${group.value}`}>{group.label}</h3>
          <div class="grid">
            {#each group.tools as tool}
              {#if tool.status === "available" && tool.route}
                <a class="tool-card" href={tool.route}>
                  <span class="icon-tile" aria-hidden="true">{iconLabel(tool.name)}</span>
                  <span class="badge">{categoryLabels[tool.category] ?? tool.category}</span>
                  <strong>{tool.name}</strong>
                  <span>{tool.description}</span>
                </a>
              {:else}
                <article class="tool-card disabled">
                  <span class="icon-tile" aria-hidden="true">{iconLabel(tool.name)}</span>
                  <span class="badge">{t.comingSoon}</span>
                  <strong>{tool.name}</strong>
                  <span>{tool.description}</span>
                </article>
              {/if}
            {/each}
          </div>
        </section>
      {/each}
    </div>
  {:else}
    <p class="empty">{t.empty}</p>
  {/if}
</section>

<style>
  .directory {
    padding: 36px 0 16px;
  }

  .directory-head {
    max-width: 680px;
    margin: 0 auto 24px;
    text-align: center;
  }

  h2 {
    margin: 0;
    color: var(--color-text);
    font-size: clamp(28px, 5vw, 40px);
    line-height: 1.08;
    letter-spacing: -0.03em;
  }

  p {
    margin: 12px 0 0;
    color: var(--color-muted);
    font-size: 16px;
    line-height: 1.65;
  }

  .search {
    position: relative;
    display: block;
    max-width: 560px;
    margin: 0 auto;
    color: var(--color-muted);
  }

  .search svg {
    position: absolute;
    top: 50%;
    left: 20px;
    transform: translateY(-50%);
  }

  .search input {
    width: 100%;
    height: 58px;
    border: 1px solid var(--color-input-border);
    border-radius: 15px;
    background: var(--color-surface);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
    color: var(--color-text);
    font-size: 16px;
    outline: none;
    padding: 0 20px 0 52px;
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 9px;
    margin: 28px 0;
  }

  .chips button {
    min-height: 44px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-pill);
    background: var(--color-surface);
    color: var(--color-text);
    cursor: pointer;
    font-size: 13.5px;
    font-weight: 700;
    padding: 9px 16px;
  }

  .chips button.active {
    border-color: var(--color-accent);
    background: var(--color-accent);
    color: #fff;
  }

  .grouped-grid,
  .tool-group {
    display: grid;
    gap: 22px;
  }

  .tool-group h3 {
    margin: 0;
    color: var(--color-text);
    font-size: 20px;
    line-height: 1.15;
    letter-spacing: -0.02em;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(264px, 1fr));
    gap: 16px;
  }

  .tool-card {
    position: relative;
    display: grid;
    min-height: 172px;
    align-content: start;
    gap: 10px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-card);
    background: var(--color-surface);
    box-shadow: var(--shadow-card);
    color: var(--color-text);
    padding: 20px;
    text-decoration: none;
    transition:
      border-color 0.18s,
      box-shadow 0.18s,
      transform 0.18s;
  }

  a.tool-card:hover {
    border-color: var(--color-accent);
    box-shadow: var(--shadow-card-hover);
    transform: translateY(-3px);
  }

  .tool-card.disabled {
    opacity: 0.72;
  }

  .icon-tile {
    display: inline-flex;
    width: 44px;
    height: 44px;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    background: var(--color-accent-soft-bg);
    color: var(--color-accent);
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.02em;
  }

  .badge {
    position: absolute;
    top: 20px;
    right: 20px;
    border-radius: var(--radius-pill);
    background: var(--color-accent-soft-bg);
    color: var(--color-accent-soft-text);
    font-size: 11px;
    font-weight: 800;
    padding: 4px 9px;
  }

  strong {
    margin-top: 4px;
    font-size: 16.5px;
    letter-spacing: -0.01em;
  }

  .tool-card span:last-child {
    color: var(--color-muted);
    font-size: 13.5px;
    line-height: 1.5;
  }

  .empty {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-card);
    background: var(--color-surface);
    padding: 24px;
    text-align: center;
  }

  @media (max-width: 560px) {
    .chips {
      flex-wrap: nowrap;
      justify-content: flex-start;
      overflow-x: auto;
      padding-bottom: 4px;
      scrollbar-width: none;
    }

    .chips::-webkit-scrollbar {
      display: none;
    }
  }
</style>
