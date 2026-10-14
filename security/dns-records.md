# DNS records to add

These are the only findings from the security review that cannot be fixed in
code. They are DNS changes on domains you control, so they are yours to make —
I have deliberately not touched DNS.

Everything here was measured against live DNS on 2026-10-14 via
`cloudflare-dns.com/dns-query`, not assumed.

---

## 1. Email spoofing — the real finding

**`bollamrishithej.com` has no SPF and no DMARC record, and no MX.**

A domain that sends no mail is the *easiest* domain in the world to spoof,
because nothing contradicts a forged sender. Today anyone can send mail as
`rishithej@bollamrishithej.com` and most receivers will accept it. For someone
whose public identity is the asset — a founder who is emailed by investors,
partners and institutions — that is the most consequential issue found, and it
is not on the website at all.

The fix for a non-sending domain is to say so explicitly.

| Type | Name | Value | TTL |
|---|---|---|---|
| TXT | `@` | `v=spf1 -all` | Auto |
| TXT | `_dmarc` | `v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s; rua=mailto:rishi@mldynamic.com; fo=1` | Auto |
| TXT | `*._domainkey` | `v=DKIM1; p=` | Auto |

- `v=spf1 -all` means "no host is authorised to send mail for this domain".
  A hard fail, because nothing legitimate sends from here.
- `p=reject` tells receivers to reject outright rather than quarantine.
  `sp=reject` extends it to subdomains, which is what a spoofer tries next.
- The wildcard DKIM record with an empty key states that no DKIM key is
  published, which closes the last loophole.
- `rua=` sends you aggregate reports. Expect spoofing attempts to appear in
  them; that is the point.

**If you ever want mail on this domain**, these three records must be replaced
first or your own mail will bounce. That is the one risk here, and it is worth
accepting: the far likelier event is someone impersonating you.

### `mldynamic.com` — your actual mail domain

It has SPF (`v=spf1 include:zohomail.in ~all`) but **no DMARC**, so there is no
policy and no reporting. SPF alone does not stop display-name spoofing.

| Type | Name | Value |
|---|---|---|
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:rishi@mldynamic.com; fo=1` |

Start at `p=none`. It changes nothing about delivery and only turns on
reporting. Read the reports for two to four weeks, confirm every legitimate
sender passes, then move to `p=quarantine` and finally `p=reject`. Going
straight to `p=reject` on a live mail domain risks dropping your own mail.

Also tighten SPF from `~all` (softfail) to `-all` once the DMARC reports have
confirmed Zoho is the only sender.

---

## 2. Certificate issuance is unrestricted

Neither domain has a **CAA** record, so any certificate authority in the world
may issue a certificate for them. CAA restricts that to the ones you actually
use. The live certificate is issued by Google Trust Services, and Cloudflare
also uses Let's Encrypt and SSL.com, so all three are authorised below.

| Type | Name | Flags | Tag | Value |
|---|---|---|---|---|
| CAA | `@` | 0 | `issue` | `pki.goog` |
| CAA | `@` | 0 | `issue` | `letsencrypt.org` |
| CAA | `@` | 0 | `issue` | `ssl.com` |
| CAA | `@` | 0 | `issuewild` | `pki.goog` |
| CAA | `@` | 0 | `issuewild` | `letsencrypt.org` |
| CAA | `@` | 0 | `issuewild` | `ssl.com` |
| CAA | `@` | 0 | `iodef` | `mailto:rishi@mldynamic.com` |

Apply to both domains. Get this wrong and certificate renewal fails, so if you
later move off Cloudflare, update CAA *before* the migration.

---

## 3. DNSSEC is off for `bollamrishithej.com`

`mldynamic.com` is signed. `bollamrishithej.com` is not, which leaves it open
to DNS answer forgery on the resolution path. In the Cloudflare dashboard:
**DNS → Settings → DNSSEC → Enable**, then add the supplied DS record at your
registrar. It is two steps and the second one is easy to forget; until the DS
record is at the registrar, DNSSEC is not actually on.

---

## 4. HSTS preload — a separate, manual step

The site now sends:

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

The `preload` token is a *request*, not an enrolment. To have the domain built
into browsers' HTTPS-only lists, submit it at
[hstspreload.org](https://hstspreload.org/).

Understand the commitment before you do: once preloaded, **every** present and
future subdomain of `bollamrishithej.com` must serve valid HTTPS, in every
browser, and removal takes months. That is already true today, so the
submission is safe — but do not submit if you plan to run a plain-HTTP
subdomain for anything.

---

## Priority

1. **`bollamrishithej.com` SPF + DMARC + null DKIM.** Impersonation is the
   live risk and this closes it today.
2. **`mldynamic.com` DMARC at `p=none`.** Reporting on your real mail domain.
3. **CAA on both.** Five minutes, removes a whole class of mis-issuance.
4. **DNSSEC on `bollamrishithej.com`.**
5. **HSTS preload submission**, once you have read the commitment above.

---

## Subdomains in use

| Name | Serves | Managed by |
|---|---|---|
| `intake.bollamrishithej.com` | Private intake form (Worker `rishithej-intake`, source in `intake/`) | Workers custom domain. Cloudflare created the DNS record and certificate automatically; do not edit or delete it in the DNS tab. Removing the `routes` entry in `intake/wrangler.toml` and redeploying removes it. |

It serves valid HTTPS, so it is compatible with the HSTS preload commitment
above. It is `noindex` and disallowed in its own `robots.txt`.
