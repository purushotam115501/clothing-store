const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@clothingstore.com';

const isConfigured = !!(SMTP_HOST && SMTP_USER && SMTP_PASS);

let transporter = null;

if (isConfigured) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT),
    secure: parseInt(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
  console.log('[EmailService] Nodemailer transport initialized.');
} else {
  console.log('[EmailService] SMTP credentials missing. Using LOGGING FALLBACK.');
}

const emailLogPath = path.join(__dirname, '../data/simulated_emails.log');

// Helper to write to simulated logs
function logEmailSimulated(to, subject, text, html) {
  const logEntry = `
========================================
TIMESTAMP: ${new Date().toISOString()}
TO: ${to}
SUBJECT: ${subject}
----------------------------------------
TEXT CONTENT:
${text}
----------------------------------------
HTML CONTENT (PREVIEW):
${html.substring(0, 1000)}${html.length > 1000 ? '... [TRUNCATED]' : ''}
========================================
\n`;
  try {
    fs.appendFileSync(emailLogPath, logEntry);
    console.log(`[EmailService Mock] Simulated email written to logs for: ${to}`);
  } catch (err) {
    console.error('[EmailService Mock] Error writing to email logs:', err);
  }
}

// Service methods
const emailService = {
  sendAdminNotification: async (order) => {
    const subject = `[New Order Alert] Order #${order._id} Placed - Total: $${order.totalAmount.toFixed(2)}`;
    
    let itemsText = order.items.map(item => `- ${item.productName} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}`).join('\n');
    let itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.productName}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${item.price.toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    const text = `
New order received on Modern Clothing Shopping!

Order ID: ${order._id}
Time: ${order.createdAt}
Payment Method: ${order.paymentMethod}
Total Amount: $${order.totalAmount.toFixed(2)}

Customer Details:
Name: ${order.shippingAddress.fullName}
Phone: ${order.shippingAddress.mobileNumber}
Email: ${order.shippingAddress.email}

Shipping Address:
${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pinCode}

Items Ordered:
${itemsText}
    `;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: #111; border-bottom: 2px solid #111; padding-bottom: 10px;">New Order Placed!</h2>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Time:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
        <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
        <p><strong>Total Amount:</strong> $${order.totalAmount.toFixed(2)}</p>
        
        <h3 style="margin-top: 20px;">Customer Shipping Details:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td><strong>Name:</strong></td><td>${order.shippingAddress.fullName}</td></tr>
          <tr><td><strong>Phone:</strong></td><td>${order.shippingAddress.mobileNumber}</td></tr>
          <tr><td><strong>Email:</strong></td><td>${order.shippingAddress.email}</td></tr>
          <tr><td><strong>Address:</strong></td><td>${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pinCode}</td></tr>
        </table>

        <h3 style="margin-top: 20px;">Items Ordered:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f5f5f5;">
              <th style="padding: 8px; text-align: left;">Product</th>
              <th style="padding: 8px; text-align: center;">Qty</th>
              <th style="padding: 8px; text-align: right;">Unit Price</th>
              <th style="padding: 8px; text-align: right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 8px; text-align: right; font-weight: bold;">Total:</td>
              <td style="padding: 8px; text-align: right; font-weight: bold; border-top: 2px solid #111;">$${order.totalAmount.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    `;

    if (isConfigured) {
      try {
        await transporter.sendMail({
          from: `"Clothing Store" <${SMTP_USER}>`,
          to: ADMIN_EMAIL,
          subject,
          text,
          html
        });
        console.log(`[EmailService] Sent admin notification for order #${order._id}`);
      } catch (err) {
        console.error('[EmailService] Failed to send admin email notification:', err);
        logEmailSimulated(ADMIN_EMAIL, subject, text, html);
      }
    } else {
      logEmailSimulated(ADMIN_EMAIL, subject, text, html);
    }
  },

  sendCustomerConfirmation: async (order) => {
    const customerEmail = order.shippingAddress.email;
    const subject = `Thank you for your order! - Order #${order._id}`;
    
    let itemsText = order.items.map(item => `- ${item.productName} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}`).join('\n');
    let itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.productName}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${item.price.toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    const text = `
Hi ${order.shippingAddress.fullName},

Thank you for shopping with us! We've received your order and are processing it.

Order ID: ${order._id}
Payment Method: ${order.paymentMethod}
Total Amount: $${order.totalAmount.toFixed(2)}

Shipping Address:
${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pinCode}

Items:
${itemsText}

We will notify you once your order is shipped.
    `;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: #111; border-bottom: 2px solid #111; padding-bottom: 10px;">Order Confirmation</h2>
        <p>Hi ${order.shippingAddress.fullName},</p>
        <p>Thank you for shopping with us! We have received your order and are currently processing it.</p>
        
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
        <p><strong>Total Amount:</strong> $${order.totalAmount.toFixed(2)}</p>
        
        <h3 style="margin-top: 20px;">Shipping Details:</h3>
        <p>${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pinCode}</p>

        <h3 style="margin-top: 20px;">Items Ordered:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f5f5f5;">
              <th style="padding: 8px; text-align: left;">Product</th>
              <th style="padding: 8px; text-align: center;">Qty</th>
              <th style="padding: 8px; text-align: right;">Unit Price</th>
              <th style="padding: 8px; text-align: right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 8px; text-align: right; font-weight: bold;">Total:</td>
              <td style="padding: 8px; text-align: right; font-weight: bold; border-top: 2px solid #111;">$${order.totalAmount.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        
        <p style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px; font-size: 12px; color: #888; text-align: center;">
          This is an automated confirmation email. You will receive tracking details once shipped.
        </p>
      </div>
    `;

    if (isConfigured) {
      try {
        await transporter.sendMail({
          from: `"Clothing Store" <${SMTP_USER}>`,
          to: customerEmail,
          subject,
          text,
          html
        });
        console.log(`[EmailService] Sent confirmation email to customer: ${customerEmail}`);
      } catch (err) {
        console.error(`[EmailService] Failed to send email to customer ${customerEmail}:`, err);
        logEmailSimulated(customerEmail, subject, text, html);
      }
    } else {
      logEmailSimulated(customerEmail, subject, text, html);
    }
  }
};

module.exports = emailService;
