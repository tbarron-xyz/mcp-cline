# mcp-cline
MCP Server to control `cline` via `cline-cli`. Run cline from cline.

# Configuring cline-cli
Cline-cli does not inherit your Cline VS Code extension settings and must be configured separately. See https://github.com/yaegaki/cline-cli (mirror: https://github.com/tbarron-xyz/cline-cli ) for details of the configuration. 

`cline_mcp_settings.json` should be identical to the VS code extension's. It seems cline-cli does not read the tools on the MCP servers automatically and pass them to the model in the API calls - maybe there's a way to enable this.

# Launching the MCP server

```
npx mcp-cline --mcpPort 3000
```

# Using the MCP server
## Tools
* `task(prompt)` - Launches `cline-cli task {prompt}`
* `readOutput()` - Read the entire output history of the task
* `y()` - Answer "y" to a y/n prompt
* `n()` - Answer "n" to a y/n prompt