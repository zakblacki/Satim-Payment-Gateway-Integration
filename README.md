# Satim Payment Gateway Integration

A Model Context Protocol (MCP) server for integrating with the SATIM payment gateway system in Algeria. The server provides a structured interface for processing CIB/Edhahabia card payments through the SATIM-ePAY platform. This package enables AI assistants like Cursor, Claude, and Copilot to directly access your Razorpay account data through a standardized interface.

<a href="https://glama.ai/mcp/servers/@zakblacki/Satim-Payment-Gateway-Integration">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@zakblacki/Satim-Payment-Gateway-Integration/badge" alt="Satim Payment Gateway Integration MCP server" />
</a>

More details : 
https://code2tutorial.com/tutorial/6b3a062c-3a34-4716-830e-8793a5378bcc/index.md

## Quick Start

```bash
# Clone the repository
git clone https://github.com/zakblacki/Satim-Payment-Gateway-Integration.git
cd satim-payment-gateway-integration

# Install dependencies
npm install @modelcontextprotocol/sdk axios
npm install --save-dev typescript @types/node tsx

# Run the server
npx tsx satim-mcp-server.ts

# Demo 
Launch index.html
```

## Table of Contents

1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Payment Flow](#payment-flow)
4. [Tools](#tools)
5. [Testing](#testing)
6. [Integration Requirements](#integration-requirements)
7. [Error Handling](#error-handling)
8. [Examples](#examples)
9. [Security Considerations](#security-considerations)

## Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Step-by-Step Setup

1. **Clone and enter the project directory:**
```bash
git clone https://github.com/zakblacki/Satim-Payment-Gateway-Integration.git
cd satim-payment-gateway-integration
```

2. **Initialize the project (if package.json doesn't exist):**
```bash
npm init -y
```

3. **Configure package.json for ES modules:**
```bash
npm pkg set type=module
```

4. **Install dependencies:**
```bash
# Core dependencies
npm install @modelcontextprotocol/sdk axios

# Development dependencies
npm install --save-dev typescript @types/node tsx
```

### Running the Server

#### Option 1: Direct execution with tsx (Recommended for development)
```bash
npx tsx satim-mcp-server.ts
```

#### Option 2: Compile and run
```bash
# Compile TypeScript
npm run build

# Run compiled JavaScript
npm start
```

#### Option 3: Development mode with auto-reload
```bash
npm run dev
```

## Configuration

### MCP Client Configuration

To use this server with an MCP client (like Claude Desktop), add to your configuration:

```json
{
  "mcpServers": {
    "satim-payment": {
      "command": "node",
      "args": [
        "--experimental-strip-types",
        "/path/to/your/satim-mcp-server.ts"
      ],
      "env": {
        "SATIM_USERNAME": "your_test_username",
        "SATIM_PASSWORD": "your_test_password",
        "NODE_ENV": "development"
      }
    }
  }
}
```

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
SATIM_BASE_URL=https://test.satim.dz/payment/rest  # or https://satim.dz/payment/rest for production
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

## Testing

### Method 1: Quick Test

Create a simple test file `test-simple.js`:

```javascript
import { spawn } from 'child_process';

// Start the MCP server
const server = spawn('npx', ['tsx', 'satim-mcp-server.ts'], {
  stdio: ['pipe', 'pipe', 'inherit']
});

console.log('SATIM MCP Server started for testing');

// Let it run for a few seconds then exit
setTimeout(() => {
  server.kill();
  console.log('Test completed');
}, 5000);
```

Run with:
```bash
node test-simple.js
```

### Method 2: Full Integration Test

Create `test-client.ts` following the example in the documentation, then run:

```bash
npm run test
```

### Method 3: HTTP Wrapper for API Testing

Use the HTTP wrapper example provided in the documentation to create REST API endpoints for easier testing with tools like Postman or curl.

## Troubleshooting

### Common Issues and Solutions

1. **"Cannot use import statement outside a module"**
   ```bash
   # Make sure package.json has "type": "module"
   npm pkg set type=module
   ```

2. **"Module not found" errors**
   ```bash
   # Reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **TypeScript compilation errors**
   ```bash
   # Check tsconfig.json configuration
   # Make sure all dependencies are installed
   npm install --save-dev @types/node
   ```

4. **Server connection issues**
   ```bash
   # Check if server is running
   ps aux | grep tsx
   
   # Check for port conflicts
   lsof -i :3000  # if using HTTP wrapper
   ```

### Debug Mode

Enable debug logging:
```bash
DEBUG=true npx tsx satim-mcp-server.ts
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