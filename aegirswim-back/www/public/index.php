<?php

require '../vendor/autoload.php';
mb_internal_encoding('UTF-8');
header('Access-Control-Allow-Origin: http://localhost:3000');
header("Access-Control-Allow-Headers: X-API-KEY, Origin, X-Requested-With, Content-Type, Authorization, Accept, Access-Control-Request-Method");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Allow: GET, POST, PUT, DELETE");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
try { //Otra opción con un manejador de excepciones: https://stackoverflow.com/questions/15245184/log-caught-exception-with-stack-trace
    $dotenv = Dotenv\Dotenv::createImmutable('../');
    $dotenv->load();
    Com\Daw2\Core\FrontController::main();
} catch (\Throwable $e) {
    http_response_code(500);
    error_log($e);
    if ($_ENV['app.debug']) {
        echo json_encode(
            [
                'message' => $e->getMessage(),
                'trace'   => $e->getTraceAsString()
            ]
        );
    }
}
