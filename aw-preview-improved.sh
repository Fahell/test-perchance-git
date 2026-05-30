#!/bin/zsh

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

SELECTED_FILE="$HOME/.aw-selected"
LAST_CONTENT=""
LAST_SESSION=""

while true; do
  SESSION=""
  [[ -f "$SELECTED_FILE" ]] && SESSION=$(cat "$SELECTED_FILE" 2>/dev/null)
  
  # Verificar se a sessão ainda existe
  if [[ -n "$SESSION" ]] && ! tmux has-session -t "$SESSION" 2>/dev/null; then
    SESSION=""
  fi
  
  if [[ -z "$SESSION" ]]; then
    if [[ "$LAST_SESSION" != "" ]]; then
      clear
      echo -e "${BOLD}${CYAN}╔══════════════════════════════════════════════╗${NC}"
      echo -e "${BOLD}${CYAN}║${NC} ${BOLD}${MAGENTA}👁  Preview ao Vivo${NC}                           ${BOLD}${CYAN}║${NC}"
      echo -e "${BOLD}${CYAN}╚══════════════════════════════════════════════╝${NC}"
      echo ""
      echo -e "${YELLOW}⚠${NC}  Nenhuma sessão selecionada"
      echo ""
      echo -e "${DIM}Selecione uma sessão no painel esquerdo${NC}"
      LAST_SESSION=""
    fi
    sleep 0.5
    continue
  fi
  
  CONTENT=$(tmux capture-pane -t "$SESSION" -p -S -50 2>/dev/null)
  
  # Só redesenhar se mudou
  if [[ "$CONTENT" != "$LAST_CONTENT" ]] || [[ "$SESSION" != "$LAST_SESSION" ]]; then
    clear
    
    # Cabeçalho com informações da sessão
    local created=$(tmux display-message -t "$SESSION" -p '#{session_created}' 2>/dev/null)
    local windows=$(tmux display-message -t "$SESSION" -p '#{session_windows}' 2>/dev/null)
    local width=$(tmux display-message -t "$SESSION" -p '#{window_width}' 2>/dev/null)
    
    echo -e "${BOLD}${CYAN}╔══════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${CYAN}║${NC} ${BOLD}${MAGENTA}👁  Preview ao Vivo${NC}                           ${BOLD}${CYAN}║${NC}"
    echo -e "${BOLD}${CYAN}╚══════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BOLD}${GREEN}📌 Sessão:${NC} ${BOLD}${SESSION}${NC}"
    echo -e "${DIM}   └─ Janelas: ${windows}  │  Atualização: tempo real${NC}"
    echo ""
    echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # Conteúdo do terminal
    if [[ -n "$CONTENT" ]]; then
      echo "$CONTENT" | sed 's/^/  /'
    else
      echo -e "${DIM}  (sessão vazia)${NC}"
    fi
    
    echo ""
    echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${DIM}Últimas 50 linhas  │  Atualização automática: 300ms${NC}"
    
    LAST_CONTENT="$CONTENT"
    LAST_SESSION="$SESSION"
  fi
  
  sleep 0.3
done
