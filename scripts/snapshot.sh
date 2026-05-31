#!/bin/bash

# Sistema de Snapshots de Estado - Opção C Híbrida
# Combina Git tags (código) + tarballs (node_modules)

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
SNAPSHOT_DIR=".snapshots"
LOCK_FILE="$SNAPSHOT_DIR/.lock"
METADATA_SUFFIX=".metadata.json"
DEPS_SUFFIX="-deps.tar.gz"
MAX_AGE_DAYS=7
MAX_SNAPSHOT_NAME_LENGTH=50

# Função de ajuda
show_help() {
    cat << EOF
📸 Sistema de Snapshots de Estado

Uso: $0 <comando> [opções]

Comandos:
  create <nome> [opções]    Cria snapshot do estado atual
  restore <nome>            Restaura snapshot específico
  list                      Lista todos os snapshots
  delete <nome>             Remove snapshot
  cleanup                   Remove snapshots antigos (>$MAX_AGE_DAYS dias)
  info <nome>               Mostra detalhes do snapshot

Opções para create:
  --include-deps            Inclui node_modules no snapshot
  --description "texto"     Adiciona descrição ao snapshot
  --force                   Sobrescreve snapshot existente
  --no-commit               Não cria commit WIP se working tree sujo

Opções para restore:
  --no-backup               Não cria backup automático antes de restaurar
  --no-deps                 Não restaura node_modules

Opções para cleanup:
  --force                   Remove sem confirmação

Exemplos:
  $0 create pre-refactor --include-deps --description "Antes de refatorar auth"
  $0 restore pre-refactor
  $0 list
  $0 delete pre-refactor

EOF
}

# Função de log
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1" >&2
}

