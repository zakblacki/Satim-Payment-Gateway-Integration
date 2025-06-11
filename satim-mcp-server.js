#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError, } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
class SatimPaymentGateway {
    constructor(credentials) {
        this.baseUrl = "https://test.satim.dz/payment/rest";
        this.credentials = credentials;
    }
    /**
     * Register a new order with SATIM payment gateway
     */
    async registerOrder(params) {
        try {
            const queryParams = new URLSearchParams({
                userName: this.credentials.userName,
                password: this.credentials.password,
                orderNumber: params.orderNumber,
                amount: params.amount.toString(),
                currency: params.currency,
                returnUrl: params.returnUrl,
                ...(params.failUrl && { failUrl: params.failUrl }),
                ...(params.description && { description: params.description }),
                ...(params.language && { language: params.language }),
                jsonParams: JSON.stringify(params.jsonParams)
            });
            const response = await axios.get(`${this.baseUrl}/register.do?${queryParams}`);
            return response.data;
        }
        catch (error) {
            throw new Error(`Order registration failed: ${error}`);
        }
    }
    /**
     * Confirm order status after payment attempt
     */
    async confirmOrder(params) {
        try {
            const queryParams = new URLSearchParams({
                userName: this.credentials.userName,
                password: this.credentials.password,
                orderId: params.orderId,
                ...(params.language && { language: params.language })
            });
            const response = await axios.get(`${this.baseUrl}/confirmOrder.do?${queryParams}`);
            return response.data;
        }
        catch (error) {
            throw new Error(`Order confirmation failed: ${error}`);
        }
    }
    /**
     * Process refund for a completed order
     */
    async refundOrder(params) {
        try {
            const queryParams = new URLSearchParams({
                userName: this.credentials.userName,
                password: this.credentials.password,
                orderId: params.orderId,
                amount: params.amount.toString(),
                ...(params.currency && { currency: params.currency }),
                ...(params.language && { language: params.language })
            });
            const response = await axios.get(`${this.baseUrl}/refund.do?${queryParams}`);
            return response.data;
        }
        catch (error) {
            throw new Error(`Refund failed: ${error}`);
        }
    }
    /**
     * Helper method to convert amount from DA to centimes
     */
    static convertAmountToCentimes(amountInDA) {
        return Math.round(amountInDA * 100);
    }
    /**
     * Helper method to convert amount from centimes to DA
     */
    static convertAmountFromCentimes(amountInCentimes) {
        return amountInCentimes / 100;
    }
    /**
     * Validate payment response status
     */
    static isPaymentAccepted(response) {
        return response.params?.respCode === "00" &&
            response.errorCode === "0" &&
            response.orderStatus === 2;
    }
    /**
     * Validate payment rejection status
     */
    static isPaymentRejected(response) {
        return response.params?.respCode === "00" &&
            response.errorCode === "0" &&
            response.orderStatus === 3;
    }
}
// MCP Server Implementation
const server = new Server({
    name: "satim-payment-gateway",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
// Store credentials (in production, use secure storage)
let satimGateway = null;
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "configure_credentials",
                description: "Configure SATIM payment gateway credentials",
                inputSchema: {
                    type: "object",
                    properties: {
                        userName: {
                            type: "string",
                            description: "Merchant's login received during registration"
                        },
                        password: {
                            type: "string",
                            description: "Merchant's password received during registration"
                        }
                    },
                    required: ["userName", "password"]
                }
            },
            {
                name: "register_order",
                description: "Register a new order with SATIM payment gateway",
                inputSchema: {
                    type: "object",
                    properties: {
                        orderNumber: {
                            type: "string",
                            description: "Unique order identifier in merchant's system"
                        },
                        amountInDA: {
                            type: "number",
                            description: "Order amount in Algerian Dinars (minimum 50 DA)"
                        },
                        currency: {
                            type: "string",
                            description: "Currency code according to ISO 4217 (012 for DZD)",
                            default: "012"
                        },
                        returnUrl: {
                            type: "string",
                            description: "URL to redirect after successful payment"
                        },
                        failUrl: {
                            type: "string",
                            description: "URL to redirect after failed payment"
                        },
                        description: {
                            type: "string",
                            description: "Order description"
                        },
                        language: {
                            type: "string",
                            enum: ["AR", "FR", "EN"],
                            description: "Language for the payment interface"
                        },
                        force_terminal_id: {
                            type: "string",
                            description: "Terminal ID assigned by bank (mandatory)"
                        },
                        udf1: {
                            type: "string",
                            description: "SATIM specific parameter (mandatory)"
                        },
                        udf2: { type: "string", description: "Additional parameter" },
                        udf3: { type: "string", description: "Additional parameter" },
                        udf4: { type: "string", description: "Additional parameter" },
                        udf5: { type: "string", description: "Additional parameter" }
                    },
                    required: ["orderNumber", "amountInDA", "returnUrl", "force_terminal_id", "udf1"]
                }
            },
            {
                name: "confirm_order",
                description: "Confirm order status after payment attempt",
                inputSchema: {
                    type: "object",
                    properties: {
                        orderId: {
                            type: "string",
                            description: "Order ID returned from registration"
                        },
                        language: {
                            type: "string",
                            enum: ["AR", "FR", "EN"],
                            description: "Language for response messages"
                        }
                    },
                    required: ["orderId"]
                }
            },
            {
                name: "refund_order",
                description: "Process refund for a completed order",
                inputSchema: {
                    type: "object",
                    properties: {
                        orderId: {
                            type: "string",
                            description: "Order ID to refund"
                        },
                        amountInDA: {
                            type: "number",
                            description: "Refund amount in Algerian Dinars"
                        },
                        currency: {
                            type: "string",
                            description: "Currency code",
                            default: "012"
                        },
                        language: {
                            type: "string",
                            enum: ["AR", "FR", "EN"],
                            description: "Language for response messages"
                        }
                    },
                    required: ["orderId", "amountInDA"]
                }
            },
            {
                name: "validate_payment_response",
                description: "Validate and interpret payment response status",
                inputSchema: {
                    type: "object",
                    properties: {
                        response: {
                            type: "object",
                            description: "Order confirmation response object"
                        }
                    },
                    required: ["response"]
                }
            }
        ]
    };
});
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        switch (name) {
            case "configure_credentials":
                satimGateway = new SatimPaymentGateway({
                    userName: args.userName,
                    password: args.password
                });
                return {
                    content: [
                        {
                            type: "text",
                            text: "SATIM payment gateway credentials configured successfully."
                        }
                    ]
                };
            case "register_order":
                if (!satimGateway) {
                    throw new McpError(ErrorCode.InvalidRequest, "Credentials not configured. Use configure_credentials first.");
                }
                const registrationResponse = await satimGateway.registerOrder({
                    orderNumber: args.orderNumber,
                    amount: SatimPaymentGateway.convertAmountToCentimes(args.amountInDA),
                    currency: args.currency || "012",
                    returnUrl: args.returnUrl,
                    failUrl: args.failUrl,
                    description: args.description,
                    language: args.language,
                    jsonParams: {
                        force_terminal_id: args.force_terminal_id,
                        udf1: args.udf1,
                        ...(args.udf2 && { udf2: args.udf2 }),
                        ...(args.udf3 && { udf3: args.udf3 }),
                        ...(args.udf4 && { udf4: args.udf4 }),
                        ...(args.udf5 && { udf5: args.udf5 })
                    }
                });
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(registrationResponse, null, 2)
                        }
                    ]
                };
            case "confirm_order":
                if (!satimGateway) {
                    throw new McpError(ErrorCode.InvalidRequest, "Credentials not configured. Use configure_credentials first.");
                }
                const confirmationResponse = await satimGateway.confirmOrder({
                    orderId: args.orderId,
                    language: args.language
                });
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(confirmationResponse, null, 2)
                        }
                    ]
                };
            case "refund_order":
                if (!satimGateway) {
                    throw new McpError(ErrorCode.InvalidRequest, "Credentials not configured. Use configure_credentials first.");
                }
                const refundResponse = await satimGateway.refundOrder({
                    orderId: args.orderId,
                    amount: SatimPaymentGateway.convertAmountToCentimes(args.amountInDA),
                    currency: args.currency,
                    language: args.language
                });
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(refundResponse, null, 2)
                        }
                    ]
                };
            case "validate_payment_response":
                const response = args.response;
                const isAccepted = SatimPaymentGateway.isPaymentAccepted(response);
                const isRejected = SatimPaymentGateway.isPaymentRejected(response);
                let status = "UNKNOWN";
                let displayMessage = "";
                if (isAccepted) {
                    status = "ACCEPTED";
                    displayMessage = response.params?.respCode_desc || response.actionCodeDescription || "Payment accepted";
                }
                else if (isRejected) {
                    status = "REJECTED";
                    displayMessage = "Your transaction was rejected / Votre transaction a été rejetée / تم رفض معاملتك";
                }
                else {
                    status = "ERROR";
                    displayMessage = response.params?.respCode_desc || response.actionCodeDescription || "Unknown error";
                }
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                status,
                                displayMessage,
                                shouldShowContactInfo: status === "REJECTED" || status === "ERROR",
                                contactNumber: "3020 3020",
                                response
                            }, null, 2)
                        }
                    ]
                };
            default:
                throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
    }
    catch (error) {
        throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${error}`);
    }
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("SATIM Payment Gateway MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Server failed to start:", error);
    process.exit(1);
});
