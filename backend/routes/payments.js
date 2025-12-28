
const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const mtnMomoService = require('../services/mtnMomoService');

const router = express.Router();

// Process MTN MoMo payment
router.post('/mtn-momo', authenticateToken, [
  body('orderId').isUUID().withMessage('Invalid orderId'),
  body('phoneNumber')
    .customSanitizer((val) => {
      if (!val) return val;
      // remove non-digits and plus sign
      let s = String(val).replace(/\D/g, '');
      // if local format starts with 0 and has 10 digits (0XXXXXXXXX), replace leading 0 with 250
      if (s.startsWith('0') && s.length === 10) {
        s = '250' + s.slice(1);
      }
      // if user supplied 9 digits without country, prefix 250
      if (s.length === 9) {
        s = '250' + s;
      }
      return s;
    })
    .custom((value) => {
      if (!/^250\d{9}$/.test(value)) throw new Error('phoneNumber must be in format 250XXXXXXXXX');
      return true;
    }),
  body('amount').custom((value) => {
    const n = parseFloat(value);
    if (isNaN(n) || n < 0.01) throw new Error('amount must be a number >= 0.01');
    return true;
  })
], async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { orderId, phoneNumber, amount } = req.body;

    // Verify order exists and belongs to user
    const orderResult = await client.query(
      'SELECT id, total, status, payment_status FROM orders WHERE id = $1 AND user_id = $2',
      [orderId, req.user.id]
    );

    if (orderResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];

    if (order.payment_status === 'completed') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Order already paid' });
    }

    const requestedAmount = parseFloat(amount);
    const orderTotal = parseFloat(order.total);
    const AMOUNT_EPSILON = 0.01; // allow small rounding differences
    if (isNaN(requestedAmount) || Math.abs(requestedAmount - orderTotal) > AMOUNT_EPSILON) {
      await client.query('ROLLBACK');
      console.warn(`Payment amount mismatch for order ${orderId}: requested=${requestedAmount} orderTotal=${orderTotal}`);
      return res.status(400).json({ error: 'Payment amount does not match order total', details: { requestedAmount, orderTotal } });
    }

    // Create payment record
    const paymentResult = await client.query(
      'INSERT INTO payments (order_id, payment_method, amount, phone_number, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [orderId, 'mtn_momo', amount, phoneNumber, 'pending']
    );

    const payment = paymentResult.rows[0];

    try {
      // Process MTN MoMo payment
      const momoResponse = await mtnMomoService.requestToPay(
        payment.id,
        amount,
        phoneNumber,
        `Payment for Order ${orderId}`
      );

      // Update payment with external reference
      await client.query(
        'UPDATE payments SET external_reference = $1, provider_response = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
        [momoResponse.referenceId, JSON.stringify(momoResponse), payment.id]
      );

      await client.query('COMMIT');

      res.status(201).json({
        message: 'Payment initiated successfully',
        payment: {
          id: payment.id,
          status: 'pending',
          referenceId: momoResponse.referenceId,
          amount: amount,
          phoneNumber: phoneNumber
        }
      });
    } catch (momoError) {
      console.error('MTN MoMo payment error:', momoError);
      console.error('MTN provider response data:', momoError?.response?.data);
      const providerResponse = (momoError && momoError.response && momoError.response.data) ? momoError.response.data : { message: momoError.message };
      // Update payment status to failed
      await client.query(
        'UPDATE payments SET status = $1, provider_response = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
        ['failed', JSON.stringify(providerResponse), payment.id]
      );

      await client.query('COMMIT');
      
      res.status(400).json({ 
        error: 'Payment processing failed',
        details: providerResponse 
      });
    }
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Payment processing error:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  } finally {
    client.release();
  }
});

// Check payment status
router.get('/status/:paymentId', authenticateToken, async (req, res) => {
  try {
    const paymentResult = await db.query(
      'SELECT p.*, o.user_id FROM payments p JOIN orders o ON p.order_id = o.id WHERE p.id = $1',
      [req.params.paymentId]
    );

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const payment = paymentResult.rows[0];

    if (payment.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // If payment is still pending and has external reference, check with MTN MoMo
    if (payment.status === 'pending' && payment.external_reference) {
      try {
        const momoStatus = await mtnMomoService.getTransactionStatus(payment.external_reference);
        
        if (momoStatus.status !== payment.status) {
          // Update payment status
          await db.query(
            'UPDATE payments SET status = $1, provider_response = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
            [momoStatus.status, JSON.stringify(momoStatus), payment.id]
          );

          // If payment is successful, update order
          if (momoStatus.status === 'SUCCESSFUL') {
            await db.query(
              'UPDATE orders SET payment_status = $1, payment_method = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
              ['completed', 'mtn_momo', payment.order_id]
            );
          }

          payment.status = momoStatus.status;
        }
      } catch (error) {
        console.error('Error checking MTN MoMo status:', error);
      }
    }

    res.json({
      payment: {
        id: payment.id,
        orderId: payment.order_id,
        status: payment.status,
        amount: payment.amount,
        paymentMethod: payment.payment_method,
        createdAt: payment.created_at
      }
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ error: 'Failed to get payment status' });
  }
});

// Get payment history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    let query = `
      SELECT p.*, o.customer_name, o.total as order_total
      FROM payments p
      JOIN orders o ON p.order_id = o.id
    `;

    const params = [];

    if (req.user.role !== 'admin') {
      query += ' WHERE o.user_id = $1';
      params.push(req.user.id);
    }

    query += ' ORDER BY p.created_at DESC';

    const result = await db.query(query, params);
    res.json({ payments: result.rows });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

module.exports = router;
