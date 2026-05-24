#!/bin/bash
# Install git hooks for the project

HOOKS_DIR="$(git rev-parse --show-toplevel)/.git/hooks"
SOURCE_DIR="$(git rev-parse --show-toplevel)/scripts/git-hooks"

if [ ! -d "$SOURCE_DIR" ]; then
  echo "❌ Diretório de hooks não encontrado: $SOURCE_DIR"
  exit 1
fi

echo "📦 Instalando git hooks..."

for hook in "$SOURCE_DIR"/*; do
  if [ -f "$hook" ]; then
    hook_name=$(basename "$hook")
    target="$HOOKS_DIR/$hook_name"
    
    chmod +x "$hook"
    
    if [ -L "$target" ] || [ -f "$target" ]; then
      rm -f "$target"
    fi
    
    cp "$hook" "$target"
    chmod +x "$target"
    
    echo "  ✅ $hook_name instalado"
  fi
done

echo "✅ Git hooks instalados com sucesso!"
echo ""
echo "Hooks ativos:"
ls -1 "$SOURCE_DIR" | sed 's/^/  - /'
