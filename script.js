// Replace with your actual Google Apps Script Web App URL
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzi7902mR6NdjxtpxTATK4Q6HF_G37X2FVn0U_Fl-I7WJVvijvjubzTEsW4ey6kEeB8yg/exec'; // Replace with your Web App URL

/**
 * Handles the form submission.
 * Prevents the default form submission and sends data via Fetch API.
 */
document.getElementById('admissionForm').addEventListener('submit', function(event) {
  event.preventDefault(); // Prevent default form submission

  const form = event.target;
  const formData = new FormData(form);

  // Convert FormData to a plain object
  const formObj = {};
  formData.forEach((value, key) => {
    formObj[key] = value;
  });

  // Send data to Google Sheets via Apps Script Web App
  fetch(WEB_APP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formObj)
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      M.toast({html: 'Form submitted successfully!'});
      // Hide the form and show the payment section
      form.classList.add('hidden');
      document.getElementById('paymentSection').classList.remove('hidden');
    } else {
      M.toast({html: 'Error: ' + data.error});
    }
  })
  .catch(error => {
    console.error('Error submitting form:', error);
    M.toast({html: 'An error occurred while submitting the form.'});
  });
});

/**
 * Initiates the Google Pay payment process when the "Pay Fee Now" button is clicked.
 */
document.getElementById('payNowButton').addEventListener('click', function() {
  onBuyClicked();
});

function onBuyClicked() {
  if (!window.PaymentRequest) {
    alert('Web payments are not supported in this browser.');
    return;
  }

  // Define the supported payment methods
  const supportedInstruments = [
    {
      supportedMethods: 'https://tez.google.com/pay',
      data: {
        pa: '9469050879@ptsbi', // Your UPI ID
        pn: 'HSS Shangus',      // Your name or merchant name
        tr: 'txn_' + new Date().getTime(), // Unique transaction ID
        url: 'https://shgulfam.github.io/e-Educational', // Your website URL
        mc: '5045', // Merchant Category Code
        tn: 'Admission Fee Payment', // Transaction note
      },
    }
  ];

  // Define the payment details
  const details = {
    total: {
      label: 'Total',
      amount: {
        currency: 'INR',
        value: '500.00', // Admission fee amount
      },
    },
    displayItems: [{
      label: 'Admission Fee',
      amount: {
        currency: 'INR',
        value: '500.00',
      },
    }],
  };

  // Create the PaymentRequest object
  let request = null;
  try {
    request = new PaymentRequest(supportedInstruments, details);
  } catch (e) {
    console.log('Payment Request Error:', e.message);
    alert('Payment Request Error: ' + e.message);
    return;
  }

  // Show the Google Pay UI
  request.show()
    .then((paymentResponse) => {
      // Complete the payment process
      paymentResponse.complete('success')
        .then(() => {
          M.toast({html: 'Payment successful!'});
          document.getElementById('paymentSection').innerHTML = '<h5>Payment successful. Thank you!</h5>';
        })
        .catch((err) => {
          console.error('Error completing payment:', err);
          M.toast({html: 'Error completing payment.'});
        });
    })
    .catch((err) => {
      console.error('Payment failed or was canceled:', err);
      M.toast({html: 'Payment failed or was canceled.'});
    });
}
