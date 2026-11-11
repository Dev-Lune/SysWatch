#!/usr/bin/env python3
"""SysWatch translations: one file per language.

The app keeps its English text in a few Android resource files. Translators
never see that split: they get ONE file, translations/en.xml, and send back
ONE file, translations/<code>.xml. This script moves text between the two.

  python scripts/translations.py export <dir>
      Write <dir>/en.xml (every translatable string, with its translator
      note) and copy the shipped languages beside it as <code>.xml.

  python scripts/translations.py check <dir>
      Check every <code>.xml in <dir> against <dir>/en.xml. Exit 1 on errors.
      This is what the pull request check runs. It needs nothing but Python.

  python scripts/translations.py import <file.xml> [code]
      Check one translation file, then install it into the app as
      android/app/src/main/res/values-<code>/strings.xml.

  python scripts/translations.py manifest <dir>
      Write <dir>/languages.json: the list the app downloads to learn which
      languages exist and whether its copy is out of date.

  python scripts/translations.py selftest
      Prove the checker catches the mistakes it exists for.
"""
import hashlib
import json
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RES = ROOT / "android" / "app" / "src" / "main" / "res"
PLACEHOLDER = re.compile(r"%(?:(\d+)\$)?[-#+ 0,(]*\d*(?:\.\d+)?([sdfx])|%%")
LONG_DASH = re.compile("[–—]")
PLURAL_REQUIRED = {"ru": {"one", "few", "many", "other"}, "uk": {"one", "few", "many", "other"},
                   "pl": {"one", "few", "many", "other"}, "cs": {"one", "few", "many", "other"},
                   "ar": {"zero", "one", "two", "few", "many", "other"}}


def source_files():
    return sorted((RES / "values").glob("strings*.xml"))


def parse(path):
    """Return ({key: entry}, [problems]). entry = (kind, value, comment); value is
    text for a string, {quantity: text} for plurals, [text] for an array."""
    try:
        parser = ET.XMLParser(target=ET.TreeBuilder(insert_comments=True))
        root = ET.parse(path, parser).getroot()
    except ET.ParseError as error:
        return {}, [f"{path.name}: not valid XML ({error})"]
    entries, problems, comment = {}, [], ""
    for node in root:
        if callable(node.tag):  # a comment
            comment = (node.text or "").strip()
            continue
        name = node.get("name", "")
        if node.get("translatable") == "false":
            comment = ""
            continue
        if node.tag == "string":
            value = "".join(node.itertext())
        elif node.tag == "plurals":
            value = {item.get("quantity"): "".join(item.itertext()) for item in node.findall("item")}
        elif node.tag == "string-array":
            value = ["".join(item.itertext()) for item in node.findall("item")]
        else:
            comment = ""
            continue
        if name in entries:
            problems.append(f"{path.name}: '{name}' appears twice")
        entries[name] = (node.tag, value, comment)
        comment = ""
    return entries, problems


def load_source():
    merged, problems = {}, []
    for path in source_files():
        entries, found = parse(path)
        problems += found
        for name, entry in entries.items():
            if name in merged:
                problems.append(f"'{name}' is defined in more than one English file")
            merged[name] = entry
    return merged, problems


def placeholders(text):
    """Placeholders as a sorted list, so order may change but the set may not."""
    found = []
    for position, match in enumerate(PLACEHOLDER.finditer(text), start=1):
        if match.group(0) == "%%":
            continue
        found.append(f"%{match.group(1) or position}${match.group(2)}")
    return sorted(found)


def texts(value):
    if isinstance(value, dict):
        return list(value.items())
    if isinstance(value, list):
        return list(enumerate(value))
    return [("", value)]


def check_text(name, part, english, translated, problems):
    label = f"'{name}'" + (f" [{part}]" if part != "" else "")
    if not translated.strip():
        problems.append(f"{label} is empty")
        return
    if placeholders(english) != placeholders(translated):
        problems.append(f"{label} must keep the same placeholders as the English: "
                        f"{placeholders(english) or 'none'}, found {placeholders(translated) or 'none'}")
    if LONG_DASH.search(translated):
        problems.append(f"{label} contains a long dash; use a comma, colon or full stop")
    if re.search(r"(?<!\\)'", translated) and not (translated.startswith('"') and translated.endswith('"')):
        problems.append(f"{label} has an apostrophe that needs a backslash before it (\\')")
    # A bare percent sign is fine where the English has one too (a unit label such as "%").
    bare = lambda text: PLACEHOLDER.sub("", text).count("%")
    if bare(translated) > bare(english):
        problems.append(f"{label} has a bare % sign; write %% when the text also has placeholders"
                        if placeholders(translated) else f"{label} has a stray % that looks like a broken placeholder")


