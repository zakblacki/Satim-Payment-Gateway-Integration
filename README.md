# Satim Payment Gateway Integration

npm install @modelcontextprotocol/sdk axios
npm install --save-dev typescript @types/node tsx
npm install zod
npm install -g ts-node

# Run your server
npx tsx satim-mcp-server.ts


# SATIM Payment Gateway MCP Server

A Model Context Protocol (MCP) server for integrating with the SATIM payment gateway system in Algeria. This server provides a structured interface for processing CIB/Edhahabia card payments through the SATIM-IPAY platform.

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Payment Flow](#payment-flow)
5. [Tools](#tools)
6. [Integration Requirements](#integration-requirements)
7. [Error Handling](#error-handling)
8. [Examples](#examples)
9. [Security Considerations](#security-considerations)

## Overview

The SATIM Payment Gateway MCP Server implements the complete payment workflow for Algerian merchants using the SATIM platform:

- **Order Registration**: Register payment orders with the SATIM gateway
- **Payment Processing**: Handle customer redirects to payment forms
- **Order Confirmation**: Verify payment status after customer returns
- **Refund Processing**: Process partial or full refunds
- **Response Validation**: Interpret payment responses correctly

### Key Features

- Type-safe TypeScript implementation
- Automatic amount conversion (DA ↔ centimes)
- Comprehensive error handling
- Multi-language support (Arabic, French, English)
- Built-in response validation
- SSL-ready for production environments

## Installation

### Prerequisites

- Node.js 18+ 
- TypeScript
- MCP SDK

### Setup

1. Install dependencies:
```bash
npm install @modelcontextprotocol/sdk axios typescript
```

2. Compile TypeScript:
```bash
npx tsc satim-mcp-server.ts --target es2020 --module es2020 --moduleResolution node
```

3. Configure your MCP client to use this server:
```json
{
  "mcpServers": {
    "satim-payment": {
      "command": "node",
      "args": ["./satim-mcp-server.js"]
    }
  }
}
```

## Configuration

### Initial Setup

Before using any payment tools, configure your SATIM credentials:

```typescript
// Configure credentials
await mcp.callTool("configure_credentials", {
  userName: "your_merchant_username",
  password: "your_merchant_password"
});
```

### Environment Variables

For production, consider using environment variables:

```bash
SATIM_USERNAME=your_merchant_username
SATIM_PASSWORD=your_merchant_password
SATIM_TERMINAL_ID=your_terminal_id
```

## Payment Flow

The complete payment process follows these steps:

### 1. Order Registration
```typescript
const registrationResult = await mcp.callTool("register_order", {
  orderNumber: "ORDER_001_2024",
  amountInDA: 1500.50,  // Amount in Algerian Dinars
  returnUrl: "https://yoursite.com/payment/success",
  failUrl: "https://yoursite.com/payment/failure",
  force_terminal_id: "E005005097",
  udf1: "merchant_ref_123",
  language: "FR"
});

// Response includes orderId and formUrl
// Redirect customer to formUrl for payment
```

### 2. Customer Payment
- Customer fills CIB/Edhahabia card details on SATIM form
- Customer is redirected back to your returnUrl/failUrl

### 3. Order Confirmation
```typescript
const confirmResult = await mcp.callTool("confirm_order", {
  orderId: "received_order_id",
  language: "FR"
});

// Validate the response
const validation = await mcp.callTool("validate_payment_response", {
  response: confirmResult
});
```

### 4. Display Results
Based on validation results, display appropriate messages to customers.

## Tools

### configure_credentials

Configure SATIM gateway credentials.

**Parameters:**
- `userName` (string, required): Merchant login
- `password` (string, required): Merchant password

### register_order

Register a new payment order.

**Parameters:**
- `orderNumber` (string, required): Unique order identifier
- `amountInDA` (number, required): Amount in Algerian Dinars (min: 50 DA)
- `returnUrl` (string, required): Success redirect URL
- `failUrl` (string, optional): Failure redirect URL
- `force_terminal_id` (string, required): Bank-assigned terminal ID
- `udf1` (string, required): SATIM-specific parameter
- `currency` (string, optional): Currency code (default: "012" for DZD)
- `language` (string, optional): Interface language ("AR", "FR", "EN")
- `description` (string, optional): Order description
- `udf2-udf5` (string, optional): Additional parameters

**Response:**
```json
{
  "orderId": "123456789AZERTYUIOPL",
  "formUrl": "https://test.satim.dz/payment/merchants/merchant1/payment_fr.html?mdOrder=123456789AZERTYUIOPL"
}
```

### confirm_order

Confirm order status after payment attempt.

**Parameters:**
- `orderId` (string, required): Order ID from registration
- `language` (string, optional): Response language

**Response:**
```json
{
  "orderNumber": "ORDER_001_2024",
  "actionCode": 0,
  "actionCodeDescription": "Votre paiement a été accepté",
  "amount": 150050,
  "errorCode": "0",
  "orderStatus": 2,
  "approvalCode": "303004",
  "params": {
    "respCode": "00",
    "respCode_desc": "Votre paiement a été accepté"
  }
}
```

### refund_order

Process a refund for a completed order.

**Parameters:**
- `orderId` (string, required): Order ID to refund
- `amountInDA` (number, required): Refund amount in DA
- `currency` (string, optional): Currency code
- `language` (string, optional): Response language

**Response:**
```json
{
  "errorCode": 0
}
```

### validate_payment_response

Validate and interpret payment response.

**Parameters:**
- `response` (object, required): Order confirmation response

**Response:**
```json
{
  "status": "ACCEPTED",
  "displayMessage": "Votre paiement a été accepté",
  "shouldShowContactInfo": false,
  "contactNumber": "3020 3020"
}
```

## Integration Requirements

### SSL Security
- **Mandatory**: Your website must have SSL certificate
- All API calls must use HTTPS

### User Interface Requirements

#### Payment Page
- Display final amount prominently (bold, larger font)
- Include CAPTCHA to prevent automated submissions
- Show CIB logo on payment button
- Display terms and conditions with customer acknowledgment
- Redirect to SATIM page in independent browser window

#### Success Page Display
For accepted payments, show:
- Transaction message (`respCode_desc`)
- Transaction ID (`orderId`)
- Order number (`orderNumber`)
- Authorization code (`approvalCode`)
- Transaction date/time
- Payment amount with currency
- Payment method (CIB/Edhahabia)
- SATIM contact: 3020 3020

#### Success Page Actions
- Print receipt option
- Download PDF receipt
- Email PDF receipt to third party

#### Rejection Page
- Display rejection message in three languages
- Show SATIM contact information

### Amount Handling

Amounts must be multiplied by 100 when sent to SATIM:
- 50.00 DA → send 5000
- 806.50 DA → send 80650

The MCP server handles this conversion automatically.

## Error Handling

### Order Registration Errors
- Invalid credentials
- Duplicate order number
- Invalid amount (< 50 DA)
- Missing required parameters

### Confirmation Errors
| Error Code | Description |
|------------|-------------|
| 0 | Successfully confirmed |
| 1 | Empty order ID |
| 2 | Already confirmed |
| 3 | Access denied |
| 5 | Access denied |
| 6 | Unknown order |
| 7 | System error |

### Refund Errors
| Error Code | Description |
|------------|-------------|
| 0 | No system error |
| 5 | Password change required / Empty order ID |
| 6 | Wrong order number |
| 7 | Payment state error / Amount error / System error |

## Examples

### Complete Payment Flow

```typescript
// 1. Configure credentials
await mcp.callTool("configure_credentials", {
  userName: "test_merchant",
  password: "test_password"
});

// 2. Register order
const order = await mcp.callTool("register_order", {
  orderNumber: `ORDER_${Date.now()}`,
  amountInDA: 250.75,
  returnUrl: "https://mystore.dz/payment/success",
  failUrl: "https://mystore.dz/payment/failure",
  force_terminal_id: "E005005097",
  udf1: "customer_ref_456",
  language: "FR",
  description: "Achat produit électronique"
});

// 3. Redirect customer to order.formUrl
// Customer completes payment and returns

// 4. Confirm payment
const confirmation = await mcp.callTool("confirm_order", {
  orderId: order.orderId,
  language: "FR"
});

// 5. Validate response
const validation = await mcp.callTool("validate_payment_response", {
  response: confirmation
});

// 6. Handle result
if (validation.status === "ACCEPTED") {
  // Process successful payment
  console.log("Payment successful:", validation.displayMessage);
} else if (validation.status === "REJECTED") {
  // Handle rejection
  console.log("Payment rejected");
} else {
  // Handle error
  console.log("Payment error:", validation.displayMessage);
}
```

### Processing Refunds

```typescript
// Full refund
const refund = await mcp.callTool("refund_order", {
  orderId: "123456789AZERTYUIOPL",
  amountInDA: 250.75,  // Full original amount
  language: "FR"
});

// Partial refund
const partialRefund = await mcp.callTool("refund_order", {
  orderId: "123456789AZERTYUIOPL",
  amountInDA: 100.00,  // Partial amount
  language: "FR"
});
```

## Security Considerations

### Credentials Management
- Store credentials securely (environment variables, key vault)
- Use HTTPS for all communications
- Implement proper authentication for your API endpoints

### Order Number Security
- Use unique, non-sequential order numbers
- Include timestamp or random elements
- Validate order ownership before confirmation

### Data Validation
- Always validate amounts on server side
- Verify order status before processing confirmations
- Implement idempotency for refund operations

### Logging and Monitoring
- Log all payment transactions
- Monitor for suspicious activities
- Implement rate limiting for API calls

## Production Deployment

### Environment Configuration
```bash
# Production endpoints
SATIM_BASE_URL=https://satim.dz/payment/rest

# Development/Testing endpoints  
SATIM_BASE_URL=https://test.satim.dz/payment/rest
```

### Health Checks
Implement health check endpoints to monitor gateway connectivity:

```typescript
// Add to your server
app.get('/health/satim', async (req, res) => {
  try {
    // Test connection to SATIM
    const response = await axios.get(`${SATIM_BASE_URL}/health`);
    res.json({ status: 'healthy', satim: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: error.message });
  }
});
```

## Support and Contact

- **SATIM Support**: 3020 3020 (toll-free)
- **Technical Issues**: Contact your integration specialist
- **Documentation**: Refer to official SATIM integration guides

---

*This MCP server implementation follows SATIM's official API specifications and includes all required integration points for Algerian e-commerce platforms.*

--------------------------------------------------------

# SATIM MCP Server - Testing & Access Guide

The following explains how to set up, test, and access the SATIM MCP server in different environments.

## Quick Start

### 1. Prerequisites Installation

```bash
# Create project directory
mkdir satim-mcp-test
cd satim-mcp-test

# Initialize npm project
npm init -y

# Install required dependencies
npm install @modelcontextprotocol/sdk axios typescript @types/node

# Install development dependencies
npm install -D ts-node nodemon
```

### 2. Project Setup

Create the following files:

**package.json** (update scripts section):
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/satim-mcp-server.js",
    "dev": "ts-node satim-mcp-server.ts",
    "test": "ts-node test-client.ts"
  },
  "type": "module"
}
```

**tsconfig.json**:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## Testing Methods

### Method 1: Direct Testing with Test Client

Create a test client to interact with the MCP server:

**test-client.ts**:
```typescript
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
```

**Run the test:**
```bash
npm run test
```

### Method 2: Integration with Claude Desktop

**Step 1: Configure Claude Desktop**

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "satim-payment": {
      "command": "ts-node",
      "args": ["/path/to/your/satim-mcp-server.ts"],
      "env": {
        "SATIM_USERNAME": "your_test_username",
        "SATIM_PASSWORD": "your_test_password"
      }
    }
  }
}
```

**Step 2: Test in Claude Desktop**

Open Claude Desktop and try these commands:

```
Configure SATIM credentials with username "test_merchant" and password "test_password_123"
```

```
Register a new order with:
- Order number: TEST_001
- Amount: 200.50 DA
- Return URL: https://mystore.com/success
- Terminal ID: E005005097
- UDF1: ref_123
- Language: French
```

### Method 3: HTTP Wrapper for Easy Testing

Create an HTTP wrapper around the MCP server:

**http-wrapper.ts**:
```typescript
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
```

**Test with curl:**
```bash
# Configure credentials
curl -X POST http://localhost:3000/api/satim/configure \
  -H "Content-Type: application/json" \
  -d '{"userName": "test_merchant", "password": "test_password"}'

# Register order
curl -X POST http://localhost:3000/api/satim/register \
  -H "Content-Type: application/json" \
  -d '{
    "orderNumber": "TEST_001",
    "amountInDA": 150.75,
    "returnUrl": "https://example.com/success",
    "force_terminal_id": "E005005097",
    "udf1": "test_ref"
  }'
```

### Method 4: Postman Collection

Create a Postman collection for testing:

**SATIM-MCP-Tests.postman_collection.json**:
```json
{
  "info": {
    "name": "SATIM MCP Server Tests",
    "description": "Test collection for SATIM payment gateway MCP server"
  },
  "item": [
    {
      "name": "Configure Credentials",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\"userName\": \"test_merchant\", \"password\": \"test_password\"}"
        },
        "url": "http://localhost:3000/api/satim/configure"
      }
    },
    {
      "name": "Register Order",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"orderNumber\": \"TEST_{{$timestamp}}\",\n  \"amountInDA\": 150.75,\n  \"returnUrl\": \"https://example.com/success\",\n  \"failUrl\": \"https://example.com/failure\",\n  \"force_terminal_id\": \"E005005097\",\n  \"udf1\": \"test_reference\",\n  \"language\": \"FR\",\n  \"description\": \"Test order from Postman\"\n}"
        },
        "url": "http://localhost:3000/api/satim/register"
      }
    }
  ]
}
```

## Production Access

### Method 1: Deploy as Microservice

```yaml
# docker-compose.yml
version: '3.8'
services:
  satim-mcp:
    build: .
    ports:
      - "3000:3000"
    environment:
      - SATIM_USERNAME=${SATIM_USERNAME}
      - SATIM_PASSWORD=${SATIM_PASSWORD}
      - NODE_ENV=production
    volumes:
      - ./logs:/app/logs
```

### Method 2: AWS Lambda Function

```typescript
// lambda-handler.ts
import { APIGatewayProxyHandler } from 'aws-lambda';
import { SatimPaymentGateway } from './satim-mcp-server';

export const handler: APIGatewayProxyHandler = async (event) => {
  const gateway = new SatimPaymentGateway({
    userName: process.env.SATIM_USERNAME!,
    password: process.env.SATIM_PASSWORD!
  });

  try {
    const { action, ...params } = JSON.parse(event.body || '{}');
    
    let result;
    switch (action) {
      case 'register':
        result = await gateway.registerOrder(params);
        break;
      case 'confirm':
        result = await gateway.confirmOrder(params);
        break;
      case 'refund':
        result = await gateway.refundOrder(params);
        break;
      default:
        throw new Error('Unknown action');
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
```

## Troubleshooting

### Common Issues

**1. Connection Errors**
```bash
# Check if server is running
ps aux | grep satim-mcp-server

# Check logs
tail -f /var/log/satim-mcp.log
```

**2. Credential Issues**
```typescript
// Test credentials separately
const testCredentials = async () => {
  try {
    const response = await axios.get('https://test.satim.dz/payment/rest/register.do', {
      params: {
        userName: 'your_username',
        password: 'your_password',
        // minimal required params
      }
    });
    console.log('Credentials valid');
  } catch (error) {
    console.log('Credentials invalid:', error.response.data);
  }
};
```

**3. SATIM Test Environment**
- Use test credentials provided by SATIM
- Test endpoint: `https://test.satim.dz/payment/rest/`
- Production endpoint: `https://satim.dz/payment/rest/`

### Debug Mode

Add debug logging to the MCP server:

```typescript
// In satim-mcp-server.ts
const DEBUG = process.env.DEBUG === 'true';

function debugLog(message: string, data?: any) {
  if (DEBUG) {
    console.error(`[DEBUG] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }
}

// Use throughout the code
debugLog('Registering order', params);
```

Run with debug:
```bash
DEBUG=true npm run dev
```

## Next Steps

1. **Get SATIM Test Credentials**: Contact SATIM to get test merchant credentials
2. **Set Up SSL Certificate**: Required for production integration
3. **Implement Webhooks**: For real-time payment notifications
4. **Add Monitoring**: Use tools like Sentry or DataDog for production monitoring
5. **Security Audit**: Review security implementation before going live

This testing setup provides multiple ways to interact with and validate your SATIM MCP server implementation!
