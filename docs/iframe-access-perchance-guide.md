Use openbrowser mcp for this task. url: https://perchance.org/cp48hd48rs



---

## Guide: Direct Access to Cross-Origin Iframes on Perchance

### Context

Every Perchance generator runs inside a cross-origin iframe with a unique hash subdomain:

```
Main page:         https://perchance.org/<slug>
App iframe:        https://<hash>.perchance.org/<slug>
```

Common JavaScript **cannot** access the iframe's content (cross-origin). The correct access is via CDP `Target.attachToTarget`.

**Important:** Connecting to a single iframe only captures console events from that target. The browser DevTools aggregates logs from all frames automatically, but CDP does not. This guide uses the **multi-frame approach** as the default — connecting to all frames (main page + iframes) for comprehensive log capture.

---

### Automated Multi-Frame Access

The CDP connection process is encapsulated in reusable functions. Use them directly in any `openbrowser` session.

#### `perchance_all_frames(slug)` — Connect to all frames

```python
async def perchance_all_frames(slug: str) -> tuple:
    """Returns (cdp, main_sid, [iframe_sids]) for all frames.

    Internally performs:
      1. navigate() + wait(4) — load page and all iframes
      2. Target.getTargets — discover all frame targets
      3. Target.attachToTarget (flatten: True) — attach to each
      4. Runtime.enable + Console.enable — activate execution context
    """
    await navigate(f"https://perchance.org/{slug}")
    await wait(4)

    cdp = browser.cdp_client
    targets = await cdp.send_raw("Target.getTargets", params={})

    page_target = None
    iframe_targets = []

    for t in targets["targetInfos"]:
        if t["type"] == "page":
            page_target = t
        elif t["type"] == "iframe" and ".perchance.org" in t["url"]:
            iframe_targets.append(t)

    # Attach to main page
    main_attach = await cdp.send_raw(
        "Target.attachToTarget",
        params={"targetId": page_target["targetId"], "flatten": True}
    )
    main_sid = main_attach["sessionId"]
    await cdp.send_raw("Runtime.enable", params={}, session_id=main_sid)
    await cdp.send_raw("Console.enable", params={}, session_id=main_sid)

    # Attach to all iframes
    iframe_sids = []
    for iframe in iframe_targets:
        attach = await cdp.send_raw(
            "Target.attachToTarget",
            params={"targetId": iframe["targetId"], "flatten": True}
        )
        sid = attach["sessionId"]
        await cdp.send_raw("Runtime.enable", params={}, session_id=sid)
        await cdp.send_raw("Console.enable", params={}, session_id=sid)
        iframe_sids.append(sid)

    return cdp, main_sid, iframe_sids
```

#### `iframe_eval(cdp, sid, expression)` — Execute JS in a specific frame

```python
async def iframe_eval(cdp, sid: str, expression: str, await_promise: bool = True) -> dict:
    """Evaluates JavaScript inside a frame and returns the result."""
    result = await cdp.send_raw(
        "Runtime.evaluate",
        params={
            "expression": expression,
            "returnByValue": True,
            "awaitPromise": await_promise,
        },
        session_id=sid
    )
    return result.get("result", {})
```

#### `install_log_interceptor(cdp, session_ids)` — Intercept console in all frames

```python
async def install_log_interceptor(cdp, session_ids: list[str]):
    """Installs console.log/warn/error/info/debug interceptor in all frames."""
    interceptor_code = """
        if (!window.__consoleLogs) {
            window.__consoleLogs = [];
            window.__origConsole = {};
            ['log', 'warn', 'error', 'info', 'debug'].forEach(method => {
                window.__origConsole[method] = console[method];
                console[method] = function(...args) {
                    window.__consoleLogs.push({
                        type: method,
                        msg: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '),
                        time: Date.now()
                    });
                    window.__origConsole[method](...args);
                };
            });
        }
        'interceptor installed';
    """
    for sid in session_ids:
        await cdp.send_raw("Runtime.evaluate", params={
            "expression": interceptor_code,
            "returnByValue": True,
            "awaitPromise": False
        }, session_id=sid)
```

