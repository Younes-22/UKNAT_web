// Initialize Stripe with your publishable key
console.log('Initializing Stripe.js...');

// Check if we're on a secure connection
const isSecureConnection = window.location.protocol === 'https:';
console.log('Secure connection:', isSecureConnection);

// Fetch publishable key from server
fetch('/config')
  .then(response => response.json())
  .then(data => {
    const stripe = Stripe(data.publishableKey);
    console.log('Stripe initialized with publishable key');
    
    // Handle amount button selection
    document.querySelectorAll('.amount-btn').forEach(button => {
      button.addEventListener('click', function() {
        if (this.classList.contains('custom-amount')) {
          // Show custom amount input
          document.querySelector('.custom-amount-input').style.display = 'block';
          return;
        }
        
        // Hide custom amount input
        document.querySelector('.custom-amount-input').style.display = 'none';
        
        // Remove selected class from all buttons
        document.querySelectorAll('.amount-btn').forEach(btn => {
          btn.classList.remove('selected');
        });
        
        // Add selected class to clicked button
        this.classList.add('selected');
        
        // Update the donation amount input with the selected amount
        document.getElementById('donation-amount').value = this.dataset.amount;
      });
    });
    
    // Set up form submission for redirect to Stripe Checkout
    // Inside your form submission handler
    const form = document.getElementById('payment-form');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      // Get donation amount
      let amount;
      const selectedAmount = document.querySelector('.amount-btn.selected:not(.custom-amount)');
      
      if (selectedAmount) {
        amount = selectedAmount.dataset.amount;
      } else {
        amount = document.getElementById('donation-amount').value;
      }
      
      const email = document.getElementById('email').value;
      
      // Get donation type (one-time or monthly)
      const donationType = document.querySelector('input[name="donation-type"]:checked').value;

      try {
        // Create a checkout session on your server
        const response = await fetch('/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: amount,
            email: email,
            donationType: donationType
          }),
        });
        
        const session = await response.json();

        if (session.error) {
          // Handle error
          const errorElement = document.getElementById('card-errors');
          errorElement.textContent = session.error;
          return;
        }

        // Redirect to Stripe Checkout
        const result = await stripe.redirectToCheckout({
          sessionId: session.id
        });

        if (result.error) {
          // Handle error
          const errorElement = document.getElementById('card-errors');
          errorElement.textContent = result.error.message;
        }
      } catch (err) {
        console.error('Error:', err);
        const errorElement = document.getElementById('card-errors');
        errorElement.textContent = 'An error occurred while processing your payment.';
      }
    });
  })
  .catch(error => {
    console.error('Error initializing Stripe:', error);
    // Handle the error appropriately, maybe show a user-friendly message
  });
  