require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();
const path = require('path');

// Update the static file path to point to the root directory
app.use(express.static(path.join(__dirname, '..')));
app.use(express.json());

// Endpoint to get publishable key
app.get('/config', (req, res) => {
  res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

// Create a checkout session
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { amount, email } = req.body;
    // Get donation type from the form
    const donationType = req.body.donationType || 'one-time';
    
    // Create a checkout session with different settings based on donation type
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: donationType === 'monthly' ? 'Monthly Donation to UKNAT' : 'One-time Donation to UKNAT',
            },
            unit_amount: amount * 100, // Convert to pence
            // Add recurring parameter for monthly donations
            ...(donationType === 'monthly' ? { recurring: { interval: 'month' } } : {})
          },
          quantity: 1,
        },
      ],
      mode: donationType === 'monthly' ? 'subscription' : 'payment',
      success_url: `${req.protocol}://${req.get('host')}/thank-you.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.protocol}://${req.get('host')}/donate.html`,
      customer_email: email,
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));