# ✅ 部署前检查清单

完成以下步骤以确保 CI/CD 系统正常工作。

## 第一阶段：GitHub App 配置（必须）

- [ ] **1.1 创建 GitHub App**
  - 网址：https://github.com/organizations/zed-tips/settings/apps
  - App 名称：`zed-tips-ci`
  - 权限：`Contents: Read and write`，`Actions: Read and write`
  - ✏️ 记录 App ID：________________

- [ ] **1.2 生成私钥**
  - 在 App 页面找到 "Private keys"
  - 点击 "Generate a private key"
  - ✏️ 文件已保存且妥善保管

- [ ] **1.3 安装 App 到两个仓库**
  - 在 App 页面点击 "Install App"
  - 选择 zed-tips organization
  - 勾选：`zed-tips-data` 和 `zed.tips`
  - 完成安装

## 第二阶段：Secrets 配置（必须）

- [ ] **2.1 配置 GH_APP_ID**
  - 网址：https://github.com/zed-tips/zed-tips-data/settings/secrets/actions
  - Secret 名称：`GH_APP_ID`
  - Secret 值：（你在 1.1 中记录的 App ID）

- [ ] **2.2 配置 GH_APP_PRIVATE_KEY**
  - 网址：同上
  - Secret 名称：`GH_APP_PRIVATE_KEY`
  - Secret 值：（从 .pem 文件复制全部内容）
  - ⚠️ 确保包含 `-----BEGIN RSA PRIVATE KEY-----` 和 `-----END RSA PRIVATE KEY-----`

- [ ] **2.3 验证 Secrets 已保存**
  - 刷新 Secrets 页面
  - 应该看到两个已配置的 secrets（内容用星号隐藏）

## 第三阶段：分支保护规则（推荐但可选）

- [ ] **3.1 配置分支保护规则**
  - 网址：https://github.com/zed-tips/zed-tips-data/settings/rules
  - 编辑或创建 `main` 分支规则
  - 启用 "Require status checks to pass before merging"
  - 等待 5-10 分钟，使 GitHub 识别 workflow
  - 在下拉列表中选择 `validate / validate`
  - 点击 "Create" 或 "Update"

## 第四阶段：功能测试

- [ ] **4.1 验证失败测试**
  - 创建分支：`git checkout -b test/validation-fail`
  - 创建无效 tip（缺少字段）：
    ```bash
    cat > tips/test-fail.mdx << 'EOF'
    ---
    title: "Test"
    ---
    Content
    EOF
    ```
  - 提交并推送
  - 创建 PR
  - ✅ 预期：PR 显示红色 ❌ `validate` 检查失败
  - ✅ 预期：无法点击 "Merge pull request" 按钮

- [ ] **4.2 验证成功测试**
  - 创建分支：`git checkout -b test/validation-success`
  - 创建有效 tip：
    ```bash
    cat > tips/test-success.mdx << 'EOF'
    ---
    title: "Test Tip"
    subtitle: "A test"
    category: "navigation"
    difficulty: "beginner"
    tags: ["test"]
    mediaType: "image"
    mediaUrl: "https://example.com/image.png"
    publishedAt: 2025-01-15
    ---
    
    Content here.
    EOF
    ```
  - 提交并推送
  - 创建 PR
  - ✅ 预期：PR 显示绿色 ✅ `validate` 检查成功
  - ✅ 预期：可以点击 "Merge pull request" 按钮

- [ ] **4.3 完整流程测试**
  - 继续使用 4.2 中有效的 PR
  - 点击 "Merge pull request"
  - 进入 https://github.com/zed-tips/zed-tips-data/actions
  - ✅ 预期：看到 `Trigger zed.tips Rebuild` workflow 正在运行
  - 进入 https://github.com/zed-tips/zed.tips/actions
  - ✅ 预期：看到 `Rebuild from Tips Data` workflow 正在运行
  - 等待 2-3 分钟
  - 进入 https://github.com/zed-tips/zed.tips
  - ✅ 预期：main 分支有新的 commit `chore: update community tips from zed-tips-data`
  - 等待 1-2 分钟
  - 进入 https://zed.tips
  - ✅ 预期：网站已更新，包含新的 tip

## 第五阶段：清理测试数据

- [ ] **5.1 删除测试 tips**
  - 创建分支：`git checkout -b cleanup/remove-test-tips`
  - 删除测试文件：
    ```bash
    git rm tips/test-fail.mdx tips/test-success.mdx
    ```
  - 提交：`git commit -m "cleanup: remove test tips"`
  - 推送并创建 PR
  - Merge PR
  - 等待自动重建完成

- [ ] **5.2 验证生产环境**
  - 进入 https://zed.tips
  - ✅ 确认测试 tips 已删除

## 故障排除

如果遇到问题，按照以下步骤排查：

### ❌ "No status checks found"

- [ ] 等待 5-10 分钟，GitHub 需要时间识别 workflow
- [ ] 检查 zed-tips-data 的 **Actions** 标签，确认 workflows 存在
- [ ] 刷新 PR 页面

### ❌ "validate 检查一直 Pending"

- [ ] 点击 PR 上 `validate` 的 "Details"
- [ ] 查看 GitHub Actions 日志
- [ ] 检查是否有运行时错误

### ❌ "trigger-rebuild 没有运行"

- [ ] 检查 zed-tips-data 的 Secrets 是否正确配置
- [ ] 检查 GitHub App 是否在 zed.tips 中安装
- [ ] 查看 `Trigger zed.tips Rebuild` workflow 的详细日志

### ❌ "Validation 报错但不清楚原因"

- [ ] 在 PR 的 "Checks" 标签点击 `validate / validate`
- [ ] 点击 "View more details on GitHub Actions"
- [ ] 查看 "Run pnpm validate:tips" 的完整输出

## 完成标记

- [ ] **所有必须配置完成** ✅
- [ ] **所有测试通过** ✅
- [ ] **生产环境就绪** ✅

---

## 📋 配置信息记录

请妥善保管以下信息：

| 项目 | 值 | 安全性 |
|------|-----|--------|
| **GitHub App ID** | `_______________` | 公开 |
| **GH_APP_ID Secret** | ✅ 已配置 | 仅在 zed-tips-data Secrets 中 |
| **GH_APP_PRIVATE_KEY Secret** | ✅ 已配置 | 仅在 zed-tips-data Secrets 中，已删除本地副本 |

## 下一步

完成上述所有步骤后：

1. 阅读 `QUICK_START.md` 了解如何提交新 tip
2. 开始接收社区贡献
3. 定期检查 GitHub Actions 日志，确保一切正常

---

**检查完成日期**：________________  
**检查人员**：________________  
**备注**：
```
_________________________________________________________________
_________________________________________________________________
```
