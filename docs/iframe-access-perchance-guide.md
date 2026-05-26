Use openbrowser mcp for this task.


---

## Guide: Direct Access to Cross-Origin Iframes on Perchance

### Context

Every Perchance generator runs inside a cross-origin iframe with a unique hash subdomain:

```
Main page:         https://perchance.org/<slug>
App iframe:        https://<hash>.perchance.org/<slug>
```

Common JavaScript **cannot** access the iframe's content (cross-origin). The correct access is via CDP `Target.attachToTarget`.

---

### 3-Step Strategy

```python
# STEP 1: Navigate and discover the iframe's targetId
await navigate("https://perchance.org/<slug>")
await wait(3)  # wait for iframe to load

cdp = browser.cdp_client
targets = await cdp.send_raw("Target.getTargets", params={})  # NO session_id

iframe_target = next(
    t for t in targets["targetInfos"]
    if t["type"] == "iframe" and ".perchance.org" in t["url"]
)
target_id = iframe_target["targetId"]

# STEP 2: Attach to the iframe to obtain sessionId
attach = await cdp.send_raw(
    "Target.attachToTarget",
    params={"targetId": target_id, "flatten": True}
)
iframe_sid = attach["sessionId"]

# STEP 3: Enable domains and execute JS inside the iframe context
await cdp.send_raw("Runtime.enable", params={}, session_id=iframe_sid)
await cdp.send_raw("Console.enable", params={}, session_id=iframe_sid)

# Now any CDP command runs INSIDE the iframe:
result = await cdp.send_raw(
    "Runtime.evaluate",
    params={"expression": "document.title"},
    session_id=iframe_sid
)
print(result)
```

---

### Reusable Function

```python
async def perchance_iframe(slug: str) -> tuple:
    """Returns (cdp, iframe_sid) ready for commands inside the iframe."""
    await navigate(f"https://perchance.org/{slug}")
    await wait(3)

    cdp = browser.cdp_client
    targets = await cdp.send_raw("Target.getTargets", params={})
    iframe = next(
        t for t in targets["targetInfos"]
        if t["type"] == "iframe" and ".perchance.org" in t["url"]
    )
    attach = await cdp.send_raw(
        "Target.attachToTarget",
        params={"targetId": iframe["targetId"], "flatten": True}
    )
    sid = attach["sessionId"]

    await cdp.send_raw("Runtime.enable", params={}, session_id=sid)
    await cdp.send_raw("Console.enable", params={}, session_id=sid)

    return cdp, sid

# Usage:
cdp, sid = await perchance_iframe("cp48hd48rs")

# Click a button inside the iframe:
await cdp.send_raw("Runtime.evaluate", params={
    "expression": "document.querySelector('button')?.click()"
}, session_id=sid)

# Extract console logs:
import json
await cdp.send_raw("Runtime.evaluate", params={
    "expression": """
        window._logs = window._logs || [];
        ['log','warn','error'].forEach(fn => {
            const orig = console[fn];
            console[fn] = (...args) => { window._logs.push({fn, args: args.map(String)}); orig(...args); };
        });
        'interceptor installed';
    """
}, session_id=sid)

# After interacting (use wait(5–10) for async ops like AI calls):
logs = await cdp.send_raw("Runtime.evaluate", params={
    "expression": "JSON.stringify(window._logs || [])"
}, session_id=sid)
print(logs["result"]["value"])
```

---

### Rules for the Agent

| Rule | Reason |
|------|--------|
| `Target.getTargets` **without** `session_id` | It's a browser-level command |
| Always `flatten: True` on attach | Without it, CDP creates a nested session whose `sessionId` cannot be used for commands — all `Runtime.evaluate` and `Console.enable` calls will fail with `"Session with given id not found"`. `flatten: True` makes the session directly usable. |
| Always `awaitPromise: True` for async code | Without it, Promises return as unresolved objects (`subtype: "promise"`) with no value. With it, primitives resolve to `value`, objects to `objectId`. |
| Use `returnByValue: True` for object results | Without it, async object results return only `objectId` (requires `Runtime.getProperties` to extract). With it, objects are serialized directly to `value`. |
| Enable `Runtime.enable` and `Console.enable` | Required for `evaluate` and log capture |
| Use `session_id=iframe_sid` in **all** subsequent commands | Ensures execution within the iframe context |
| `wait(3)` after `navigate` | Iframe loads asynchronously |
| `wait(N)` after async actions (AI, fetch, etc.) | Results may be delayed; use `wait(5–10)` before reading logs |
| Prefer ID selectors for buttons | Perchance test panel buttons have semantic IDs (`#btn-dice`, `#btn-ai-text`, etc.) — use `querySelector('#btn-dice')` instead of text-based selectors which are fragile due to emojis and whitespace |

---

### Pitfalls & Patterns

#### `flatten: True` is not optional

