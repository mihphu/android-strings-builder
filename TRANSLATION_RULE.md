# Android Strings Translation Rules

> A standard rule set for translating (localizing) `strings.xml` in an Android project in a way that is **safe, idempotent, and build-error-free**.

---

## 1. Input / Output

### Input
| Component | Description |
|---|---|
| **Base file** | `res/values/strings.xml` (the source language, usually English) — this is the **single source of truth** |
| **Locale folders** | Folders that already exist under `res/`, e.g. `values-es-rES`, `values-fr-rFR`, `values-ja`, `values-vi`, ... |

### Output
- For **each** existing `values-xx[-rYY]` folder:
  - If `strings.xml` does not exist yet → **create it**.
  - If it already exists → **only add the missing keys** (never touch already-translated keys).

---

## 2. Core Logic

1. **Automatically detect** every locale folder under `res/` — do **NOT** use a hardcoded list.
   - Scan by pattern: `values-<lang>` or `values-<lang>-r<REGION>`.
2. Parse `res/values/strings.xml` as the canonical key set (base keys).
3. For each locale:
   - Read the existing `strings.xml` (if any) → get the list of already-translated keys.
   - Compute `missing = base_keys − existing_keys`.
   - Only translate and write the keys in `missing`.

```
base_keys ─┐
           ├─► missing = base_keys − existing_keys ─► translate(missing) ─► merge & write
locale ────┘
```

---

## 3. Translation Rules

### 3.1. Skip non-translatable keys
- **Skip** every `<string>` with `translatable="false"`.
- Do not copy these keys into the locale file.

```xml
<!-- Skip: do not translate, do not copy -->
<string name="app_version" translatable="false">1.0.0</string>
```

### 3.2. Never overwrite existing translations
- If a key already exists in the locale file → **keep it as is**, never overwrite.

### 3.3. Preserve placeholders & formatting
You must preserve the following **exactly** (do not translate, do not change the index order):

| Type | Example |
|---|---|
| String/Digit format | `%s`, `%d`, `%f` |
| Positional args | `%1$s`, `%2$d` |
| Line breaks | `\n`, `\t` |
| HTML tags | `<b>`, `<i>`, `<u>`, `<a href="...">` |
| CDATA | `<![CDATA[ ... ]]>` |

> ⚠️ For strings with **multiple** placeholders, you MUST use the positional form (`%1$s`, `%2$d`) — because the grammar of different languages may reorder them.

### 3.4. Do not translate special characters
- Keep as is: `%`, `$`, `@`, `#`.

### 3.5. Required escaping (Android XML)
| Original character | After escaping |
|---|---|
| `'` (single quote) | `\'` |
| `"` (double quote) | `\"` |
| `&` | `&amp;` |
| `<` | `&lt;` |
| `>` | `&gt;` |
| `@` (start of string) | `\@` |
| `?` (start of string) | `\?` |

> Note: a string containing `'` that is **not** escaped will cause a resource compile error.

### 3.6. Keep keys unchanged
- Do **NOT** rename the `name` of any `<string>`/`<plurals>`/`<string-array>`.

---

## 4. Output Format

- Valid Android XML (`<resources>` is the root tag).
- **UTF-8** encoding.
- Consistent indentation (4 spaces recommended).
- Include the header declaration:

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="welcome_message">¡Bienvenido a la aplicación!</string>
    <string name="greeting">Hola, %1$s. Tienes %2$d mensajes nuevos.</string>
    <string name="cant_undo">Esta acción no se puede deshacer</string>
</resources>
```

---

## 5. Translation Quality

- Translate **naturally and in context** — do not translate word-by-word.
- Use a tone appropriate for a **mobile app UI**: concise, friendly, and using correct platform terminology.
- Respect the conventions of the target language (e.g. German tends to be longer → consider the UI).
- Use the correct register: keep the form of address (formal/informal) consistent across the whole app.

---

## 6. Idempotency (IMPORTANT)

The script/process must be **safe to run multiple times**:

- ✅ Already-translated keys → **unchanged** between runs.
- ✅ Only translate the **missing** keys.
- ✅ Stable output (key order should follow the base file for clean diffs).
- ❌ Do not re-translate, do not produce different content across two runs with the same input.

---

## 7. Avoid Duplicate Resource Names

Each `<string name="...">` must be **unique** within a single `strings.xml`.

| Situation | Handling |
|---|---|
| Key already in the base file | Do NOT create a new key |
| Updating a locale file | Only **add missing keys**, do not redefine existing keys |
| Duplicate key detected | Keep the correct entry (matching base), **delete/merge** the redundant one |
| Sync the key set | Every locale must have the **same key set** as the base file |

> Duplicate resource names → **build error** or **unexpected value overwrite at runtime**.

**Goal:** ensure a **1-to-1** mapping between the keys of every locale and the base file.

---

## 8. Recommended Pipeline (pseudo-flow)

```text
1. parse base_strings = parse("res/values/strings.xml")
2. base_keys = { name | translatable != false }
3. locales   = detect_locale_dirs("res/")           # automatic
4. for locale in locales:
5.     existing = parse_if_exists(locale/strings.xml)
6.     dedupe(existing)                              # merge duplicate keys
7.     missing  = base_keys − keys(existing)
8.     translated = translate(missing, target=locale)  # natural, keep placeholders
9.     escape_xml(translated)                         # ', ", &, <, >
10.    merged   = existing ∪ translated               # do not overwrite
11.    order_by(base_keys)                            # clean diff
12.    write_utf8(locale/strings.xml, merged)
```

---

## 9. Pre-commit Checklist

- [ ] Every locale has the **full** key set like base (1-to-1 mapping).
- [ ] No duplicate keys within each file.
- [ ] No overwriting of existing translations.
- [ ] Placeholders `%1$s`, `%2$d`, `\n`, and HTML are preserved.
- [ ] Escaped `'`, `"`, `&`, `<`, `>`.
- [ ] `translatable="false"` is skipped.
- [ ] File is UTF-8, `<resources>` root, consistent formatting.
- [ ] Build passes with no "duplicate resources" warnings.
