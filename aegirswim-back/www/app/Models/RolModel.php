<?php

namespace Com\Daw2\Models;

use Com\Daw2\Core\BaseDbModel;

class RolModel extends BaseDbModel
{
    public function getRoles()
    {
        $stmt = $this->pdo->query("SELECT id_rol as id, nombre_rol as rol FROM roles");
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function findById(int $id): array | bool
    {
        $stmt = $this->pdo->prepare("SELECT * FROM roles WHERE id_rol = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch();
    }
}
