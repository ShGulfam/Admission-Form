<?php
// Allow only POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['status' => 'fail', 'message' => 'Invalid request method']);
    exit;
}

// Get the JSON payload sent from the JavaScript
$input = file_get_contents('php://input');
$paymentData = json_decode($input, true);

// Check if payment data is received
if (!$paymentData) {
    http_response_code(400); // Bad Request
    echo json_encode(['status' => 'fail', 'message' => 'Invalid payment data']);
    exit;
}

// Process the payment data (e.g., log it, store it in the database, etc.)
try {
    // Open or create a log file for storing transactions
    $logFile = 'payment_log.txt'; // Change this to your desired file path
    $logData = "Transaction Details:\n" . print_r($paymentData, true) . "\n---\n";

    // Append the payment data to the log file
    file_put_contents($logFile, $logData, FILE_APPEND);

    // Respond to the client with a success message
    echo json_encode(['status' => 'success', 'message' => 'Payment was successful!']);
} catch (Exception $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode(['status' => 'fail', 'message' => 'Error processing payment data']);
}
?>

