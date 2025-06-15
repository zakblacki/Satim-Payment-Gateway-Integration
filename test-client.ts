import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { z } from "zod";
import path from "path";
import { fileURLToPath } from "url";

// Get the current directory for resolving paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define response schemas
const ToolCallResponseSchema = z.object({
  content: z.array(z.object({
    type: z.string(),
    text: z.string().optional()
  }))
});

const ToolsListResponseSchema = z.object({
  tools: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    inputSchema: z.object({}).optional()
  }))
});

class SatimMCPTester {
  private client: Client;
  private transport: StdioClientTransport;

  constructor() {
    // Check if we're running in development or production mode
    const isDev = process.env.NODE_ENV === 'development';
    
    let serverParams;
    
    if (isDev) {
      // Development mode: use tsx
      serverParams = {
        command: "npx",
        args: ["tsx", "satim-mcp-server.ts"],
        env: {
          ...process.env,
          NODE_ENV: "development"
        }
      };
    } else {
      // Production mode: use compiled JS
      // Fix: Check if we're already in dist directory
      let serverPath;
      if (__dirname.endsWith('dist')) {
        // We're running from dist, so the server is in the same directory
        serverPath = path.resolve(__dirname, 'satim-mcp-server.js');
      } else {
        // We're running from project root, so server is in dist/
        serverPath = path.resolve(__dirname, 'dist', 'satim-mcp-server.js');
      }
      
      serverParams = {
        command: "node",
        args: [serverPath],
        env: {
          ...process.env,
          NODE_ENV: "production"
        }
      };
    }

    this.transport = new StdioClientTransport(serverParams);
    
    this.client = new Client({
      name: "satim-test-client",
      version: "1.0.0"
    }, {
      capabilities: {}
    });
  }

  async connect() {
    await this.client.connect(this.transport);
    console.log("Connected to SATIM MCP Server");
  }

  async testCredentials() {
    console.log("\n=== Testing Credentials Configuration ===");
    try {
      const result = await this.client.request({
        method: "tools/call",
        params: {
          name: "configure_credentials",
          arguments: {
            userName: "test_merchant",
            password: "test_password_123"
          }
        }
      }, ToolCallResponseSchema);
      console.log("✅ Credentials configured:", result);
    } catch (error) {
      console.error("❌ Credentials failed:", error);
    }
  }

  async testOrderRegistration() {
    console.log("\n=== Testing Order Registration ===");
    try {
      const result = await this.client.request({
        method: "tools/call",
        params: {
          name: "register_order",
          arguments: {
            orderNumber: `TEST_ORDER_${Date.now()}`,
            amountInDA: 150.75,
            returnUrl: "https://example.com/success",
            failUrl: "https://example.com/failure", 
            force_terminal_id: "E005005097",
            udf1: "test_reference_123",
            language: "FR",
            description: "Test order for MCP server"
          }
        }
      }, ToolCallResponseSchema);
      console.log("✅ Order registered:", result);
      return result.content[0]?.text ? JSON.parse(result.content[0].text) : null;
    } catch (error) {
      console.error("❌ Order registration failed:", error);
      return null;
    }
  }

  async testOrderConfirmation(orderId: string) {
    console.log("\n=== Testing Order Confirmation ===");
    try {
      const result = await this.client.request({
        method: "tools/call",
        params: {
          name: "confirm_order",
          arguments: {
            orderId: orderId,
            language: "FR"
          }
        }
      }, ToolCallResponseSchema);
      console.log("✅ Order confirmed:", result);
      return result.content[0]?.text ? JSON.parse(result.content[0].text) : null;
    } catch (error) {
      console.error("❌ Order confirmation failed:", error);
      return null;
    }
  }

  async testResponseValidation(response: any) {
    console.log("\n=== Testing Response Validation ===");
    try {
      const result = await this.client.request({
        method: "tools/call",
        params: {
          name: "validate_payment_response",
          arguments: {
            response: response
          }
        }
      }, ToolCallResponseSchema);
      console.log("✅ Response validated:", result);
    } catch (error) {
      console.error("❌ Response validation failed:", error);
    }
  }

  async testRefund(orderId: string) {
    console.log("\n=== Testing Refund ===");
    try {
      const result = await this.client.request({
        method: "tools/call",
        params: {
          name: "refund_order",
          arguments: {
            orderId: orderId,
            amountInDA: 50.00,
            language: "FR"
          }
        }
      }, ToolCallResponseSchema);
      console.log("✅ Refund processed:", result);
    } catch (error) {
      console.error("❌ Refund failed:", error);
    }
  }

  async listTools() {
    console.log("\n=== Available Tools ===");
    try {
      const result = await this.client.request({
        method: "tools/list",
        params: {}
      }, ToolsListResponseSchema);
      console.log("Available tools:", result.tools?.map(t => t.name));
    } catch (error) {
      console.error("❌ Failed to list tools:", error);
    }
  }

  async runFullTest() {
    try {
      await this.connect();
      await this.listTools();
      await this.testCredentials();
      
      const orderResult = await this.testOrderRegistration();
      if (orderResult?.orderId) {
        const confirmResult = await this.testOrderConfirmation(orderResult.orderId);
        if (confirmResult) {
          await this.testResponseValidation(confirmResult);
        }
        await this.testRefund(orderResult.orderId);
      }
      
      console.log("\n🎉 All tests completed!");
    } catch (error) {
      console.error("❌ Test suite failed:", error);
    }
  }

  async disconnect() {
    try {
      await this.client.close();
      console.log("Disconnected from SATIM MCP Server");
    } catch (error) {
      console.error("Error during disconnect:", error);
    }
  }
}

// Run the tests
const tester = new SatimMCPTester();
tester.runFullTest()
  .then(() => tester.disconnect())
  .catch(console.error);