import express from 'express';
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { spawn } from "child_process";

const app = express();
app.use(express.json());

class MCPHttpWrapper {
  private client: Client;
  private transport: StdioClientTransport;

  constructor() {
    const serverProcess = spawn("ts-node", ["satim-mcp-server.ts"], {
      stdio: ["pipe", "pipe", "inherit"]
    });

    this.transport = new StdioClientTransport(
      serverProcess.stdin,
      serverProcess.stdout
    );
    
    this.client = new Client({
      name: "satim-http-wrapper",
      version: "1.0.0"
    }, { capabilities: {} });
  }

  async connect() {
    await this.client.connect(this.transport);
  }

  async callTool(name: string, args: any) {
    return await this.client.request({
      method: "tools/call",
      params: { name, arguments: args }
    });
  }
}

const mcpWrapper = new MCPHttpWrapper();

// Initialize connection
mcpWrapper.connect().then(() => {
  console.log("MCP wrapper connected");
});

// API Routes
app.post('/api/satim/configure', async (req, res) => {
  try {
    const result = await mcpWrapper.callTool('configure_credentials', req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/satim/register', async (req, res) => {
  try {
    const result = await mcpWrapper.callTool('register_order', req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/satim/confirm', async (req, res) => {
  try {
    const result = await mcpWrapper.callTool('confirm_order', req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/satim/refund', async (req, res) => {
  try {
    const result = await mcpWrapper.callTool('refund_order', req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/satim/validate', async (req, res) => {
  try {
    const result = await mcpWrapper.callTool('validate_payment_response', req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SATIM HTTP API running on port ${PORT}`);
});