<?php

namespace Com\Daw2\Controllers;

use Com\Daw2\Core\BaseController;
use Com\Daw2\Helpers\ArrayHelper;
use Com\Daw2\Libraries\Respuesta;
use Com\Daw2\Models\DuracionModel;
use Com\Daw2\Models\EntrenamientosModel;
use Com\Daw2\Models\EstilosModel;
use Com\Daw2\Models\IntensidadModel;
use Com\Daw2\Models\NivelesModel;
use Com\Daw2\Models\RitmosModel;
use Com\Daw2\Models\UsuariosModel;

class EntrenamientosController extends BaseController
{
    private const ALLOWED_FIELDS = [
        'nombre', 'descripcion', 'duracion', 'nivel', 'intensidad',
        'calentamiento', 'seriesCalentamiento',
        'partePrincipal', 'seriesPartePrincipal',
        'vueltaCalma', 'seriesVueltaCalma'
    ];

    private const ALLOWED_FIELDS_EJERCICIOS = [
        'repeticiones', 'metros', 'descanso', 'id_ritmo', 'id_estilo', 'descripcion'
    ];
    public function entrenamientos(): void
    {
        $archivo = __DIR__ . '/../Data/Entrenamientos.json';

        if (file_exists($archivo)) {
            $entrenamientos = json_decode(file_get_contents($archivo), true);
            $respuesta = new Respuesta(200, $entrenamientos);
        } else {
            $respuesta = new Respuesta(404, ['error' => 'Archivo no encontrado']);
        }
        $this->view->show('json.view.php', ['respuesta' => $respuesta]);
    }

    public function getNumerosEntrenmientosUser(int $id_usuario): void
    {
        $model = new UsuariosModel();
        $user = $model->getById($id_usuario);
        if ($user !== false) {
            $model = new EntrenamientosModel();
            $res = $model->getNumeroEntrenamientos($id_usuario);
            if ($res !== false) {
                $respuesta = new Respuesta(200, ['success' => $res]);
            } else {
                $respuesta = new Respuesta(404, ['error' => 'Error al obtener número de entrenamientos']);
            }
        } else {
            $respuesta = new Respuesta(404, ['error' => 'Error al obtener el usuario']);
        }
        $this->view->show('json.view.php', ['respuesta' => $respuesta]);
    }

    public function getEntrenamientosUser(int $id_usuario): void
    {
        $model = new EntrenamientosModel();
        $entrenamientos = $model->getEntrenamientos($id_usuario);
        if ($entrenamientos !== false) {
            $respuesta = new Respuesta(200, $entrenamientos);
        } else {
            $respuesta = new Respuesta(500, ['error' => 'Error al obtener entrenamientos']);
        }

        $this->view->show('json.view.php', ['respuesta' => $respuesta]);
    }

    public function getEntrenamientoUser(int $id_usuario, int $id_entrenamiento): void
    {
        $model = new  EntrenamientosModel();
        $res = $model->getEntrenamientoById($id_usuario, $id_entrenamiento);
        if ($res !== false) {
            $respuesta = new Respuesta(200, $res);
        } else {
            $respuesta = new Respuesta(404, ['error' => 'Error al obtener entrenamiento']);
        }
        $this->view->show('json.view.php', ['respuesta' => $respuesta]);
    }

    public function insertEntrenamiento(int $id_usuario, bool $isPremium): void
    {
        $inputJSON = file_get_contents('php://input');
        $data = json_decode($inputJSON, true);
        $cleanData = ArrayHelper::filterAssociativeArray($data, self::ALLOWED_FIELDS);
        $cleanData = $this->clearEjercicios($cleanData);
        $errors = $this->checkErrors($cleanData);
        if (empty($errors)) {
            if ($isPremium) {
                $model = new EntrenamientosModel();
                $res = $model->insertEntrenamiento($cleanData, $id_usuario);
                if ($res !== false) {
                    $respuesta = new Respuesta(200, ['success' => 'Entrenamiento guardado con éxito']);
                } else {
                    $respuesta = new Respuesta(500, ['error' => 'Error al guardar el entrenamiento']);
                }
            } else {
                $model = new EntrenamientosModel();
                $res = $model->getNumeroEntrenamientos($id_usuario);
                if ($res < $_ENV['max.entrenamientos']) {
                    $res = $model->insertEntrenamiento($cleanData, $id_usuario);
                    if ($res !== false) {
                        $respuesta = new Respuesta(200, ['success' => 'Entrenamiento guardado con éxito']);
                    } else {
                        $respuesta = new Respuesta(500, ['error' => 'Error al guardar el entrenamiento']);
                    }
                } else {
                    $respuesta = new Respuesta(401, ['error' => 'El usuario ha llegado a su límite de entrenamientos']);
                }
            }
        } else {
            $respuesta = new Respuesta(400, $errors);
        }

        $this->view->show('json.view.php', ['respuesta' => $respuesta]);
    }

