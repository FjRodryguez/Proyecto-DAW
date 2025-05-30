<?php

namespace Com\Daw2\Core;

use Ahc\Jwt\JWT;
use Ahc\Jwt\JWTException;
use Com\Daw2\Controllers\AuthController;
use Com\Daw2\Controllers\EntrenamientosController;
use Com\Daw2\Controllers\EnviarDatosController;
use Com\Daw2\Controllers\ErrorController;
use Com\Daw2\Controllers\UsuariosController;
use Steampixel\Route;

class FrontController
{
    private static ?array $jwtData = null;
    private static array $permisos = [];

    private static function tienePermiso(string $permiso): bool
    {
        return !empty(self::$permisos[$permiso]);
    }

    private static function errorPermiso(): void
    {
        (new ErrorController())->errorWithBody(403, ['error' => 'No tiene permiso para esta acción']);
        die;
    }
    public static function main()
    {

        if (!empty($_COOKIE['token'])) {
            try {
                $jwt = new JWT($_ENV['service.secret']);
                self::$jwtData = $jwt->decode($_COOKIE['token']);
                self::$permisos = UsuariosController::getPermisos((int)self::$jwtData['id_rol']);
            } catch (JWTException $e) {
                $controller = new ErrorController();
                $controller->errorWithBody(403, ['error' => 'Token inválido: ' . $e->getMessage()]);
                die;
            }
        } else {
            self::$permisos = UsuariosController::getPermisos();
        }

        Route::add(
            '/register',
            fn() => (new UsuariosController())->register(),
            'post'
        );

        Route::add(
            '/register-google',
            fn() => (new UsuariosController())->registerWithGoogle(),
            'post'
        );

        Route::add(
            '/login',
            fn() => (new UsuariosController())->login(),
            'post'
        );

        Route::add(
            '/login-google',
            fn() => (new UsuariosController())->loginWithGoogle(),
            'post'
        );

        Route::add(
            '/me',
            function () {
                (new AuthController())->me();
            },
            'get'
        );

        Route::add(
            '/logout',
            function () {
                (new UsuariosController())->logout();
            },
            'post'
        );

        Route::add(
            '/entrenamientos',
            function () {
                (new EntrenamientosController())->entrenamientos();
            },
            'get'
        );

        Route::add(
            '/entrenamientosUser',
            function () {
                if (self::tienePermiso('entrenamientos')) {
                    (new EntrenamientosController())->getEntrenamientosUser(self::$jwtData['id_usuario']);
                } else {
                    self::errorPermiso();
                }
            },
            'get'
        );

        Route::add(
            '/numeroEntrenamientosUser',
            function () {
                if (self::tienePermiso('entrenamientos')) {
                    (new EntrenamientosController())->getNumerosEntrenmientosUser(self::$jwtData['id_usuario']);
                } else {
                    self::errorPermiso();
                }
            },
            'get'
        );

        Route::add(
            '/entrenamientos/([0-9]+)',
            function ($id) {
                if (self::tienePermiso('entrenamientos')) {
                    (new EntrenamientosController())->getEntrenamientoUser(self::$jwtData['id_usuario'], $id);
                } else {
                    self::errorPermiso();
                }
            },
            'get'
        );
        Route::add(
            '/entrenamientos/new',
            function () {
                if (self::tienePermiso('entrenamientos')) {
                    (new EntrenamientosController())->insertEntrenamiento(self::$jwtData['id_usuario'], self::tienePermiso('premium'));
                } else {
                    self::errorPermiso();
                }
            },
            'post'
        );

        Route::add(
            '/entrenamientos/([0-9]+)',
            function ($id) {
                if (self::tienePermiso('entrenamientos')) {
                    (new EntrenamientosController())->updateEntrenamiento(self::$jwtData['id_usuario'], $id);
                } else {
                    self::errorPermiso();
                }
            },
            'put'
        );

        Route::add(
            '/entrenamientos/([0-9]+)',
            function ($id) {
                if (self::tienePermiso('entrenamientos')) {
                    (new EntrenamientosController())->deleteEntrenamiento(self::$jwtData['id_usuario'], $id);
                } else {
                    self::errorPermiso();
                }
            },
            'delete'
        );

        Route::add(
            '/usuario/premium',
            function () {
                if (self::tienePermiso('entrenamientos')) {
                    (new UsuariosController())->getUserIsPremium(self::$jwtData['id_usuario'], self::tienePermiso('premium'));
                } else {
                    self::errorPermiso();
                }
            },
            'get'
        );

        Route::add(
            '/usuario/doPremium',
            function () {
                if (self::tienePermiso('hacerPremium')) {
                    (new UsuariosController())->doUserPremium(self::$jwtData['id_usuario']);
                } else {
                    self::errorPermiso();
                }
            },
            'get'
        );

        Route::add(
            '/usuarios',
            function () {
                if (self::tienePermiso('panel_admin')) {
                    (new UsuariosController())->getUsuarios();
                } else {
                    self::errorPermiso();
                }
            },
            'get'
        );

        Route::add(
            '/usuarios/new',
            function () {
                if (self::tienePermiso('panel_admin')) {
                    (new UsuariosController())->register($admin = true);
                } else {
                    self::errorPermiso();
                }
            },
            'post'
        );

        Route::add(
            '/usuarios/([0-9]+)',
            function ($id) {
                if (self::tienePermiso('panel_admin')) {
                    (new UsuariosController())->editUser($id);
                } else {
                    self::errorPermiso();
                }
            },
            'put'
        );

        Route::add(
            '/usuarios/([0-9]+)',
            function ($id) {
                if (self::tienePermiso('panel_admin')) {
                    (new UsuariosController())->deleteUser($id);
                } else {
                    self::errorPermiso();
                }
            },
            'delete'
        );

        Route::add(
            '/roles',
            function () {
                if (self::tienePermiso('panel_admin')) {
                    (new EnviarDatosController())->getRoles();
                } else {
                    self::errorPermiso();
                }
            },
            'get'
        );

        Route::add(
            '/cargarDatos',
            function () {
                (new EnviarDatosController())->getAll();
            },
            'get'
        );
        Route::pathNotFound(
            function () {
                http_response_code(404);
            }
        );

        Route::methodNotAllowed(
            function () {
                http_response_code(405);
            }
        );

        Route::run();
    }
}
