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
                if (!paymentResponse) return; // If canMakePayment was false

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
        // apiKey: 'YOUR_SECURE_API_KEY', // Optional: If using API Key
    };

    fetch('https://script.google.com/macros/s/AKfycbxxihrba0FfmWp3rEJCKdr8T8IKToN9H_b6UBxghiVuzutYu0tbcWFFNztjfJ4R1bFc/exec', { // Replace with your GAS Web App URL
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
    })
        .then((response) => response.json())
        .then((result) => {
            console.log("Payment processed:", result);
            if (result.status === 'success') {
                paymentResponse.complete('success');
                alert(result.message);
            } else {
                paymentResponse.complete('fail');
                alert(result.message);
            }
        })
        .catch((err) => {
            console.error("Payment failed:", err);
            paymentResponse.complete('fail');
            alert("An error occurred while processing your payment. Please try again.");
        });
}
