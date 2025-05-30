<?php

namespace Com\Daw2\Helpers;

class ArrayHelper
{
    public static function filterAssociativeArray(array $array, array $keys): array
    {
        $result = [];
        foreach ($keys as $key) {
            if (isset($array[$key])) {
                $result[$key] = $array[$key];
            } else {
                $result[$key] = '';
            }
        }
        return $result;
    }
}
