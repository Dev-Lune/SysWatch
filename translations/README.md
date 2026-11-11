# Translate SysWatch

SysWatch speaks English, German, French, Spanish and Russian. You can add your
language, or fix a wording in one that exists. No programming needed: it is one text
file per language.

When a translation is merged here, **every SysWatch app, on the phone and on Windows, picks
it up by itself** within a day (or at once from Settings, Language). No app update needed.

## Add your language

1. **Fork** this repository (the Fork button at the top right of the GitHub page).
2. In the `translations` folder, **copy `en.xml`** and name the copy with your language
   code: `hi.xml` for Hindi, `pt-BR.xml` for Brazilian Portuguese, `ja.xml` for Japanese.
   ([List of codes](https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes), first column.)
3. **Translate the text between the tags.** Leave everything inside the `< >` brackets alone.

   ```xml
   <!-- English -->
   <string name="pair_scan">Scan the code on your PC</string>

   <!-- Your file -->
   <string name="pair_scan">अपने पीसी पर कोड स्कैन करें</string>
   ```
4. **Open a pull request.** A check runs by itself and tells you, in plain words, if
   anything needs fixing. Once it is green we review it and merge.

You do not have to finish in one go. Strings you leave out show in English, and the app
tells people how complete a language is. But do not leave a string empty: delete the
whole line instead.

## Fix an existing translation

Edit the file for that language (`de.xml`, `fr.xml`, `es.xml`, `ru.xml`), change the
text, open a pull request. Say in a sentence why the new wording is better.

## The rules, all five of them

**1. Keep the placeholders.** Things like `%1$s` and `%2$d` are slots the app fills in
(a name, a number). Every one in the English must be in your text. You may move them to
wherever your grammar wants them: that is why they are numbered.

```xml
<string name="settings_paired_with">Paired with code %1$s</string>
<string name="settings_paired_with">Gekoppelt mit Code %1$s</string>
```

A real percent sign next to placeholders is written twice: `%1$d%%` shows as `47%`.

**2. Put a backslash before an apostrophe.** `l\'application`, not `l'application`.
Write `&amp;` for &, and `&lt;` for <.

**3. Do not translate names and units.** SysWatch, DevLune, CPU, GPU, RAM, Wi-Fi,
Tailscale, Google Play, Windows, Android, and units such as MB, GB, GHz, °C stay as
they are. The art standby faces (Horizon, Blocks, Bauhaus, Ink, Weave, Bloom, Type,
Pixel) keep their names too.

**4. Plurals follow your language.** English has two forms, `one` and `other`. If your
language has more (Russian, Polish, Arabic...), add the forms it needs:

```xml
<plurals name="settings_import_done">
    <item quantity="one">Импортировано %1$d правило.</item>
    <item quantity="few">Импортировано %1$d правила.</item>
    <item quantity="many">Импортировано %1$d правил.</item>
    <item quantity="other">Импортировано %1$d правила.</item>
</plurals>
```

**5. Keep it short and plain.** This text sits on buttons and small cards on a phone.
Prefer the word people actually use over the formal one. No long dashes: use a comma,
a colon or a full stop.

The lines that start with `<!--` in `en.xml` are notes for you: what a slot holds, or
where the text appears. You do not need to keep them in your file.

Names that start with `desktop_` belong to the Windows app; all the others belong to the
Android app. They live in the same file, so one pull request translates both apps.

One string is special: `language_name` is the name of your language, written in your
language (Deutsch, Español, Русский, हिन्दी). That is what people see in the app's
language list.

## Check your file before sending (optional)

If you have Python:

```sh
python scripts/translations.py check translations
```

It prints `ok` or the exact strings to fix. The same check runs on your pull request.

## What happens after a merge

- `languages.json` in this folder is updated automatically. It is the list the app reads.
- Apps check it once a day. A phone using your language downloads the new file, checks
  every string again on the device (a broken string is skipped and shown in English, so a
  mistake can never break the app), saves it, and shows it.
- Languages that are not built into the app appear in the language list with a download
  mark. Popular ones get built in with the next app version.

## Questions

Open an [issue](https://github.com/Dev-Lune/SysWatch/issues) or ask on
[Discord](https://discord.gg/BXu9qxgaE8). Thank you for helping people use SysWatch in
their own language.