Without `flatten: True`, `Target.attachToTarget` returns a `sessionId`, but it refers to a **nested** session. Any command sent with that `sessionId` (e.g. `Runtime.evaluate`, `Console.enable`) fails with `"Session with given id not found"`. With `flatten: True`, the session is flattened to the CDP client level and the `sessionId` works for all commands.

**Verification:** After attaching, run `Runtime.enable` with the returned `sessionId`. If it throws `"Session with given id not found"`, the attach was done without `flatten: True`.

#### `awaitPromise: True` is mandatory for async code

Perchance plugins (AI Text, Image, TTS, etc.) are inherently async. `Runtime.evaluate` has two critical parameters for async code:

| Parameter | Purpose | Default |
|-----------|---------|---------|
| `awaitPromise` | Waits for Promise resolution before returning | `False` |
| `returnByValue` | Serializes objects to `value` instead of `objectId` | `False` |

**Without `awaitPromise: True`:**
```json
// Result of: (async () => 42)()
{"result": {"type": "object", "subtype": "promise", "description": "Promise"}}
// No value accessible
```

**With `awaitPromise: True` (primitives):**
```json
// Result of: (async () => 42)()
{"result": {"type": "number", "value": 42}}
```

**With `awaitPromise: True` (objects, without `returnByValue`):**
```json
// Result of: (async () => ({key: 'value'}))()
{"result": {"type": "object", "objectId": "..."}}
// Must call Runtime.getProperties to extract value
```

**With `awaitPromise: True` + `returnByValue: True` (objects):**
```json
// Result of: (async () => ({key: 'value'}))()
{"result": {"type": "object", "value": {"key": "value"}}}
```

**Error handling:** Without `awaitPromise`, rejected Promises return silently (no `exceptionDetails`). With `awaitPromise`, rejections populate `exceptionDetails` with full stack trace.

**Correct pattern for async evaluation:**
```python
result = await cdp.send_raw("Runtime.evaluate", params={
    "expression": "(async () => { /* async code */ })()",
    "awaitPromise": True,
    "returnByValue": True  # if returning objects
}, session_id=sid)
```

**Note:** `click()` and other synchronous DOM methods are unaffected by `awaitPromise`. For plugin results triggered by clicks, use: click (sync) + monitor console logs.

---

#### Console logs vs. return value: the async gap

When a button click triggers an async function inside Perchance (e.g., AI Text, Dice roll, Image generation), `Runtime.evaluate` returns **immediately** with `undefined` or the click confirmation — **not** the actual result. The real result appears in **console logs** or in the **DOM** (e.g., `#test-log`).

**Example:**
```python
# Click returns immediately, no result:
result = await cdp.send_raw("Runtime.evaluate", params={
    "expression": "document.querySelector('#btn-dice')?.click()",
    "returnByValue": True
}, session_id=sid)
print(result["result"])  # {'type': 'undefined'}

# But the dice result appears in console logs (captured via interceptor):
await wait(3)
logs = await cdp.send_raw("Runtime.evaluate", params={
    "expression": "JSON.stringify(window._logs || [])"
}, session_id=sid)
print(logs["result"]["value"])  # '[{"fn":"log","args":["✅ [Dice] Resultado: 15"]}]'
```

**Why this happens:**
- `click()` is synchronous — it returns immediately
- The click handler calls an async function (e.g., `aiText.generate()`)
- That async function logs its result via `console.log()` or updates the DOM
- `evaluate` does not wait for or capture those logs

**Correct patterns for plugin interactions:**

**Option 1: Console log interceptor**
1. Install console interceptor (see "Reusable Function" section)
2. Click the button (sync, returns undefined)
3. `wait(5-10)` for async operation to complete
4. Read `window._logs` to get the actual result

**Option 2: Read from DOM**
```python
# After clicking and waiting:
dom_result = await cdp.send_raw("Runtime.evaluate", params={
    "expression": """
        (function() {
            const log = document.querySelector('#test-log');
            if (!log) return 'not found';
            const entries = Array.from(log.querySelectorAll('.log-entry')).map(el => ({
                time: el.querySelector('.log-entry__time')?.textContent || '',
                msg: el.querySelector('.log-entry__msg')?.textContent || ''
            }));
            return JSON.stringify(entries);
        })()
    """,
    "returnByValue": True
}, session_id=sid)
print(dom_result["result"]["value"])
```

**Option 3: Use `Console.messageAdded` events**
For real-time log capture, but the interceptor pattern is simpler for most cases.

---

#### IIFE wrapper required for `return` statements

When using `Runtime.evaluate` with complex expressions that use `return`, wrap them in an IIFE (Immediately Invoked Function Expression) to avoid `SyntaxError: Illegal return statement`:

```python
# ❌ Wrong: top-level return causes SyntaxError
result = await cdp.send_raw("Runtime.evaluate", params={
    "expression": """
        const log = document.querySelector('#test-log');
        return log.textContent;
    """
}, session_id=sid)

# ✅ Correct: wrap in IIFE
result = await cdp.send_raw("Runtime.evaluate", params={
    "expression": """
        (function() {
            const log = document.querySelector('#test-log');
            return log.textContent;
        })()
    """,
    "returnByValue": True
}, session_id=sid)
```

