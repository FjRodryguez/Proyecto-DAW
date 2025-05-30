<?php

namespace Com\Daw2\Models;

use Com\Daw2\Core\BaseDbModel;

class DuracionModel extends BaseDbModel
{
    public function get(): array
    {
        $stmt = $this->pdo->query("SELECT id_duracion as id, duracion FROM duracion");
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function getById(int $id): array|bool
    {
        $stmt = $this->pdo->prepare("SELECT * FROM duracion WHERE id_duracion = :id");
        $stmt->execute([":id" => $id]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }
}
