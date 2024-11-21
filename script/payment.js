document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('payButton').addEventListener('click', onBuyClicked);
});

function onGooglePayLoaded() {
    console.log("Google Pay script loaded.");
}

function onBuyClicked() {
    console.log("Pay button clicked.");

    const supportedInstruments = [
        {
            supportedMethods: 'https://tez.google.com/pay',
            data: {
                pa: '9469050879@ptsbi',
                pn: 'HSS Shangus',
                tr: '1234ABCD',
                url: 'https://shgulfam.github.io/e-Educational/',
                mc: '5045',
                tn: 'Admission Fee',
            },
        },
    ];

    const details = {
        total: {
            label: 'Total',
            amount: {
                currency: 'INR',
                value: '10.01',
            },
        },
    };

    try {
        const request = new PaymentRequest(supportedInstruments, details);

        request.canMakePayment()
            .then((canMakePayment) => {
                if (!canMakePayment) {
                    alert("Google Pay is not available.");
                    return;
                }
                return request.show();
            })
            .then((paymentResponse) => {
                processPayment(paymentResponse);
            })
            .catch((err) => {
                console.error("Error:", err);
            });
    } catch (e) {
        console.error("PaymentRequest Error:", e.message);
    }
}

function processPayment(paymentResponse) {
    const paymentData = {
        methodName: paymentResponse.methodName,
        details: paymentResponse.details,
    };

    fetch('backend/process_payment.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
    })
        .then((response) => response.text())
        .then((result) => {
            console.log("Payment processed:", result);
            paymentResponse.complete('success');
        })
        .catch((err) => {
            console.error("Payment failed:", err);
            paymentResponse.complete('fail');
        });
}
