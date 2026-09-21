[![Deploy](https://github.com/mka142/michalkulbacki.com/actions/workflows/deploy.yml/badge.svg)](https://github.com/mka142/michalkulbacki.com/actions/workflows/deploy.yml)

# Deployment

The site deploys itself.
Every push to `main` validates the HTML on a GitHub runner and copies `site/` to the production server over SSH.
Pull requests, tags and other branches do nothing.
The workflow can also be started by hand from the Actions tab, which deploys whatever `main` currently holds.

Workflow: [`.github/workflows/deploy.yml`](workflows/deploy.yml).

## What a run does

1. Checks out the repository.
2. Runs `npx html-validate@11` over `site/index.html` and `site/en/index.html`.
   A validation error stops the deploy.
   The generator pages under `site/stave-generator/`, `site/golden-chord/`, `site/tension-fader/` and `site/receipt-tracker/` vendor third-party markup and are not validated.
3. Uploads `site/` to `~/michalkulbacki.com/public_html/` on the server with `rsync -az --delete` over SSH.

There is no build step.
`site/` is the published site, byte for byte.

`--delete` means the server mirrors `site/` exactly, so files removed from the repository disappear from the server too.
`.htaccess` and `.well-known/` already on the server survive that deletion, so whatever the hosting panel put there stays.
Ship an `.htaccess` from `site/` and it overwrites the server copy as usual.

Deploys are serialized: a second push waits for the running deploy to finish instead of overlapping with it.

## Required GitHub secrets

Set these under **Settings - Secrets and variables - Actions - Repository secrets**.

| Secret | Value |
| --- | --- |
| `DEPLOY_HOST` | SSH host of the hosting account, from the dhosting panel. |
| `DEPLOY_PORT` | SSH port, from the dhosting panel. |
| `DEPLOY_USER` | SSH user of the hosting account. |
| `DEPLOY_SSH_KEY` | Private half of the deploy key, the whole PEM block including the header and footer lines. |
| `DEPLOY_KNOWN_HOSTS` | Server host key, so the runner can verify what it connects to. |

## One-time setup

Generate a key pair used only by this workflow, without a passphrase:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/michalkulbacki_deploy -C "github-actions deploy michalkulbacki.com" -N ""
```

Add the public half to the server, then confirm the tools the workflow needs are there and see exactly what the first `--delete` run will mirror over:

```bash
ssh-copy-id -i ~/.ssh/michalkulbacki_deploy.pub -p PORT USER@HOST
ssh -i ~/.ssh/michalkulbacki_deploy -p PORT USER@HOST 'rsync --version; ls -la ~/michalkulbacki.com/public_html'
```

That listing matters.
Anything on the server but not in `site/` is deleted by the first deploy, so compare the two before adding the secrets:

```bash
rsync -az -e "ssh -i $HOME/.ssh/michalkulbacki_deploy -p PORT" USER@HOST:michalkulbacki.com/public_html/ /tmp/mk-live/
diff -rq /tmp/mk-live/ site/
```

Commit the app directories the diff lists as server-only.
Leave everything else the hosting panel created, such as `.htaccess`, `.well-known/`, `cgi-bin/` or log files.
The rsync filters protect `.htaccess` and `.well-known/`; anything else the panel owns should be moved out of the document root rather than committed.

Collect the host key:

```bash
ssh-keyscan -p PORT HOST
```

Then fill the secrets: `DEPLOY_SSH_KEY` with `cat ~/.ssh/michalkulbacki_deploy`, `DEPLOY_KNOWN_HOSTS` with the `ssh-keyscan` output, and the rest with the values from the panel.
Keep the private key out of the repository.

## Checking a deploy

Runs are listed under the repository's **Actions** tab.
Each step prints its own log, so a failure points at the step that broke.
Re-run a failed deploy from that page once the cause is fixed.
