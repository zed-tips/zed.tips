# Zed Tips Data 🎉

社区贡献的 Zed 编辑器使用技巧数据库。

## 🚀 快速开始

### 本项目的作用

这个仓库存储所有社区贡献的 Zed 编辑器 Tips。当你提交 PR 时：

1. **PR 时自动验证** ✅
   - 检查文件格式和必须字段
   - 验证数据类型和值
   - 失败时 PR 显示红色 ❌

2. **Merge 后自动部署** 🚀
   - 自动触发 zed.tips 网站重建
   - 克隆最新数据
   - 自动部署到 https://zed.tips

### 提交新 Tip 的步骤

```bash
# 1. 创建分支
git checkout -b feature/my-tip

# 2. 创建 tip 文件 (遵循 kebab-case)
cat > tips/my-awesome-tip.mdx << 'EOF'
---
title: "My Awesome Tip"
subtitle: "A helpful description"
category: "navigation"
difficulty: "beginner"
tags: ["keyboard", "workflow"]
mediaType: "image"
mediaUrl: "https://example.com/image.png"
publishedAt: 2025-01-15
---

## How to Use

Your content here...
EOF

# 3. 提交并推送
git add tips/my-awesome-tip.mdx
git commit -m "feat: add my awesome tip"
git push origin feature/my-tip

# 4. 在 GitHub 上创建 PR
# 5. 等待 CI 验证通过 ✅
# 6. Merge PR
# 7. 等待自动部署完成！
```

## 📝 Tip 文件格式

### 必须字段

```yaml
---
title: string              # 例如："Quick File Navigation"
subtitle: string           # 例如："Navigate files faster"
category: string           # 例如："navigation", "plugins"
difficulty: string         # 例如："beginner", "advanced"
tags: array                # 例如：["keyboard", "workflow"]（最多10个）
mediaType: enum            # "image" 或 "video"
mediaUrl: string           # 有效的 URL
publishedAt: date          # 格式：YYYY-MM-DD
---
```

### 可选字段

```yaml
updatedAt: date            # 最后更新日期
featured: boolean          # 是否显示在主页
newInMonth: date           # 新功能发布月份
```

## ✅ 验证规则

| 规则 | 说明 |
|------|------|
| 文件名格式 | 必须是 kebab-case（`my-tip-name.mdx`） |
| tags 数量 | 最多 10 个标签 |
| mediaUrl | 必须是有效的 URL |
| 日期格式 | 必须是 `YYYY-MM-DD` |
| category/difficulty | 支持任意字符串（灵活性） |

## ❌ 常见错误

```
❌ 错误                    ✅ 正确
my_tip.mdx                my-tip.mdx
MyTip.mdx                 my-tip.mdx
title: "My Tip"           必须包含 subtitle, tags 等
mediaType: "img"          mediaType: "image"
publishedAt: 01/15/2025   publishedAt: 2025-01-15
tags: [1,2,3,...,11]      tags: [1,2,...,10]（最多10个）
```

## 🔄 完整工作流程

```
你的 PR
   ↓
CI 验证 (validate-tips.yml)
   ├─ 检查文件名 ✓
   ├─ 解析 YAML ✓
   ├─ 验证字段 ✓
   └─ 检查数据类型 ✓
   ↓
✅ 通过      |  ❌ 失败
可以 merge   |  无法 merge
   ↓
你 merge PR
   ↓
自动触发重建 (trigger-rebuild.yml)
   ↓
zed.tips 网站自动重建 (rebuild-from-tips-data.yml)
   ├─ 克隆最新数据
   ├─ pnpm build
   └─ 部署到 Cloudflare Pages
   ↓
🚀 完成！https://zed.tips 已更新
```

**总耗时**：约 2-3 分钟

## 📖 详细文档

- **[QUICK_START.md](./QUICK_START.md)** - 快速开始指南（5分钟）
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - 详细配置步骤和故障排除
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - 架构设计说明
- **[CHECKLIST.md](./CHECKLIST.md)** - 部署检查清单

## 🛠️ 本地开发

### 克隆 zed-tips-data 用于本地测试

```bash
# 如果你在 zed.tips 中开发，需要本地数据
git clone https://github.com/zed-tips/zed-tips-data.git /path/to/zed.tips/src/content/community-tips
```

### 验证你的 Tip 格式

```bash
# 安装依赖
pnpm install

# 运行验证脚本
pnpm validate:tips

# 输出应该显示所有 tips 都通过验证 ✅
```

## 🔐 CI/CD 配置

这个项目配置了自动化的 CI/CD 流程：

- ✅ **PR 验证**：提交时自动验证格式
- ✅ **自动触发**：Merge 后自动触发下游构建
- ✅ **安全通信**：使用 GitHub App，无需 Personal Token
- ✅ **完整日志**：所有过程都可在 GitHub Actions 中查看

配置详情见 [SETUP_GUIDE.md](./SETUP_GUIDE.md) 和 [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

## 📋 Tip 示例

```yaml
---
title: "Quick File Navigation with Go to File"
subtitle: "Navigate to any file instantly using Cmd+P"
category: "navigation"
difficulty: "beginner"
tags: ["shortcuts", "workflow", "file-management"]
mediaType: "image"
mediaUrl: "https://zed.tips/debugger.webp"
publishedAt: 2025-01-15
featured: true
newInMonth: 2025-01-01
---

The **Go to File** feature in Zed allows you to quickly navigate to any file in your project.

## How to Use

1. Press `Cmd+P` (macOS) or `Ctrl+P` (Linux/Windows)
2. Start typing the filename
3. Use fuzzy search to find files quickly
4. Press `Enter` to open the file

## Pro Tips

- You don't need to type the full filename
- Use `/` to navigate through directory paths
- Combine with `Cmd+Shift+P` for the command palette
```

## 🤝 贡献指南

1. Fork 这个仓库
2. 创建你的 tip 分支
3. 按照格式要求编写 tip
4. 提交 PR
5. 等待 CI 验证通过
6. Maintainer 审查并 merge
7. 自动部署到网站！

## 📞 遇到问题？

### CI 验证失败

查看 PR 的 "Checks" 标签，点击失败的 `validate` 检查查看详细错误信息。

常见问题：
- **文件名错误** - 使用 kebab-case（`my-tip-name.mdx`）
- **缺少字段** - 检查是否包含所有必须字段
- **日期格式** - 使用 `YYYY-MM-DD` 格式
- **tags 过多** - 最多 10 个标签

### 自动部署失败

联系 maintainer，检查 GitHub Actions 日志。

## 📚 相关链接

- [zed.tips 网站](https://zed.tips)
- [zed 编辑器](https://zed.dev)
- [Astro 文档](https://docs.astro.build)
- [GitHub Actions](https://docs.github.com/en/actions)

## 📄 许可证

MIT

---

**准备好提交你的 Tip 了吗？** 🚀

阅读 [QUICK_START.md](./QUICK_START.md) 开始吧！
