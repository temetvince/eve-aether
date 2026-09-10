# CLAUDE.md — working agreement for aether-fleet-ops

Standing instructions for any Claude / AI assistant making changes in this
repository — a React + TypeScript app bundled by webpack. This file is committed
to git so it travels with the code and is loaded automatically at the start of
every session in this folder. **Follow every rule below on every change, without
being reminded**, wherever you are running.

The governing principle: **maximum compile-time certainty, enforced
automatically.** A mistake this repo can catch before the code runs should be
impossible to commit, and catching it should require no human vigilance. Prefer
a gate that fails the build over a convention someone has to remember.

## The rules

Apply all of these to every non-trivial change, as part of "done" — not optional
polish.

### 1. Component purity — props in, markup out

A presentational component takes props and renders markup. It does not fetch
data, read the router, reach for globals, or know where it sits in the page.
Composition happens at the page level, where the concrete data, routes, and copy
are assembled and passed down. A component that reaches outward is harder to
test, harder to reuse, and harder to reason about; one that only reads its props
is none of those things.

**Type props as deeply readonly.** Props are the component's contract, and a
component must never mutate them. `readonly` on every field, `readonly T[]` for
every array — see [`HeaderProps.ts`](src/components/Header/HeaderProps.ts) for
the shape. This is not decoration: oxlint's `prefer-readonly-parameter-types`
enforces it, and the compiler makes a violation unrepresentable.

**Keep the variant out of the invariant.** When a component is genuinely
reusable, it should hold no copy, no routes, and no site-specific layout — those
belong to the page composing it. When it is genuinely page-specific, leave it
there rather than promoting it to a generality it does not have. Do not
manufacture abstraction layers this site's size does not justify. If the line is
unclear, that is a rule-5 trade-off: surface it rather than guess.

### 2. Refactor, don't bolt on

Favor refactoring toward the right design even when it is a lot of work. Match
the surrounding patterns and naming. Do not paper over a design problem with a
local patch when the clean fix is a refactor.

### 3. Zero warnings — the build is the gate

Leave **no** type errors, **no** lint errors, and **no** warnings. The gate is
real and automatic:

| Layer                 | Enforces                                         | Config                                     |
| --------------------- | ------------------------------------------------ | ------------------------------------------ |
| `tsc`                 | Full type safety at maximum strictness           | [`tsconfig.json`](tsconfig.json)           |
| `oxlint` + `tsgolint` | Type-aware lint rules, plus compiler diagnostics | [`.oxlintrc.json`](.oxlintrc.json)         |
| `prettier`            | Formatting                                       | [`.prettierrc.js`](.prettierrc.js)         |
| `markdownlint`        | Markdown                                         | [`.markdownlint.json`](.markdownlint.json) |

`tsconfig.json` runs every strictness flag TypeScript offers, not just
`strict: true`. `skipLibCheck` is **off**, so dependency types are checked too.
`erasableSyntaxOnly` is load-bearing: Babel strips types without consulting a
typechecker, so `enum`, `namespace`, and parameter properties would compile and
then break at runtime — that flag makes them impossible.

`.oxlintrc.json` runs `correctness`, `suspicious`, `perf`, and `pedantic` as
**errors**, with `typeAware`, `typeCheck`, and `denyWarnings` on. The `style`
and `restriction` categories are deliberately off: they enforce taste, not
correctness, and buy churn instead of protection.

**Fix the cause, not the symptom.** Prefer changing the code over disabling the
rule. When a rule genuinely does not apply, disable it as narrowly as possible —
scoped to a file via `overrides` rather than globally — and write the
justification as a comment next to it. `.oxlintrc.json` accepts comments; every
deviation there carries its reason. `reportUnusedDisableDirectives` is an error,
so stale suppressions cannot accumulate silently.

**Never reach for `--fix-suggestions` or `--fix-dangerously` inside the build.**
Both may change program behavior, and a linter that silently rewrites semantics
on every build is a hazard, not a convenience. They live in `npm run lint:fix`,
run deliberately and reviewed.

