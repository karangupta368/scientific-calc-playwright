#!/usr/bin/env bash
# Exports the Zscaler (or other corporate) root CA from macOS Keychain so Node.js
# and Playwright can download browsers behind SSL inspection.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CERT_DIR="${ROOT_DIR}/certs"
CERT_FILE="${CERT_DIR}/corporate-root.pem"
KEYCHAIN="${KEYCHAIN:-/Library/Keychains/System.keychain}"
CA_NAME="${CA_NAME:-Zscaler Root CA}"

mkdir -p "${CERT_DIR}"

if security find-certificate -a -c "${CA_NAME}" -p "${KEYCHAIN}" > "${CERT_FILE}" 2>/dev/null; then
  echo "Exported '${CA_NAME}' to ${CERT_FILE}"
else
  echo "Could not find '${CA_NAME}' in ${KEYCHAIN}." >&2
  echo "Export your corporate root CA manually to ${CERT_FILE}, then re-run:" >&2
  echo "  export NODE_EXTRA_CA_CERTS=${CERT_FILE}" >&2
  echo "  npx playwright install" >&2
  exit 1
fi

echo ""
echo "Add to your shell profile or .env:"
echo "  export NODE_EXTRA_CA_CERTS=${CERT_FILE}"
echo ""
echo "Then install browsers:"
echo "  npx playwright install"