# Validação de nome do snapshot
validate_snapshot_name() {
    local name="$1"
    
    if [ -z "$name" ]; then
        log_error "Nome do snapshot não pode ser vazio"
        exit 1
    fi
    
    if [ ${#name} -gt $MAX_SNAPSHOT_NAME_LENGTH ]; then
        log_error "Nome do snapshot muito longo (máximo $MAX_SNAPSHOT_NAME_LENGTH caracteres)"
        exit 1
    fi
    
    if [[ ! "$name" =~ ^[a-zA-Z0-9_-]+$ ]]; then
        log_error "Nome do snapshot inválido. Use apenas letras, números, _ e -"
        exit 1
    fi
    
    if [[ "$name" =~ ^- ]]; then
        log_error "Nome do snapshot não pode começar com -"
        exit 1
    fi
}

# Verifica se snapshot existe
snapshot_exists() {
    local name="$1"
    git tag -l "snapshot/$name" | grep -q "snapshot/$name"
}

# Cria lock para evitar concorrência
acquire_lock() {
    if [ -f "$LOCK_FILE" ]; then
        local pid=$(cat "$LOCK_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            log_error "Outra operação de snapshot está em execução (PID: $pid)"
            exit 1
        else
            log_warning "Lock órfão encontrado, removendo..."
            rm -f "$LOCK_FILE"
        fi
    fi
    echo $$ > "$LOCK_FILE"
}

# Remove lock
release_lock() {
    rm -f "$LOCK_FILE"
}

# Cria snapshot
create_snapshot() {
    local name=""
    local include_deps=false
    local description=""
    local force=false
    local no_commit=false
    
    # Parse argumentos
    while [[ $# -gt 0 ]]; do
        case $1 in
            --include-deps)
                include_deps=true
                shift
                ;;
            --description)
                description="$2"
                shift 2
                ;;
            --force)
                force=true
                shift
                ;;
            --no-commit)
                no_commit=true
                shift
                ;;
            -*)
                log_error "Opção desconhecida: $1"
                exit 1
                ;;
            *)
                if [ -z "$name" ]; then
                    name="$1"
                else
                    log_error "Argumento inesperado: $1"
                    exit 1
                fi
                shift
                ;;
        esac
    done
    
    if [ -z "$name" ]; then
        log_error "Nome do snapshot é obrigatório"
        exit 1
    fi
    
    validate_snapshot_name "$name"
    
    # Verifica se já existe
    if snapshot_exists "$name" && [ "$force" = false ]; then
        log_error "Snapshot '$name' já existe. Use --force para sobrescrever"
        exit 1
    fi
    
    # Cria diretório de snapshots se não existe
    mkdir -p "$SNAPSHOT_DIR"
    
    acquire_lock
    trap release_lock EXIT
    
    log_info "Criando snapshot '$name'..."
    
    # Captura estado atual
    local current_branch=$(git branch --show-current)
    local current_commit=$(git rev-parse HEAD)
    local is_dirty=false
    
    if ! git diff-index --quiet HEAD --; then
        is_dirty=true
    fi
    
    # Se working tree sujo e não é --no-commit
    if [ "$is_dirty" = true ] && [ "$no_commit" = false ]; then
        log_warning "Working tree contém mudanças não commitadas"
        read -p "Deseja criar commit WIP temporário? (s/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Ss]$ ]]; then
            log_info "Criando commit WIP..."
            git add -A
            git commit -m "WIP: snapshot $name" --no-verify
            current_commit=$(git rev-parse HEAD)
            log_success "Commit WIP criado"
        else
            log_error "Working tree sujo. Commite ou use --no-commit"
            exit 1
        fi
    elif [ "$is_dirty" = true ] && [ "$no_commit" = true ]; then
        log_warning "Snapshot será criado sem incluir mudanças não commitadas"
    fi
    
    # Remove snapshot antigo se --force
    if [ "$force" = true ] && snapshot_exists "$name"; then
        log_info "Removendo snapshot antigo..."
        git tag -d "snapshot/$name" || true
        rm -f "$SNAPSHOT_DIR/$name$DEPS_SUFFIX"
        rm -f "$SNAPSHOT_DIR/$name$METADATA_SUFFIX"
    fi
    
    # Cria tag Git
    log_info "Criando tag Git..."
    git tag -a "snapshot/$name" -m "Snapshot: $name" -m "Branch: $current_branch" -m "Commit: $current_commit"
    log_success "Tag snapshot/$name criada"
    
    # Comprime node_modules se --include-deps
    local has_deps=false
    local archive_size=0
    
    if [ "$include_deps" = true ]; then
        if [ -d "node_modules" ]; then
            log_info "Comprimindo node_modules (pode levar alguns segundos)..."
            tar -czf "$SNAPSHOT_DIR/$name$DEPS_SUFFIX" node_modules
            has_deps=true
            archive_size=$(stat -c%s "$SNAPSHOT_DIR/$name$DEPS_SUFFIX" 2>/dev/null || stat -f%z "$SNAPSHOT_DIR/$name$DEPS_SUFFIX")
            log_success "node_modules comprimido ($((archive_size / 1024 / 1024)) MB)"
        else
            log_warning "node_modules não encontrado, pulando..."
        fi
    fi
    
    # Cria metadados
    local created=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    cat > "$SNAPSHOT_DIR/$name$METADATA_SUFFIX" <<EOF
{
  "name": "$name",
  "created": "$created",
  "branch": "$current_branch",
  "commit": "$current_commit",
  "has_deps": $has_deps,
  "description": "$description",
  "archive_size": $archive_size,
  "auto_created": false
}
EOF
    
    log_success "Snapshot '$name' criado com sucesso!"
    
    if [ "$has_deps" = true ]; then
        log_info "Tamanho total: $((archive_size / 1024 / 1024)) MB"
    fi
}