def check(source, translation, code):
    problems = []
    for name in sorted(set(translation) - set(source)):
        problems.append(f"'{name}' is not a string the app has (typo, or it was removed)")
    for name in sorted(set(source) - set(translation)):
        problems.append(f"'{name}' is missing")
    for name, (kind, english, _) in source.items():
        if name not in translation:
            continue
        other_kind, value, _ = translation[name]
        if other_kind != kind:
            problems.append(f"'{name}' must be a <{kind}>, found <{other_kind}>")
            continue
        if kind == "string":
            check_text(name, "", english, value, problems)
        elif kind == "string-array":
            if len(value) != len(english):
                problems.append(f"'{name}' must have {len(english)} items, found {len(value)}")
            for index, (a, b) in enumerate(zip(english, value)):
                check_text(name, index, a, b, problems)
        else:
            needed = PLURAL_REQUIRED.get(code.split("-")[0], {"one", "other"})
            if "other" not in value:
                problems.append(f"'{name}' needs an item with quantity=\"other\"")
            for quantity in sorted(needed - set(value)):
                problems.append(f"'{name}' needs an item with quantity=\"{quantity}\" in this language")
            reference = english.get("other", next(iter(english.values())))
            for quantity, text in value.items():
                check_text(name, quantity, reference, text, problems)
    return problems


def escape(text):
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def render(entries, header):
    lines = ['<?xml version="1.0" encoding="utf-8"?>', "<!--", *header, "-->", "<resources>"]
    for name, (kind, value, comment) in entries.items():
        if comment:
            lines.append(f"    <!-- {comment.replace('--', '- -')} -->")
        if kind == "string":
            # A lone % with no placeholders must be marked, or the build treats it as a format.
            plain = ' formatted="false"' if "%" in PLACEHOLDER.sub("", value) and not placeholders(value) else ""
            lines.append(f'    <string name="{name}"{plain}>{escape(value)}</string>')
        else:
            tag = "plurals" if kind == "plurals" else "string-array"
            lines.append(f'    <{tag} name="{name}">')
            for part, text in texts(value):
                attribute = f' quantity="{part}"' if kind == "plurals" else ""
                lines.append(f"        <item{attribute}>{escape(text)}</item>")
            lines.append(f"    </{tag}>")
    lines.append("</resources>")
    return "\n".join(lines) + "\n"


def shipped_languages():
    return sorted(p.name[len("values-"):] for p in RES.glob("values-*")
                  if (p / "strings.xml").exists() and re.fullmatch(r"values-[a-z]{2,3}(-r[A-Z]{2})?", p.name))


def export(target):
    source, problems = load_source()
    if problems:
        sys.exit("\n".join(problems))
    target.mkdir(parents=True, exist_ok=True)
    (target / "en.xml").write_text(render(source, [
        "  SysWatch, English. This is the source: do not edit it in a translation pull request.",
        "  To add your language, copy this file to <language code>.xml (for example hi.xml)",
        "  and translate the text between the tags. See README.md in this folder.",
    ]), encoding="utf-8", newline="\n")
    for code in shipped_languages():
        entries, _ = parse(RES / f"values-{code}" / "strings.xml")
        ordered = {name: entries[name] for name in source if name in entries}
        (target / f"{code}.xml").write_text(
            render(ordered, [f"  SysWatch, language code: {code}. Fixes are welcome: see README.md in this folder."]),
            encoding="utf-8", newline="\n")
    print(f"exported {len(source)} strings to {target} (en + {', '.join(shipped_languages()) or 'no translations yet'})")
    write_bundled_versions(manifest(target))


def check_folder(folder):
    source, problems = parse(folder / "en.xml")
    if problems or not source:
        sys.exit("\n".join(problems or [f"{folder / 'en.xml'} not found or empty"]))
    failed = False
    for path in sorted(folder.glob("*.xml")):
        if path.name == "en.xml":
            continue
        if not re.fullmatch(r"[a-z]{2,3}(-[A-Z]{2})?\.xml", path.name):
            print(f"FAIL {path.name}: name the file by language code, like hi.xml or pt-BR.xml")
            failed = True
            continue
        translation, found = parse(path)
        found += check(source, translation, path.stem)
        print(("FAIL " if found else "ok   ") + f"{path.name}: {len(translation)} of {len(source)} strings"
              + "".join(f"\n       - {p}" for p in found))
        failed = failed or bool(found)
    sys.exit(1 if failed else 0)


def install(path, code):
    source, problems = load_source()
    translation, found = parse(path)
    problems += found + check(source, translation, code)
    if problems:
        sys.exit(f"{path.name} is not ready:\n  - " + "\n  - ".join(problems))
    folder = RES / ("values-" + (code if "-" not in code else code.replace("-", "-r")))
    folder.mkdir(exist_ok=True)
    ordered = {name: translation[name] for name in source}
    (folder / "strings.xml").write_text(
        render(ordered, [f"  Generated by scripts/translations.py from {path.name}. Edit the translation file, not this."]),
        encoding="utf-8", newline="\n")
    print(f"installed {len(ordered)} strings into {folder.relative_to(ROOT)}")
    print("A NEW language also needs: AppLanguage enum entry, res/xml/locales_config.xml, localeFilters in build.gradle.kts.")


