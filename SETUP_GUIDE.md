# CI/CD 配置指南

本指南说明如何配置 GitHub App 和相关的 secrets，以完成自动构建和部署流程。

## 第 1 步：创建 GitHub App

### 操作步骤

1. 进入 zed-tips organization 的 GitHub App 设置页面：
   https://github.com/organizations/zed-tips/settings/apps

2. 点击 **"New GitHub App"** 按钮

3. 填写表单信息：

   | 字段 | 值 |
   |------|-----|
   | **App name** | `zed-tips-ci` |
   | **Homepage URL** | `https://github.com/zed-tips` |
   | **Webhook → Active** | ❌ 取消勾选（不需要 webhook） |
   | **Permissions → Repository permissions → Contents** | `Read and write` |
   | **Permissions → Repository permissions → Actions** | `Read and write` |
   | **Where can this app be installed?** | ✅ Only on this account |

4. 点击 **"Create GitHub App"**

5. 生成私钥：
   - 在 App 页面找到 **"Private keys"** 部分
   - 点击 **"Generate a private key"**（会自动下载 `.pem` 文件）
   - 记下 **App ID**（在页面顶部，形如 `123456`）

### 在两个仓库中安装 App

1. 在 GitHub App 页面，点击 **"Install App"** 标签
2. 点击 zed-tips organization
3. 选择 **"Only select repositories"**
4. 选中以下两个仓库：
   - `zed-tips-data`
   - `zed.tips`
5. 点击 **"Install"**

---

## 第 2 步：配置 zed-tips-data 的 Secrets

### 操作步骤

1. 进入 zed-tips-data 仓库的 Secrets 设置：
   https://github.com/zed-tips/zed-tips-data/settings/secrets/actions

2. 点击 **"New repository secret"**

3. 创建第一个 secret（App ID）：
   - **Name**: `GH_APP_ID`
   - **Value**: 你刚记下的 App ID（如 `123456`）
   - 点击 **"Add secret"**

4. 再次点击 **"New repository secret"**

5. 创建第二个 secret（私钥）：
   - **Name**: `GH_APP_PRIVATE_KEY`
   - **Value**: 复制下载的 `.pem` 文件的全部内容（包括 `-----BEGIN RSA PRIVATE KEY-----` 和 `-----END RSA PRIVATE KEY-----`）
   - 点击 **"Add secret"**

> ⚠️ **安全提示**：
> - 私钥只会存储在 GitHub Secrets 中，不会在 logs 中显示
> - 不要将私钥提交到 git 仓库
> - `.pem` 文件可以本地删除

---

## 第 3 步：配置分支保护规则

### 在 zed-tips-data 中配置

1. 进入 zed-tips-data 的分支保护设置：
   https://github.com/zed-tips/zed-tips-data/settings/rules

2. 点击 **"New branch protection rule"** 或编辑现有的 `main` 规则

3. 配置以下选项：

   | 选项 | 状态 | 说明 |
   |------|------|------|
   | **Branch name pattern** | `main` | 保护 main 分支 |
   | **Require status checks to pass before merging** | ✅ 启用 | - |
   | **Require branches to be up to date before merging** | ✅ 启用 | 可选，提高安全性 |
   | **Status checks that are required** | ✅ `validate` | 从下拉列表中选择 `validate / validate` |

4. 点击 **"Create"** 或 **"Update"**

**效果**：
- 🔴 PR 验证失败 → PR 无法 merge（被系统阻止）
- 🟢 PR 验证成功 → PR 可以 merge

### 注意

- 首次配置时，GitHub 可能需要几分钟才能识别 workflow
- 如果看不到 workflow 在下拉列表中，请稍候一会儿再刷新

---

## 第 4 步：验证配置

### 测试 PR 验证

1. 创建一个测试分支：
   ```bash
   git checkout -b test/validation
   ```

2. 创建一个**格式错误的** tip 文件（用来测试验证失败的情况）：
   ```bash
   cat > tips/test-invalid.mdx << 'EOF'
   ---
   title: "Test Tip"
   # 缺少必须字段：subtitle, category, difficulty, tags, mediaType, mediaUrl, publishedAt
   ---
   
   This is a test.
   EOF
   ```

3. 提交并推送：
   ```bash
   git add tips/test-invalid.mdx
   git commit -m "test: invalid tip format"
   git push origin test/validation
   ```