# Restaura snapshot
restore_snapshot() {
    local name=""
    local no_backup=false
    local no_deps=false
    
    # Parse argumentos
    while [[ $# -gt 0 ]]; do
        case $1 in
            --no-backup)
                no_backup=true
                shift
                ;;
            --no-deps)
                no_deps=true
                shift
                ;;
            -*)
                log_error "Opção desconhecida: $1"
                exit 1
                ;;
            *)
                if [ -z "$name" ]; then
                    name="$1"
                else
                    log_error "Argumento inesperado: $1"
                    exit 1
                fi
                shift
                ;;
        esac
    done
    
    if [ -z "$name" ]; then
        log_error "Nome do snapshot é obrigatório"
        exit 1
    fi
    
    validate_snapshot_name "$name"
    
    if ! snapshot_exists "$name"; then
        log_error "Snapshot '$name' não encontrado"
        log_info "Use 'npm run snapshot:list' para ver snapshots disponíveis"
        exit 1
    fi
    
    acquire_lock
    trap release_lock EXIT
    
    log_info "Restaurando snapshot '$name'..."
    
    # Cria backup automático se não --no-backup
    if [ "$no_backup" = false ]; then
        local backup_name="auto-backup-$(date +%Y%m%d-%H%M%S)"
        log_info "Criando backup automático: $backup_name"
        create_snapshot "$backup_name" --no-commit --include-deps --description "Backup automático antes de restaurar $name"
    fi
    
    # Restaura Git
    log_info "Restaurando estado Git..."
    git checkout "snapshot/$name"
    log_success "Estado Git restaurado"
    
    # Restaura node_modules se existe e não --no-deps
    if [ "$no_deps" = false ] && [ -f "$SNAPSHOT_DIR/$name$DEPS_SUFFIX" ]; then
        log_info "Restaurando node_modules..."
        rm -rf node_modules
        tar -xzf "$SNAPSHOT_DIR/$name$DEPS_SUFFIX"
        log_success "node_modules restaurado"
    else
        if [ "$no_deps" = false ]; then
            log_warning "Archive de node_modules não encontrado, execute 'npm install'"
        fi
    fi
    
    log_success "Snapshot '$name' restaurado com sucesso!"
}

