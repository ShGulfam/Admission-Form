const canMakePaymentCache = 'canMakePaymentCache';


/**
 * Check whether the browser supports Google Pay.
 */
function checkCanMakePayment(request) {
  if (sessionStorage.hasOwnProperty(canMakePaymentCache)) {
    return Promise.resolve(JSON.parse(sessionStorage[canMakePaymentCache]));
  }

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
      console.error('Error calling canMakePayment:', err);
      return false;
    });
}

/**
 * Launches the payment request flow.
 */
function onBuyClicked() {
  if (!window.PaymentRequest) {
    console.error('Web payments are not supported in this browser.');
    return;
  }

  const supportedInstruments = [
    {
      supportedMethods: 'https://tez.google.com/pay',
      data: {
        pa: '9469050879@ptsbi', // Merchant UPI ID
        pn: 'HSS Shangus',       // Payee name
        tr: 'txn_' + new Date().getTime(),
        url: 'https://yourwebsite.com/order',
        mc: '5045',               // Merchant category code
        tn: 'Admission Fee',      // Transaction note
      },
    },
  ];

  const details = {
    total: {
      label: 'Total',
      amount: {
        currency: 'INR',
        value: '10.01', // Sample amount
      },
    },
    displayItems: [
      {
        label: 'Original Amount',
        amount: {
          currency: 'INR',
          value: '10.01',
        },
      },
    ],
  };

  let request = null;

  try {
    request = new PaymentRequest(supportedInstruments, details);
  } catch (e) {
    console.error('Payment Request Error:', e.message);
    return;
  }

  if (!request) {
    console.error('Web payments are not supported in this browser.');
    return;
  }

  checkCanMakePayment(request)
    .then((result) => {
      if (result) {
        showPaymentUI(request);
      } else {
        alert('Google Pay is not ready on this device.');
      }
    })
    .catch((err) => {
      console.error('Error calling checkCanMakePayment:', err);
    });
}

/**
 * Show the payment request UI.
 */
function showPaymentUI(request) {
  let paymentTimeout = window.setTimeout(() => {
    request.abort()
      .then(() => console.error('Payment timed out.'))
      .catch(() => console.error('Unable to abort payment.'));
  }, 20 * 60 * 1000); // Timeout after 20 minutes

  request.show()
    .then((instrument) => {
      clearTimeout(paymentTimeout);
      processPayment(instrument);
    })
    .catch((err) => {
      console.error('Payment UI Error:', err);
    });
}

/**
 * Process the payment response.
 */
function processPayment(instrument) {
  const paymentData = JSON.stringify({
    methodName: instrument.methodName,
    details: instrument.details,
  });

  fetch('backend/process_payment.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: paymentData,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('Server response:', data);
      instrument.complete('success');
    })
    .catch((error) => {
      console.error('Payment processing error:', error);
      instrument.complete('fail');
    });
}
