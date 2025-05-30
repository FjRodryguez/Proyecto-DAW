<?php

namespace Com\Daw2\Models;

use Com\Daw2\Core\BaseDbModel;
use Com\Daw2\Helpers\ArrayHelper;

class EntrenamientosModel extends BaseDbModel
{
    private const SELECT_ENTRENAMIENTO = "SELECT e.id_entrenamiento as id, e.nombre, e.fecha, e.descripcion, d.duracion, i.intensidad, n.nivel";
    private const FROM_ENTRENAMIENTO = " FROM entrenamientos e join duracion d using(id_duracion) join intensidad i using (id_intensidad) join niveles n using(id_nivel)";
    private const CLAVES_ENTRENAMIENTO = [
        'nombre', 'descripcion', 'duracion', 'intensidad', 'nivel'
    ];

    public function getNumeroEntrenamientos(int $id_usuario): int
    {
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM entrenamientos WHERE id_usuario = :id_usuario");
        $stmt->execute(["id_usuario" => $id_usuario]);
        return $stmt->fetchColumn(0);
    }

    public function getEntrenamientos(int $id_usuario): array
    {
        $stmt = $this->pdo->prepare(self::SELECT_ENTRENAMIENTO . self::FROM_ENTRENAMIENTO . " WHERE id_usuario = :id_usuario");
        $stmt->execute(['id_usuario' => $id_usuario]);
        $entrenamientos = $stmt->fetchAll();

        foreach ($entrenamientos as &$entrenamiento) {
            $datosCalentamiento = $this->getSeriesCalentamiento($entrenamiento['id']);
            $entrenamiento['seriesCalentamiento'] = $datosCalentamiento['series'];
            $datosPartePrincipal = $this->getSeriesPartePrincipal($entrenamiento['id']);
            $entrenamiento['seriesPartePrincipal'] = $datosPartePrincipal['series'];
            $datosVueltaCalma = $this->getSeriesVueltaCalma($entrenamiento['id']);
            $entrenamiento['seriesVueltaCalma'] = $datosVueltaCalma['series'];
            $entrenamiento['calentamiento'] = $this->getEjerciciosCalentamiento($entrenamiento['id']);
            $entrenamiento['partePrincipal'] = $this->getEjerciciosPartePrincipal($entrenamiento['id']);
            $entrenamiento['vueltaCalma'] = $this->getEjerciciosVueltaCalma($entrenamiento['id']);
        }
        return $entrenamientos;
    }

    public function getEntrenamientoById(int $idUsuario, int $idEntrenamiento): array|bool
    {
        $stmt = $this->pdo->prepare("SELECT * FROM entrenamientos WHERE id_entrenamiento = ? AND id_usuario = ?");
        $stmt->execute([$idEntrenamiento, $idUsuario]);
        $entrenamiento = $stmt->fetch(\PDO::FETCH_ASSOC);
        if ($entrenamiento !== false) {
            $entrenamiento['id'] = $entrenamiento['id_entrenamiento'];
            unset($entrenamiento['id_entrenamiento']);

            $datosCalentamiento = $this->getSeriesCalentamiento($entrenamiento['id']);
            $entrenamiento['seriesCalentamiento'] = $datosCalentamiento['series'];
            $datosPartePrincipal = $this->getSeriesPartePrincipal($entrenamiento['id']);
            $entrenamiento['seriesPartePrincipal'] = $datosPartePrincipal['series'];
            $datosVueltaCalma = $this->getSeriesVueltaCalma($entrenamiento['id']);
            $entrenamiento['seriesVueltaCalma'] = $datosVueltaCalma['series'];
            $entrenamiento['calentamiento'] = $this->getEjerciciosCalentamiento($entrenamiento['id']);
            $entrenamiento['partePrincipal'] = $this->getEjerciciosPartePrincipal($entrenamiento['id']);
            $entrenamiento['vueltaCalma'] = $this->getEjerciciosVueltaCalma($entrenamiento['id']);

            return $entrenamiento;
        } else {
            return false;
        }
    }

