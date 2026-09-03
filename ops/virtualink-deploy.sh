#!/usr/bin/env bash
set -Eeuo pipefail

app_root="/opt/apps/virtualink"
releases_dir="$app_root/releases"
current_link="$app_root/current"
project_name="virtualink"

commit_sha="${1:-}"
workspace="${2:-}"

if [[ ! "$commit_sha" =~ ^[0-9a-f]{40}$ ]]; then
  echo "Invalid commit SHA" >&2
  exit 2
fi
if [[ ! -d "$workspace" || ! -f "$workspace/compose.yaml" || ! -d "$workspace/.git" ]]; then
  echo "Invalid GitHub Actions workspace" >&2
  exit 2
fi
if [[ "$(git -C "$workspace" rev-parse HEAD)" != "$commit_sha" ]]; then
  echo "Workspace commit does not match requested deployment" >&2
  exit 2
fi

mkdir -p "$releases_dir"
release_dir="$releases_dir/$commit_sha"
mkdir -p "$release_dir"
rsync -a --delete --exclude '.env' --exclude 'node_modules' --exclude '.next' "$workspace/" "$release_dir/"
ln -sfn "$app_root/.env" "$release_dir/.env"

previous_dir=""
if [[ -L "$current_link" ]]; then
  previous_dir="$(readlink -f "$current_link")"
fi
ln -sfn "$release_dir" "$current_link"

compose() {
  docker compose --project-name "$project_name" --file "$1/compose.yaml" "${@:2}"
}

healthcheck() {
  local dir="$1"
  local attempt
  for attempt in $(seq 1 30); do
    if compose "$dir" exec -T app node -e \
      "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" \
      >/dev/null 2>&1; then
      return 0
    fi
    sleep 2
  done
  return 1
}

if compose "$release_dir" up -d --build app && healthcheck "$release_dir"; then
  echo "VirtuaLink deployed: $commit_sha"
  exit 0
fi

echo "Deployment failed; attempting rollback" >&2
if [[ -n "$previous_dir" && -f "$previous_dir/compose.yaml" ]]; then
  ln -sfn "$previous_dir" "$current_link"
  compose "$previous_dir" up -d app || true
  healthcheck "$previous_dir" || true
fi
exit 1
