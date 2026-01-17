# Zed Tips Data

Community-contributed tips and tricks for the Zed editor.

## Overview

This repository hosts a curated collection of user tips for the Zed editor. Each tip is a standalone MDX file containing actionable advice, keyboard shortcuts, workflow optimizations, and best practices.

When you submit a tip via pull request:

1. **Automatic Validation** - CI automatically validates the tip format
2. **Quality Assurance** - Required fields and data types are checked
3. **Auto-deployment** - Upon merge, changes are automatically deployed to [zed.tips](https://zed.tips)

## Quick Start

### Add a New Tip

1. **Create a new branch:**
   ```bash
   git checkout -b feature/my-tip
   ```

2. **Create a tip file** (use kebab-case naming):
   ```bash
   cat > tips/keyboard-shortcuts-basics.mdx << 'EOF'
   ---
   title: "Essential Keyboard Shortcuts"
   subtitle: "Master the most commonly used Zed shortcuts"
   category: "shortcuts"
   difficulty: "beginner"
   tags: ["keyboard", "productivity"]
   mediaType: "image"
   mediaUrl: "https://example.com/image.png"
   publishedAt: 2025-01-15
   ---
   
   ## How to Use
   
   Learn the essential keyboard shortcuts that will boost your productivity.
   
   ## Pro Tips
   
   - Customize shortcuts in your keybindings.json
   - Use Cmd+K Cmd+S to open the keyboard shortcuts reference
   EOF
   ```

3. **Commit and push:**
   ```bash
   git add tips/keyboard-shortcuts-basics.mdx
   git commit -m "feat: add essential keyboard shortcuts tip"
   git push origin feature/my-tip
   ```

4. **Create a Pull Request** on GitHub

5. **Wait for CI validation** - GitHub Actions will automatically validate your tip

6. **Merge once approved** - Validation must pass before merging

7. **Auto-deployment** - Changes are automatically deployed to the website

## Tip Format Specification

### Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `title` | string | Tip title | `"Quick File Navigation"` |
| `subtitle` | string | Brief description | `"Navigate files faster with Cmd+P"` |
| `category` | string | Topic category | `"navigation"`, `"shortcuts"` |
| `difficulty` | string | Skill level required | `"beginner"`, `"intermediate"`, `"advanced"` |
| `tags` | array | Keywords for discovery (1-10 items) | `["keyboard", "workflow"]` |
| `mediaType` | enum | `"image"` or `"video"` | `"image"` |
| `mediaUrl` | string | Valid URL to media asset | `"https://example.com/image.png"` |
| `publishedAt` | date | Publication date (YYYY-MM-DD) | `"2025-01-15"` |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `updatedAt` | date | Last update date (YYYY-MM-DD) |
| `featured` | boolean | Display on homepage |
| `newInMonth` | date | When feature was released (YYYY-MM-DD) |

### Example Tip

```yaml
---
title: "Smart Code Navigation"
subtitle: "Jump to definitions and symbols instantly"
category: "navigation"
difficulty: "beginner"
tags: ["shortcuts", "code-navigation", "productivity"]
mediaType: "image"
mediaUrl: "https://zed.tips/assets/smart-nav.webp"
publishedAt: 2025-01-15
featured: true
newInMonth: 2025-01-01
---

The **Go to Definition** feature lets you quickly jump to where a symbol is defined.

## How to Use

1. Right-click on any symbol (variable, function, class)
2. Select "Go to Definition" or press `Cmd+Shift+D`
3. You're instantly taken to the definition

## Pro Tips

- Use `Alt+Left Arrow` to go back to your previous location
- Hover over a symbol with `Cmd` held to see a preview
- Create keyboard shortcuts for faster navigation
```

## File Format Rules

### Naming Convention

- Use **kebab-case** for file names
- Valid: `quick-file-navigation.mdx`, `debug-tips.mdx`
- Invalid: `QuickFileNavigation.mdx`, `quick_file_navigation.mdx`

### Content Validation

| Rule | Requirement |
|------|-------------|
| **Filename** | Must match `kebab-case` pattern |
| **Title & Subtitle** | Non-empty strings |
| **Category** | Any string (no restrictions) |
| **Difficulty** | Any string (no restrictions) |
| **Tags** | Array with 1-10 items |
| **MediaType** | Must be `"image"` or `"video"` |
| **MediaUrl** | Valid URL format |
| **PublishedAt** | Valid date in `YYYY-MM-DD` format |

### Common Mistakes

| ❌ Wrong | ✅ Correct |
|---------|-----------|
| `my_tip.mdx` | `my-tip.mdx` |
| `MyTip.mdx` | `my-tip.mdx` |
| `mediaType: "img"` | `mediaType: "image"` |
| `publishedAt: 01/15/2025` | `publishedAt: 2025-01-15` |
| `tags: [a, b, c, ..., k, l]` (11 items) | `tags: [a, b, c, d, e]` (max 10) |

## Workflow Overview

```
You create a PR with a new tip
              ↓
GitHub Actions: Validate Tips
  ├─ Check filename format
  ├─ Parse YAML front matter
  ├─ Validate all required fields
  └─ Verify data types
              ↓
    ❌ Failed          ✅ Passed
  Cannot merge      Ready to merge
              ↓
You merge the PR
              ↓
GitHub Actions: Trigger Rebuild
  └─ Signal zed.tips to rebuild
              ↓
GitHub Actions: Rebuild from Tips Data (on zed.tips)
  ├─ Fetch latest tips
  ├─ Build website
  └─ Deploy to Cloudflare
              ↓
🚀 Live! https://zed.tips is updated
```

**Total time: 2-3 minutes from merge to live**

## Local Development

### Validate Tips Locally

```bash
# Install dependencies
pnpm install

# Run validation script
pnpm validate:tips

# Output example:
# 🔍 Validating tips format...
# Found 2 tip file(s) to validate:
# ✅ tips/quick-navigation.mdx
# ✅ tips/debug-tips.mdx
# ============================================================
# ✅ All 2 file(s) passed validation
```

### Test Your Tip

```bash
# Clone the website repo
git clone https://github.com/zed-tips/zed.tips.git
cd zed.tips

# Link community tips
git clone https://github.com/zed-tips/zed-tips-data.git src/content/community-tips

# Start development server
pnpm dev

# Visit http://localhost:3000 to see your tip
```

## CI/CD Configuration

This repository uses automated CI/CD:

- ✅ **PR Validation** - Automatic format checks on every PR
- ✅ **Auto-merge** - Only valid tips can be merged
- ✅ **Auto-deployment** - Changes deploy automatically after merge
- ✅ **Secure** - Uses GitHub App authentication (no personal tokens)
- ✅ **Auditable** - All actions logged and traceable

## Contributing

We welcome contributions! Here's the process:

1. **Fork** this repository
2. **Create** a feature branch (`git checkout -b feature/my-tip`)
3. **Write** your tip following the format specification
4. **Test** locally with `pnpm validate:tips`
5. **Commit** with clear messages
6. **Push** to your fork
7. **Create a Pull Request**
8. **Address** any CI validation failures
9. **Wait for approval** from maintainers
10. **Celebrate** when merged! 🎉

## Troubleshooting

### Validation Failed

**Check the PR comments** for validation errors. Common issues:

- **Invalid filename** - Use kebab-case (`my-tip.mdx`)
- **Missing fields** - Ensure all required fields are present
- **Invalid date format** - Use `YYYY-MM-DD` format
- **Too many tags** - Maximum is 10 tags
- **Invalid mediaType** - Must be `"image"` or `"video"`

### Deployment Failed

Contact the maintainers. Check the GitHub Actions logs at:
`https://github.com/zed-tips/zed-tips-data/actions`

## Guidelines

### What Makes a Good Tip

- **Practical** - Solves a real problem or improves productivity
- **Clear** - Easy to understand for the target audience
- **Concise** - Get to the point quickly
- **Visual** - Include screenshots or videos when helpful
- **Actionable** - Users can immediately apply the tip

### Tip Categories

- **shortcuts** - Keyboard shortcuts and hotkeys
- **navigation** - Moving efficiently through code and files
- **editing** - Editing techniques and tricks
- **debugging** - Debugging workflows and tools
- **plugins** - Extensions and extensions management
- **config** - Configuration and customization
- **productivity** - General productivity tips

### Before Submitting

- [ ] Tip is in kebab-case filename
- [ ] All required fields are present
- [ ] MediaUrl is valid and accessible
- [ ] Date format is correct (YYYY-MM-DD)
- [ ] Tags are between 1-10 items
- [ ] Content is clear and helpful
- [ ] No spelling or grammar errors
- [ ] Run `pnpm validate:tips` locally

## Resources

- [Zed Editor](https://zed.dev) - Official Zed website
- [Zed Tips](https://zed.tips) - Published tips
- [Astro Documentation](https://docs.astro.build) - Website framework
- [Markdown Guide](https://www.markdownguide.org/) - Markdown syntax

## License

MIT License - feel free to use this repository as a reference for your own projects.

## Questions?

- Open an [issue](https://github.com/zed-tips/zed-tips-data/issues)
- Check [GitHub Discussions](https://github.com/zed-tips/zed-tips-data/discussions)
- Contact the maintainers

---

**Ready to share your Zed expertise?** Submit a tip today! 🚀
