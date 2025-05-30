<?php

namespace Com\Daw2\Controllers;

use Ahc\Jwt\JWT;
use Com\Daw2\Core\BaseController;
use Com\Daw2\Helpers\ArrayHelper;
use Com\Daw2\Libraries\Respuesta;
use Com\Daw2\Models\RolModel;
use Com\Daw2\Models\UsuariosModel;
use Kreait\Firebase\Factory;

class UsuariosController extends BaseController
{
    private const ALLOWED_FIELDS = [
        'email', 'pass', 'pass2', 'nombre', 'aceptar_terminos', 'rol'
    ];
    private const ALLOWED_FILTERS = [
        'nombre', 'email', 'rol', 'order', 'sentido', 'page'
    ];
    public function getUsuarios(): void
    {
        $model = new UsuariosModel();
        $filtros = ArrayHelper::filterAssociativeArray($_GET, self::ALLOWED_FILTERS);
        try {
            $users = $model->getUsuarios($filtros);
            $maxPage = $model->maxPage($filtros);
            if ($users !== false) {
                $data['usuarios'] = $users;
                $data['maxPage'] = $maxPage;
                $respuesta = new Respuesta(200, $data);
            } else {
                $respuesta = new Respuesta(404, ['error' => 'No se encontraron resultados']);
            }
        } catch (\InvalidArgumentException $e) {
            $respuesta = new Respuesta(500, ['error' => $e->getMessage()]);
        }
        $this->view->show('json.view.php', ['respuesta' => $respuesta]);
    }

    public function getUserIsPremium(int $id_usuario, bool $isPremium): void
    {
        if ($isPremium) {
            $respuesta = new Respuesta(200, ['success' => true]);
        } else {
            $respuesta = new Respuesta(200, ['success' => false]);
        }

        $this->view->show('json.view.php', ['respuesta' => $respuesta]);
    }

    public function doUserPremium(int $id_usuario): void
    {
        $model = new UsuariosModel();
        $user = $model->getById($id_usuario);
        if ($user !== false) {
            $res = $model->doPremium($id_usuario);
            if ($res !== false) {
                $this->quitarCookie();
                $respuesta = new Respuesta(200, ['success' => 'Usuario actualizado a premium correctamente, vuelva a iniciar sesión']);
            } else {
                $respuesta = new Respuesta(500, ['error' => 'Error al actualizar el usuario a premium']);
            }
        } else {
            $respuesta = new Respuesta(404, ['error' => 'Error al obtener el usuario']);
        }
        $this->view->show('json.view.php', ['respuesta' => $respuesta]);
    }

    public function register(bool $admin = false): void
    {
         $inputJSON = file_get_contents('php://input');
         $data = json_decode($inputJSON, true);
         $cleanData = ArrayHelper::filterAssociativeArray($data, self::ALLOWED_FIELDS);
         $errors = $this->checkErrors($cleanData, $admin);

        if (empty($errors)) {
            $cleanData['pass'] = password_hash($cleanData['pass'], PASSWORD_DEFAULT);
            unset($cleanData['pass2']);
            unset($cleanData['aceptar_terminos']);
            $model = new UsuariosModel();
            if ($admin) {
                $res = $model->insert($cleanData);
            } else {
                $res = $model->register($cleanData);
            }
            if ($res !== false) {
                $respuesta = new Respuesta(200, ['success' => 'Usuario registrado correctamente.']);
            } else {
                $respuesta = new Respuesta(500, ['error' => 'Error al registrar. Intente nuevamente.']);
            }
        } else {
            $respuesta = new Respuesta(400, $errors);
        }

         $this->view->show('json.view.php', ['respuesta' => $respuesta]);
    }

    public function editUser(int $id): void
    {
        $inputJSON = file_get_contents("php://input");
        $data = json_decode($inputJSON, true);
        $cleanData = ArrayHelper::filterAssociativeArray($data, self::ALLOWED_FIELDS);
        $model = new UsuariosModel();
        $user = $model->getById($id);
        if ($user !== false) {
            $cleanData['oldEmail'] = $user['email'];
            $errors = $this->checkErrors($cleanData, true, true);
            if (empty($errors)) {
                unset($cleanData['pass2']);
                unset($cleanData['aceptar_terminos']);
                unset($cleanData['oldEmail']);
                $cleanData['id'] = $id;
                $cleanData['pass'] = password_hash($cleanData['pass'], PASSWORD_DEFAULT);
                $res = $model->edit($cleanData);
                if ($res !== false) {
                    $respuesta = new Respuesta(200, ['success' => 'Usuario editado con éxito']);
                } else {
                    $respuesta = new Respuesta(500, ['error' => 'Error al editar']);
                }
            } else {
                $respuesta = new Respuesta(400, $errors);
            }
        } else {
            $respuesta = new Respuesta(404, ['error' => 'El usuario no es válido']);
        }
        $this->view->show('json.view.php', ['respuesta' => $respuesta]);
    }

