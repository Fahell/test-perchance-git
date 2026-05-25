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
| Always `flatten: True` on attach | CDP-compatible format |
| Enable `Runtime.enable` and `Console.enable` | Required for `evaluate` and log capture |
| Use `session_id=iframe_sid` in **all** subsequent commands | Ensures execution within the iframe context |
| `wait(3)` after `navigate` | Iframe loads asynchronously |
| `wait(N)` after async actions (AI, fetch, etc.) | Results may be delayed; use `wait(5–10)` before reading logs |

---