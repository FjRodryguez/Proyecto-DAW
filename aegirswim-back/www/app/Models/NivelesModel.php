<?php

namespace Com\Daw2\Models;

use Com\Daw2\Core\BaseDbModel;

class NivelesModel extends BaseDbModel
{
    public function get(): array
    {
        $stmt = $this->pdo->query("SELECT id_nivel as id, nivel FROM niveles");
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function getById(int $id): array|bool
    {
        $stmt = $this->pdo->prepare("SELECT * FROM niveles WHERE id_nivel = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }
}
