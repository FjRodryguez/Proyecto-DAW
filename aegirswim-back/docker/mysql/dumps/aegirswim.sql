-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Servidor: aegirswim-mysql
-- Tiempo de generación: 29-05-2025 a las 14:49:40
-- Versión del servidor: 8.4.5
-- Versión de PHP: 8.2.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `aegirswim`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `calentamiento`
--

CREATE TABLE `calentamiento` (
  `id_calentamiento` int NOT NULL,
  `id_entrenamiento` int DEFAULT NULL,
  `series` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `duracion`
--

CREATE TABLE `duracion` (
  `id_duracion` int NOT NULL,
  `duracion` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `duracion`
--

INSERT INTO `duracion` (`id_duracion`, `duracion`) VALUES
(1, '2 h'),
(2, '1.5 h'),
(3, '1 h'),
(4, '45 min'),
(5, '30 min');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ejercicios_calentamiento`
--

CREATE TABLE `ejercicios_calentamiento` (
  `id_ejercicio_calentamiento` int NOT NULL,
  `id_calentamiento` int DEFAULT NULL,
  `repeticiones` int DEFAULT NULL,
  `metros` int DEFAULT NULL,
  `descanso` int DEFAULT NULL,
  `id_ritmo` int DEFAULT NULL,
  `id_estilo` int DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_general_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ejercicios_parte_principal`
--

CREATE TABLE `ejercicios_parte_principal` (
  `id_ejercicio_parte_principal` int NOT NULL,
  `id_parte_principal` int DEFAULT NULL,
  `metros` int DEFAULT NULL,
  `repeticiones` int DEFAULT NULL,
  `descanso` int DEFAULT NULL,
  `id_ritmo` int DEFAULT NULL,
  `id_estilo` int DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_general_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ejercicios_vuelta_a_la_calma`
--

CREATE TABLE `ejercicios_vuelta_a_la_calma` (
  `id_ejercicio_vuelta_a_la_calma` int NOT NULL,
  `id_vuelta_a_la_calma` int DEFAULT NULL,
  `metros` int DEFAULT NULL,
  `repeticiones` int DEFAULT NULL,
  `descanso` int DEFAULT NULL,
  `id_ritmo` int DEFAULT NULL,
  `id_estilo` int DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_general_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `entrenamientos`
--

CREATE TABLE `entrenamientos` (
  `id_entrenamiento` int NOT NULL,
  `id_usuario` int DEFAULT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_general_ci,
  `id_duracion` int DEFAULT NULL,
  `id_intensidad` int DEFAULT NULL,
  `id_nivel` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estilos`
--

CREATE TABLE `estilos` (
  `id_estilo` int NOT NULL,
  `estilo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estilos`
--

INSERT INTO `estilos` (`id_estilo`, `estilo`) VALUES
(1, 'Mariposa'),
(2, 'Espalda'),
(3, 'Braza'),
(4, 'Crol'),
(5, 'Estilos'),
(6, 'Mejor estilo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `intensidad`
--

CREATE TABLE `intensidad` (
  `id_intensidad` int NOT NULL,
  `intensidad` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `intensidad`
--

INSERT INTO `intensidad` (`id_intensidad`, `intensidad`) VALUES
(1, 'Alta'),
(2, 'Media'),
(3, 'Baja');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `niveles`
--

CREATE TABLE `niveles` (
  `id_nivel` int NOT NULL,
  `nivel` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `niveles`
--

INSERT INTO `niveles` (`id_nivel`, `nivel`) VALUES
(1, 'Principiante'),
(2, 'Intermedio'),
(3, 'Avanzado');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `parte_principal`
--

CREATE TABLE `parte_principal` (
  `id_parte_principal` int NOT NULL,
  `id_entrenamiento` int DEFAULT NULL,
  `series` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ritmos`
--

CREATE TABLE `ritmos` (
  `id_ritmo` int NOT NULL,
  `ritmo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ritmos`
--

INSERT INTO `ritmos` (`id_ritmo`, `ritmo`) VALUES
(1, 'Suave'),
(2, 'Ligero'),
(3, 'Medio'),
(4, 'Intenso'),
(5, 'Progresivo'),
(6, 'Regresivo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id_rol` int NOT NULL,
  `nombre_rol` varchar(50) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id_rol`, `nombre_rol`) VALUES
(1, 'Normal'),
(2, 'Premium'),
(3, 'Admin');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `pass` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `ultimo_inicio_sesion` date DEFAULT NULL,
  `id_rol` int NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `email`, `pass`, `nombre`, `ultimo_inicio_sesion`, `id_rol`) VALUES
(10, 'a@gmail.com', '$2y$10$yEQMrGD1F5SNJMWmPn3CgOonbKBblllUWLrxbe3PjIxS0ixvvhkVu', 'Administrador', '2025-05-29', 3),
(11, 'uquintana@gmail.com', '$2y$10$32ccf613dd8cd750fb87f6b478198c', 'Calista Tomé Jimenez', '2024-12-29', 2),
(12, 'molinerfernando@gmail.com', '$2y$10$b53516e71a848bcfdf0b0b293015b3', 'Rafa Segarra Tur', NULL, 3),
(13, 'murciaconcha@yahoo.com', '$2y$10$908a37bfc7a5bddd0d7e6ac2bbeeed', 'Hortensia Bárcena Grau', NULL, 3),
(14, 'gabrielburgos@barrera.com', '$2y$10$9f48ed0b5fb835188bf1723b6111a4', 'Florina Valencia Giner', '2024-07-29', 2),
(15, 'valcarcelleopoldo@gmail.com', '$2y$10$5c13ea4062e80b63b10242c3c97a50', 'Victorino Montero Guerra', NULL, 3),
(16, 'aureabarros@hotmail.com', '$2y$10$21fa9bece8d26e53fec66faab90168', 'Aroa Lladó España', '2024-12-16', 3),
(17, 'uromeu@yahoo.com', '$2y$10$e4d79de4cbda1e1a2597651709d26a', 'Luciana Uribe Vall', '2025-05-02', 2),
(18, 'cruz18@mora-llorente.org', '$2y$10$67e42a2f06e2dc79e268659a704208', 'Encarnacion Sureda Cornejo', NULL, 2),
(19, 'bvelasco@yahoo.com', '$2y$10$53220c4774e8dd9d805266386f4982', 'Octavio Duque Cañas', NULL, 1),
(20, 'barberocarmelo@yahoo.com', '$2y$10$b1544e7f469c749128d429e79f924d', 'Carina Ariza Palmer', NULL, 2),
(21, 'molinaanselmo@sanabria-alvaro.es', '$2y$10$8d8c524dcabe2cef29e992423cf476', 'Ariel Andres', '2025-04-23', 2),
(22, 'oalarcon@peralta-granados.com', '$2y$10$4aa1b16daf959372adcec57e493f34', 'Edelmiro Ballesteros-Fuertes', '2024-09-15', 3),
(23, 'revillacasandra@estevez.es', '$2y$10$745529d6193986f8aa52141eed4867', 'Carlos Miró Asenjo', NULL, 2),
(24, 'reyesbarral@antunez-martinez.net', '$2y$10$9c7813b08bd6f14757ed3b39d26808', 'Urbano de Valencia', '2025-02-18', 3),
(26, 'ariasnoa@noriega.net', '$2y$10$6878e47548100fad7cfc28e7b27daf', 'Benito Suárez Olmo', '2024-12-10', 1),
(27, 'pallaressusana@mari-gual.es', '$2y$10$85cd28875119edc7a1f1f8ffa329b9', 'Bernabé Arévalo Gras', NULL, 1),
(28, 'yvillar@yahoo.com', '$2y$10$c95ef5bbe350c29de2ede8b1371ac7', 'Ulises Cornejo Anguita', '2025-01-05', 2),
(29, 'renata54@jara.com', '$2y$10$f99e704e610326f5b47ce478459d09', 'Anunciación Rivera Cortina', NULL, 2),
(30, 'umerino@cadenas.org', '$2y$10$a7b7d4c14a25a3ea19ca6a4475c77e', 'Amando Nebot Sala', '2025-02-12', 3),
(31, 'nogueradulce@yahoo.com', '$2y$10$3103617f3f3808594e1fea5a9847b3', 'María Jesús Vergara-Lara', '2024-06-24', 2),
(32, 'toledojose-miguel@rios.org', '$2y$10$4faf859cedd1f1ba91e1605dc91160', 'Fulgencio Azcona Montero', NULL, 3),
(33, 'allerlupe@yahoo.com', '$2y$10$b33138fadde35189cd9359bc748af9', 'Mireia del Luque', '2024-08-10', 3),
(34, 'felicianorobledo@cespedes.net', '$2y$10$f497dbf8e172d976f5ee25aa5cf560', 'Georgina Somoza Jordán', NULL, 2),
(35, 'belenbaquero@marquez-huertas.com', '$2y$10$244c77fa5c0fe5f12367e207277240', 'Encarnacion Núñez Mur', '2025-01-30', 1),
(36, 'jgabaldon@miguel-rovira.net', '$2y$10$198ff671c8be270f2885b936dac895', 'Lázaro Collado', '2024-11-24', 2),
(37, 'rosalinacarrion@yahoo.com', '$2y$10$1e6b4008a3cdc4bc61e07e6b460dcd', 'Amílcar Montesinos-Galván', '2025-01-29', 3),
(38, 'modestoecheverria@galan-hidalgo.es', '$2y$10$51e2c223b6e79686289820ae54bf8c', 'Guiomar Azorin Asenjo', '2024-10-21', 2),
(39, 'castelloreyes@bustamante.com', '$2y$10$68a9a0f31e998f57b6c96f3ff89e4a', 'Dolores Bertrán Mancebo', '2024-12-29', 2),
(40, 'estevezleonel@aguilo.es', '$2y$10$1dc33da27b798a088dd6d4eb2354df', 'Victoriano Arsenio Segarra Palma', NULL, 2),
(41, 'heribertoaparicio@campos.com', '$2y$10$1830d31becaf9b54f36a0c41f41c0f', 'Octavia Ruano-Peña', '2025-04-12', 2),
(42, 'eva60@herrera-boix.es', '$2y$10$55bcd005cde8d302bdd6e65f071d2d', 'Ágata Nevado-Morell', '2024-10-25', 1),
(43, 'espiridion95@hidalgo-garzon.es', '$2y$10$3b2f1d9ee32873cec05fe31841b003', 'Amelia del Sanmartín', '2024-09-11', 3),
(44, 'maximino29@tello.es', '$2y$10$782fefbc6cb6af87e665ca0e44670d', 'Joel Cárdenas Torrents', NULL, 1),
(45, 'jodaramor@yahoo.com', '$2y$10$e1de26d2abf399f7b4156657ede534', 'Osvaldo Sacristán Acevedo', '2024-11-27', 1),
(46, 'aragonesremigio@herrera.es', '$2y$10$6a9e5b0e48e7c175b882800a6d8a80', 'Valerio Ibañez Sobrino', '2025-05-24', 1),
(47, 'nmaldonado@sanz.net', '$2y$10$e08e05fe6fc15a50ccfb64d3a3248f', 'Joan Jódar Hidalgo', NULL, 2),
(48, 'francoonofre@exposito.es', '$2y$10$c1e38814dbba42960514fab55d961f', 'Jose Carlos Carrillo Izaguirre', NULL, 1),
(49, 'tacedo@yahoo.com', '$2y$10$d3f0c64c05f77d2a44f0d71302b307', 'Judith Barranco Chacón', NULL, 3),
(50, 'raimundocardenas@torre.es', '$2y$10$fdbbd64ee4d6c68c612672fba26e39', 'Dionisio Córdoba', '2025-02-03', 3),
(51, 'navarretegertrudis@gmail.com', '$2y$10$99be3b8e8dd125ec58d1695c0e0169', 'Marco Toño Sanz Jimenez', '2024-06-15', 1),
(52, 'xarjona@gmail.com', '$2y$10$a3cbb2ad0ccfe54655f01106c924b1', 'Josep Suarez', '2024-05-26', 2),
(53, 'paniagualeticia@quintanilla-vaquero.org', '$2y$10$d1ff72410c9f26b77ace3b3e83524c', 'Hilda Páez', NULL, 3),
(54, 'amateva-maria@gmail.com', '$2y$10$34ae58e2761b645d149e29ba8fdf81', 'Santos Verdú Ferrando', NULL, 3),
(55, 'ymorales@cadenas.org', '$2y$10$7f3bdf428fe9da0e8e305be836e3fd', 'Manu Lupe Garrido Amigó', '2024-09-25', 2),
(56, 'lmanzano@llado.es', '$2y$10$15a25290832f20c0b75760d15b913d', 'Ligia del Marin', '2024-07-28', 1),
(57, 'bgimeno@ortiz-valbuena.es', '$2y$10$06386b99da2c68750a2eea286abe5a', 'Vanesa Genoveva Escalona Pardo', '2024-08-07', 3),
(58, 'francisco-javier15@gmail.com', '$2y$10$3c3f39213e196a72edda28e2939d5d', 'Paulina Casas-Guzman', '2024-07-01', 1),
(59, 'cferrero@yahoo.com', '$2y$10$ff0e155b1168784adff392b2838bf0', 'Joaquina Prado Ferrán', '2025-03-15', 3),
(60, 'roberto18@yahoo.com', '$2y$10$af71ad5dc6d4369697c32039b9fb90', 'Estela Nogués-Ferreras', '2024-06-28', 3),
(65, 'jennifer19@gmail.com', '$2y$10$YWUMi6..gt6KwdW39Z7B8Oav0t.yWPMxiMTf/3ocCWE1wCJL3J6Iq', 'Adoración Farré', NULL, 2),
(67, 'fjrodriguezcnp@gmail.com', '$2y$10$URIsNhMKBUHer6vTIt4.F.6v2Nm8vx0LbCnOOwRzHs4w3p/ApO7RK', 'Francisco Javier Rodríguez Domínguez', '2025-05-29', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `vuelta_a_la_calma`
--

CREATE TABLE `vuelta_a_la_calma` (
  `id_vuelta_a_la_calma` int NOT NULL,
  `id_entrenamiento` int DEFAULT NULL,
  `series` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `calentamiento`
--
ALTER TABLE `calentamiento`
  ADD PRIMARY KEY (`id_calentamiento`),
  ADD KEY `id_entrenamiento` (`id_entrenamiento`);

--
-- Indices de la tabla `duracion`
--
ALTER TABLE `duracion`
  ADD PRIMARY KEY (`id_duracion`);

--
-- Indices de la tabla `ejercicios_calentamiento`
--
ALTER TABLE `ejercicios_calentamiento`
  ADD PRIMARY KEY (`id_ejercicio_calentamiento`),
  ADD KEY `id_calentamiento` (`id_calentamiento`),
  ADD KEY `id_ritmo` (`id_ritmo`),
  ADD KEY `id_estilo` (`id_estilo`);

--
-- Indices de la tabla `ejercicios_parte_principal`
--
ALTER TABLE `ejercicios_parte_principal`
  ADD PRIMARY KEY (`id_ejercicio_parte_principal`),
  ADD KEY `id_parte_principal` (`id_parte_principal`),
  ADD KEY `id_ritmo` (`id_ritmo`),
  ADD KEY `id_estilo` (`id_estilo`);

--
-- Indices de la tabla `ejercicios_vuelta_a_la_calma`
--
ALTER TABLE `ejercicios_vuelta_a_la_calma`
  ADD PRIMARY KEY (`id_ejercicio_vuelta_a_la_calma`),
  ADD KEY `id_vuelta_a_la_calma` (`id_vuelta_a_la_calma`),
  ADD KEY `id_ritmo` (`id_ritmo`),
  ADD KEY `id_estilo` (`id_estilo`);

--
-- Indices de la tabla `entrenamientos`
--
ALTER TABLE `entrenamientos`
  ADD PRIMARY KEY (`id_entrenamiento`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `fk_duracion` (`id_duracion`),
  ADD KEY `fk_intensidad` (`id_intensidad`),
  ADD KEY `fk_nivel` (`id_nivel`);

--
-- Indices de la tabla `estilos`
--
ALTER TABLE `estilos`
  ADD PRIMARY KEY (`id_estilo`);

--
-- Indices de la tabla `intensidad`
--
ALTER TABLE `intensidad`
  ADD PRIMARY KEY (`id_intensidad`);

--
-- Indices de la tabla `niveles`
--
ALTER TABLE `niveles`
  ADD PRIMARY KEY (`id_nivel`);

--
-- Indices de la tabla `parte_principal`
--
ALTER TABLE `parte_principal`
  ADD PRIMARY KEY (`id_parte_principal`),
  ADD KEY `id_entrenamiento` (`id_entrenamiento`);

--
-- Indices de la tabla `ritmos`
--
ALTER TABLE `ritmos`
  ADD PRIMARY KEY (`id_ritmo`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id_rol`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `id_rol` (`id_rol`);

--
-- Indices de la tabla `vuelta_a_la_calma`
--
ALTER TABLE `vuelta_a_la_calma`
  ADD PRIMARY KEY (`id_vuelta_a_la_calma`),
  ADD KEY `id_entrenamiento` (`id_entrenamiento`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `calentamiento`
--
ALTER TABLE `calentamiento`
  MODIFY `id_calentamiento` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT de la tabla `duracion`
--
ALTER TABLE `duracion`
  MODIFY `id_duracion` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `ejercicios_calentamiento`
--
ALTER TABLE `ejercicios_calentamiento`
  MODIFY `id_ejercicio_calentamiento` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT de la tabla `ejercicios_parte_principal`
--
ALTER TABLE `ejercicios_parte_principal`
  MODIFY `id_ejercicio_parte_principal` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT de la tabla `ejercicios_vuelta_a_la_calma`
--
ALTER TABLE `ejercicios_vuelta_a_la_calma`
  MODIFY `id_ejercicio_vuelta_a_la_calma` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT de la tabla `entrenamientos`
--
ALTER TABLE `entrenamientos`
  MODIFY `id_entrenamiento` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT de la tabla `intensidad`
--
ALTER TABLE `intensidad`
  MODIFY `id_intensidad` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `niveles`
--
ALTER TABLE `niveles`
  MODIFY `id_nivel` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `parte_principal`
--
ALTER TABLE `parte_principal`
  MODIFY `id_parte_principal` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=68;

--
-- AUTO_INCREMENT de la tabla `vuelta_a_la_calma`
--
ALTER TABLE `vuelta_a_la_calma`
  MODIFY `id_vuelta_a_la_calma` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `calentamiento`
--
ALTER TABLE `calentamiento`
  ADD CONSTRAINT `calentamiento_ibfk_1` FOREIGN KEY (`id_entrenamiento`) REFERENCES `entrenamientos` (`id_entrenamiento`) ON DELETE CASCADE;

--
-- Filtros para la tabla `ejercicios_calentamiento`
--
ALTER TABLE `ejercicios_calentamiento`
  ADD CONSTRAINT `ejercicios_calentamiento_ibfk_1` FOREIGN KEY (`id_calentamiento`) REFERENCES `calentamiento` (`id_calentamiento`) ON DELETE CASCADE,
  ADD CONSTRAINT `ejercicios_calentamiento_ibfk_2` FOREIGN KEY (`id_ritmo`) REFERENCES `ritmos` (`id_ritmo`),
  ADD CONSTRAINT `ejercicios_calentamiento_ibfk_3` FOREIGN KEY (`id_estilo`) REFERENCES `estilos` (`id_estilo`);

--
-- Filtros para la tabla `ejercicios_parte_principal`
--
ALTER TABLE `ejercicios_parte_principal`
  ADD CONSTRAINT `ejercicios_parte_principal_ibfk_1` FOREIGN KEY (`id_parte_principal`) REFERENCES `parte_principal` (`id_parte_principal`) ON DELETE CASCADE,
  ADD CONSTRAINT `ejercicios_parte_principal_ibfk_2` FOREIGN KEY (`id_ritmo`) REFERENCES `ritmos` (`id_ritmo`),
  ADD CONSTRAINT `ejercicios_parte_principal_ibfk_3` FOREIGN KEY (`id_estilo`) REFERENCES `estilos` (`id_estilo`);

--
-- Filtros para la tabla `ejercicios_vuelta_a_la_calma`
--
ALTER TABLE `ejercicios_vuelta_a_la_calma`
  ADD CONSTRAINT `ejercicios_vuelta_a_la_calma_ibfk_1` FOREIGN KEY (`id_vuelta_a_la_calma`) REFERENCES `vuelta_a_la_calma` (`id_vuelta_a_la_calma`) ON DELETE CASCADE,
  ADD CONSTRAINT `ejercicios_vuelta_a_la_calma_ibfk_2` FOREIGN KEY (`id_ritmo`) REFERENCES `ritmos` (`id_ritmo`),
  ADD CONSTRAINT `ejercicios_vuelta_a_la_calma_ibfk_3` FOREIGN KEY (`id_estilo`) REFERENCES `estilos` (`id_estilo`);

--
-- Filtros para la tabla `entrenamientos`
--
ALTER TABLE `entrenamientos`
  ADD CONSTRAINT `entrenamientos_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_duracion` FOREIGN KEY (`id_duracion`) REFERENCES `duracion` (`id_duracion`),
  ADD CONSTRAINT `fk_intensidad` FOREIGN KEY (`id_intensidad`) REFERENCES `intensidad` (`id_intensidad`),
  ADD CONSTRAINT `fk_nivel` FOREIGN KEY (`id_nivel`) REFERENCES `niveles` (`id_nivel`);

--
-- Filtros para la tabla `parte_principal`
--
ALTER TABLE `parte_principal`
  ADD CONSTRAINT `parte_principal_ibfk_1` FOREIGN KEY (`id_entrenamiento`) REFERENCES `entrenamientos` (`id_entrenamiento`) ON DELETE CASCADE;

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`);

--
-- Filtros para la tabla `vuelta_a_la_calma`
--
ALTER TABLE `vuelta_a_la_calma`
  ADD CONSTRAINT `vuelta_a_la_calma_ibfk_1` FOREIGN KEY (`id_entrenamiento`) REFERENCES `entrenamientos` (`id_entrenamiento`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
