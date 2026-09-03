# VirtuaLink 自动部署

VirtuaLink 的生产服务运行在 Ubuntu 的 `/opt/apps/virtualink`，通过 Tailscale IP 提供访问。应用使用 Docker Compose，PostgreSQL 使用 named volume；发布只替换 app，不删除数据库容器或数据卷。

## 一次性配置 Ubuntu

在服务器上安装一个只用于本仓库生产发布的 GitHub Actions self-hosted runner，标签设置为：

```text
virtualink-prod
```

建议使用专用 runner 用户。将本仓库的 `ops/virtualink-deploy.sh` 安装为 root 所有：

```bash
sudo install -o root -g root -m 0755 ops/virtualink-deploy.sh /usr/local/sbin/virtualink-deploy
```

为 runner 用户增加一条仅允许调用该发布脚本的 sudo 规则，例如 `/etc/sudoers.d/virtualink-deploy`：

```text
gha-deploy ALL=(root) NOPASSWD: /usr/local/sbin/virtualink-deploy *
```

检查语法：

```bash
sudo visudo -cf /etc/sudoers.d/virtualink-deploy
```

保留现有 `/opt/apps/virtualink/.env`，不要把它复制进仓库。至少包括：

```text
POSTGRES_PASSWORD=...
VIRTUALINK_AUTH_SECRET=...
VIRTUALINK_BIND_ADDRESS=100.79.187.62
VIRTUALINK_SECURE_COOKIE=false
```

## GitHub 配置

在仓库 Settings → Environments 创建 `production`。稳定前可以配置 Required reviewers；确认发布稳定后，可以取消审批实现完全自动发布。只允许 `main` 分支部署。

工作流会先在 GitHub 托管 runner 上执行 `npm ci` 和 `npm run build`，通过后再由 Ubuntu runner 发布。发布版本按 Git commit SHA 存放在 `/opt/apps/virtualink/releases/`，新版本健康检查失败时自动恢复上一个版本。

## 日常流程

```text
提交或合并到 main
→ 构建与类型检查
→ Ubuntu runner 部署 app
→ /api/health 检查
→ 成功保留版本，失败回滚
```

数据库迁移如果未来需要，应另行增加可回滚的 migration 步骤；不要把数据库删除或重建放进普通发布脚本。
