# Antigravity provider: current diagnostic evidence

Environment observed on 2026-10-31:

- OpenCode CLI: `2.2.5`
- Configured provider package: `opencode-antigravity-auth@2.1.2`
- Test model: `google/antigravity-gemini-3.8-flash-high`
- Background service: `opencode-serve` reports `active` and listens on `127.0.0.1:4096`.

## Evidence from local logs

A prior session failed while draining with:

```text
AI.Error.UnknownProvider: Antigravity plugin has been disposed
  at runCredentialOperation (.../opencode-antigravity-auth/dist/src/v2.js:207:43)
```

A separate request failed with:

```text
AI_APICallError: The requested model is not supported.
```

The supplied command's restart only established service availability. It did not prove that the OAuth credential operation, plugin lifecycle, provider API call, or model ID worked.

## Correct test invocation

Use lowercase log levels and preserve the full output in a private local log (never commit it):

```bash
cd /home/archer/projects/passist
opencode run --log-level debug --print-logs \
  -m google/antigravity-gemini-3.8-flash-high \
  'Reply with exactly: OK'
```

The following is invalid because the CLI accepts lowercase values:

```bash
opencode run --log-level DEBUG ...
```

## Diagnosis order

1. Capture a single reproduction with `--log-level debug --print-logs` and note whether the terminal returns a structured error or simply times out.
2. Inspect the exact provider plugin entrypoint load/dispose lifecycle. Correlate the failing session ID with plugin load/unload events. The `Antigravity plugin has been disposed` exception specifically implicates lifecycle/disposal, not merely a bad model alias.
3. Check whether the selected model ID exists in the provider's live model catalog for installed plugin v2.1.2. The historical `requested model is not supported` response must be investigated independently; do not presume it is the same failure.
4. Compare a second model advertised by the same installed provider. If all Antigravity models fail similarly, prioritize provider lifecycle/auth; if only one fails, prioritize model catalog/alias drift.
5. Test against a fresh standalone OpenCode process only after recording the normal service result. Do not restart the persistent service repeatedly as a substitute for diagnosis.
6. Only then evaluate a provider-plugin version change, preserving the old version and OAuth account state for rollback.

## Safety

Never print or commit `antigravity-accounts.json`, OAuth credentials, access/refresh tokens, or account identifiers. Redact session and account identifiers from shared logs.

## Status

Not resolved by service restart. Current captured test ended on the 65-second timeout without a provider-level failure in the retained output. The older logs contain the two concrete errors above; a fresh isolated reproduction with complete correlation is still required before applying an auth-plugin fix.
