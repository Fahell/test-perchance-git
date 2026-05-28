<#
.SYNOPSIS
    Cleanup automatico de processos MCP orfaos do Qwen

.DESCRIPTION
    Identifica e finaliza processos MCP (terminal-mcp, openbrowser-ai, server-github)
    que foram criados pelo Qwen mas nao sao mais necessarios.
    
    Whitelist (NUNCA finaliza):
    - openbrowser daemon (openbrowser.daemon.server)
    - terminal-proxy.py (proxy fundamental do terminal-mcp)

.PARAMETER GracePeriod
    Tempo minimo em minutos antes de considerar um processo como orfao (padrao: 5)

.PARAMETER DryRun
    Simula a execucao sem finalizar processos

.EXAMPLE
    .\cleanup-qwen-mcp.ps1
    
.EXAMPLE
    .\cleanup-qwen-mcp.ps1 -DryRun
    
.EXAMPLE
    .\cleanup-qwen-mcp.ps1 -GracePeriod 10
#>

[CmdletBinding()]
param(
    [int]$GracePeriod = 5,
    [switch]$DryRun
)

# Configuracao
$LogDir = "$PSScriptRoot\logs"
$LogFile = "$LogDir\cleanup.log"

# Funcao de log
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    
    if (-not (Test-Path $LogDir)) {
        New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
    }
    
    Add-Content -Path $LogFile -Value $logEntry -Encoding UTF8
    Write-Host $logEntry
}

# Inicio
Write-Log "========================================"
Write-Log "Cleanup Qwen MCP - Iniciando"
Write-Log "Grace Period: $GracePeriod minutos"
Write-Log "Modo: $(if ($DryRun) { 'DRY RUN (simulacao)' } else { 'EXECUCAO REAL' })"

# Verifica se Qwen esta rodando
$qwenProcesses = Get-Process -Name "Qwen" -ErrorAction SilentlyContinue
if (-not $qwenProcesses) {
    Write-Log "Qwen nao encontrado - abortando" "WARN"
    exit 0
}

$qwenPids = $qwenProcesses | Select-Object -ExpandProperty Id
Write-Log "Qwen PIDs: $($qwenPids -join ', ')"

# Coleta TODOS os processos candidatos via CIM (mais completo que Get-Process)
Write-Log "Coletando processos do sistema (python, uvx, bun)..."
$allCimProcs = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | 
    Where-Object { $_.Name -match 'python|uvx|bun' }

if (-not $allCimProcs -or $allCimProcs.Count -eq 0) {
    Write-Log "Nenhum processo candidato encontrado"
    exit 0
}

Write-Log "Encontrados $($allCimProcs.Count) processos candidatos"

# Funcao recursiva para verificar se um processo esta na arvore do Qwen (ate 3 niveis)
function Test-IsInQwenTree {
    param(
        [int]$ProcessId,
        [int[]]$QwenPids,
        [hashtable]$ParentMap,
        [int]$MaxDepth = 3,
        [int]$CurrentDepth = 0
    )
    
    if ($CurrentDepth -ge $MaxDepth) { return $false }
    
    $parentPid = $ParentMap[$ProcessId]
    if (-not $parentPid) { return $false }
    
    # Nivel 1: filho direto do Qwen
    if ($QwenPids -contains $parentPid) { return $true }
    
    # Nivel 2+: recursivo
    return Test-IsInQwenTree -ProcessId $parentPid -QwenPids $QwenPids -ParentMap $ParentMap -MaxDepth $MaxDepth -CurrentDepth ($CurrentDepth + 1)
}

# Construi mapa de parentesco (ProcessId -> ParentProcessId)
$parentMap = @{}
foreach ($proc in $allCimProcs) {
    $parentMap[$proc.ProcessId] = $proc.ParentProcessId
}

# Identifica processos na arvore do Qwen
$qwenTreeProcs = $allCimProcs | Where-Object {
    $qwenPids -contains $_.ParentProcessId -or  # L1 (filho direto)
    (Test-IsInQwenTree -ProcessId $_.ProcessId -QwenPids $qwenPids -ParentMap $parentMap)  # L2, L3
}

Write-Log "Processos na arvore do Qwen: $($qwenTreeProcs.Count)"

# Contadores
$killedCount = 0
$preservedCount = 0
$whitelistedCount = 0
$ignoredCount = 0

# Processa cada processo da arvore
foreach ($proc in $qwenTreeProcs) {
    $procPid = $proc.ProcessId
    $procName = $proc.Name
    $ageMinutes = [math]::Round(((Get-Date) - $proc.CreationDate).TotalMinutes, 1)
    $commandLine = $proc.CommandLine
    
    # Whitelist: openbrowser daemon
    if ($commandLine -match 'openbrowser\.daemon\.server') {
        Write-Log "[WHITELIST] $procName PID $procPid - ${ageMinutes}min - openbrowser daemon (protegido)"
        $whitelistedCount++
        continue
    }
    
    # Whitelist: terminal-proxy.py
    if ($commandLine -match 'terminal-proxy\.py') {
        Write-Log "[WHITELIST] $procName PID $procPid - ${ageMinutes}min - terminal-proxy (protegido)"
        $whitelistedCount++
        continue
    }
    
    # Grace period check
    if ($ageMinutes -lt $GracePeriod) {
        Write-Log "[PRESERVED] $procName PID $procPid - ${ageMinutes}min (dentro do grace period)"
        $preservedCount++
        continue
    }
    
    # Processo excedeu grace period - finalizar
    if ($DryRun) {
        Write-Log "[DRY RUN] Seria finalizado: $procName PID $procPid - ${ageMinutes}min (excedeu grace period)"
        $killedCount++
    } else {
        try {
            Stop-Process -Id $procPid -Force -ErrorAction Stop
            Write-Log "[KILLED] $procName PID $procPid - ${ageMinutes}min (finalizado)"
            $killedCount++
        } catch {
            Write-Log "Erro ao finalizar PID $procPid - $_" "ERROR"
        }
    }
}

# Resumo
Write-Log "========================================"
Write-Log "[SUMMARY] RESUMO FINAL:"
Write-Log "   - Finalizados: $killedCount"
Write-Log "   - Preservados: $preservedCount"
Write-Log "   - Whitelisted: $whitelistedCount"
Write-Log "   - Total processado: $($killedCount + $preservedCount + $whitelistedCount)"
Write-Log "========================================"
Write-Log ""

Write-Host ""
Write-Host "Limpeza concluida!"
Write-Host "   Finalizados: $killedCount | Preservados: $preservedCount | Protegidos: $whitelistedCount"
Write-Host "   Log completo: $LogFile"