    public function deleteUser(int $id): void
    {
        $model = new UsuariosModel();
        $user = $model->getById($id);
        if ($user !== false) {
            $res = $model->delete($id);
            if ($res !== false) {
                $respuesta = new Respuesta(200, ['success' => 'Usuario eliminado']);
            } else {
                $respuesta = new Respuesta(500, ['error' => 'Error al eliminar usuario']);
            }
        } else {
            $respuesta = new Respuesta(404, ['error' => 'Usuario no encontrado']);
        }
        $this->view->show('json.view.php', ['respuesta' => $respuesta]);
    }

    public function registerWithGoogle(): void
    {
        $headers = getallheaders();
        $bearer = $headers['Authorization'] ?? '';

        if (!str_starts_with($bearer, 'Bearer ')) {
            $respuesta = new Respuesta(401, ['error' => 'Token no proporcionado']);
        } else {
            $idToken = substr($bearer, 7);

            try {
                $factory = (new Factory())->withServiceAccount(__DIR__ . '/../Libraries/firebase.json');
                $auth = $factory->createAuth();

                $verifiedIdToken = $auth->verifyIdToken($idToken);
                $uid = $verifiedIdToken->claims()->get('sub');
                $firebaseUser = $auth->getUser($uid);

                $email = $firebaseUser->email;
                $nombre = $firebaseUser->displayName ?? 'Usuario';

                $model = new UsuariosModel();
                $user = $model->getByEmail($email);

                if ($user !== false) {
                    $respuesta = new Respuesta(400, ['error' => 'El usuario ya existe']);
                } else {
                    $userData = [
                        'email' => $email,
                        'nombre' => $nombre,
                        'pass' => password_hash(bin2hex(random_bytes(8)), PASSWORD_DEFAULT),
                    ];

                    $res = $model->register($userData);
                    if ($res !== false) {
                        $respuesta = new Respuesta(200, ['success' => 'Usuario registrado correctamente.']);
                    } else {
                        $respuesta = new Respuesta(500, ['error' => 'No se pudo registrar el usuario']);
                    }
                }
            } catch (\Throwable $e) {
                $respuesta = new Respuesta(500, ['error' => 'Error al verificar el token: ' . $e->getMessage()]);
            }
        }

        $this->view->show('json.view.php', ['respuesta' => $respuesta]);
    }

