# 私有化部署与跨端同步

VirtuaLink 原本是浏览器 `localStorage` 应用。自托管版本增加了：

- PostgreSQL 中的一份私有状态文档：Todo、日记、习惯、番茄钟、成就、剧情、亲密度及偏好都保留；
- 账号密码会话；每个账号的数据只在其已登录浏览器间同步；
- AI Passport 摘要接口：已配对设备可读取当前陪伴、未完成 Todo 和番茄钟状态。

## 本地 Docker 运行

```bash
cp .env.example .env
# 编辑 .env，替换所有密码和密钥
docker compose up -d --build
curl http://127.0.0.1:3060/api/health
```

在首页右上角点账号图标，注册账号或登录已有账号后才会启用跨端同步。第一个注册账号会自动接管此前单管理员版本的已有数据和设备配对；之后每个账号有独立的状态文档与设备令牌。首次登录会把该浏览器现有本地数据上传；之后由服务器版本同步到其他浏览器。同步采用 10 秒轮询与最后写入优先策略，因此不要同时编辑同一篇日记。

## Ubuntu（Tailscale 私有访问）

部署路径建议为 `/opt/apps/virtualink`。将项目和真实 `.env` 放入该目录后运行：

```bash
sudo docker compose up -d --build
curl http://127.0.0.1:3060/api/health
```

将 `VIRTUALINK_BIND_ADDRESS` 设置为 Ubuntu 主机的 Tailscale IP。这样端口只会绑定 Tailnet，而不是公网。PostgreSQL 不发布主机端口，数据保存于 Docker named volume `virtualink-postgres`。

当前的 Tailnet 访问使用私有 HTTP，因此 `VIRTUALINK_SECURE_COOKIE=false`。如果改用 HTTPS 反向代理或自有域名，必须将它改为 `true` 后重启服务。

## AI Passport 对接边界

`GET /api/passport/summary` 接受已登录账号会话或 `Authorization: Bearer <device-token>`，返回该账号已脱敏的当前角色、未完成 Todo 和番茄钟摘要。Passport 页面只对已登录账号显示；设备令牌由该页面一次性生成，并且只能读取其所属账号的数据。

AI Passport 的 NTAG213 是与 ESP32-C3 分离的被动标签：手机可手动写入一个短网址，但固件无法动态读写它。不要把设备令牌写进 NFC 标签，也不要把家用门卡内容写入该标签。实际 ESP32-C3 固件、网络传输与音频仍需在连接实物且可用 ESP-IDF 5.5.3 的环境中单独验证。
