function processPayment(paymentResponse) {
    const paymentData = {
        methodName: paymentResponse.methodName,
        details: paymentResponse.details,
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