### 4. Docs — update them with the change

Docs ship with the change, never as a follow-up. [`README.md`](README.md) is the
guide for a human running or building the app. This file is the working
agreement. Every fact lives in exactly one place. Markdown must pass
`npm run docs`.

**Write docs to be read, not decoded — clarity beats brevity.** The goal is
prose an engineer new to the code can follow on the first pass, not the fewest
possible words. Concision is a virtue only up to the point where it starts
hiding meaning; past it, a "dense" sentence is a defect, not a flourish.
Specifically:

- **One thought per sentence.** If a sentence chains a whole pipeline or
  decision tree through arrows, semicolons, em-dashes, and stacked
  parentheticals, it is doing too much — break it into several short sentences.
  More than one nested parenthetical, or more than about 35 words, is a smell.
- **Use structure for structured content.** A sequence of steps is an ordered
  list; a set of independent things is a bullet list or a table — not a run-on
  sentence with separators. Reserve inline prose for genuine narrative ("why",
  "how it fits").
- **Parentheticals are the exception, not the sentence.** A clause important
  enough to keep belongs in its own sentence; if it is not important enough for
  that, cut it. Never nest them.
- **Keep the facts, drop the compression.** Rewriting for clarity must not
  delete technical content or move a fact to a second location — it re-shapes
  the _same_ information into readable form.

**Document the present, not the past.** Docs describe what the code does _now_ —
never what it used to do, how it changed, or how to migrate from an older
design. No "breaking changes", "previously", "the old behavior", or before/after
narration; that history lives in git. Write every behavioural caveat as a
present-tense fact about how the code works today.

### 5. Ask the user on trade-off decisions

When a task involves a genuine choice — an architecture or design decision with
real trade-offs, an ambiguous requirement, or more than one reasonable approach
— **ask before committing to a direction** rather than guessing. Lay out the
options and their trade-offs concisely (a recommendation plus the alternatives)
and let the user decide. This matters most for choices that are expensive to
reverse: dependencies, public component APIs, build-pipeline structure, and
cross-cutting patterns. For low-stakes or clearly conventional choices, pick the
sensible default, state it, and move on — do not stall on trivia.

### 6. Document by contract

Every exported type, component, function, and hook carries a TSDoc comment: a
summary, plus `@param` for each parameter and `@returns` where the return is not
self-evident. Write them **by contract**, not as narration. State the
**preconditions** a caller must satisfy, the **postconditions** the member
guarantees, and the **invariants** it holds. Document what the signature cannot
show — side effects, valid ranges, "call once", ownership, what throws and when.
Never restate the member's name or its parameter types.

The type system carries most of the contract here, so a doc comment that merely
repeats the types is noise. Write one when there is something the signature
cannot say.

### 7. Keep dependencies current — but verify, never trust

Run `npm run update` (`ncu -u --peer`) to bump dependencies, then **always** run
the full build before believing it. Dependency updates in this repo have a track
record of breaking in non-obvious ways, and the tooling will not warn you:

- **`ncu` ignores peer-dependency ranges, even with `--peer`.** It bumps to the
  newest published version regardless of whether the rest of the tree can accept
  it. Verified, not assumed.
- **A stale `package-lock.json` produces misleading `ERESOLVE` errors.** npm
  reports the first collision it finds against the old tree, which is often not
  the real conflict. When an install fails after a version bump, delete
  `node_modules` and `package-lock.json` and install clean before diagnosing
  anything.
- **`npm install --force` / `--legacy-peer-deps` do not fix peer conflicts.**
  They install a tree that cannot work and defer the failure to runtime. The
  tell is a nested duplicate package under `node_modules/<pkg>/node_modules/`.

