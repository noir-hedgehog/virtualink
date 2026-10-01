#!/bin/bash
set -Eeuo pipefail
[[ $# == 0 ]] || exit 2
[[ $(id -u) == 0 ]] || { echo 'Root entry required' >&2; exit 2; }
export PATH=/usr/sbin:/usr/bin:/sbin:/bin HOME=/root
export GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null
config_dir=/etc/virtualink
app_root=/opt/apps/virtualink
source_dir=/var/lib/virtualink-deploy
# Reject symlinks and runner-writable ancestors, including configuration/source.
trusted_path() {
  local path="$1" uid mode
  while [[ "$path" != / ]]; do
    [[ -e "$path" && ! -L "$path" ]] || return 1
    read -r uid mode < <(stat -c '%u %a' "$path")
    [[ "$uid" == 0 && $((8#$mode & 022)) == 0 ]] || return 1
    path=$(dirname "$path")
  done
}
for path in "$config_dir/deploy.conf" "$config_dir/compose.yaml" "$config_dir/Dockerfile" "$source_dir" "$app_root" "$app_root/.env"; do
  trusted_path "$path" || { echo "Untrusted deployment path: $path" >&2; exit 2; }
done
# Data, never sourced shell; only the administrator can choose the trusted source.
repository=$(sed -n 's/^repository=//p' "$config_dir/deploy.conf")
ref=$(sed -n 's/^ref=//p' "$config_dir/deploy.conf")
[[ "$repository" == https://github.com/noir-hedgehog/virtualink.git && "$ref" == refs/heads/main ]] || { echo 'Unapproved deployment source' >&2; exit 2; }
exec 9>"$source_dir/deploy.lock"
flock -n 9 || { echo 'Deployment already running' >&2; exit 1; }
repo="$source_dir/source.git"
[[ -d "$repo" ]] || git init --bare "$repo" >/dev/null
trusted_path "$repo" || exit 2
git --git-dir="$repo" -c core.hooksPath=/dev/null fetch --no-tags "$repository" "$ref"
revision=$(git --git-dir="$repo" rev-parse FETCH_HEAD)
[[ "$revision" =~ ^[0-9a-f]{40}$ ]] || exit 2
release="$app_root/releases/$revision"
mkdir -p "$release"
trusted_path "$release" || exit 2
# Build from a root-owned snapshot, never from GITHUB_WORKSPACE.
git --git-dir="$repo" archive "$revision" | tar --no-same-owner --no-same-permissions -xf - -C "$release"
# Deployment instructions are administrator-controlled, not downloaded code.
rm -f "$release/compose.yaml" "$release/Dockerfile" "$release/.env"
install -m 0644 "$config_dir/compose.yaml" "$release/compose.yaml"
install -m 0644 "$config_dir/Dockerfile" "$release/Dockerfile"
ln -s "$app_root/.env" "$release/.env"
printf '%s\n' "$revision" > "$release/.revision"
previous=''
[[ ! -L "$app_root/current" ]] || previous=$(readlink -f "$app_root/current")
compose() {
  local dir="$1"; shift
  local version
  version=$(cat "$dir/.revision")
  [[ "$version" =~ ^[0-9a-f]{40}$ ]] || return 2
  local command=(docker compose --project-name virtualink --project-directory "$dir" --file "$dir/compose.yaml")
  # Bound Docker exec as well as fetch: a hung daemon must not hold the lock forever.
  if [[ "${1:-}" == exec ]]; then command=(timeout --kill-after=2s 8s "${command[@]}"); fi
  VIRTUALINK_IMAGE="virtualink-app:$version" "${command[@]}" "$@"
}
healthcheck() {
  local dir="$1" attempt
  for attempt in $(seq 1 30); do
    if compose "$dir" exec -T app node -e "fetch('http://127.0.0.1:3000/api/health',{signal:AbortSignal.timeout(5000)}).then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" >/dev/null 2>&1; then return 0; fi
    sleep 2
  done
  return 1
}
# A revision tag is write-once; never rebuild an existing rollback image.
build_release() {
  docker image inspect "virtualink-app:$revision" >/dev/null 2>&1 || compose "$release" build app
}
if build_release && compose "$release" up -d --no-build app && healthcheck "$release"; then
  ln -sfn "$release" "$app_root/current"
  echo "VirtuaLink deployed: $revision"
  exit 0
fi
echo 'Deployment failed; restoring previous immutable image' >&2
if [[ "$previous" == "$app_root/releases/"* && -f "$previous/.revision" ]]; then
  trusted_path "$previous" || exit 2
  compose "$previous" up -d --no-build --pull never app
  healthcheck "$previous" || { echo 'Rollback health check failed' >&2; exit 1; }
else
  echo 'No versioned rollback target; manual recovery required' >&2
fi
exit 1