# Lista snapshots
list_snapshots() {
    local snapshots=$(git tag -l "snapshot/*" | sort)
    
    if [ -z "$snapshots" ]; then
        log_info "Nenhum snapshot encontrado"
        return
    fi
    
    echo -e "${BLUE}📸 Snapshots Disponíveis${NC}\n"
    printf "%-30s %-20s %-15s %-10s %s\n" "NOME" "DATA" "BRANCH" "TAMANHO" "DESCRIÇÃO"
    printf "%-30s %-20s %-15s %-10s %s\n" "----" "----" "------" "-------" "---------"
    
    while IFS= read -r tag; do
        local name=${tag#snapshot/}
        local metadata_file="$SNAPSHOT_DIR/$name$METADATA_SUFFIX"
        
        if [ -f "$metadata_file" ]; then
            local created=$(jq -r '.created' "$metadata_file" | cut -d'T' -f1)
            local branch=$(jq -r '.branch' "$metadata_file")
            local has_deps=$(jq -r '.has_deps' "$metadata_file")
            local archive_size=$(jq -r '.archive_size' "$metadata_file")
            local description=$(jq -r '.description // ""' "$metadata_file")
            
            local size_display="N/A"
            if [ "$has_deps" = "true" ]; then
                size_display="$((archive_size / 1024 / 1024)) MB"
            fi
            
            printf "%-30s %-20s %-15s %-10s %s\n" "$name" "$created" "$branch" "$size_display" "${description:0:40}"
        else
            printf "%-30s %-20s %-15s %-10s %s\n" "$name" "N/A" "N/A" "N/A" "Sem metadados"
        fi
    done <<< "$snapshots"
    
    echo
}

# Deleta snapshot
delete_snapshot() {
    local name="$1"
    
    if [ -z "$name" ]; then
        log_error "Nome do snapshot é obrigatório"
        exit 1
    fi
    
    validate_snapshot_name "$name"
    
    if ! snapshot_exists "$name"; then
        log_error "Snapshot '$name' não encontrado"
        exit 1
    fi
    
    acquire_lock
    trap release_lock EXIT
    
    log_info "Deletando snapshot '$name'..."
    
    # Remove tag Git
    git tag -d "snapshot/$name" || log_warning "Falha ao remover tag Git"
    
    # Remove archive
    if [ -f "$SNAPSHOT_DIR/$name$DEPS_SUFFIX" ]; then
        rm -f "$SNAPSHOT_DIR/$name$DEPS_SUFFIX"
        log_success "Archive removido"
    fi
    
    # Remove metadados
    if [ -f "$SNAPSHOT_DIR/$name$METADATA_SUFFIX" ]; then
        rm -f "$SNAPSHOT_DIR/$name$METADATA_SUFFIX"
        log_success "Metadados removidos"
    fi
    
    log_success "Snapshot '$name' deletado"
}

# Cleanup de snapshots antigos
cleanup_snapshots() {
    local force=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --force)
                force=true
                shift
                ;;
            *)
                shift
                ;;
        esac
    done
    
    local cutoff_date=$(date -d "$MAX_AGE_DAYS days ago" +%Y-%m-%d 2>/dev/null || date -v-${MAX_AGE_DAYS}d +%Y-%m-%d)
    local found_old=false
    
    log_info "Procurando snapshots mais antigos que $MAX_AGE_DAYS dias (antes de $cutoff_date)..."
    
    local snapshots=$(git tag -l "snapshot/*" | sort)
    
    while IFS= read -r tag; do
        local name=${tag#snapshot/}
        local metadata_file="$SNAPSHOT_DIR/$name$METADATA_SUFFIX"
        
        if [ -f "$metadata_file" ]; then
            local created=$(jq -r '.created' "$metadata_file" | cut -d'T' -f1)
            
            if [[ "$created" < "$cutoff_date" ]]; then
                found_old=true
                log_info "Snapshot antigo encontrado: $name (criado em $created)"
                
                if [ "$force" = true ]; then
                    delete_snapshot "$name"
                fi
            fi
        fi
    done <<< "$snapshots"
    
    if [ "$found_old" = false ]; then
        log_info "Nenhum snapshot antigo encontrado"
        return
    fi
    
    if [ "$force" = false ]; then
        read -p "Deseja remover os snapshots antigos? (s/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Ss]$ ]]; then
            while IFS= read -r tag; do
                local name=${tag#snapshot/}
                local metadata_file="$SNAPSHOT_DIR/$name$METADATA_SUFFIX"
                
                if [ -f "$metadata_file" ]; then
                    local created=$(jq -r '.created' "$metadata_file" | cut -d'T' -f1)
                    if [[ "$created" < "$cutoff_date" ]]; then
                        delete_snapshot "$name"
                    fi
                fi
            done <<< "$snapshots"
        fi
    fi
}

# Mostra informações do snapshot
show_info() {
    local name="$1"
    
    if [ -z "$name" ]; then
        log_error "Nome do snapshot é obrigatório"
        exit 1
    fi
    
    validate_snapshot_name "$name"
    
    if ! snapshot_exists "$name"; then
        log_error "Snapshot '$name' não encontrado"
        exit 1
    fi
    
    local metadata_file="$SNAPSHOT_DIR/$name$METADATA_SUFFIX"
    
    if [ ! -f "$metadata_file" ]; then
        log_warning "Metadados não encontrados, mostrando informações básicas do Git"
        git show "snapshot/$name"
        return
    fi
    
    echo -e "${BLUE}📸 Informações do Snapshot: $name${NC}\n"
    jq '.' "$metadata_file"
    echo
    
    # Mostra informações do Git tag
    echo -e "${BLUE}Git Tag Info:${NC}"
    git show "snapshot/$name" --no-patch
}

# Comando principal
case "${1:-}" in
    create)
        shift
        create_snapshot "$@"
        ;;
    restore)
        shift
        restore_snapshot "$@"
        ;;
    list)
        list_snapshots
        ;;
    delete)
        shift
        delete_snapshot "$@"
        ;;
    cleanup)
        shift
        cleanup_snapshots "$@"
        ;;
    info)
        shift
        show_info "$@"
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        log_error "Comando desconhecido: ${1:-}"
        show_help
        exit 1
        ;;
esac