    public function updateEntrenamiento(int $id_usuario, int $id_entrenamiento): void
    {
        $inputJSON = file_get_contents('php://input');
        $data = json_decode($inputJSON, true);
        $cleanData = ArrayHelper::filterAssociativeArray($data, self::ALLOWED_FIELDS);
        $cleanData = $this->clearEjercicios($cleanData);
        $errors = $this->checkErrors($cleanData);
        if (empty($errors)) {
            $model = new EntrenamientosModel();
            $res = $model->getEntrenamientoById($id_usuario, $id_entrenamiento);
            if ($res !== false) {
                $res = $model->updateEntrenamiento($cleanData, $id_entrenamiento);
                if ($res !== false) {
                    $respuesta = new Respuesta(200, ['success' => 'Entrenamiento actualizado con éxito']);
                } else {
                    $respuesta = new Respuesta(500, ['error' => 'Error al actualizar el entrenamiento']);
                }
            } else {
                $respuesta = new Respuesta(404, ['error' => 'Error al obtener entrenamiento']);
            }
        } else {
            $respuesta = new Respuesta(400, $errors);
        }

        $this->view->show('json.view.php', ['respuesta' => $respuesta]);
    }

    public function deleteEntrenamiento(int $id_usuario, int $id_entrenamiento): void
    {
        $model = new EntrenamientosModel();
        $res = $model->getEntrenamientoById($id_usuario, $id_entrenamiento);
        if ($res !== false) {
            $res = $model->deleteEntrenamiento($id_entrenamiento);
            if ($res !== false) {
                $respuesta = new Respuesta(200, ['success' => 'Entrenamiento eliminado con éxito']);
            } else {
                $respuesta = new Respuesta(500, ['error' => 'Error al eliminar el entrenamiento']);
            }
        } else {
            $respuesta = new Respuesta(404, ['error' => 'Error al obtener entrenamiento']);
        }
        $this->view->show('json.view.php', ['respuesta' => $respuesta]);
    }

    private function checkErrors(array $data): array
    {
        $errors = [];

        foreach (['nombre', 'duracion', 'nivel', 'intensidad'] as $field) {
            if (empty($data[$field])) {
                $errors[$field] = "El campo " . $field . " es obligatorio";
            }
        }

        if (!empty($data['nombre']) && (mb_strlen($data['nombre']) > 50 || mb_strlen($data['nombre']) < 3)) {
            $errors['nombre'] = 'El campo nombre debe tener entre 3 y 50 caracteres';
        }

        if (!empty($data['descripcion']) && mb_strlen($data['descripcion']) > 255) {
            $errors['descripcion'] = 'El campo descripción no debe tener más de 255 caracteres';
        }

        if (!empty($data['duracion']) && filter_var($data['duracion'], FILTER_VALIDATE_INT) === false) {
            $errors['duracion'] = 'El campo duración no es válido';
        } else {
            $duracionModel = new DuracionModel();
            $res = $duracionModel->getById((int)$data['duracion']);
            if ($res === false) {
                $errors['duracion'] = 'El campo duración no es válido';
            }
        }

        if (!empty($data['nivel']) && filter_var($data['nivel'], FILTER_VALIDATE_INT) === false) {
            $errors['nivel'] = 'El campo nivel no es válido';
        } else {
            $nivelModel = new NivelesModel();
            $res = $nivelModel->getById((int)$data['nivel']);
            if ($res === false) {
                $errors['nivel'] = 'El campo nivel no es válido';
            }
        }

        if (!empty($data['intensidad']) && filter_var($data['intensidad'], FILTER_VALIDATE_INT) === false) {
            $errors['intensidad'] = 'El campo intensidad no es válido';
        } else {
            $intensidadModel = new IntensidadModel();
            $res = $intensidadModel->getById((int)$data['intensidad']);
            if ($res === false) {
                $errors['intensidad'] = 'El campo intensidad no es válido';
            }
        }

        if (mb_strlen($data['descripcion']) > 255) {
            $errors['descripcion'] = 'El campo descripción no debe tener más de 255 caracteres';
        }

        foreach (['seriesCalentamiento', 'seriesPartePrincipal', 'seriesVueltaCalma'] as $field) {
            if (empty($data[$field])  && $data[$field] !== 0) {
                $errors[$field] = "El campo es obligatorio";
            } elseif (filter_var($data[$field], FILTER_VALIDATE_INT) === false) {
                $errors[$field] = "El campo debe ser un número entero mayor a 0";
            } elseif ($data[$field] < 1) {
                $errors[$field] = "El campo debe ser mayor a 0";
            }
        }

        $erroresPartes = $this->checkErrorsEntrenamiento($data);
        return array_merge($errors, $erroresPartes);
    }

