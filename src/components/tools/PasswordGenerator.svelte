<script lang="ts">
  import type { Locale } from "@/i18n/config";
  import { t as getStrings } from "@/i18n/strings";

  let {
    locale = "en",
  }: {
    locale?: Locale;
  } = $props();

  const t = $derived(getStrings(locale).passwordGenerator);

  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()-_=+[]{};:,.?";
  const ambiguous = new Set(["0", "O", "1", "l", "I"]);

  let length = $state(16);
  let includeUppercase = $state(true);
  let includeLowercase = $state(true);
  let includeNumbers = $state(true);
  let includeSymbols = $state(true);
  let excludeAmbiguous = $state(false);
  let password = $state("");
  let copied = $state(false);
  let message = $state("");

  const characterGroups = $derived(getCharacterGroups());
  const canGenerate = $derived(characterGroups.length > 0);

  function filterAmbiguous(characters: string) {
    if (!excludeAmbiguous) return characters;
    return [...characters].filter((character) => !ambiguous.has(character)).join("");
  }

  function getCharacterGroups() {
    return [
      includeUppercase ? filterAmbiguous(uppercase) : "",
      includeLowercase ? filterAmbiguous(lowercase) : "",
      includeNumbers ? filterAmbiguous(numbers) : "",
      includeSymbols ? filterAmbiguous(symbols) : "",
    ].filter(Boolean);
  }

  function randomInt(max: number) {
    const range = 2 ** 32;
    const limit = range - (range % max);
    const value = new Uint32Array(1);

    do {
      crypto.getRandomValues(value);
    } while (value[0] >= limit);

    return value[0] % max;
  }

  function randomCharacter(characters: string) {
    return characters[randomInt(characters.length)];
  }

  function shuffle(characters: string[]) {
    for (let index = characters.length - 1; index > 0; index -= 1) {
      const swapIndex = randomInt(index + 1);
      [characters[index], characters[swapIndex]] = [characters[swapIndex], characters[index]];
    }

    return characters;
  }

  function createPassword() {
    if (!canGenerate) return "";

    const requiredCharacters = characterGroups.map(randomCharacter);
    const allCharacters = characterGroups.join("");
    const remainingLength = Math.max(0, length - requiredCharacters.length);
    const remainingCharacters = Array.from({ length: remainingLength }, () => randomCharacter(allCharacters));

    return shuffle([...requiredCharacters, ...remainingCharacters]).join("");
  }

  function generatePassword() {
    password = createPassword();
    copied = false;
    message = canGenerate ? "" : t.noClassSelected;
  }

  async function copyPassword() {
    if (!password) return;

    try {
      await navigator.clipboard.writeText(password);
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
    length;
    includeUppercase;
    includeLowercase;
    includeNumbers;
    includeSymbols;
    excludeAmbiguous;
    generatePassword();
  });
</script>

<section class="password-tool panel" aria-labelledby="password-tool-title">
  <div class="tool-head">
    <div>
      <p class="privacy-pill">{t.privacy}</p>
      <h2 id="password-tool-title">{t.title}</h2>
    </div>
    <button type="button" onclick={generatePassword} disabled={!canGenerate}>{t.generate}</button>
  </div>

  <label class="output-label" for="password-output">{t.outputLabel}</label>
  <textarea id="password-output" readonly rows="3" value={password} aria-describedby="password-status"></textarea>

  <div class="actions">
    <button type="button" onclick={copyPassword} disabled={!password} aria-label={t.copyLabel}>
      {copied ? t.copied : t.copy}
    </button>
  </div>

  <div class="controls">
    <label class="length-control" for="password-length">
      <span>{t.lengthLabel}</span>
      <strong>{length}</strong>
    </label>
    <input id="password-length" type="range" min="8" max="64" bind:value={length} />

    <div class="toggles">
      <label>
        <input type="checkbox" bind:checked={includeUppercase} />
        <span>{t.uppercase}</span>
      </label>
      <label>
        <input type="checkbox" bind:checked={includeLowercase} />
        <span>{t.lowercase}</span>
      </label>
      <label>
        <input type="checkbox" bind:checked={includeNumbers} />
        <span>{t.numbers}</span>
      </label>
      <label>
        <input type="checkbox" bind:checked={includeSymbols} />
        <span>{t.symbols}</span>
      </label>
      <label>
        <input type="checkbox" bind:checked={excludeAmbiguous} />
        <span>{t.excludeAmbiguous}</span>
      </label>
    </div>
  </div>

  <p id="password-status" class:error={!canGenerate} class="status" aria-live="polite">
    {canGenerate ? message : t.noClassSelected}
  </p>
</section>

<style>
  .password-tool {
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

  .output-label,
  .length-control span {
    display: block;
    color: var(--color-text);
    font-size: 13px;
    font-weight: 800;
  }

  .output-label {
    margin-bottom: 8px;
  }

  textarea {
    display: block;
    width: 100%;
    min-height: 94px;
    resize: vertical;
    border: 1px solid var(--color-input-border);
    border-radius: 15px;
    background: var(--color-bg);
    color: var(--color-text);
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
    font-size: clamp(20px, 4vw, 28px);
    line-height: 1.45;
    outline: none;
    overflow-wrap: anywhere;
    padding: 16px;
  }

  textarea:focus {
    border-color: var(--color-accent);
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 12px;
  }

  .controls {
    display: grid;
    gap: 14px;
    margin-top: 24px;
    border-top: 1px solid var(--color-border);
    padding-top: 20px;
  }

  .length-control {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .length-control strong {
    color: var(--color-text);
    font-size: 20px;
    letter-spacing: -0.02em;
  }

  input[type="range"] {
    width: 100%;
    accent-color: var(--color-accent);
  }

  .toggles {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .toggles label {
    display: flex;
    min-height: 48px;
    align-items: center;
    gap: 10px;
    border: 1px solid var(--color-border);
    border-radius: 14px;
    background: var(--color-bg);
    color: var(--color-text);
    font-size: 13.5px;
    font-weight: 800;
    padding: 10px 12px;
  }

  .toggles input {
    width: 18px;
    height: 18px;
    accent-color: var(--color-accent);
  }

  .status {
    min-height: 18px;
    margin-top: 12px;
    color: var(--color-accent-soft-text);
    font-size: 13px;
    font-weight: 800;
  }

  .status.error {
    color: #b91c1c;
  }

  @media (max-width: 560px) {
    .password-tool {
      padding: 18px;
    }

    .tool-head {
      flex-direction: column;
    }

    .actions,
    button {
      width: 100%;
    }

    .toggles {
      grid-template-columns: 1fr;
    }
  }
</style>
