CREATE TABLE `MEMO`
(
	`ID` INT(11) NOT NULL AUTO_INCREMENT,
	`AUTHOR` VARCHAR(32) DEFAULT NULL,
	`CONTENTS` TEXT,
	`CREATEDATE` VARCHAR(16) DEFAULT NULL,
	`FILENAME` TEXT,
	PRIMARY KEY (`ID`)
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;