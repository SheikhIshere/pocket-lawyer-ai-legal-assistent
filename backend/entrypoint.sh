#!/bin/sh
set -e

SECRETS_FILE=/data/app-secrets.env

# Backend generates the keys once; the worker waits for the same file.
if [ "${GENERATE_SECRETS:-0}" = "1" ] && [ ! -f "$SECRETS_FILE" ]; then
    python - <<'PY'
import base64
import os
import secrets

secret_key = secrets.token_urlsafe(48)
fernet_key = base64.urlsafe_b64encode(os.urandom(32)).decode()
tmp = "/data/.app-secrets.tmp"
with open(tmp, "w") as fh:
    fh.write(f"SECRET_KEY={secret_key}\n")
    fh.write(f"DJANGO_CRYPTO_KEY={fernet_key}\n")
os.replace(tmp, "/data/app-secrets.env")
PY
fi

while [ ! -f "$SECRETS_FILE" ]; do
    sleep 1
done

set -a
. "$SECRETS_FILE"
set +a

exec "$@"
