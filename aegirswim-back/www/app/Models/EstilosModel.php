<?php

namespace Com\Daw2\Models;

use Com\Daw2\Core\BaseDbModel;

class EstilosModel extends BaseDbModel
{
    public function get(): array
    {
        $stmt = $this->pdo->query("SELECT id_estilo as id, estilo FROM estilos");
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function getById(int $id): array|bool
    {
        $stmt = $this->pdo->prepare("SELECT * FROM estilos WHERE id_estilo = :id");
        $stmt->execute([":id" => $id]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }
}
