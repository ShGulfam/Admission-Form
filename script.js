let submitted = false;

function formSubmissionSuccess() {
  M.toast({html: 'Form submitted successfully!'});

  // Hide the form and show the payment section
  const form = document.getElementById('admissionForm');
  const paymentSection = document.getElementById('paymentSection');

  form.classList.add('hidden');
  paymentSection.classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', function() {
  M.updateTextFields();

  // Handle form submission
  const form = document.getElementById('admissionForm');
  form.addEventListener('submit', function() {
    submitted = true;
  });

  // Add event listener to the payment button
  const payNowButton = document.getElementById('payNowButton');
  payNowButton.addEventListener('click', function() {
    // Include your payment code here
    onBuyClicked();
  });
});

// Payment processing code

// Global key for canMakePayment cache.
const canMakePaymentCache = 'canMakePaymentCache';

/**
 * Check whether can make payment with Google Pay or not.
 * It will check session storage cache first and use the cache directly if it exists.
 * Otherwise, it will call canMakePayment method from PaymentRequest object and return the result,
 * the result will also be stored in the session storage cache for future usage.
 */
function checkCanMakePayment(request) {
  // Check canMakePayment cache, use cache result directly if it exists.
  if (sessionStorage.hasOwnProperty(canMakePaymentCache)) {
    return Promise.resolve(JSON.parse(sessionStorage[canMakePaymentCache]));
  }

  // If canMakePayment() isn't available, default to assume the method is supported.
  let canMakePaymentPromise = Promise.resolve(true);

  // Feature detect canMakePayment().
  if (request.canMakePayment) {
    canMakePaymentPromise = request.canMakePayment();
  }

  return canMakePaymentPromise
      .then((result) => {
        // Store the result in cache for future usage.
        sessionStorage[canMakePaymentCache] = result;
        return result;
      })
      .catch((err) => {
        console.log('Error calling canMakePayment: ' + err);
      });
}

/** Launches payment request flow when user taps on the pay button. */
function onBuyClicked() {
  if (!window.PaymentRequest) {
    console.log('Web payments are not supported in this browser.');
    return;
  }

  // Create supported payment method.
  const supportedInstruments = [
    {
      supportedMethods: ['https://tez.google.com/pay'],
      data: {
        pa: '9469050879@ptsbi', // Replace with your UPI ID
        pn: 'Shk_Gulfam',       // Replace with your name or merchant name
        tr: 'txn_' + new Date().getTime(), // Unique transaction ID
        url: 'https://shgulfam.github.io/e-Educational', // Your website URL
        mc: '5045', // Your merchant category code
        tn: 'Admission Fee Payment',
      },
    }
  ];

  // Create order detail data.
  const details = {
    total: {
      label: 'Total',
      amount: {
        currency: 'INR',
        value: '10.01', // Sample amount
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

  // Create payment request object.
  let request = null;
  try {
    request = new PaymentRequest(supportedInstruments, details);
  } catch (e) {
    console.log('Payment Request Error: ' + e.message);
    return;
  }
  if (!request) {
    console.log('Web payments are not supported in this browser.');
    return;
  }

  const canMakePaymentPromise = checkCanMakePayment(request);
  canMakePaymentPromise
      .then((result) => {
        showPaymentUI(request, result);
      })
      .catch((err) => {
        console.log('Error calling checkCanMakePayment: ' + err);
      });
}

/**
 * Show the payment request UI.
 *
 * @private
 * @param {PaymentRequest} request The payment request object.
 * @param {boolean} canMakePayment Indicates if the payment can be made.
 */
function showPaymentUI(request, canMakePayment) {
  if (!canMakePayment) {
    handleNotReadyToPay();
    return;
  }

  // Set payment timeout.
  let paymentTimeout = window.setTimeout(function() {
    window.clearTimeout(paymentTimeout);
    request.abort()
        .then(function() {
          console.log('Payment timed out after 20 minutes.');
        })
        .catch(function() {
          console.log('Unable to abort, user is in the process of paying.');
        });
  }, 20 * 60 * 1000); /* 20 minutes */

  request.show()
      .then(function(paymentResponse) {
        window.clearTimeout(paymentTimeout);
        // Process paymentResponse here
        paymentResponse.complete('success');

        // Display success message
        M.toast({html: 'Payment successful!'});

        // Optionally, you can redirect or show a success message
        // For example, hide the payment section and show a thank you message
        const paymentSection = document.getElementById('paymentSection');
        paymentSection.innerHTML = '<h5>Payment successful. Thank you!</h5>';
      })
      .catch(function(err) {
        console.log('Payment failed: ' + err);
        M.toast({html: 'Payment failed or was cancelled.'});
      });
}

/** Handle Google Pay not ready to pay case. */
function handleNotReadyToPay() {
  alert('Google Pay is not ready to pay on this device or browser.');
}
