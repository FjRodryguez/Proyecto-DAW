<?php

namespace Com\Daw2\Controllers;

use Ahc\Jwt\JWT;
use Com\Daw2\Core\BaseController;
use Com\Daw2\Libraries\Respuesta;

class AuthController extends baseController
{
    public function me(): void
    {
        if (empty($_COOKIE['token'])) {
            $respuesta = new Respuesta(401, ['error' => 'Token no encontrado']);
        } else {
            try {
                $jwt = new JWT($_ENV['service.secret'], 'HS256');
                $token = $_COOKIE['token'];
                $payload = $jwt->decode($token);

                $respuesta = new Respuesta(200, ['user' => $payload]);
            } catch (\Throwable $e) {
                $respuesta = new Respuesta(401, ['error' => $e->getMessage()]);
            }
        }

        $this->view->show('json.view.php', ['respuesta' => $respuesta]);
    }
}
