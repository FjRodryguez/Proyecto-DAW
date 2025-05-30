<?php

namespace Com\Daw2\Models;

use Com\Daw2\Core\BaseDbModel;

class UsuariosModel extends BaseDbModel
{
    private const SELECT = "SELECT id, u.nombre, u.email, u.ultimo_inicio_sesion, r.id_rol, r.nombre_rol as rol";
    private const COUNT = "SELECT COUNT(*)";
    private const FROM = " FROM usuarios u join roles r using(id_rol)";
    private const ORDER_COLUMNS = ["nombre", "email", "rol", "ultimo_inicio_sesion"];

    public function getUsuarios(array $filtros): array
    {
        $filtrosProcesados = $this->clearFilters($filtros);
        if (!empty($filtros['order'])) {
            if (
                filter_var($filtros['order'], FILTER_VALIDATE_INT) &&
                (int)$filtros['order'] > 0 && (int)$filtros['order'] <= count(self::ORDER_COLUMNS)
            ) {
                $order = self::ORDER_COLUMNS[(int)$filtros['order'] - 1];
            } else {
                throw new \InvalidArgumentException("El orden debe ser un número entre 1 y 4: " . $filtros['order']);
            }
        } else {
            $order = self::ORDER_COLUMNS[0];
        }

        if (!empty($filtros['sentido'])) {
            $sentido = match (strtolower($filtros['sentido'])) {
                'asc' => 'ASC',
                'desc' => 'DESC',
                default => throw new \InvalidArgumentException("El sentido solo puede ser asc o desc")
            };
        } else {
            $sentido = 'ASC';
        }


        if (!empty($filtros['page'])) {
            if (filter_var($filtros['page'], FILTER_VALIDATE_INT) && $filtros['page'] > 0) {
                $page = (int)$filtros['page'];
            } else {
                throw new \InvalidArgumentException("El número de página debe ser un entero mayor a 0");
            }
        } else {
            $page = 1;
        }

        $sql = self::SELECT . self::FROM;
        if (!empty($filtrosProcesados['condiciones'])) {
            $sql .= " WHERE " . implode(" AND ", $filtrosProcesados['condiciones']);
        }
        $sql .= " ORDER BY $order $sentido";
        $sql .= " LIMIT " . ($page - 1) * $_ENV['users.per.page'] . " , " . $_ENV['users.per.page'];
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($filtrosProcesados['valores']);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function maxPage($filtros): int
    {
        $filtrosProcesados = $this->clearFilters($filtros);
        $sql = self::COUNT . self::FROM;
        if (!empty($filtrosProcesados['condiciones'])) {
            $sql .= " WHERE " . implode(" AND ", $filtrosProcesados['condiciones']);
        }
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($filtrosProcesados['valores']);
        $maxPage = (int)ceil($stmt->fetchColumn(0) / $_ENV['users.per.page']);
        return $maxPage;
    }

    public function register(array $data): bool
    {
        $stmt = $this->pdo->prepare("INSERT INTO usuarios (nombre, email, pass) VALUES (:nombre, :email, :pass)");
        return $stmt->execute($data);
    }

    public function insert(array $data): bool
    {
        $stmt = $this->pdo->prepare("INSERT INTO usuarios (nombre, email, pass, id_rol) VALUES (:nombre, :email, :pass, :rol)");
        return $stmt->execute($data);
    }

    public function edit($data): bool
    {
        if (empty($data['pass'])) {
            $campos = "nombre = :nombre, email = :email, id_rol = :rol";
        } else {
            $campos = "nombre = :nombre, email = :email, pass = :pass, id_rol = :rol";
        }
        $stmt = $this->pdo->prepare("UPDATE usuarios SET $campos WHERE id = :id");
        return $stmt->execute($data);
    }

    public function delete(int $id_usuario): bool
    {
        $stmt = $this->pdo->prepare("DELETE FROM usuarios WHERE id = :id_usuario");
        return $stmt->execute(["id_usuario" => $id_usuario]);
    }

    public function doPremium(int $id_usuario):bool
    {
        $stmt = $this->pdo->prepare("UPDATE usuarios set id_rol = 2 WHERE id = :id_usuario");
        return $stmt->execute(["id_usuario" => $id_usuario]);
    }


    public function getByEmail(string $email): array|bool
    {
        $stmt = $this->pdo->prepare("SELECT * FROM usuarios WHERE email = :email");
        $stmt->execute(["email" => $email]);
        return $stmt->fetch();
    }

    public function getById(int $id): array|bool
    {
        $stmt = $this->pdo->prepare("SELECT * FROM usuarios WHERE id = :id");
        $stmt->execute(["id" => $id]);
        return $stmt->fetch();
    }

    public function updateUltimaSesion(int $id_usuario): bool
    {
        $stmt = $this->pdo->prepare("UPDATE usuarios SET ultimo_inicio_sesion = curdate() WHERE id = :id");
        return $stmt->execute(["id" => $id_usuario]);
    }

    private function clearFilters($filtros): array
    {
        $condiciones = [];
        $valores = [];

        foreach (['nombre', 'email'] as $campo) {
            if (!empty($filtros[$campo])) {
                if (is_string($filtros[$campo])) {
                    $valores[$campo] = '%' . $filtros[$campo] . '%';
                    $condiciones[$campo] = "$campo LIKE :$campo";
                } else {
                    throw new \InvalidArgumentException("El $campo debe ser una cadena");
                }
            }
        }

        if (!empty($filtros['rol'])) {
            if (is_numeric($filtros['rol'])) {
                $valores['rol'] = $filtros['rol'];
                $condiciones['rol'] = 'id_rol = :rol';
            } else {
                throw new \InvalidArgumentException("El rol debe ser un número");
            }
        }

        return [
            'valores' => $valores,
            'condiciones' => $condiciones
        ];
    }
}
