import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { spawn } from "child_process";

class SatimMCPTester {
  private client: Client;
  private transport: StdioClientTransport;

  constructor() {
    // Spawn the MCP server process
    const serverProcess = spawn("ts-node", ["satim-mcp-server.ts"], {
      stdio: ["pipe", "pipe", "inherit"]
    });

    this.transport = new StdioClientTransport(
      serverProcess.stdin,
      serverProcess.stdout
    );
    
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
      });
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
      });
      console.log("✅ Order registered:", result);
      return result.content[0].text ? JSON.parse(result.content[0].text) : null;
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
      });
      console.log("✅ Order confirmed:", result);
      return result.content[0].text ? JSON.parse(result.content[0].text) : null;
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
      });
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
      });
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
      });
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
}

// Run the tests
const tester = new SatimMCPTester();
tester.runFullTest();