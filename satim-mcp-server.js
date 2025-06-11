#!/usr/bin/env node
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SatimPaymentGateway = void 0;
var index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
var stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
var types_js_1 = require("@modelcontextprotocol/sdk/types.js");
var axios_1 = require("axios");
var SatimPaymentGateway = /** @class */ (function () {
    function SatimPaymentGateway(credentials) {
        this.baseUrl = "https://test.satim.dz/payment/rest";
        this.credentials = credentials;
    }
    /**
     * Register a new order with SATIM payment gateway
     */
    SatimPaymentGateway.prototype.registerOrder = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var queryParams, response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        queryParams = new URLSearchParams(__assign(__assign(__assign(__assign({ userName: this.credentials.userName, password: this.credentials.password, orderNumber: params.orderNumber, amount: params.amount.toString(), currency: params.currency, returnUrl: params.returnUrl }, (params.failUrl && { failUrl: params.failUrl })), (params.description && { description: params.description })), (params.language && { language: params.language })), { jsonParams: JSON.stringify(params.jsonParams) }));
                        return [4 /*yield*/, axios_1.default.get("".concat(this.baseUrl, "/register.do?").concat(queryParams))];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 2:
                        error_1 = _a.sent();
                        throw new Error("Order registration failed: ".concat(error_1));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Confirm order status after payment attempt
     */
    SatimPaymentGateway.prototype.confirmOrder = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var queryParams, response, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        queryParams = new URLSearchParams(__assign({ userName: this.credentials.userName, password: this.credentials.password, orderId: params.orderId }, (params.language && { language: params.language })));
                        return [4 /*yield*/, axios_1.default.get("".concat(this.baseUrl, "/confirmOrder.do?").concat(queryParams))];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 2:
                        error_2 = _a.sent();
                        throw new Error("Order confirmation failed: ".concat(error_2));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Process refund for a completed order
     */
    SatimPaymentGateway.prototype.refundOrder = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var queryParams, response, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        queryParams = new URLSearchParams(__assign(__assign({ userName: this.credentials.userName, password: this.credentials.password, orderId: params.orderId, amount: params.amount.toString() }, (params.currency && { currency: params.currency })), (params.language && { language: params.language })));
                        return [4 /*yield*/, axios_1.default.get("".concat(this.baseUrl, "/refund.do?").concat(queryParams))];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 2:
                        error_3 = _a.sent();
                        throw new Error("Refund failed: ".concat(error_3));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Helper method to convert amount from DA to centimes
     */
    SatimPaymentGateway.convertAmountToCentimes = function (amountInDA) {
        return Math.round(amountInDA * 100);
    };
    /**
     * Helper method to convert amount from centimes to DA
     */
    SatimPaymentGateway.convertAmountFromCentimes = function (amountInCentimes) {
        return amountInCentimes / 100;
    };
    /**
     * Validate payment response status
     */
    SatimPaymentGateway.isPaymentAccepted = function (response) {
        var _a;
        return ((_a = response.params) === null || _a === void 0 ? void 0 : _a.respCode) === "00" &&
            response.errorCode === "0" &&
            response.orderStatus === 2;
    };
    /**
     * Validate payment rejection status
     */
    SatimPaymentGateway.isPaymentRejected = function (response) {
        var _a;
        return ((_a = response.params) === null || _a === void 0 ? void 0 : _a.respCode) === "00" &&
            response.errorCode === "0" &&
            response.orderStatus === 3;
    };
    return SatimPaymentGateway;
}());
exports.SatimPaymentGateway = SatimPaymentGateway;
// MCP Server Implementation
var server = new index_js_1.Server({
    name: "satim-payment-gateway",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
// Store credentials (in production, use secure storage)
var satimGateway = null;
server.setRequestHandler(types_js_1.ListToolsRequestSchema, function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, {
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
            }];
    });
}); });
server.setRequestHandler(types_js_1.CallToolRequestSchema, function (request) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name, args, _b, jsonParams, registrationResponse, confirmationResponse, refundResponse, response, isAccepted, isRejected, status_1, displayMessage, error_4;
    var _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _a = request.params, name = _a.name, args = _a.arguments;
                // Add null check for args
                if (!args) {
                    throw new types_js_1.McpError(types_js_1.ErrorCode.InvalidRequest, "Arguments are required");
                }
                _e.label = 1;
            case 1:
                _e.trys.push([1, 12, , 13]);
                _b = name;
                switch (_b) {
                    case "configure_credentials": return [3 /*break*/, 2];
                    case "register_order": return [3 /*break*/, 3];
                    case "confirm_order": return [3 /*break*/, 5];
                    case "refund_order": return [3 /*break*/, 7];
                    case "validate_payment_response": return [3 /*break*/, 9];
                }
                return [3 /*break*/, 10];
            case 2:
                satimGateway = new SatimPaymentGateway({
                    userName: args.userName,
                    password: args.password
                });
                return [2 /*return*/, {
                        content: [
                            {
                                type: "text",
                                text: "SATIM payment gateway credentials configured successfully."
                            }
                        ]
                    }];
            case 3:
                if (!satimGateway) {
                    throw new types_js_1.McpError(types_js_1.ErrorCode.InvalidRequest, "Credentials not configured. Use configure_credentials first.");
                }
                jsonParams = {
                    force_terminal_id: args.force_terminal_id,
                    udf1: args.udf1,
                };
                // Add optional parameters only if they exist
                if (args.udf2)
                    jsonParams.udf2 = args.udf2;
                if (args.udf3)
                    jsonParams.udf3 = args.udf3;
                if (args.udf4)
                    jsonParams.udf4 = args.udf4;
                if (args.udf5)
                    jsonParams.udf5 = args.udf5;
                return [4 /*yield*/, satimGateway.registerOrder({
                        orderNumber: args.orderNumber,
                        amount: SatimPaymentGateway.convertAmountToCentimes(args.amountInDA),
                        currency: args.currency || "012",
                        returnUrl: args.returnUrl,
                        failUrl: args.failUrl,
                        description: args.description,
                        language: args.language,
                        jsonParams: jsonParams
                    })];
            case 4:
                registrationResponse = _e.sent();
                return [2 /*return*/, {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(registrationResponse, null, 2)
                            }
                        ]
                    }];
            case 5:
                if (!satimGateway) {
                    throw new types_js_1.McpError(types_js_1.ErrorCode.InvalidRequest, "Credentials not configured. Use configure_credentials first.");
                }
                return [4 /*yield*/, satimGateway.confirmOrder({
                        orderId: args.orderId,
                        language: args.language
                    })];
            case 6:
                confirmationResponse = _e.sent();
                return [2 /*return*/, {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(confirmationResponse, null, 2)
                            }
                        ]
                    }];
            case 7:
                if (!satimGateway) {
                    throw new types_js_1.McpError(types_js_1.ErrorCode.InvalidRequest, "Credentials not configured. Use configure_credentials first.");
                }
                return [4 /*yield*/, satimGateway.refundOrder({
                        orderId: args.orderId,
                        amount: SatimPaymentGateway.convertAmountToCentimes(args.amountInDA),
                        currency: args.currency,
                        language: args.language
                    })];
            case 8:
                refundResponse = _e.sent();
                return [2 /*return*/, {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(refundResponse, null, 2)
                            }
                        ]
                    }];
            case 9:
                response = args.response;
                isAccepted = SatimPaymentGateway.isPaymentAccepted(response);
                isRejected = SatimPaymentGateway.isPaymentRejected(response);
                status_1 = "UNKNOWN";
                displayMessage = "";
                if (isAccepted) {
                    status_1 = "ACCEPTED";
                    displayMessage = ((_c = response.params) === null || _c === void 0 ? void 0 : _c.respCode_desc) || response.actionCodeDescription || "Payment accepted";
                }
                else if (isRejected) {
                    status_1 = "REJECTED";
                    displayMessage = "Your transaction was rejected / Votre transaction a été rejetée / تم رفض معاملتك";
                }
                else {
                    status_1 = "ERROR";
                    displayMessage = ((_d = response.params) === null || _d === void 0 ? void 0 : _d.respCode_desc) || response.actionCodeDescription || "Unknown error";
                }
                return [2 /*return*/, {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({
                                    status: status_1,
                                    displayMessage: displayMessage,
                                    shouldShowContactInfo: status_1 === "REJECTED" || status_1 === "ERROR",
                                    contactNumber: "3020 3020",
                                    response: response
                                }, null, 2)
                            }
                        ]
                    }];
            case 10: throw new types_js_1.McpError(types_js_1.ErrorCode.MethodNotFound, "Unknown tool: ".concat(name));
            case 11: return [3 /*break*/, 13];
            case 12:
                error_4 = _e.sent();
                throw new types_js_1.McpError(types_js_1.ErrorCode.InternalError, "Tool execution failed: ".concat(error_4));
            case 13: return [2 /*return*/];
        }
    });
}); });
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var transport;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    transport = new stdio_js_1.StdioServerTransport();
                    return [4 /*yield*/, server.connect(transport)];
                case 1:
                    _a.sent();
                    console.error("SATIM Payment Gateway MCP Server running on stdio");
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(function (error) {
    console.error("Server failed to start:", error);
    process.exit(1);
});
