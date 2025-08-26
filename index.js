#!/usr/bin/env node
/* eslint @typescript-eslint/no-explicit-any: 0 */
/* eslint no-empty-pattern: 0 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import express from "express";
import { v4 } from "uuid";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import minimist from 'minimist';
import childProcess from "child_process";
import readline from "readline";
var argv = minimist(process.argv.slice(2));
var lastMessages = []; // this could be redis
var taskProcess; // yes, global
var app = express();
app.use(express.json());
// Map to store transports by session ID
var transports = {};
// Handle POST requests for client-to-server communication
app.post('/mcp', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var sessionId, transport, server;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                sessionId = req.headers['mcp-session-id'];
                if (!(sessionId && transports[sessionId])) return [3 /*break*/, 1];
                // Reuse existing transport
                transport = transports[sessionId];
                return [3 /*break*/, 4];
            case 1:
                if (!(!sessionId && isInitializeRequest(req.body))) return [3 /*break*/, 3];
                // New initialization request
                transport = new StreamableHTTPServerTransport({
                    sessionIdGenerator: function () { return v4(); },
                    onsessioninitialized: function (sessionId) {
                        // Store the transport by session ID
                        transports[sessionId] = transport;
                    },
                    // DNS rebinding protection is disabled by default for backwards compatibility. If you are running this server
                    // locally, make sure to set:
                    // enableDnsRebindingProtection: true,
                    // allowedHosts: ['127.0.0.1'],
                });
                // Clean up transport when closed
                transport.onclose = function () {
                    if (transport.sessionId) {
                        delete transports[transport.sessionId];
                    }
                };
                server = new McpServer({
                    name: "mcp-cline",
                    version: "1.0.0"
                }, { capabilities: { tools: {} } });
                // ... set up server resources, tools, and prompts ...
                server.registerTool("task", {
                    description: "Spawn a new task for cline",
                    inputSchema: {
                        task: z.string().describe("The prompt for the task"),
                    },
                }, function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                    var rl;
                    var task = _b.task;
                    return __generator(this, function (_c) {
                        taskProcess = childProcess.spawn("cline-cli ".concat(task));
                        rl = readline.createInterface({ input: taskProcess.stdout });
                        rl.on('line', function (line) { return lastMessages.unshift(line); });
                        return [2 /*return*/, {
                                content: [
                                    {
                                        type: "text",
                                        text: "Done",
                                    },
                                ],
                            }];
                    });
                }); });
                server.registerTool("y", {
                    description: "Send a 'y' and a newline",
                    inputSchema: {},
                }, function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                    return __generator(this, function (_c) {
                        taskProcess.send("y\n");
                        return [2 /*return*/, {
                                content: [
                                    {
                                        type: "text",
                                        text: "Done",
                                    },
                                ],
                            }];
                    });
                }); });
                server.registerTool("n", {
                    description: "Send an 'n' and a newline",
                    inputSchema: {},
                }, function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                    return __generator(this, function (_c) {
                        taskProcess.send("n\n");
                        return [2 /*return*/, {
                                content: [
                                    {
                                        type: "text",
                                        text: "Done",
                                    },
                                ],
                            }];
                    });
                }); });
                server.registerTool("readOutput", {
                    description: "Read the output of the task",
                    inputSchema: {},
                }, function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                    return __generator(this, function (_c) {
                        return [2 /*return*/, {
                                content: [
                                    {
                                        type: "text",
                                        text: JSON.stringify(lastMessages),
                                    },
                                ],
                            }];
                    });
                }); });
                server.registerTool("exitCode", {
                    description: "Returns the exit code, if the task is completed, or null, if the task is still running",
                    inputSchema: {},
                }, function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                    return __generator(this, function (_c) {
                        return [2 /*return*/, {
                                content: [
                                    {
                                        type: "text",
                                        text: JSON.stringify(taskProcess.exitCode),
                                    },
                                ],
                            }];
                    });
                }); });
                // Connect to the MCP server
                return [4 /*yield*/, server.connect(transport)];
            case 2:
                // Connect to the MCP server
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                // Invalid request
                res.status(400).json({
                    jsonrpc: '2.0',
                    error: {
                        code: -32000,
                        message: 'Bad Request: No valid session ID provided',
                    },
                    id: null,
                });
                return [2 /*return*/];
            case 4: 
            // Handle the request
            return [4 /*yield*/, transport.handleRequest(req, res, req.body)];
            case 5:
                // Handle the request
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
// Reusable handler for GET and DELETE requests
var handleSessionRequest = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var sessionId, transport;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                sessionId = req.headers['mcp-session-id'];
                if (!sessionId || !transports[sessionId]) {
                    res.status(400).send('Invalid or missing session ID');
                    return [2 /*return*/];
                }
                transport = transports[sessionId];
                return [4 /*yield*/, transport.handleRequest(req, res)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
// Handle GET requests for server-to-client notifications via SSE
app.get('/mcp', handleSessionRequest);
// Handle DELETE requests for session termination
app.delete('/mcp', handleSessionRequest);
console.log("listening");
app.listen(argv["mcpPort"] || 3000);
