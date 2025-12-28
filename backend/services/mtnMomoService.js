const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

class MTNMomoService {
  constructor() {
    this.baseURL = process.env.MTN_MOMO_BASE_URL;
    this.environment = process.env.MTN_MOMO_ENVIRONMENT || 'sandbox';
    this.userId = process.env.MTN_MOMO_USER_ID;
    this.apiKey = process.env.MTN_MOMO_API_KEY;
    this.primaryKey = process.env.MTN_MOMO_PRIMARY_KEY;
    this.token = null;
    this.tokenExpiry = null;
  }

  async getAccessToken() {
    try {
      // Check if we have a valid token
      if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
        return this.token;
      }

      const response = await axios.post(
        `${this.baseURL}/collection/token/`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': this.primaryKey,
            'Authorization': `Basic ${Buffer.from(`${this.userId}:${this.apiKey}`).toString('base64')}`
          }
        }
      );

      this.token = response.data.access_token;
      // Set expiry to 1 hour from now (MTN tokens typically last 1 hour)
      this.tokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

      return this.token;
    } catch (error) {
      console.error('Error getting MTN MoMo access token:', error.response?.data || error.message);
      throw new Error('Failed to get access token');
    }
  }

  async requestToPay(referenceId, amount, phoneNumber, payerMessage = '') {
    try {
      // Basic configuration checks to fail fast with clear message
      if (!this.baseURL || !this.primaryKey || !this.userId || !this.apiKey) {
        console.error('MTN MoMo configuration missing', {
          baseURL: this.baseURL,
          primaryKeySet: !!this.primaryKey,
          userIdSet: !!this.userId,
          apiKeySet: !!this.apiKey
        });
        throw new Error('MTN MoMo configuration missing. Check MTN_MOMO_BASE_URL, MTN_MOMO_PRIMARY_KEY, MTN_MOMO_USER_ID and MTN_MOMO_API_KEY');
      }
      const token = await this.getAccessToken();
      const transactionId = uuidv4();

      const requestBody = {
        amount: amount.toString(),
        currency: 'RWF',
        externalId: referenceId,
        payer: {
          partyIdType: 'MSISDN',
          partyId: phoneNumber
        },
        payerMessage: payerMessage,
        payeeNote: `Payment for order ${referenceId}`
      };

      // Log request details (not headers) to help debug provider rejections
      console.info('MTN requestToPay', { transactionId, requestBody, targetEnv: this.environment });

      const response = await axios.post(
        `${this.baseURL}/collection/v1_0/requesttopay`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-Reference-Id': transactionId,
            'X-Target-Environment': this.environment,
            'Ocp-Apim-Subscription-Key': this.primaryKey
          }
        }
      );

      return {
        success: true,
        referenceId: transactionId,
        status: 'PENDING',
        message: 'Payment request sent successfully'
      };
    } catch (error) {
      // Log full axios response data and status when available
      if (error && error.response) {
        console.error('MTN requestToPay axios error status:', error.response.status);
        console.error('MTN requestToPay axios error data:', JSON.stringify(error.response.data));
        // Rethrow the original axios error so callers can access response.data
        throw error;
      }

      console.error('Error requesting MTN MoMo payment:', error?.message || error);
      throw new Error(error?.message || 'Payment request failed');
    }
  }

  async getTransactionStatus(referenceId) {
    try {
      const token = await this.getAccessToken();

      const response = await axios.get(
        `${this.baseURL}/collection/v1_0/requesttopay/${referenceId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Target-Environment': this.environment,
            'Ocp-Apim-Subscription-Key': this.primaryKey
          }
        }
      );

      const data = response.data;
      
      // Map MTN MoMo status to our internal status
      let status = 'pending';
      if (data.status === 'SUCCESSFUL') {
        status = 'completed';
      } else if (data.status === 'FAILED') {
        status = 'failed';
      } else if (data.status === 'PENDING') {
        status = 'pending';
      }

      return {
        referenceId: referenceId,
        status: status,
        amount: data.amount,
        currency: data.currency,
        financialTransactionId: data.financialTransactionId,
        externalId: data.externalId,
        reason: data.reason
      };
    } catch (error) {
      console.error('Error getting MTN MoMo transaction status:', error.response?.data || error.message);
      
      if (error.response?.status === 404) {
        throw new Error('Transaction not found');
      }
      
      throw new Error('Failed to get transaction status');
    }
  }

  async getAccountBalance() {
    try {
      const token = await this.getAccessToken();

      const response = await axios.get(
        `${this.baseURL}/collection/v1_0/account/balance`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Target-Environment': this.environment,
            'Ocp-Apim-Subscription-Key': this.primaryKey
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting MTN MoMo account balance:', error.response?.data || error.message);
      throw new Error('Failed to get account balance');
    }
  }

  async validateAccount(phoneNumber) {
    try {
      const token = await this.getAccessToken();

      const response = await axios.get(
        `${this.baseURL}/collection/v1_0/accountholder/msisdn/${phoneNumber}/active`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Target-Environment': this.environment,
            'Ocp-Apim-Subscription-Key': this.primaryKey
          }
        }
      );

      return {
        isValid: response.data.result,
        phoneNumber: phoneNumber
      };
    } catch (error) {
      console.error('Error validating MTN MoMo account:', error.response?.data || error.message);
      return {
        isValid: false,
        phoneNumber: phoneNumber,
        error: error.response?.data?.message || 'Validation failed'
      };
    }
  }
}

module.exports = new MTNMomoService();
