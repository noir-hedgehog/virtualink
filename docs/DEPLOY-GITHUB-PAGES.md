# 部署到 GitHub Pages（virtualink 仓库）

仓库地址：<https://github.com/noir-hedgehog/virtualink>  
部署后访问：**https://noir-hedgehog.github.io/virtualink/**

## 步骤一：关联远程并推送

在项目根目录执行（如已有关联可跳过或改 `origin`）：

```bash
# 添加远程（若还没有）
git remote add origin https://github.com/noir-hedgehog/virtualink.git

# 若已有 origin 但指向别的地址，可改为：
# git remote set-url origin https://github.com/noir-hedgehog/virtualink.git

# 推送到 main（仓库名为 virtualink，workflow 会自动用 BASE_PATH=/virtualink）
git push -u origin main
```

若远程已有内容（如 README/LICENSE），需要先拉再合或强制推送，例如：

```bash
git pull origin main --rebase   # 有冲突再处理
git push -u origin main
# 或强制覆盖远程： git push -u origin main --force
```

## 步骤二：开启 GitHub Pages

1. 打开 <https://github.com/noir-hedgehog/virtualink>
2. **Settings** → 左侧 **Pages**
3. **Build and deployment** → **Source** 选择 **GitHub Actions**
4. 保存后无需再选具体 workflow，推送后会自动用仓库里的 `Deploy to GitHub Pages`

## 步骤三：触发部署

- 推送或合并到 **main** 分支后，Actions 会自动运行 **Deploy to GitHub Pages**
- 在仓库 **Actions** 里可查看运行状态
- 成功完成后访问：**https://noir-hedgehog.github.io/virtualink/**

## 说明

- 当前 workflow 使用 `BASE_PATH=/${{ github.event.repository.name }}`，即 `/virtualink`，与项目站地址一致
- 若将来改为用户站（如 `noir-hedgehog.github.io` 仓库），需在 workflow 里把 `BASE_PATH` 改为空并重新部署
