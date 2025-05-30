<?php

namespace Com\Daw2\Controllers;

use Com\Daw2\Core\BaseController;
use Com\Daw2\Libraries\Respuesta;
use Com\Daw2\Models\DuracionModel;
use Com\Daw2\Models\EstilosModel;
use Com\Daw2\Models\IntensidadModel;
use Com\Daw2\Models\NivelesModel;
use Com\Daw2\Models\RitmosModel;
use Com\Daw2\Models\RolModel;

class EnviarDatosController extends BaseController
{
    public function getAll(): void
    {
        $estilosModel = new EstilosModel();
        $intensidadModel = new IntensidadModel();
        $nivelesModel = new NivelesModel();
        $ritmosModel = new RitmosModel();
        $duracionModel = new DuracionModel();

        $datos = [
            'estilos' => $estilosModel->get(),
            'intensidad' => $intensidadModel->get(),
            'niveles' => $nivelesModel->get(),
            'ritmos' => $ritmosModel->get(),
            'duracion' => $duracionModel->get()
        ];

        $exitoCargarDatos = true;
        foreach ($datos as $key => $value) {
            if ($datos[$key] === false) {
                $respuesta = new Respuesta(500, ['error' => 'Error al cargar datos']);
                $exitoCargarDatos = false;
            }
        }
        if ($exitoCargarDatos) {
            $respuesta = new Respuesta(200, $datos);
        }
        $this->view->show('json.view.php', ['respuesta' => $respuesta]);
    }

    public function getRoles(): void
    {
        $model = new RolModel();
        $roles = $model->getRoles();
        if ($roles !== false) {
            $respuesta = new Respuesta(200, $roles);
        } else {
            $respuesta = new Respuesta(500, ['Error' => 'Error al cargar los datos']);
        }
        $this->view->show('json.view.php', ['respuesta' => $respuesta]);
    }
}