#### `poll_all_frame_logs(cdp, all_sids, duration, interval)` — Collect logs from all frames

```python
import asyncio
import json

async def poll_all_frame_logs(cdp, all_sids: list[str], duration: int = 10, interval: float = 0.5) -> list[dict]:
    """Polls console logs from all frames over a duration.

    Args:
        all_sids: List of session IDs (main + iframes)
        duration: How long to poll (seconds)
        interval: Polling interval (seconds)

    Returns:
        List of log entries: [{"source": "main"|"iframe", "type": "log"|"warn"|..., "msg": str}]
    """
    all_logs = []
    seen_logs = {sid: 0 for sid in all_sids}
    end_time = asyncio.get_event_loop().time() + duration

    while asyncio.get_event_loop().time() < end_time:
        for i, sid in enumerate(all_sids):
            source = "main" if i == 0 else f"iframe-{i}"
            try:
                result = await cdp.send_raw("Runtime.evaluate", params={
                    "expression": "window.__consoleLogs ? JSON.stringify(window.__consoleLogs) : '[]'",
                    "returnByValue": True
                }, session_id=sid)
                
                val = result.get("result", {}).get("value", "[]")
                logs = json.loads(val) if isinstance(val, str) else val
                
                # Get only new logs since last check
                new_logs = logs[seen_logs[sid]:]
                seen_logs[sid] = len(logs)
                
                for log in new_logs:
                    all_logs.append({
                        "source": source,
                        "type": log["type"],
                        "msg": log["msg"]
                    })
            except Exception:
                pass
        
        await asyncio.sleep(interval)

    return all_logs
```

#### Usage

```python
# Connect to all frames (main page + iframes)
cdp, main_sid, iframe_sids = await perchance_all_frames("cp48hd48rs")
all_sids = [main_sid] + iframe_sids

# Install log interceptor in all frames
await install_log_interceptor(cdp, all_sids)

# Click a button inside the iframe
await iframe_eval(cdp, iframe_sids[0], "document.querySelector('#btn-dice')?.click()")
await wait(1)

# Read results from DOM
log = await iframe_eval(cdp, iframe_sids[0], "document.querySelector('#test-log')?.textContent")
print(log.get("value"))

# Poll logs from all frames after an async action
await iframe_eval(cdp, iframe_sids[0], "document.querySelector('#btn-ai-text')?.click()")
logs = await poll_all_frame_logs(cdp, all_sids, duration=10, interval=0.5)

# Display results
for entry in logs:
    print(f"[{entry['source']}] [{entry['type']}] {entry['msg']}")
```

#### Output example

```
[main] [log] Page loaded
[iframe-1] [log] 🤖 [AI-Text] Gerando texto básico...
[iframe-1] [log] ✅ [AI-Text] Texto gerado: Com a espada enferrujada...
[iframe-1] [debug] streamKeepAlive: heartbeat
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
| Use `session_id=<sid>` in **all** subsequent commands | Ensures execution within the correct frame context |
| `wait(4)` after `navigate` | Iframe loads asynchronously |
| `wait(N)` after async actions (AI, fetch, etc.) | Results may be delayed; use `wait(5–10)` before reading logs |
| Prefer `Runtime.evaluate` over CDP `DOM.*` methods | `DOM.*` methods require multiple steps for simple operations (e.g., getting text content). `Runtime.evaluate` with native DOM API is more direct and efficient. |
| Attach to **all** frame targets (page + iframes) | CDP events are per-target; without attaching to each, logs are missed |
| Install interceptor in **every** frame | Each frame has its own `console` object |
| Use polling instead of CDP events | `register.Runtime.consoleAPICalled` does not reliably receive events from attached sessions |
| Track seen log count per frame | Avoids duplicate entries when polling repeatedly |
| Filter irrelevant logs in post-processing | Keep-alive heartbeats and debug noise may need filtering |

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
result = await iframe_eval(cdp, iframe_sids[0], "document.querySelector('#btn-dice')?.click()")
print(result)  # {'type': 'undefined'}

# But the dice result appears in console logs (captured via interceptor):
await wait(3)
logs = await poll_all_frame_logs(cdp, all_sids, duration=1)
print(logs)  # [{'source': 'iframe-1', 'type': 'log', 'msg': '✅ [Dice] Resultado: 15'}]
```