---

#### DOM discovery snippet

Perchance generators have inconsistent HTML structures. Before interacting, discover available elements:

```python
# Find all buttons
buttons = await cdp.send_raw("Runtime.evaluate", params={
    "expression": """
        Array.from(document.querySelectorAll('button')).map(b => ({
            text: b.textContent.trim().substring(0, 50),
            id: b.id,
            className: b.className
        }))
    """,
    "returnByValue": True
}, session_id=sid)

# Find log/output elements
log_elements = await cdp.send_raw("Runtime.evaluate", params={
    "expression": """
        Array.from(document.querySelectorAll('[class*="log"], [id*="log"], [class*="output"], [id*="output"]')).map(el => ({
            tag: el.tagName,
            id: el.id,
            class: el.className.substring(0, 60),
            childCount: el.children.length,
            text: el.textContent.substring(0, 100)
        }))
    """,
    "returnByValue": True
}, session_id=sid)
```

---

#### Error-safe evaluate pattern

Wrap code in `try/catch` to capture errors as strings instead of failing silently:

```python
result = await cdp.send_raw("Runtime.evaluate", params={
    "expression": """
        (function() {
            try {
                // Your code here
                return document.querySelector('#nonexistent').textContent;
            } catch(e) {
                return 'ERROR: ' + e.message;
            }
        })()
    """,
    "returnByValue": True
}, session_id=sid)
```

---

#### CSS selectors: prefer IDs, avoid text-based selection

Perchance test panel buttons have **semantic IDs** (`#btn-dice`, `#btn-ai-text`, `#btn-image`, etc.). Always prefer ID selectors over text-based or class-based selectors.

**Why text-based selectors fail:**
- Button text contains emojis (`🎲 Dice`, `🤖 AI Text`) which may vary
- Whitespace differences (trimming issues)
- No `data-*` attributes available
- No Shadow DOM

**Selector strategy comparison:**

| Strategy | Robustness | Example |
|----------|------------|---------|
| ID selector | ✅ Most robust | `querySelector('#btn-dice')` |
| Class + text | ⚠️ Fallback | `Array.from(querySelectorAll('.ui-test-btn')).find(b => b.textContent?.includes('Dice'))` |
| XPath | ⚠️ Verbose | `document.evaluate('//button[contains(text(), "Dice")]', ...)` |
| `:contains()` | ❌ Invalid CSS | `querySelector('button:contains("Dice")')` — throws SyntaxError |

**Common mistakes:**
- `:contains()` is jQuery-only, not valid CSS — throws `SyntaxError`
- XPath syntax (`//button[...]`) in `querySelector` — throws `SyntaxError`
- Case-sensitive IDs: `#BTN-DICE` won't match `#btn-dice`

**Discovery pattern:**
```python
# List all buttons with their IDs (run this first to discover available elements)
discovery = await cdp.send_raw("Runtime.evaluate", params={
    "expression": """
        Array.from(document.querySelectorAll('button')).map(b => ({
            id: b.id,
            text: b.textContent?.trim().substring(0, 30)
        }))
    """,
    "returnByValue": True
}, session_id=sid)
print(discovery["result"]["value"])
# Output: [{"id":"btn-dice","text":"🎲 Dice"}, {"id":"btn-ai-text","text":"🤖 AI Text"}, ...]
```

**Click pattern:**
```python
# ✅ Correct: use ID selector
await cdp.send_raw("Runtime.evaluate", params={
    "expression": "document.querySelector('#btn-dice')?.click()",
    "returnByValue": True
}, session_id=sid)

# ❌ Wrong: text-based selector (fragile)
await cdp.send_raw("Runtime.evaluate", params={
    "expression": "Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Dice'))?.click()",
    "returnByValue": True
}, session_id=sid)
```

**Available button IDs in test panel:**
- System: `#btn-run-all`, `#btn-clear-log`, `#btn-export`
- Generation: `#btn-dice`, `#btn-seeder`, `#btn-pattern`
- AI: `#btn-ai-text`, `#btn-image`, `#btn-tts`, `#btn-tts-stop`
- Render: `#btn-3d`, `#btn-raycaster`, `#btn-canvas`, `#btn-rpg-icon`
- Charts: `#btn-chart-bar`, `#btn-chart-line`, `#btn-chart-pie`, `#btn-chart-radar`, `#btn-mermaid`, `#btn-matter`
- Audio: `#btn-audio-sfx`, `#btn-audio-music`, `#btn-audio-sprite`, `#btn-audio-volume`, `#btn-audio-stop`
- Data: `#btn-lists`, `#btn-bridge`, `#btn-state-save`, `#btn-state-load`, `#btn-kv`
