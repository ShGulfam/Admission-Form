// Replace with your actual Google Apps Script Web App URL
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyHEhrCWqHdnPi-4anyI-7ZKe8l0LSGOGZ_z0bi0u1coZOa5nmA6b6qscVfHcSNGkTfWg/exec'; // Replace with your Web App URL

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
 * Checks whether the user can make a payment with Google Pay.
 * Caches the result in sessionStorage to avoid repeated checks.
 *
 * @param {PaymentRequest} request The payment request object.
 * @return {Promise<boolean>} A promise that resolves to whether the payment can be made.
 */
function checkCanMakePayment(request) {
  const canMakePaymentCache = 'canMakePaymentCache';

  // Check cache first
  if (sessionStorage.hasOwnProperty(canMakePaymentCache)) {
    return Promise.resolve(JSON.parse(sessionStorage[canMakePaymentCache]));
  }

  // Check using canMakePayment API
  let canMakePaymentPromise = Promise.resolve(true);
  if (request.canMakePayment) {
    canMakePaymentPromise = request.canMakePayment();
  }

  return canMakePaymentPromise
    .then((result) => {
      sessionStorage[canMakePaymentCache] = result;
      return result;
    })
    .catch((err) => {
      console.log('Error calling canMakePayment:', err);
      return false;
    });
}

/**
 * Initiates the Google Pay payment process when the "Pay Fee Now" button is clicked.
 */
function onBuyClicked() {
  if (!window.PaymentRequest) {
    alert('Web payments are not supported in this browser.');
    return;
  }

  // Define the supported payment methods
  const supportedInstruments = [
    {
      supportedMethods: ['https://tez.google.com/pay'],
      data: {
        pa: 'paytm.s18p6k6@pty', // Your UPI ID
        pn: 'HSS Shangus',        // Your name or merchant name
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
        value: '10.01', // Admission fee amount
      },
    },
    displayItems: [{
      label: 'Admission Fee',
      amount: {
        currency: 'INR',
        value: '10.01',
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

  if (!request) {
    console.log('PaymentRequest initialization failed.');
    alert('PaymentRequest initialization failed.');
    return;
  }

  // Check if the user can make the payment
  checkCanMakePayment(request)
    .then((canMakePayment) => {
      if (canMakePayment) {
        showPaymentUI(request);
      } else {
        alert('Google Pay is not available on this device.');
      }
    })
    .catch((err) => {
      console.log('Error in checkCanMakePayment:', err);
      alert('Error checking payment capabilities.');
    });
}

/**
 * Displays the Google Pay UI and handles the payment process.
 *
 * @param {PaymentRequest} request The payment request object.
 */
function showPaymentUI(request) {
  // Set a timeout for the payment process (e.g., 20 minutes)
  let paymentTimeout = window.setTimeout(() => {
    window.clearTimeout(paymentTimeout);
    request.abort()
      .then(() => {
        console.log('Payment timed out after 20 minutes.');
      })
      .catch(() => {
        console.log('Unable to abort, user is in the process of paying.');
      });
  }, 20 * 60 * 1000); // 20 minutes

  // Show the Google Pay UI
  request.show()
    .then((paymentResponse) => {
      window.clearTimeout(paymentTimeout);
      // Process the payment response
      paymentResponse.complete('success')
        .then(() => {
          M.toast({html: 'Payment successful!'});
          // Optionally, you can redirect the user or perform additional actions
          document.getElementById('paymentSection').innerHTML = '<h5>Payment successful. Thank you!</h5>';
        })
        .catch((err) => {
          console.log('Error completing payment:', err);
          M.toast({html: 'Error completing payment.'});
        });
    })
    .catch((err) => {
      console.log('Payment failed or was canceled:', err);
      M.toast({html: 'Payment failed or was canceled.'});
    });
}

/**
 * Handles the scenario where Google Pay is not available for payment.
 */
function handleNotReadyToPay() {
  alert('Google Pay is not ready to pay on this device or browser.');
}

// Initialize Materialize components and attach event listeners once the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  M.updateTextFields();

  // Attach event listener to the "Pay Fee Now" button
  const payNowButton = document.getElementById('payNowButton');
  if (payNowButton) {
    payNowButton.addEventListener('click', function() {
      console.log('Pay Now button clicked');
      onBuyClicked();
    });
  } else {
    console.error('Pay Now button not found in the DOM.');
  }
});