**Why this happens:**
- `click()` is synchronous — it returns immediately
- The click handler calls an async function (e.g., `aiText.generate()`)
- That async function logs its result via `console.log()` or updates the DOM
- `evaluate` does not wait for or capture those logs

**Correct patterns for plugin interactions:**

**Option 1: Console log interceptor (recommended)**
1. Install console interceptor in all frames
2. Click the button (sync, returns undefined)
3. `poll_all_frame_logs()` to capture async results

**Option 2: Read from DOM**
```python
# After clicking and waiting:
dom_result = await iframe_eval(cdp, iframe_sids[0], """
    (function() {
        const log = document.querySelector('#test-log');
        if (!log) return 'not found';
        const entries = Array.from(log.querySelectorAll('.log-entry')).map(el => ({
            time: el.querySelector('.log-entry__time')?.textContent || '',
            msg: el.querySelector('.log-entry__msg')?.textContent || ''
        }));
        return JSON.stringify(entries);
    })()
""")
print(dom_result.get("value"))
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
buttons = await iframe_eval(cdp, iframe_sids[0], """
    Array.from(document.querySelectorAll('button')).map(b => ({
        text: b.textContent.trim().substring(0, 50),
        id: b.id,
        className: b.className
    }))
""")

# Find log/output elements
log_elements = await iframe_eval(cdp, iframe_sids[0], """
    Array.from(document.querySelectorAll('[class*="log"], [id*="log"], [class*="output"], [id*="output"]')).map(el => ({
        tag: el.tagName,
        id: el.id,
        class: el.className.substring(0, 60),
        childCount: el.children.length,
        text: el.textContent.substring(0, 100)
    }))
""")
```

---

#### Error-safe evaluate pattern

Wrap code in `try/catch` to capture errors as strings instead of failing silently:

```python
result = await iframe_eval(cdp, iframe_sids[0], """
    (function() {
        try {
            // Your code here
            return document.querySelector('#nonexistent').textContent;
        } catch(e) {
            return 'ERROR: ' + e.message;
        }
    })()
""")
```

---

#### CSS selectors: prefer IDs, avoid text-based selection

Perchance test panel buttons have **semantic IDs** (`#btn-dice`, `#btn-ai-text`, `#btn-image`, etc.). Always prefer ID selectors over text-based or class-based selectors.

**Why text-based selectors fail:**
- Button text contains emojis (🎲 Dice, 🤖 AI Text) which may vary
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
discovery = await iframe_eval(cdp, iframe_sids[0], """
    Array.from(document.querySelectorAll('button')).map(b => ({
        id: b.id,
        text: b.textContent?.trim().substring(0, 30)
    }))
""")
print(discovery.get("value"))
# Output: [{"id":"btn-dice","text":"🎲 Dice"}, {"id":"btn-ai-text","text":"🤖 AI Text"}, ...]
```

**Click pattern:**
```python
# ✅ Correct: use ID selector
await iframe_eval(cdp, iframe_sids[0], "document.querySelector('#btn-dice')?.click()")

