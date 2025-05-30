<?php

http_response_code($respuesta->getCode());

if ($respuesta->hasData()) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($respuesta->getData());
}
