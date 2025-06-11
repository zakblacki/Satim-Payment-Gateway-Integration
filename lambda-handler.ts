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
      body: JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      })
    };
  }
};