def manifest(folder):
    """languages.json: code, the language's own name, a version that changes with the
    file, and how complete it is. English is the built-in source and is not listed."""
    source, _ = parse(folder / "en.xml")
    languages = []
    for path in sorted(folder.glob("*.xml")):
        if path.name == "en.xml" or not re.fullmatch(r"[a-z]{2,3}(-[A-Z]{2})?\.xml", path.name):
            continue
        entries, problems = parse(path)
        if problems:
            continue
        name = entries.get("language_name", ("string", path.stem, ""))[1]
        content = path.read_bytes().replace(b"\r\n", b"\n")
        languages.append({
            "code": path.stem,
            "name": name if isinstance(name, str) and name.strip() else path.stem,
            "version": hashlib.sha256(content).hexdigest()[:12],
            "strings": sum(1 for key in entries if key in source),
            "total": len(source),
        })
    text = json.dumps({"v": 1, "languages": languages}, ensure_ascii=False, indent=2) + "\n"
    (folder / "languages.json").write_text(text, encoding="utf-8", newline="\n")
    print("languages.json: " + (", ".join(l["code"] + " " + l["version"] for l in languages) or "no languages"))
    return languages


def write_bundled_versions(languages):
    """Tell the app which version of each built-in language it already contains,
    so it does not download what it shipped with."""
    target = ROOT / "android/app/src/main/kotlin/in/devlune/syswatch/data/i18n/BundledVersions.kt"
    if not target.parent.exists():
        return
    bundled = set(shipped_languages())
    rows = [f'    "{l["code"]}" to "{l["version"]}",' for l in languages if l["code"] in bundled]
    lines = ["package `in`.devlune.syswatch.data.i18n", "",
             "/** Written by scripts/translations.py. Do not edit by hand. */",
             "val BUNDLED_VERSIONS: Map<String, String> = mapOf(", *rows, ")", ""]
    target.write_text("\n".join(lines), encoding="utf-8", newline="\n")
    print(f"BundledVersions.kt: {len(rows)} languages")


def selftest():
    source = {"hello": ("string", "Paired with code %1$s", ""),
              "rules": ("plurals", {"one": "%1$d rule", "other": "%1$d rules"}, ""),
              "notes": ("string-array", ["One.", "Two."], "")}
    good = {"hello": ("string", "Gekoppelt mit Code %1$s", ""),
            "rules": ("plurals", {"one": "%1$d Regel", "other": "%1$d Regeln"}, ""),
            "notes": ("string-array", ["Eins.", "Zwei."], "")}
    assert check(source, good, "de") == [], check(source, good, "de")
    cases = {
        "dropped placeholder": {**good, "hello": ("string", "Gekoppelt", "")},
        "missing key": {k: v for k, v in good.items() if k != "notes"},
        "unknown key": {**good, "extra": ("string", "x", "")},
        "empty": {**good, "hello": ("string", "  ", "")},
        "long dash": {**good, "hello": ("string", "Code — %1$s", "")},
        "unescaped apostrophe": {**good, "hello": ("string", "l'app %1$s", "")},
        "short array": {**good, "notes": ("string-array", ["Eins."], "")},
        "plural without other": {**good, "rules": ("plurals", {"one": "%1$d Regel"}, "")},
    }
    for label, broken in cases.items():
        assert check(source, broken, "de"), f"checker missed: {label}"
    assert any("few" in p for p in check(source, good, "ru")), "checker missed: Russian plural forms"
    assert placeholders("%2$s of %1$s") == placeholders("%1$s von %2$s")
    unit = {"pct": ("string", "%", "")}
    assert check(unit, {"pct": ("string", "%", "")}, "de") == [], "a plain % that the English also has must pass"
    assert check(unit, {"pct": ("string", "% %", "")}, "de"), "checker missed: extra bare %"
    print(f"selftest passed: clean file accepted, {len(cases) + 1} kinds of mistake caught")


if __name__ == "__main__":
    args = sys.argv[1:]
    if args[:1] == ["export"] and len(args) == 2:
        export(Path(args[1]))
    elif args[:1] == ["check"] and len(args) == 2:
        check_folder(Path(args[1]))
    elif args[:1] == ["import"] and len(args) in (2, 3):
        install(Path(args[1]), args[2] if len(args) == 3 else Path(args[1]).stem)
    elif args[:1] == ["manifest"] and len(args) == 2:
        manifest(Path(args[1]))
    elif args == ["selftest"]:
        selftest()
    else:
        sys.exit(__doc__)