    public function loginWithGoogle(): void
    {
        $headers = getallheaders();
        $bearer = $headers['Authorization'] ?? '';

        if (!str_starts_with($bearer, 'Bearer ')) {
            $respuesta = new Respuesta(401, ['error' => 'Token no proporcionado']);
        } else {
            $idToken = substr($bearer, 7);

            try {
                $factory = (new Factory())->withServiceAccount(__DIR__ . '/../Libraries/firebase.json');
                $auth = $factory->createAuth();

                $verifiedIdToken = $auth->verifyIdToken($idToken);
                $uid = $verifiedIdToken->claims()->get('sub');
                $firebaseUser = $auth->getUser($uid);

                $email = $firebaseUser->email;

                $model = new UsuariosModel();
                $user = $model->getByEmail($email);

                if ($user !== false) {
                    $res = $model->updateUltimaSesion($user['id']);
                    if ($res !== false) {
                        $playload = [
                            'id_usuario' => $user['id'],
                            'nombre' => $user['nombre'],
                            'id_rol' => (int)$user['id_rol']
                        ];
                        $jwt = new JWT($_ENV['service.secret'], 'HS256', 3600);
                        $token = $jwt->encode($playload);
                        setcookie("token", $token, [
                            "expires" => time() + 3600,
                            "path" => "/",
                            "secure" => false, // Cambia a true con HTTPS
                            "httponly" => true,
                            "samesite" => "Lax", // "None" si usas cookies cross-origin con HTTPS
                        ]);
                        $respuesta = new Respuesta(200, ['success' => 'Inicio de sesión exitoso']);
                    } else {
                        $respuesta = new Respuesta(500, ['error' => 'Error al iniciar sesión']);
                    }
                } else {
                    $respuesta = new Respuesta(400, ['error' => 'El usuario no existe']);
                }
            } catch (\Throwable $e) {
                $respuesta = new Respuesta(500, ['error' => 'Error al verificar el token: ' . $e->getMessage()]);
            }
        }

        $this->view->show('json.view.php', ['respuesta' => $respuesta]);
    }
    public function login(): void
    {
        $inputJSON = file_get_contents('php://input');
        $data = json_decode($inputJSON, true);
        $cleanData = ArrayHelper::filterAssociativeArray($data, ['email', 'pass']);
        if (empty($cleanData['email']) || empty($cleanData['pass'])) {
            $respuesta = new Respuesta(400, ['error' => 'Es necesario rellenar todos los campos']);
        } else {
            $model = new UsuariosModel();
            $user = $model->getByEmail($cleanData['email']);
            if ($user !== false) {
                if (password_verify($cleanData['pass'], $user['pass'])) {
                    $res = $model->updateUltimaSesion($user['id']);
                    if ($res !== false) {
                        $playload = [
                        'id_usuario' => $user['id'],
                        'nombre' => $user['nombre'],
                        'id_rol' => (int)$user['id_rol']
                        ];
                        $jwt = new JWT($_ENV['service.secret'], 'HS256', 3600);
                        $token = $jwt->encode($playload);
                        setcookie("token", $token, [
                        "expires" => time() + 3600,
                        "path" => "/",
                        "secure" => false, // Cambia a true con HTTPS
                        "httponly" => true,
                        "samesite" => "Lax", // "None" si usas cookies cross-origin con HTTPS
                        ]);
                        $respuesta = new Respuesta(200, ['success' => 'Inicio de sesión exitoso']);
                    } else {
                        $respuesta = new Respuesta(500, ['error' => 'Error al iniciar sesión']);
                    }
                } else {
                    $respuesta = new Respuesta(403, ['error' => 'Datos incorrectos']);
                }
            } else {
                $respuesta = new Respuesta(403, ['error' => 'Datos incorrectos']);
            }
        }
        $this->view->show('json.view.php', ['respuesta' => $respuesta]);
    }
    private function checkErrors(array $data, bool $admin, bool $isEdit = false): array
    {
        $errors = [];
        foreach (['nombre', 'email'] as $field) {
            if (empty($data[$field])) {
                $errors[$field] = 'El campo ' . $field . ' es obligatorio';
            }
        }

        if (!empty($data['nombre']) && mb_strlen($data['nombre']) < 3 || mb_strlen($data['nombre']) > 150) {
            $errors['nombre'] = 'El campo nombre debe tener entre 3 y 150 caracteres';
        }

        if (!$isEdit || $data['oldEmail'] != $data['email']) {
            if (!empty($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                $errors['email'] = 'El email no es válido';
            } else {
                $model = new UsuariosModel();
                $row = $model->getByEmail($data['email']);
                if ($row !== false) {
                    $errors['email'] = 'El email ya tiene una cuenta asociada';
                }
            }
        }

        //Acordarse de poner la expresion regular para controlar la contraseña
        if (($isEdit && !empty($data['pass'])) || !$isEdit) {
            if (empty($data['pass'])) {
                $errors['pass'] = 'La constraseña es obligatoria';
            } elseif ($data['pass'] !== $data['pass2']) {
                $errors['pass'] = 'Las contraseñas no coinciden';
            }
        }

        if ($admin === false) {
            if (empty($data['aceptar_terminos'])) {
                $errors['aceptar_terminos'] = 'Debe aceptar los terminos y condiciones';
            } elseif ($data['aceptar_terminos'] === false) {
                $errors['aceptar_terminos'] = 'Debe aceptar los terminos y condiciones';
            }
        }

        if ($admin === true) {
            if (empty($data['rol'])) {
                $errors['rol'] = 'El campo rol es obligatorio';
            } elseif (!filter_var($data['rol'], FILTER_VALIDATE_INT)) {
                $errors['rol'] = 'El rol no es válido';
            } else {
                $rolModel = new RolModel();
                $row = $rolModel->findById((int)$data['rol']);
                if ($row === false) {
                    $errors['rol'] = 'El rol no es válido';
                }
            }
        }

        return $errors;
    }

    private function quitarCookie(): void
    {
        setcookie('token', '', [
            'expires'  => time() - 3600,
            'path'     => '/',
            'secure'   => true,
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
    }

    public function logout(): void
    {
        $this->quitarCookie();

        $respuesta = new Respuesta(200, ['success' => 'Logout exitoso']);
        $this->view->show('json.view.php', ['respuesta' => $respuesta]);
    }

    public static function getPermisos(int $idRol = 0): array
    {
        return match ($idRol) {
            1 => [ // Usuario normal
                'entrenamientos' => true,
                'hacerPremium' => true,
            ],
            2 => [ // Usuario premium
                'entrenamientos' => true,
                'premium' => true,
            ],
            3 => [ // Admin
                'entrenamientos' => true,
                'premium' => true,
                'panel_admin' => true,
            ],
            default => [] // No autenticado
        };
    }
}
