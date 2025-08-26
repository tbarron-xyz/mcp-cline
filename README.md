# mcp-irc-ts
MCP Server to control `cline` via `cline-cli`. Run cline from cline.

# Launching the MCP server and IRC Client

```
npx mcp-cline --mcpPort 3000
```

# Using the MCP server
## Tools
* `task(prompt)` - Launches `cline-cli task {prompt}`
* `readOutput()` - Read the entire output history of the task
* `y()` - Answer "y" to a y/n prompt
* `n()` - Answer "n" to a y/n prompt