    public function insertEntrenamiento(array $data, int $idUsuario): bool
    {
        try {
            $this->pdo->beginTransaction();

            //Insertar en entrenamientos
            $stmt = $this->pdo->prepare("INSERT INTO entrenamientos (id_usuario, nombre, fecha, descripcion, id_duracion, id_intensidad, id_nivel) VALUES (:id_usuario, :nombre, CURDATE(), :descripcion, :duracion, :intensidad, :nivel)");
            $datosEntrenamiento = ArrayHelper::filterAssociativeArray($data, self::CLAVES_ENTRENAMIENTO);
            $datosEntrenamiento['id_usuario'] = $idUsuario;
            $stmt->execute($datosEntrenamiento);

            $idEntrenamiento = $this->pdo->lastInsertId();

            $this->insertarBloques($data, $idEntrenamiento);
            $this->pdo->commit();
            return true;
        } catch (\PDOException $e) {
            $this->pdo->rollBack();
            return false;
        }
    }

    public function updateEntrenamiento(array $data, int $idEntrenamiento)
    {
        try {
            $this->pdo->beginTransaction();

            // 1. Actualizar el entrenamiento general
            $stmt = $this->pdo->prepare("UPDATE entrenamientos SET nombre = :nombre, fecha = CURDATE(), descripcion = :descripcion, id_duracion = :duracion, id_intensidad = :intensidad, id_nivel = :nivel WHERE id_entrenamiento = :id_entrenamiento");
            $datosEntrenamiento = ArrayHelper::filterAssociativeArray($data, self::CLAVES_ENTRENAMIENTO);
            $datosEntrenamiento['id_entrenamiento'] = $idEntrenamiento;
            $stmt->execute($datosEntrenamiento);

            // 2. Eliminar datos existentes
            $this->eliminarBloques($idEntrenamiento);

            // 3. Insertar de nuevo como si fuera nuevo
            $this->insertarBloques($data, $idEntrenamiento);

            $this->pdo->commit();
            return true;
        } catch (\PDOException $e) {
            $this->pdo->rollBack();
            return false;
        }
    }

    public function deleteEntrenamiento(int $idEntrenamiento): bool
    {
        $stmt = $this->pdo->prepare("DELETE FROM entrenamientos WHERE id_entrenamiento = :id_entrenamiento");
        return $stmt->execute(['id_entrenamiento' => $idEntrenamiento]);
    }

