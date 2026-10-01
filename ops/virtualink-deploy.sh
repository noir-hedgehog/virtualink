#!/bin/bash -p
# Install this fixed entry as root; never execute a runner checkout as root.
set -Eeuo pipefail
[[ $# == 0 ]] || { echo 'This entry accepts no arguments' >&2; exit 2; }
exec /usr/bin/env -i PATH=/usr/sbin:/usr/bin:/sbin:/bin HOME=/root \
  /bin/bash -p /usr/local/libexec/virtualink-deploy-release
