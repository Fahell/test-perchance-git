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
touch "$SELECTED_FILE"

CURRENT=""
SELECTED=1
LAST_SESSIONS=""

get_sessions() {
  tmux list-sessions 2>/dev/null | grep '^agent-' | cut -d: -f1 | tac
}

get_session_info() {
  local session=$1
  local created=$(tmux display-message -t "$session" -p '#{session_created}' 2>/dev/null)
  local windows=$(tmux display-message -t "$session" -p '#{session_windows}' 2>/dev/null)
  
  # Converter timestamp para formato legível
  if [[ -n "$created" ]]; then
    local age=$(($(date +%s) - created))
    if (( age < 60 )); then
      echo "${age}s atrás"
    elif (( age < 3600 )); then
      echo "$((age / 60))min atrás"
    else
      echo "$((age / 3600))h atrás"
    fi
  else
    echo "agora"
  fi
}

draw_ui() {
  local sessions=(${(f)"$(get_sessions)"})
  local count=${#sessions}
  
  clear
  
  # Cabeçalho
  echo -e "${BOLD}${CYAN}╔══════════════════════════════════════╗${NC}"
  echo -e "${BOLD}${CYAN}║${NC} ${BOLD}${MAGENTA}🎯 Agent Watch Dashboard${NC}              ${BOLD}${CYAN}║${NC}"
  echo -e "${BOLD}${CYAN}╚══════════════════════════════════════╝${NC}"
  echo ""
  
  if (( count == 0 )); then
    echo -e "${YELLOW}⚠${NC}  Nenhuma sessão ativa"
    echo ""
    echo -e "${DIM}Aguardando novas sessões...${NC}"
    echo ""
    echo -e "${DIM}[q] sair  [r] recarregar${NC}"
    return
  fi
  
  # Contador
  echo -e "${BOLD}${BLUE}📊 Sessões ativas:${NC} ${GREEN}${count}${NC}"
  echo ""
  
  # Lista de sessões
  for i in {1..$count}; do
    local session=${sessions[$i]}
    local info=$(get_session_info "$session")
    
    if (( i == SELECTED )); then
      # Sessão selecionada (destacada)
      echo -e "${BOLD}${GREEN}▶ [${i}]${NC} ${BOLD}${session}${NC}"
      echo -e "    ${DIM}└─ ${CYAN}${info}${NC}  ${DIM}│  Enter: attach  │  v: view${NC}"
    else
      # Sessão normal
      echo -e "  ${DIM}[${i}]${NC} ${session}"
      echo -e "    ${DIM}└─ ${info}${NC}"
    fi
  done
  
  echo ""
  echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${DIM}Controles:${NC}"
  echo -e "  ${YELLOW}↑/↓${NC}    navegar"
  echo -e "  ${YELLOW}1-9${NC}    selecionar por número"
  echo -e "  ${YELLOW}Enter${NC}  attach direto"
  echo -e "  ${YELLOW}v${NC}      view independente (scroll livre)"
  echo -e "  ${YELLOW}r${NC}      recarregar lista"
  echo -e "  ${YELLOW}q${NC}      sair do dashboard"
  echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  
  # Salvar sessão selecionada
  echo "${sessions[$SELECTED]}" > "$SELECTED_FILE"
}

# Loop principal
while true; do
  SESSIONS=$(get_sessions)
  COUNT=$(echo "$SESSIONS" | grep -c '^' 2>/dev/null || echo 0)
  
  # Ajustar seleção se necessário
  if (( SELECTED > COUNT )) && (( COUNT > 0 )); then
    SELECTED=$COUNT
  fi
  if (( COUNT == 0 )); then
    SELECTED=1
  fi
  
  # Só redesenhar se mudou
  if [[ "$SESSIONS" != "$LAST_SESSIONS" ]] || (( FORCE_REDRAW == 1 )); then
    draw_ui
    LAST_SESSIONS="$SESSIONS"
    FORCE_REDRAW=0
  fi
  
  # Ler tecla com timeout
  if read -t 2 -k 1 key 2>/dev/null; then
    case "$key" in
      $'\x1b')
        # Sequência de escape (setas)
        read -t 0.1 -k 2 seq 2>/dev/null
        case "$seq" in
          '[A') # Seta para cima
            (( SELECTED > 1 )) && (( SELECTED-- )) && FORCE_REDRAW=1
            ;;
          '[B') # Seta para baixo
            (( SELECTED < COUNT )) && (( SELECTED++ )) && FORCE_REDRAW=1
            ;;
        esac
        ;;
      'q'|'Q')
        tmux kill-session -t "aw-$$" 2>/dev/null
        exit 0
        ;;
      'r'|'R')
        FORCE_REDRAW=1
        ;;
      $'\n'|$'\r')
        # Enter - attach
        sessions=(${(f)"$(get_sessions)"})
        if (( COUNT > 0 )); then
          tmux switch-client -t "${sessions[$SELECTED]}"
        fi
        ;;
      'v'|'V')
        # View independente
        sessions=(${(f)"$(get_sessions)"})
        if (( COUNT > 0 )); then
          view_name="view-${sessions[$SELECTED]}"
          tmux new-session -d -s "$view_name" -t "${sessions[$SELECTED]}" 2>/dev/null
          tmux switch-client -t "$view_name"
        fi
        ;;
      [1-9])
        # Seleção por número
        if (( key <= COUNT )); then
          SELECTED=$key
          FORCE_REDRAW=1
        fi
        ;;
    esac
  fi
done