    private function eliminarBloques(int $idEntrenamiento): void
    {
        foreach (['calentamiento', 'parte_principal', 'vuelta_a_la_calma'] as $bloque) {
            $stmt = $this->pdo->prepare("DELETE FROM $bloque WHERE id_entrenamiento = :id");
            $stmt->execute(['id' => $idEntrenamiento]);
        }
    }
    private function insertarBloques(array $data, int $idEntrenamiento): void
    {
        //Calentamiento
        $stmt = $this->pdo->prepare("INSERT INTO calentamiento (id_entrenamiento, series) VALUES (:id_entrenamiento, :series)");
        $stmt->execute(['id_entrenamiento' => $idEntrenamiento, 'series' => $data['seriesCalentamiento']]);

        $idCalentamiento = $this->pdo->lastInsertId();

        $stmt = $this->pdo->prepare("
            INSERT INTO ejercicios_calentamiento (id_calentamiento, repeticiones, metros, descanso, id_ritmo, id_estilo, descripcion)
            VALUES (:id_calentamiento, :repeticiones, :metros, :descanso, :id_ritmo, :id_estilo, :descripcion)");
        foreach ($data['calentamiento'] as $ejercicio) {
            $ejercicio['id_calentamiento'] = $idCalentamiento;
            $stmt->execute($ejercicio);
        }

        //Parte principal
        $stmt = $this->pdo->prepare("INSERT INTO parte_principal (id_entrenamiento, series) VALUES (:id_entrenamiento, :series)");
        $stmt->execute(['id_entrenamiento' => $idEntrenamiento, 'series' => $data['seriesPartePrincipal']]);

        $idPartePrincipal = $this->pdo->lastInsertId();

        $stmt = $this->pdo->prepare("
            INSERT INTO ejercicios_parte_principal (id_parte_principal, repeticiones, metros, descanso, id_ritmo, id_estilo, descripcion)
            VALUES (:id_parte_principal, :repeticiones, :metros, :descanso, :id_ritmo, :id_estilo, :descripcion)");
        foreach ($data['partePrincipal'] as $ejercicio) {
            $ejercicio['id_parte_principal'] = $idPartePrincipal;
            $stmt->execute($ejercicio);
        }

        //Vuelta a la calma
        $stmt = $this->pdo->prepare("INSERT INTO vuelta_a_la_calma (id_entrenamiento, series) VALUES (:id_entrenamiento, :series)");
        $stmt->execute(['id_entrenamiento' => $idEntrenamiento, 'series' => $data['seriesVueltaCalma']]);

        $idVueltaCalma = $this->pdo->lastInsertId();

        $stmt = $this->pdo->prepare("
            INSERT INTO ejercicios_vuelta_a_la_calma (id_vuelta_a_la_calma, repeticiones, metros, descanso, id_ritmo, id_estilo, descripcion)
            VALUES (:id_vuelta_a_la_calma, :repeticiones, :metros, :descanso, :id_ritmo, :id_estilo, :descripcion)");
        foreach ($data['vueltaCalma'] as $ejercicio) {
            $ejercicio['id_vuelta_a_la_calma'] = $idVueltaCalma;
            $stmt->execute($ejercicio);
        }
    }

    private function getSeriesCalentamiento(int $idEntrenamiento): array
    {
        $stmt = $this->pdo->prepare("SELECT * FROM calentamiento WHERE id_entrenamiento = :id_entrenamiento");
        $stmt->execute(['id_entrenamiento' => $idEntrenamiento]);
        return $stmt->fetch();
    }

    private function getSeriesPartePrincipal(int $idEntrenamiento): array
    {
        $stmt = $this->pdo->prepare("SELECT * FROM parte_principal WHERE id_entrenamiento = :id_entrenamiento");
        $stmt->execute(['id_entrenamiento' => $idEntrenamiento]);
        return $stmt->fetch();
    }

    private function getSeriesVueltaCalma(int $idEntrenamiento): array
    {
        $stmt = $this->pdo->prepare("SELECT * FROM vuelta_a_la_calma WHERE id_entrenamiento = :id_entrenamiento");
        $stmt->execute(['id_entrenamiento' => $idEntrenamiento]);
        return $stmt->fetch();
    }

    private function getEjerciciosCalentamiento(int $idEntrenamiento): array
    {
        $stmt = $this->pdo->prepare("
        SELECT ec.repeticiones, ec.metros, ec.descanso, ec.descripcion, r.*, e.* FROM ejercicios_calentamiento ec join ritmos r using(id_ritmo) join estilos e using(id_estilo)
        JOIN calentamiento c using(id_calentamiento)
        WHERE c.id_entrenamiento = :id_entrenamiento");
        $stmt->execute(['id_entrenamiento' => $idEntrenamiento]);
        return $stmt->fetchAll();
    }

    private function getEjerciciosPartePrincipal(int $idEntrenamiento): array
    {
        $stmt = $this->pdo->prepare("
        SELECT ep.repeticiones, ep.metros, ep.descanso, ep.descripcion, r.*, e.* FROM ejercicios_parte_principal ep join ritmos r using(id_ritmo) join estilos e using(id_estilo)
        JOIN parte_principal pp using(id_parte_principal)
        WHERE pp.id_entrenamiento = :id_entrenamiento");
        $stmt->execute(['id_entrenamiento' => $idEntrenamiento]);
        return $stmt->fetchAll();
    }

    private function getEjerciciosVueltaCalma(int $idEntrenamiento): array
    {
        $stmt = $this->pdo->prepare("
        SELECT ev.repeticiones, ev.metros, ev.descanso, ev.descripcion, r.*, e.* FROM ejercicios_vuelta_a_la_calma ev join ritmos r using(id_ritmo) join estilos e using(id_estilo)
        JOIN vuelta_a_la_calma vc using(id_vuelta_a_la_calma)
        WHERE vc.id_entrenamiento = :id_entrenamiento");
        $stmt->execute(['id_entrenamiento' => $idEntrenamiento]);
        return $stmt->fetchAll();
    }
}
