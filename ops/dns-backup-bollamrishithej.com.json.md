# Cutover record — bollamrishithej.com

**2026-09-28.** Apex moved from Hostinger to Cloudflare Pages
(project `bollam-rishithej`).

## What changed
- Deleted: 2x A and 2x AAAA on the apex (Hostinger), and the
  `www -> www.bollamrishithej.com.cdn.hstgr.net` CNAME.
- Created: `CNAME bollamrishithej.com -> bollam-rishithej.pages.dev` (proxied)
  and the same for `www`.
- Attached both hostnames to the Pages project.
- `Always Use HTTPS` turned **on** — it was off, so `http://` was being served
  plaintext rather than upgraded.
- Dynamic redirect rule: `www` 301s to the apex, preserving path and query.
- Left untouched: `ftp.bollamrishithej.com` (not web hosting).

## Rolling back
Recreate the records in `dns-backup-bollamrishithej.com.json`, delete the two
Pages CNAMEs, and remove the www redirect rule. The previous host still holds
the old site's files — only DNS moved.

## Canonical host
Apex. Every canonical, `og:url`, sitemap entry and JSON-LD `@id` points at
`https://bollamrishithej.com`. Do not reintroduce `pages.dev` URLs into the
markup; the `*.pages.dev` subdomain still resolves but is not canonical.

## Update — ftp record removed

`A ftp.bollamrishithej.com -> 82.180.142.59` (Hostinger FTP) was deleted on
2026-09-28, after the web cutover. It is preserved in the JSON backup alongside
the web records and can be recreated the same way.

Note this does not remove FTP access to the Hostinger account — that is reached
via Hostinger's own hostname or IP from hPanel, not through this zone. Only the
vanity `ftp.` alias on this domain is gone.

The zone is now exactly two records, both pointing at Cloudflare Pages:

    CNAME bollamrishithej.com      -> bollam-rishithej.pages.dev  (proxied)
    CNAME www.bollamrishithej.com  -> bollam-rishithej.pages.dev  (proxied)
