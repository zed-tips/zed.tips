# Contributing to Zed Tips

Thank you for contributing to Zed Tips! This guide will help you submit high-quality tips that help the community master Zed.

## Quick Start

1. Fork this repository
2. Create a new tip file in `tips/` directory
3. Submit a pull request
4. Our automation will add metadata after merge

## Tip File Format

### File Naming

Use kebab-case for filenames:
- ✅ `quick-file-navigation.mdx`
- ✅ `custom-keybindings.md`
- ❌ `QuickFileNavigation.mdx`
- ❌ `custom_keybindings.md`

### Required Frontmatter

Create your tip with these required fields:

```yaml
---
title: "Your Tip Title"
subtitle: "A brief description of what this tip covers"
category: "navigation"  # See categories below
difficulty: "beginner"  # beginner, intermediate, or advanced
tags: ["shortcuts", "productivity"]
mediaType: "image"  # or "video"
mediaUrl: "https://example.com/demo.png"
---

Your tip content in Markdown...
```

### Valid Categories

Choose one from `config/categories.yaml`:
- `shortcuts` - Keyboard shortcuts
- `plugins` - Plugins & extensions
- `config` - Configuration
- `productivity` - Productivity tips
- `navigation` - Code navigation

### Valid Difficulty Levels

- `beginner` - Easy to learn and understand
- `intermediate` - Moderate difficulty, requires some practice
- `advanced` - Challenging, requires advanced skills

## Automatic Metadata

**You don't need to add these fields** - they're automatically added after your PR is merged:

- `publishedAt` - Publication date (YYYY-MM-DD)
- `updatedAt` - Last update date (YYYY-MM-DD)
- `author` - Your GitHub username
- `authorUrl` - Your GitHub profile link

### How It Works

1. You create a PR with your tip (no metadata fields needed)
2. CI validates your tip format
3. After merge, our workflow automatically:
   - Adds missing metadata fields
   - Commits changes to main
   - Triggers website rebuild

### Example

**Your tip submission:**
```yaml
---
title: "Quick File Navigation"
subtitle: "Navigate instantly with Cmd+P"
category: "navigation"
difficulty: "beginner"
tags: ["shortcuts", "productivity"]
mediaType: "image"
mediaUrl: "https://example.com/demo.png"
---

The **Go to File** feature in Zed allows you to quickly navigate...
```

**After merge (auto-added):**
```yaml
---
title: "Quick File Navigation"
subtitle: "Navigate instantly with Cmd+P"
category: "navigation"
difficulty: "beginner"
tags: ["shortcuts", "productivity"]
mediaType: "image"
mediaUrl: "https://example.com/demo.png"
publishedAt: 2026-01-19        # ← Auto-added
updatedAt: 2026-01-19          # ← Auto-added
author: yourusername           # ← Auto-added
authorUrl: https://github.com/yourusername  # ← Auto-added
---

The **Go to File** feature in Zed allows you to quickly navigate...
```

## Content Guidelines

### Writing Style

- **Be concise**: Get to the point quickly
- **Be actionable**: Include specific steps users can follow
- **Be clear**: Use simple language, avoid jargon
- **Use examples**: Show don't just tell

### Structure

A good tip typically includes:

1. **Introduction** - What problem does this solve?
2. **How to Use** - Step-by-step instructions
3. **Pro Tips** - Advanced usage or variations
4. **Related Tips** - Links to other relevant tips (optional)

### Example Template

```markdown
---
title: "Your Tip Title"
subtitle: "Brief description"
category: "productivity"
difficulty: "beginner"
tags: ["workflow", "shortcuts"]
mediaType: "image"
mediaUrl: "https://example.com/demo.png"
---

## Introduction

Brief explanation of what this tip does and why it's useful.

## How to Use

1. First step
2. Second step
3. Third step

## Pro Tips

- Advanced technique #1
- Advanced technique #2

## Related Tips

- [Another Tip Name](link)
```

## Media Guidelines

### Images

- Use high-quality screenshots
- Recommended size: 1280x720 or similar 16:9 ratio
- Format: PNG or WebP preferred
- Host on reliable CDN or include in repo

### Videos

- Keep videos short (< 30 seconds ideal)
- Show one tip clearly
- No sound required (make it work muted)
- Format: MP4, WebM, or GIF

## Validation

Before submitting, your tip will be automatically validated for:

- ✅ Correct frontmatter structure
- ✅ Valid category and difficulty
- ✅ Required fields present
- ✅ Proper filename format
- ✅ Valid URLs

Run validation locally:
```bash
pnpm install
pnpm validate:tips
```

## Submission Process

1. **Create a branch**
   ```bash
   git checkout -b tip/your-tip-name
   ```

2. **Create your tip file**
   ```bash
   # In tips/ directory
   touch tips/your-tip-name.mdx
   ```

3. **Write your tip**
   - Follow the format above
   - Don't worry about metadata fields

4. **Commit and push**
   ```bash
   git add tips/your-tip-name.mdx
   git commit -m "feat: add tip about [topic]"
   git push origin tip/your-tip-name
   ```

5. **Create a pull request**
   - Wait for CI validation
   - Address any feedback
   - After merge, metadata is auto-added!

## Questions?

- Open an issue for questions about contributing
- Join discussions in existing PRs
- Check existing tips for examples

Thank you for helping the community master Zed! 🚀