    private function checkErrorsEntrenamiento(array $data): array
    {
        $errors = [];

        foreach (['calentamiento', 'partePrincipal', 'vueltaCalma'] as $field) {
            if (empty($data[$field]) || !is_array($data[$field])) {
                $errors[$field] = 'La sección debe tener al menos 1 ejercicio';
            } else {
                foreach ($data[$field] as $index => $ejercicio) {
                    $erroresEjercicio = $this->checkErrorsEjercicios($ejercicio);
                    if (!empty($erroresEjercicio)) {
                        $errors[$field][$index + 1] = $erroresEjercicio;
                    }
                }
            }
        }

        return $errors;
    }

    private function checkErrorsEjercicios(array $data): array
    {
        $errors = [];
        $camposNumericos = ['repeticiones', 'metros', 'descanso'];

        foreach ($camposNumericos as $field) {
            if (empty($data[$field]) && $data[$field] !== 0) {
                $errors[$field] = "El campo " . $field . " es obligatorio";
            } elseif (filter_var($data[$field], FILTER_VALIDATE_INT) === false) {
                $errors[$field] = "El campo " . $field . " debe ser un número entero";
            } elseif ($data[$field] < 1) {
                $errors[$field] = "El campo " . $field . " debe ser mayor a 0";
            }
        }

        if (empty($data['id_ritmo'])) {
            $errors['ritmo'] = "El campo ritmo es obligatorio";
        } elseif (filter_var($data['id_ritmo'], FILTER_VALIDATE_INT) === false) {
            $errors['ritmo'] = 'El campo ritmo no es válido';
        } else {
            $ritmoModel = new RitmosModel();
            $res = $ritmoModel->getById((int)$data['id_ritmo']);
            if ($res === false) {
                $errors['ritmo'] = 'El campo ritmo no es válido';
            }
        }

        if (empty($data['id_estilo'])) {
            $errors['estilo'] = "El campo estilo es obligatorio";
        } elseif (filter_var($data['id_estilo'], FILTER_VALIDATE_INT) === false) {
            $errors['estilo'] = 'El campo estilo no es válido';
        } else {
            $estiloModel = new EstilosModel();
            $res = $estiloModel->getById((int)$data['id_estilo']);
            if ($res === false) {
                $errors['estilo'] = 'El campo estilo no es válido';
            }
        }

        if (!empty($data['descripcion']) && mb_strlen($data['descripcion']) > 255) {
            $errors['descripcion'] = 'El campo descripción no debe tener más de 255 caracteres';
        }

        return $errors;
    }

    private function clearEjercicios(array $data): array
    {
        foreach (['calentamiento', 'partePrincipal', 'vueltaCalma'] as $parte) {
            if (!empty($data[$parte]) && is_array($data[$parte])) {
                foreach ($data[$parte] as $i => $ejercicio) {
                    $data[$parte][$i] = ArrayHelper::filterAssociativeArray($ejercicio, self::ALLOWED_FIELDS_EJERCICIOS);
                }
            }
        }
        return $data;
    }
}
