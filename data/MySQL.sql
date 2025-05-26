CREATE DATABASE base_main;
USE base_main;

CREATE TABLE `Categories` (
  `id` int UNIQUE PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(255),
  `id_parent` int,
  `view_name` varchar(255)
);

CREATE TABLE `Entities` (
  `id` int UNIQUE PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(255),
  `category_id` int,
  `location` int
);

CREATE TABLE `Users` (
  `id` int UNIQUE PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(255),
  `passwd` varchar(255),
  `email` varchar(255),
  `admin` bool
);

ALTER TABLE `Categories` ADD FOREIGN KEY (`id_parent`) REFERENCES `Categories` (`id`);
ALTER TABLE `Entities` ADD FOREIGN KEY (`category_id`) REFERENCES `Categories` (`id`);
ALTER TABLE `Entities` ADD FOREIGN KEY (`location`) REFERENCES `Entities` (`id`) ON DELETE CASCADE;

INSERT INTO `Categories` (name,id_parent,view_name)
VALUES ('Entities',null,null),('Items',1,null),('Containers',1,null);

INSERT INTO `Users` (name,passwd,admin) VALUES ("ppaliasjose","b43b0231a41b2aba2d6e9f3759f45122",1),("admin","21232f297a57a5a743894a0e4a801fc3",1);

--select count(host) from information_schema.processlist;