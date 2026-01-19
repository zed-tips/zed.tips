# Zed Tips

Master Zed, together!

A curated collection of tips, tricks, and workflows from developers who live and breathe Zed every day.

## Overview

Zed is phenomenal—fast, elegant, powerful. But we kept discovering hidden gems buried in Slack threads, tweets, and personal notes. The community needed a single source of truth.

This repository hosts a curated collection of user tips for the Zed editor. Each tip is a standalone MDX file containing actionable advice, keyboard shortcuts, workflow optimizations, and best practices.

## Quick Start

Visit [zedtips.com](https://zedtips.com) to browse all tips.

## Automatic Metadata

When you submit a PR with a new tip, our GitHub Actions workflow automatically adds metadata fields after your PR is merged:

- **publishedAt**: Publication date (YYYY-MM-DD format) - set when tip is first created, never overwritten
- **updatedAt**: Last update date (YYYY-MM-DD format) - updated whenever the tip content changes
- **author**: Your GitHub username - extracted from git commit history
- **authorUrl**: Your GitHub profile link - automatically generated from your username

You don't need to manually add these fields to your tip files. Just focus on creating great content!

### Example

**Your tip (before merge)**:
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

Your tip content...
```

**After merge (metadata auto-added)**:
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

Your tip content...
```

## Contributing

Built by the Community, Free Forever

Every tip on Zed.tips is completely free and contributed by developers like you. Join our growing community and help others master the Zed editor.

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) for more information.

## License

MIT License
