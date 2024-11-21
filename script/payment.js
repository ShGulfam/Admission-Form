function onBuyClicked() {
    console.log("Pay button clicked.");

    // Create the payment request object
    const supportedInstruments = [
        {
            supportedMethods: 'https://tez.google.com/pay', // Google Pay for UPI
            data: {
                pa: '9469050879@ptsbi', // UPI ID
                pn: 'HSS Shangus',      // Payee name
                tr: '1234ABCD',         // Transaction ID
                url: 'https://your-website.com', // Order URL
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
    };

    try {
        const request = new PaymentRequest(supportedInstruments, details);

        // Check if the device can make payments
        request.canMakePayment()
            .then((canMakePayment) => {
                if (!canMakePayment) {
                    alert("Google Pay is not available on this device.");
                    return;
                }
                // Show the payment request UI
                return request.show();
            })
            .then((paymentResponse) => {
                processPayment(paymentResponse);
            })
            .catch((err) => {
                console.error('Error during payment process:', err);
            });
    } catch (e) {
        console.error('Payment Request Error:', e.message);
    }
}
