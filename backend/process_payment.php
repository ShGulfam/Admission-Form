// <?php
// // Retrieve the payment data from the POST request
// $paymentData = file_get_contents('php://input');
// $data = json_decode($paymentData, true);

// // Log the payment data (optional)
// file_put_contents('payment_log.txt', print_r($data, true), FILE_APPEND);

// // Simulate payment processing (replace this with actual logic)
// if ($data['details']) {
//     echo json_encode([
//         'status' => 'success',
//         'message' => 'Payment processed successfully!',
//     ]);
// } else {
//     http_response_code(400);
//     echo json_encode([
//         'status' => 'fail',
//         'message' => 'Invalid payment data!',
//     ]);
// }
// ?>
