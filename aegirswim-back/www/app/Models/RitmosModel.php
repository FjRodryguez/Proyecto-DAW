<?php

namespace Com\Daw2\Models;

use Com\Daw2\Core\BaseDbModel;

class RitmosModel extends BaseDbModel
{
    public function get(): array
    {
        $stmt = $this->pdo->query("SELECT id_ritmo as id, ritmo FROM ritmos");
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function getById(int $id): array|bool
    {
        $stmt = $this->pdo->prepare("SELECT * FROM ritmos WHERE id_ritmo = :id");
        $stmt->execute([":id" => $id]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }
}
