# ligmax-website

This site is one of three in the `diagla_main` workspace one level up.

**Read the workspace docs before writing:** `../CLAUDE.md` (the rules), `../REPOS.md`
(the repo map and shared conventions), `../MOBULA_BRIEF.md` (facts and copy rules for the
sister site) and `../WORKLOG.md` (recent history). Facts are duplicated across the three
sites by hand, so a change here often needs the same change there.

Two rules worth having in front of you before the first edit:

- **No em dashes** (U+2014) anywhere: copy, code comments, docs, commit messages. Use a
  comma, a colon, parentheses or two sentences. A `PreToolUse` hook in
  `../.claude/settings.json` rejects writes that contain one.
- **Do not invent numbers or specs.** If a figure was not supplied, the site says nothing.

Build with `npx astro build` and confirm it is clean before reporting done. Publishing is
`git push` to `main`; Cloudflare Pages builds from GitHub. There is no upload step.
