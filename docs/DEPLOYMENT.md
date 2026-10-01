# VirtuaLink 自动部署

生产发布只替换 app，不删除 PostgreSQL 数据卷或更换数据库密码。以下是待管理员审查的一次性安装说明，普通 CI 不应安装或更新特权入口。

## 信任边界

self-hosted runner 的 checkout、环境和提交参数均不可信。root 入口不接收任何参数，也不复制 runner 的文件。它使用 privileged Bash 禁止导入 BASH_ENV/函数，再清空环境，执行管理员安装的固定发布引擎，从 root 专用 Git 镜像获取固定仓库的 `main`；Compose 和 Dockerfile 来自管理员审查的 `/etc/virtualink`，不是 runner checkout。

`main` 是受信生产源：必须启用分支保护、禁止未经审查的直接推送，并对生产环境设置 required reviewers。获准进入 main 的构建代码仍能访问构建环境；只允许受信维护者批准发布，不要在这台 runner 上运行不可信 PR。runner 用户不得加入 docker 组、直接访问 Docker socket，或写入受信部署路径；这些权限本身等同于主机 root。CI 触发时可能发布 main 的最新获准提交，而非触发工作流的旧 SHA；发布输出记录实际 SHA。

## 管理员安装（不要在普通工作流中执行）

先单独备份现有发布文件并确认迁移策略。以下示例由管理员在审查代码后手动执行，不会自动修改 sudoers：

```bash
sudo install -o root -g root -m 0755 ops/virtualink-deploy.sh /usr/local/sbin/virtualink-deploy
sudo install -d -o root -g root -m 0755 /usr/local/libexec /etc/virtualink
sudo install -o root -g root -m 0755 ops/virtualink-deploy-release.sh /usr/local/libexec/virtualink-deploy-release
sudo install -o root -g root -m 0644 compose.yaml Dockerfile /etc/virtualink/
sudo install -d -o root -g root -m 0700 /var/lib/virtualink-deploy
```

管理员创建 root 所有、不可由 runner 写入的 `/etc/virtualink/deploy.conf`：

```text
repository=https://github.com/noir-hedgehog/virtualink.git
ref=refs/heads/main
```

`/opt/apps/virtualink`、`.env`、releases、受信配置、引擎及所有祖先路径必须 root 所有，且 group/other 不可写，无符号链接。保留现有 `.env` 的内容、密码和数据库卷；只经管理员审查调整所有权和权限。配置中至少包含 `POSTGRES_PASSWORD`、`VIRTUALINK_AUTH_SECRET`、`VIRTUALINK_BIND_ADDRESS`、`VIRTUALINK_SECURE_COOKIE`。私有源如需凭据必须由管理员单独管理，不能接受 runner 提供的 Git 配置或凭据路径。

管理员审查的 sudoers 可只允许无参数入口（sudoers 的 `""` 表示不允许参数）：

```text
gha-deploy ALL=(root) NOPASSWD: /usr/local/sbin/virtualink-deploy ""
```

使用 `visudo` 验证；不要使用允许任意参数的通配规则。入口自身也拒绝参数。root 安装文件的更改需要独立管理员审查，不能由仓库工作流自更新。

## 发布与回滚

runner 标签为 `virtualink-prod`。每次发布从受信 main 获取实际 SHA，将快照保存在 `/opt/apps/virtualink/releases/<SHA>`。应用镜像为 `virtualink-app:<SHA>`；构建完成后使用 `--no-build` 启动，成功健康检查后才更新 current 链接。失败时从上一发布的 `.revision` 获取原镜像标签，禁止重新构建或拉取回滚镜像。单次健康 HTTP 请求限制 5 秒；Docker exec 在 8 秒后终止、再过 2 秒强制结束，最多尝试 30 次，避免无限等待而不回滚。保留上一版本目录与镜像，不要清理尚在回滚范围内的镜像。

旧部署没有 `.revision` 时无法自动回滚：首次迁移前必须建立并验证管理员批准的带版本基线，或准备手动恢复步骤。不要把首次迁移当作已有自动回滚保障。

Compose 使用离散 `PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSWORD`，密码的 `@:/?#%` 等字符不再被 URI 解释。保留现有密码和 named volume；独立配置仍兼容 `DATABASE_URL`，但 PGHOST 存在时离散字段优先。

数据库迁移需独立设计与审查，不得把重建/删卷加入普通发布。
