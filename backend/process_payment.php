
<?php
header('Content-Type: application/json');


// Ensure it's a POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get the raw POST data
    $input = file_get_contents('php://input');

    // Decode the JSON payload
    $data = json_decode($input, true);

    if ($data) {
        // Log or process payment details securely
        error_log('Payment Data: ' . print_r($data, true));

        // Send a success response
        echo json_encode([
            'status' => 'success',
            'message' => 'Payment processed successfully.',
        ]);
    } else {
        http_response_code(400); // Bad request
        echo json_encode([
            'status' => 'error',
            'message' => 'Invalid payment data.',
        ]);
    }
} else {
    http_response_code(405); // Method not allowed
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid request method.',
    ]);
}
?>
