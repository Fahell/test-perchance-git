---

# Guide: Direct Access to Cross-Origin Iframes on Perchance

## Context

Every Perchance generator runs inside a cross-origin iframe. Common JavaScript cannot access it. The correct access is via CDP `Target.attachToTarget`. This guide uses the multi-frame approach as default — connecting to all frames (main page + iframes) for comprehensive log capture. Use openbrowser mcp. url: 
https://perchance.org/cp48hd48rs
---

## Core Functions

### `perchance_all_frames(slug)` — Connect to all frames

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
    await cdp.send_raw("Log.enable", params={}, session_id=main_sid)

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
        await cdp.send_raw("Log.enable", params={}, session_id=sid)
        iframe_sids.append(sid)

    return cdp, main_sid, iframe_sids
```

### `iframe_eval(cdp, sid, expression)` — Execute JS in a specific frame

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

### `install_log_interceptor(cdp, session_ids)` — Intercept all logs in all frames

```python
async def install_log_interceptor(cdp, session_ids: list[str]):
    """Installs comprehensive log interceptor in all frames.

    Captures:
      - console.log/warn/error/info/debug
      - Uncaught exceptions (window 'error' event)
      - Unhandled promise rejections
      - Resource load errors (img, script, link)
      - Fetch/XHR failures

    Note: Browser-internal errors (ERR_BLOCKED_BY_CLIENT, cross-origin postMessage)
    are NOT captured. These are noise from ad-blockers and security policies.
    """
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

            window.addEventListener('error', function(e) {
                var msg = e.message;
                if (!msg.startsWith('Uncaught ')) { msg = 'Uncaught ' + msg; }
                if (e.filename) { msg += ' @ ' + e.filename + ':' + e.lineno; }
                window.__consoleLogs.push({ type: 'error', msg: msg, time: Date.now() });
            });

            window.addEventListener('error', function(e) {
                var target = e.target || e.srcElement;
                if (target && target !== window) {
                    var src = target.src || target.href || '(unknown resource)';
                    window.__consoleLogs.push({
                        type: 'error',
                        msg: 'Failed to load resource: ' + src,
                        time: Date.now()
                    });
                }
            }, true);

            window.addEventListener('unhandledrejection', function(e) {
                var reason = e.reason;
                var msg = typeof reason === 'object' ? (reason.message || JSON.stringify(reason)) : String(reason);
                window.__consoleLogs.push({
                    type: 'error',
                    msg: 'Unhandled Promise Rejection: ' + msg,
                    time: Date.now()
                });
            });

            var origFetch = window.fetch;
            window.fetch = function() {
                var url = arguments[0];
                return origFetch.apply(this, arguments).catch(function(err) {
                    window.__consoleLogs.push({
                        type: 'error',
                        msg: 'Fetch failed: ' + (err.message || String(err)) + ' — ' + url,
                        time: Date.now()
                    });
                    throw err;
                });
            };

            var origXHROpen = XMLHttpRequest.prototype.open;
            var origXHRSend = XMLHttpRequest.prototype.send;
            XMLHttpRequest.prototype.open = function(method, url) {
                this._url = url;
                return origXHROpen.apply(this, arguments);
            };
            XMLHttpRequest.prototype.send = function() {
                this.addEventListener('error', function() {
                    window.__consoleLogs.push({
                        type: 'error',
                        msg: 'XHR failed: ' + (this._url || 'unknown'),
                        time: Date.now()
                    });
                });
                return origXHRSend.apply(this, arguments);
            };
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

