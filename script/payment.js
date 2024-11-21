// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/service-worker.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            }, function(err) {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

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
            supportedMethods: 'https://google.com/pay', // Updated to correct URL
            data: {
                pa: '9469050879@ptsbi',
                pn: 'HSS Shangus',
                tr: '1234ABCD',
                url: 'https://shgulfam.github.io/e-Educational/',
                mc: '5045',
                tn: 'Admission Fee',
                amount: {
                    currency: 'INR',
                    value: '10.01',
                },
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
                console.log("canMakePayment:", canMakePayment);
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
                alert("An error occurred during the payment process.");
            });
    } catch (e) {
        console.error("PaymentRequest Error:", e.message);
        alert("An error occurred while initiating the payment.");
    }
}

function processPayment(paymentResponse) {
    const paymentData = {
        methodName: paymentResponse.methodName,
        details: paymentResponse.details,
    };

    fetch('https://script.google.com/macros/s/AKfycbwUeO7yRSVC_YBZlfeukq8ImBIAifQcQc4AUsKm9gwkaTSOSnkSQz0u-5sndhkiGj_2PQ/exec', { // Replace with your GAS Web App URL
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