TypeScript is pinned to `7.x` and lint runs on oxlint precisely because
`typescript-eslint` cannot support TypeScript 7 — TS 7 is the Go compiler, and
its npm package no longer exports the compiler API that typescript-eslint is
built on. Do not reintroduce `eslint` or `typescript-eslint` here.

### 8. Accessibility — WCAG 2.1 AA is a requirement, not a goal

The site must conform to **WCAG 2.1 Level AA**. That is the standard the
Department of Justice points to when it enforces the ADA, and this app is a
business's front door. Treat a conformance failure exactly as you treat a type
error: a defect that blocks "done".

Accessibility is the one correctness property this repo's gate cannot prove.
`tsc` cannot see a contrast ratio, oxlint's `jsx-a11y` plugin catches only
markup-level mistakes, and nothing at all sees a focus ring or a reflow at
320px. So this rule is checked **deliberately, by measurement** — never by
assumption, and never by eye.

Check all of the following on every non-trivial change:

- **Contrast — measure it.** Every text/background pair clears 4.5:1, or 3:1 for
  large text. Every UI component boundary and focus indicator clears 3:1
  (success criterion 1.4.11). Measure **both editions**: a token that passes on
  the day sheet can fail on the night one.
- **Keyboard.** Every interactive element is reachable and operable by keyboard
  alone, and shows a visible focus indicator. Never add a custom widget without
  keyboard semantics.
- **Semantics.** Exactly one `h1`. No skipped heading levels. Landmarks for
  header, nav, main, and footer. A `<label>` for every form control. Alt text on
  every meaningful image, and `aria-hidden` on every decorative one.
- **Reflow.** No horizontal scrolling at a 320px viewport, or at 200% zoom
  (1.4.10).
- **Preferences.** Honour `prefers-reduced-motion`, `prefers-color-scheme`,
  `prefers-contrast`, and `forced-colors`.

Colour is never the only carrier of meaning (1.4.1). A state shown by colour is
also shown by text, shape, or position.

Verify what the measurement cannot reach by exercising it: tab through the page,
and read it at 320px.

### 9. Updating these instructions

If you change how work is done here — these rules, or the equivalent home-folder
memories — you **must**: (a) **notify the user explicitly** that the
instructions changed; (b) update **this file** (it is committed and portable);
and (c) update the home-folder memory copy if it is accessible. Keep the two in
sync. **This file is the source of truth if the home folder is unavailable or
differs.**

## Definition of done

- [ ] Components stay pure — props in, markup out; props typed deeply
      `readonly`.
- [ ] Refactored toward the right design, not bolted on.
- [ ] Exported members documented by contract (TSDoc: preconditions,
      postconditions, invariants).
- [ ] Rule deviations fixed at the cause; any suppression is narrowly scoped and
      carries its justification.
- [ ] WCAG 2.1 AA verified: contrast measured in both editions, keyboard path
      exercised, reflow checked at 320px.
- [ ] `npm run build` is green: lint, format, docs, typecheck, and bundle.
- [ ] Behavior that the type system cannot prove was exercised by hand in a
      browser.
- [ ] README updated if behavior a human relies on changed; markdownlint passes.
- [ ] Committed only if the user asked (branch first if on the default branch).

## Where config lives

| Concern                                              | Home                                       |
| ---------------------------------------------------- | ------------------------------------------ |
| TypeScript strictness (the primary correctness gate) | [`tsconfig.json`](tsconfig.json)           |
| Lint rules, categories, plugins, type-aware options  | [`.oxlintrc.json`](.oxlintrc.json)         |
| Formatting                                           | [`.prettierrc.js`](.prettierrc.js)         |
| Markdown rules                                       | [`.markdownlint.json`](.markdownlint.json) |
| Bundling, loaders, output                            | [`webpack.config.js`](webpack.config.js)   |
| Babel presets (transpile only — never typechecks)    | [`.babelrc`](.babelrc)                     |
| Line endings (LF everywhere, enforced on checkout)   | [`.gitattributes`](.gitattributes)         |
