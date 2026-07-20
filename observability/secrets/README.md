# Alertmanager secrets

Alertmanager's config file has no native `${VAR}` environment-variable expansion — this was verified against the upstream docs while building this stack, not assumed. The real mechanism is a `_file`-suffixed config field reading from a mounted file, wired up via Docker Compose's file-based `secrets:`.

To enable email alerting, create `smtp_password.txt` in this directory (gitignored, never committed) containing just the SMTP password/app-password — the same one already in `gmao-backend/.env`'s `SMTP_PASS`:

```bash
echo -n "your-smtp-app-password" > observability/secrets/smtp_password.txt
```

`docker-compose.observability.yml` mounts this as a Docker secret at `/run/secrets/smtp_password`, which `observability/alertmanager.yml`'s `smtp_auth_password_file` points to. Without this file, the `alertmanager` service will fail to start — that's expected until you create it.