4. 在 GitHub 上创建 PR：
   - 进入 https://github.com/zed-tips/zed-tips-data
   - 你应该会看到一个 "Compare & pull request" 按钮
   - 点击创建 PR

5. 观察 CI 结果：
   - 进入 PR 页面
   - 滚动到底部，应该看到红色的 ❌ 检查标记
   - 点击 "Details" 查看错误信息

### 测试完整流程

1. 修复 tip 文件，使其有效：
   ```bash
   cat > tips/test-valid.mdx << 'EOF'
   ---
   title: "Test Tip"
   subtitle: "A test tip for validation"
   category: "navigation"
   difficulty: "beginner"
   tags: ["test"]
   mediaType: "image"
   mediaUrl: "https://example.com/image.png"
   publishedAt: 2025-01-15
   ---
   
   This is a test.
   EOF
   ```

2. 提交修改：
   ```bash
   git add tips/test-valid.mdx
   git commit -m "test: valid tip format"
   git push
   ```

3. PR 应该显示绿色 ✅ 检查标记

4. Merge PR：
   - 点击 "Merge pull request"
   - 确认合并

5. 观察自动触发的 rebuild workflow：
   - 进入 zed-tips-data 的 **Actions** 标签页
   - 应该看到 `Trigger zed.tips Rebuild` workflow 正在运行
   - 同时进入 zed.tips 的 **Actions** 标签页
   - 应该看到 `Rebuild from Tips Data` workflow 正在运行

6. 验证 zed.tips 是否有新的 commit：
   - 进入 zed.tips 的 main 分支
   - 应该看到一个新的 commit：`chore: update community tips from zed-tips-data`

---

## 📋 完整的工作流程

```
开发者创建 PR
    ↓
GitHub Actions: validate-tips.yml
  ├─ 检查文件名格式（xx-xx-xx.mdx）
  ├─ 解析 YAML Front Matter
  └─ 验证所有必须字段和数据类型
    ↓
❌ 失败 → PR 红色 ❌，无法 merge
         开发者修复后重新推送
         ↓（回到第一步）

✅ 成功 → PR 绿色 ✅，可以 merge
         开发者点击 "Merge pull request"
    ↓
GitHub Actions: trigger-rebuild.yml
  └─ 生成 GitHub App token
     发送 repository_dispatch 事件到 zed.tips
    ↓
GitHub Actions: rebuild-from-tips-data.yml（在 zed.tips 中运行）
  ├─ 克隆最新的 zed-tips-data
  ├─ pnpm install && pnpm build
  └─ 提交并推送到 zed.tips main 分支
    ↓
Cloudflare Pages 自动检测 push
  └─ 自动构建和部署到 https://zed.tips
    ↓
✅ 完成！新的 tips 已发布
```

---

## 🔧 故障排除

### 问题 1：PR 验证显示 "No status checks found"

**原因**：GitHub 还没有识别 workflow

**解决方案**：
- 等待 5-10 分钟
- 刷新 PR 页面
- 检查 zed-tips-data 的 **Actions** 标签页，确保 `validate-tips.yml` 已存在

### 问题 2：`validate` 检查一直处于 "Pending" 状态

**原因**：可能是 workflow 还在运行

**解决方案**：
- 进入 zed-tips-data 的 **Actions** 标签页
- 点击最新的 `Validate Tips` workflow
- 查看实时日志了解进度

### 问题 3：验证失败，但错误信息不清楚

**解决方案**：
- 进入 PR 的 Checks 标签
- 点击 `validate / validate`
- 点击 "View more details on GitHub Actions"
- 查看完整的构建日志

### 问题 4：trigger-rebuild 没有触发 zed.tips 的重建

**原因**：可能是 GitHub App token 权限不足或 secrets 配置错误

**解决方案**：
- 检查 zed-tips-data 的 Secrets 是否正确配置
- 检查 GitHub App 是否在 zed.tips 中安装
- 查看 trigger-rebuild workflow 的详细日志
- 确保 GitHub App 有 `Actions: Read and write` 权限

---

## 📚 相关资源

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [GitHub App 文档](https://docs.github.com/en/developers/apps)
- [Repository Dispatch 事件](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#repository_dispatch)
- [Astro 文档](https://docs.astro.build)
- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
