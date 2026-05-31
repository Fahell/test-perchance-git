# Agent Resume System

## Overview
Saves session progress for continuation across agent turns. Useful for long-running tasks or when switching contexts.

## Quick Start
```bash
# Save current session
~/home/agent-resume.sh save "Working on auth refactor"

# Load previous session
~/home/agent-resume.sh load

# List saved sessions
~/home/agent-resume.sh list
```

## When to Use
- Before long-running tasks that may be interrupted
- When switching between different tasks/contexts
- At end of work session to preserve progress
- After completing significant milestones

## Best Practices
- Use descriptive save messages for easy identification
- Load the most recent session when resuming work
- Clean up old sessions periodically
- Do not rely solely on this system for critical work (always commit)
