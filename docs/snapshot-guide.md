# Environment Snapshot System

## Overview
Create restore points before major refactors. Restores code + dependencies in seconds.

## Quick Start
```bash
# Create snapshot before refactoring
npm run snapshot:create pre-refactor -- --include-deps

# If something goes wrong, restore
npm run snapshot:restore pre-refactor

# If successful, cleanup
npm run snapshot:delete pre-refactor
```

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run snapshot:create <name>` | Creates snapshot of current state |
| `npm run snapshot:restore <name>` | Restores specific snapshot |
| `npm run snapshot:list` | Lists all snapshots |
| `npm run snapshot:delete <name>` | Deletes snapshot |
| `npm run snapshot:cleanup` | Removes old snapshots (>7 days) |
| `npm run snapshot:info <name>` | Shows snapshot details |

## Important Flags

- `--include-deps` → Include `node_modules` in snapshot (recommended for complex refactors)
- `--description "text"` → Add description to snapshot
- `--force` → Overwrite existing snapshot (use with caution)
- `--auto-backup` → Create automatic backup before restoring

## How It Works

### Create
- Creates Git tag `snapshot/<name>` with current state
- If `--include-deps`, compresses `node_modules` to `.snapshots/<name>-deps.tar.gz`
- Saves metadata to `.snapshots/<name>.metadata.json`

### Restore
- Creates auto backup (`auto-backup-<timestamp>`) for safety
- Checkout of tag `snapshot/<name>`
- If archive exists, extracts `node_modules`

### Storage
- Snapshots stored in `.snapshots/` (gitignored)
- Each snapshot takes ~15-20 MB (with node_modules)
- Auto-cleanup removes snapshots >7 days

## Performance

| Operation | Estimated Time |
|-----------|----------------|
| Create (no deps) | ~1-2s |
| Create (with deps) | ~5-10s |
| Restore (no deps) | ~2-3s |
| Restore (with deps) | ~10-15s |

## Best Practices

- Always use `--include-deps` for refactors that may break dependencies
- Use descriptive names: `pre-auth-refactor`, `before-threejs-upgrade`
- Add descriptions for future context
- Clean old snapshots regularly (`npm run snapshot:cleanup`)
- Do not create snapshots for small changes (use git stash)
- Do not keep snapshots longer than 7 days (use cleanup)
