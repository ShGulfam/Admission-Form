document.addEventListener('DOMContentLoaded', () => {
    // Add click event listener to the button
    document.getElementById('payButton').addEventListener('click', onBuyClicked);
});

function onGooglePayLoaded() {
    console.log("Google Pay script loaded.");
}

// Function to handle "Pay Now" button click
function onBuyClicked() {
    console.log("Pay button clicked.");

    // Create the payment request object
    const supportedInstruments = [
        {
            supportedMethods: 'https://tez.google.com/pay',
            data: {
                pa: '9469050879@ptsbi', // Replace with your UPI ID
                pn: 'HSS Shangus',      // Payee name
                tr: '1234ABCD',         // Transaction ID
                url: 'https://your-website.com', // URL for the order
                mc: '5045',             // Merchant code
                tn: 'Admission Fee',    // Transaction note
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

    let request;
    try {
        request = new PaymentRequest(supportedInstruments, details);
    } catch (e) {
        console.error('Payment Request Error:', e.message);
        return;
    }

    // Check if the device can make payments
    request.canMakePayment()
        .then((canMakePayment) => {
            if (!canMakePayment) {
                alert("Google Pay is not ready on this device.");
                return;
            }
            // Show the payment request UI
            return request.show();
        })
        .then((paymentResponse) => {
            // Process the payment response
            processPayment(paymentResponse);
        })
        .catch((err) => {
            console.error('Error during payment process:', err);
        });
}

// Function to process payment response
function processPayment(paymentResponse) {
    const paymentData = {
        methodName: paymentResponse.methodName,
        details: paymentResponse.details,
    };

    console.log("Payment Data:", paymentData);

    // Send payment data to the server for processing
    fetch('backend/process_payment.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
    })
        .then((response) => response.text())
        .then((result) => {
            console.log("Payment processed successfully:", result);
            paymentResponse.complete('success');
        })
        .catch((err) => {
            console.error("Payment processing failed:", err);
            paymentResponse.complete('fail');
        });
}