# ❌ Wrong: text-based selector (fragile)
await iframe_eval(cdp, iframe_sids[0], "Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Dice'))?.click()")
```

---

#### Prefer `Runtime.evaluate` over CDP `DOM.*` methods

CDP provides native `DOM.*` methods (`DOM.querySelector`, `DOM.getOuterHTML`, etc.), but `Runtime.evaluate` with native DOM API is **simpler and more efficient** for most tasks.

**Why `DOM.*` methods are verbose:**

| Task | `DOM.*` steps | `Runtime.evaluate` steps |
|------|---------------|--------------------------|
| Get text content | `DOM.querySelector` → `DOM.getOuterHTML` → parse HTML | Single `evaluate` call |
| Click element | `DOM.querySelector` → `DOM.resolveNode` → `Runtime.callFunctionOn` | Single `evaluate` call |
| XPath search | `DOM.performSearch` → `DOM.getSearchResults` → `DOM.discardSearchResults` | Single `evaluate` call |
| Get multiple properties | Multiple `DOM.describeNode` calls | Single `evaluate` call |

**Example: Getting button text**

```python
# ❌ DOM API (3 steps):
doc = await cdp.send_raw("DOM.getDocument", params={"depth": 0}, session_id=sid)
result = await cdp.send_raw("DOM.querySelector", params={
    "nodeId": doc["root"]["nodeId"],
    "selector": "#btn-dice"
}, session_id=sid)
html = await cdp.send_raw("DOM.getOuterHTML", params={
    "nodeId": result["nodeId"]
}, session_id=sid)
# Must parse HTML to extract text content

# ✅ Runtime.evaluate (1 step):
result = await iframe_eval(cdp, iframe_sids[0], "document.querySelector('#btn-dice')?.textContent")
print(result.get("value"))  # "🎲 Dice"
```

**Example: Clicking a button**

```python
# ❌ DOM API (3 steps):
doc = await cdp.send_raw("DOM.getDocument", params={"depth": 0}, session_id=sid)
result = await cdp.send_raw("DOM.querySelector", params={
    "nodeId": doc["root"]["nodeId"],
    "selector": "#btn-dice"
}, session_id=sid)
resolved = await cdp.send_raw("DOM.resolveNode", params={
    "nodeId": result["nodeId"]
}, session_id=sid)
await cdp.send_raw("Runtime.callFunctionOn", params={
    "objectId": resolved["object"]["objectId"],
    "functionDeclaration": "function() { this.click(); }"
}, session_id=sid)

# ✅ Runtime.evaluate (1 step):
await iframe_eval(cdp, iframe_sids[0], "document.querySelector('#btn-dice')?.click()")
```

**Example: XPath search**

```python
# ❌ DOM API (3 steps):
search = await cdp.send_raw("DOM.performSearch", params={
    "query": "//button[contains(text(), 'Dice')]"
}, session_id=sid)
results = await cdp.send_raw("DOM.getSearchResults", params={
    "searchId": search["searchId"],
    "fromIndex": 0,
    "toIndex": search["resultCount"]
}, session_id=sid)
await cdp.send_raw("DOM.discardSearchResults", params={
    "searchId": search["searchId"]
}, session_id=sid)
# results["nodeIds"][0] is the nodeId

# ✅ Runtime.evaluate (1 step):
result = await iframe_eval(cdp, iframe_sids[0], """
    (function() {
        const r = document.evaluate(
            "//button[contains(text(), 'Dice')]",
            document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null
        );
        return r.singleNodeValue?.id;
    })()
""")
print(result.get("value"))  # "btn-dice"
```

**When to use `DOM.*` methods:**
- When you need the raw `nodeId` for subsequent CDP operations
- When working with CDP-specific features like `DOM.setOuterHTML`
- When you need to traverse the DOM tree programmatically via `DOM.describeNode`

**Rule of thumb:** Use `Runtime.evaluate` for all DOM interactions unless you specifically need CDP-level node references.

---

#### Why single-target capture is insufficient

| Approach | Coverage | Limitation |
|----------|----------|------------|
| Attach to 1 iframe | ✅ Single frame | Misses logs from other iframes and main page |
| `Target.setAutoAttach` | ⚠️ New targets only | Does not cover existing frames |
| `register.Runtime.consoleAPICalled` | ⚠️ Main page only | Does not receive events from attached sessions |
| **Intercept + Polling (all frames)** | ✅ All frames | Most reliable for comprehensive log capture |
