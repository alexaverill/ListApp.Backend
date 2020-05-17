-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `mydb` DEFAULT CHARACTER SET utf8 ;
USE `mydb` ;

-- -----------------------------------------------------
-- Table `mydb`.`Users`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Users` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Users` (
  `idUsers` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(45) NULL,
  `password` VARCHAR(1024) NULL,
  `email` VARCHAR(45) NULL,
  `canGetUpdates` VARCHAR(45) NULL,
  `birthday` VARCHAR(45) NULL,
  PRIMARY KEY (`idUsers`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Events`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Events` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Events` (
  `idEvents` INT NOT NULL AUTO_INCREMENT,
  `eventName` VARCHAR(45) NULL,
  `eventDate` VARCHAR(45) NULL,
  PRIMARY KEY (`idEvents`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Lists`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Lists` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Lists` (
  `idlists` INT NOT NULL AUTO_INCREMENT,
  `listName` VARCHAR(45) NULL,
  `eventID` INT NULL,
  `userID` INT NULL,
  PRIMARY KEY (`idlists`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`ListItems`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`ListItems` ;

CREATE TABLE IF NOT EXISTS `mydb`.`ListItems` (
  `idlistItems` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NULL,
  `url` VARCHAR(255) NULL,
  `price` DECIMAL NULL,
  `isClaimed` TINYINT NULL,
  `lists_idlists` INT NOT NULL,
  `quantity` INT NULL,
  `comments` VARCHAR(255) NULL,
  PRIMARY KEY (`idlistItems`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Events_has_Users`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Events_has_Users` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Events_has_Users` (
  `Events_idEvents` INT NOT NULL,
  `Users_idUsers` INT NOT NULL,
  PRIMARY KEY (`Events_idEvents`, `Users_idUsers`))
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
