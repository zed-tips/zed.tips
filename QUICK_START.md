# 快速开始指南

## ⚡ 5 分钟快速配置

### 第 1 步：创建 GitHub App（3 分钟）

1. 打开 https://github.com/organizations/zed-tips/settings/apps
2. 点击 "New GitHub App"
3. 填写：
   - App name: `zed-tips-ci`
   - Homepage URL: `https://github.com/zed-tips`
4. 权限设置：
   - Contents: `Read and write`
   - Actions: `Read and write`
5. 点击 "Create GitHub App"
6. **重要**：生成私钥
   - 找到 "Private keys" → "Generate a private key"
   - 记下 App ID（页面顶部）
   - 下载的 .pem 文件稍后需要

### 第 2 步：安装 App 到两个仓库（1 分钟）

1. 在 App 页面点击 "Install App"
2. 选择 zed-tips organization
3. 选择 "Only select repositories"
4. 勾选：`zed-tips-data` 和 `zed.tips`
5. 点击 "Install"

### 第 3 步：配置 Secrets（1 分钟）

进入 zed-tips-data 的 Secrets 设置：
https://github.com/zed-tips/zed-tips-data/settings/secrets/actions

**添加 Secret 1**：
- Name: `GH_APP_ID`
- Value: 你的 App ID（如 `123456`）

**添加 Secret 2**：
- Name: `GH_APP_PRIVATE_KEY`
- Value: `.pem` 文件的全部内容

---

## 🧪 验证配置

### 测试 1：验证成功

```bash
# 在本地创建一个有效的 tip
cat > tips/test-valid.mdx << 'EOF'
---
title: "Test Tip"
subtitle: "Testing CI validation"
category: "navigation"
difficulty: "beginner"
tags: ["test"]
mediaType: "image"
mediaUrl: "https://example.com/test.png"
publishedAt: 2025-01-15
---

This is a test tip.
EOF

# 推送到新分支
git checkout -b test/ci-validation
git add tips/test-valid.mdx
git commit -m "test: valid tip"
git push origin test/ci-validation
```

然后：
1. 进入 GitHub 的 Pull Requests
2. 创建 PR
3. 应该看到绿色 ✅ 的 `validate` 检查
4. Merge PR
5. 进入 Actions 页面观察 `Trigger zed.tips Rebuild` 和 `Rebuild from Tips Data` workflow

### 测试 2：验证失败

创建一个 **缺少字段** 的 tip：

```bash
cat > tips/test-invalid.mdx << 'EOF'
---
title: "Invalid Tip"
---

Missing required fields!
EOF

git checkout -b test/invalid
git add tips/test-invalid.mdx
git commit -m "test: invalid tip"
git push origin test/invalid
```

应该看到红色 ❌ 的 `validate` 检查和详细的错误信息。

---

## 📝 提交 Tip 的完整流程

```bash
# 1. 创建功能分支
git checkout -b feature/my-tip-name

# 2. 创建 tip 文件（使用 kebab-case）
cat > tips/my-awesome-navigation-tip.mdx << 'EOF'
---
title: "Quick Navigation with Cmd+P"
subtitle: "Learn the fastest way to navigate files"
category: "navigation"
difficulty: "beginner"
tags: ["keyboard", "navigation", "productivity"]
mediaType: "image"
mediaUrl: "https://zed.tips/debugger.webp"
publishedAt: 2025-01-15
---

## How to Use

1. Press Cmd+P (macOS) or Ctrl+P (Linux/Windows)
2. Type the filename
3. Press Enter

## Pro Tips

- Use fuzzy search
- Type `/` for directory navigation

---
EOF

# 3. 提交
git add tips/my-awesome-navigation-tip.mdx
git commit -m "feat: add navigation tip"

# 4. 推送
git push origin feature/my-tip-name

# 5. 在 GitHub 上创建 PR
# 6. 等待 CI 验证通过（绿色 ✅）
# 7. Merge PR
# 8. 等待自动部署（2-3 分钟）
# 9. 检查 https://zed.tips，新 tip 已发布！
```

---

## 🎯 Tip 文件格式

### 必须字段

| 字段 | 类型 | 示例 |
|------|------|------|
| `title` | string | `"Quick File Navigation"` |
| `subtitle` | string | `"Learn to navigate files faster"` |
| `category` | string | `"navigation"` |
| `difficulty` | string | `"beginner"` |
| `tags` | array | `["keyboard", "workflow"]` |
| `mediaType` | enum | `"image"` 或 `"video"` |
| `mediaUrl` | string | `"https://example.com/image.png"` |
| `publishedAt` | date | `2025-01-15` |

### 可选字段

| 字段 | 类型 | 示例 |
|------|------|------|
| `updatedAt` | date | `2025-01-20` |
| `featured` | boolean | `true` |
| `newInMonth` | date | `2025-01-01` |

### 约束条件

- ✅ 文件名必须是 kebab-case：`my-tip-name.mdx`
- ✅ tags 最多 10 个
- ✅ mediaUrl 必须是有效的 URL
- ✅ 日期格式必须是 `YYYY-MM-DD`

---

## ❌ 常见错误

### 错误 1：文件名格式

```
❌ 错误：MyTip.mdx, my_tip.mdx, mytip.mdx
✅ 正确：my-tip.mdx, quick-navigation.mdx
```

### 错误 2：缺少必须字段

```yaml
❌ 错误：
---
title: "My Tip"
---

✅ 正确：
---
title: "My Tip"
subtitle: "Description"
category: "navigation"
difficulty: "beginner"
tags: ["tag1"]
mediaType: "image"
mediaUrl: "https://example.com/image.png"
publishedAt: 2025-01-15
---
```

### 错误 3：日期格式

```yaml
❌ 错误：publishedAt: 01/15/2025
✅ 正确：publishedAt: 2025-01-15
```

### 错误 4：mediaType 值

```yaml
❌ 错误：mediaType: "img"
✅ 正确：mediaType: "image"
```

### 错误 5：tags 数量过多

```yaml
❌ 错误：tags: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k"]  # 11个
✅ 正确：tags: ["a", "b", "c", "d", "e"]  # 最多10个
```

---

## 🔗 有用的链接

- [zed-tips-data GitHub](https://github.com/zed-tips/zed-tips-data)
- [zed.tips GitHub](https://github.com/zed-tips/zed.tips)
- [Actions 日志](https://github.com/zed-tips/zed-tips-data/actions)
- [zed.tips 网站](https://zed.tips)

---

## 💡 常见问题

**Q: 我修改了 tip，多久会在网站上更新？**  
A: 从 PR merge 到网站更新约 2-3 分钟。流程：merge → 验证 → 克隆 → 构建 → 部署

**Q: 我的 PR 验证失败了怎么办？**  
A: 点击 PR 上的 "Details"，查看具体的错误信息。通常是字段格式问题。修复后重新推送，CI 会自动重新验证。

**Q: 支持多少个 tags？**  
A: 最多 10 个。超过会验证失败。

**Q: mediaUrl 一定要是真实可访问的吗？**  
A: 不需要。只要是有效的 URL 格式就行。

**Q: 我可以创建新的 category 或 difficulty 吗？**  
A: 可以！这些字段没有限制，支持任意字符串。设计时就考虑了灵活性。

---

## 📞 需要帮助？

1. 查看详细的 [SETUP_GUIDE.md](./SETUP_GUIDE.md)
2. 查看 [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) 了解架构
3. 检查 GitHub Actions 日志：https://github.com/zed-tips/zed-tips-data/actions
4. 查看验证脚本：[scripts/validate-tips.js](./scripts/validate-tips.js)

---

**最后更新**：2025-01-15
