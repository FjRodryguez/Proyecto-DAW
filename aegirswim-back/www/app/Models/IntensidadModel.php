<?php

namespace Com\Daw2\Models;

use Com\Daw2\Core\BaseDbModel;

class IntensidadModel extends BaseDbModel
{
    public function get(): array
    {
        $stmt = $this->pdo->query("SELECT id_intensidad as id, intensidad FROM intensidad");
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function getById(int $id): array|bool
    {
        $stmt = $this->pdo->prepare("SELECT * FROM intensidad WHERE id_intensidad = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }
}