### `poll_all_frame_logs(cdp, all_sids, duration, interval)` — Collect logs from all frames

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
        List of log entries sorted by time:
        [{"source": "main"|"iframe-N", "type": str, "msg": str, "time": int}]
    """
    all_logs = []
    seen_console = {sid: 0 for sid in all_sids}
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

                new_logs = logs[seen_console[sid]:]
                seen_console[sid] = len(logs)

                for log in new_logs:
                    all_logs.append({
                        "source": source,
                        "type": log["type"],
                        "msg": log["msg"],
                        "time": log.get("time", 0)
                    })
            except Exception:
                pass

        await asyncio.sleep(interval)

    all_logs.sort(key=lambda x: x.get("time", 0))
    return all_logs
```

---

## Critical Rules

| Rule | Consequence if violated |
|------|------------------------|
| `flatten: True` on every `Target.attachToTarget` | Commands fail with `"Session with given id not found"` |
| `awaitPromise: True` for async expressions | Returns `{subtype: "promise"}` — no value accessible |
| `returnByValue: True` for object results | Returns `objectId` — requires extra `Runtime.getProperties` call |
| Wrap `return` statements in IIFE | `SyntaxError: Illegal return statement` |
| `Target.getTargets` without `session_id` | It's a browser-level command, not frame-level |
| Enable `Runtime.enable` + `Console.enable` per frame | Required for `evaluate` and log capture |
| Wait 4s after `navigate` | Iframe loads asynchronously |
| Wait 5-10s after async triggers before reading logs | Results may be delayed |
| Install interceptor in ALL frames | Each frame has independent `console` |
| Attach to all frame targets (page + iframes) | CDP events are per-target |

### Verification for `flatten: True`

After attaching, run `Runtime.enable` with the returned `sessionId`. If it throws `"Session with given id not found"`, the attach was done without `flatten: True`.

### `awaitPromise` in detail

```python
# ❌ Without awaitPromise (default: False)
result = await iframe_eval(cdp, sid, "(async () => 42)()", await_promise=False)
print(result)  # {"type": "object", "subtype": "promise"} — useless

# ✅ With awaitPromise: True
result = await iframe_eval(cdp, sid, "(async () => 42)()", await_promise=True)
print(result)  # {"type": "number", "value": 42}

# ✅ With awaitPromise + returnByValue for objects
result = await iframe_eval(cdp, sid, "(async () => ({key: 'value'}))()")
print(result)  # {"type": "object", "value": {"key": "value"}}
```

---

## The Async Gap

When a button triggers async code (AI, dice, image generation), `Runtime.evaluate` returns immediately — **not** the actual result. The result appears in **console logs** or **DOM updates**.

```python
# Click returns immediately:
result = await iframe_eval(cdp, sid, "document.querySelector('#btn-dice')?.click()")
print(result)  # {"type": "undefined"}

# Correct: capture from console logs
await wait(3)
logs = await poll_all_frame_logs(cdp, all_sids, duration=5)
# logs now contains: [{"source": "iframe-1", "type": "log", "msg": "✅ [Dice] Resultado: 15"}]
```

---

## DOM Interaction Cheatsheet

### Discovery (always run first)

```python
# List all buttons with IDs
buttons = await iframe_eval(cdp, sid, """
    Array.from(document.querySelectorAll('button')).map(b => ({
        id: b.id,
        text: b.textContent?.trim().substring(0, 30)
    }))
""")

# Find output/log elements
outputs = await iframe_eval(cdp, sid, """
    Array.from(document.querySelectorAll('[class*="log"], [id*="log"], [class*="output"], [id*="output"]')).map(el => ({
        tag: el.tagName,
        id: el.id,
        class: el.className.substring(0, 60),
        text: el.textContent.substring(0, 100)
    }))
""")
```

### Clicking

```python
# ✅ ID selector (most robust)
await iframe_eval(cdp, sid, "document.querySelector('#btn-dice')?.click()")

# ❌ Avoid: text-based selectors (fragile), :contains() (jQuery-only, throws SyntaxError)
```

### Reading results

```python
# From DOM
text = await iframe_eval(cdp, sid, "document.querySelector('#test-log')?.textContent")

# From console (preferred for async operations)
logs = await poll_all_frame_logs(cdp, all_sids, duration=5)
```

### Error-safe evaluation

```python
result = await iframe_eval(cdp, sid, """
    (function() {
        try {
            return document.querySelector('#x').textContent;
        } catch(e) {
            return 'ERROR: ' + e.message;
        }
    })()
""")
```

---

## Notes

- **Prefer `Runtime.evaluate`** over CDP `DOM.*` methods — 1 step vs. 3+ steps for the same operation
- **Browser-internal errors are not captured:** `ERR_BLOCKED_BY_CLIENT` and cross-origin `postMessage` errors are generated by the browser engine, not JavaScript. They are noise from ad-blockers and security policies
- **Perchance test panel buttons have semantic IDs:** `#btn-dice`, `#btn-ai-text`, `#btn-image`, etc. — always prefer these over class or text selectors

---