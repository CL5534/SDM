# ************************************************************
# Sequel Pro SQL dump
# Version 4541
#
# http://www.sequelpro.com/
# https://github.com/sequelpro/sequelpro
#
# Host: 127.0.0.1 (MySQL 12.0.2-MariaDB)
# Database: CDM
# Generation Time: 2025-12-23 01:09:26 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table failure_reasons
# ------------------------------------------------------------

DROP TABLE IF EXISTS `failure_reasons`;

CREATE TABLE `failure_reasons` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `reason_text` varchar(255) DEFAULT NULL COMMENT '고장 부위 (케이블, 전원, 화면, 외관)',
  `status_id` int(11) NOT NULL COMMENT 'station_statuses 테이블의 ID 참조 (고장 상태 등)',
  PRIMARY KEY (`id`),
  KEY `fk_failure_to_status` (`status_id`),
  CONSTRAINT `fk_failure_to_status` FOREIGN KEY (`status_id`) REFERENCES `station_statuses` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='고장 부위 원인 마스터 테이블';

LOCK TABLES `failure_reasons` WRITE;
/*!40000 ALTER TABLE `failure_reasons` DISABLE KEYS */;

INSERT INTO `failure_reasons` (`id`, `reason_text`, `status_id`)
VALUES
	(1,'케이블',3),
	(2,'전원',3),
	(3,'화면',3),
	(4,'외관',3);

/*!40000 ALTER TABLE `failure_reasons` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table roles
# ------------------------------------------------------------

DROP TABLE IF EXISTS `roles`;

CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL COMMENT '사용자 직급 이름 (예: 점검자, 관리자)',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='사용자 권한 수준을 정의하는 기준표';

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;

INSERT INTO `roles` (`id`, `name`)
VALUES
	(1,'관리자'),
	(2,'점검자');

/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table station_statuses
# ------------------------------------------------------------

DROP TABLE IF EXISTS `station_statuses`;

CREATE TABLE `station_statuses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL COMMENT '상태명 (사용 가능, 점검 중, 고장)',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='1단계: 상태 정의 마스터';

LOCK TABLES `station_statuses` WRITE;
/*!40000 ALTER TABLE `station_statuses` DISABLE KEYS */;

INSERT INTO `station_statuses` (`id`, `name`)
VALUES
	(1,'사용 가능'),
	(2,'점검 중'),
	(3,'고장');

/*!40000 ALTER TABLE `station_statuses` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table stations
# ------------------------------------------------------------

DROP TABLE IF EXISTS `stations`;

CREATE TABLE `stations` (
  `id` int(11) NOT NULL COMMENT '충전소 고유 ID (엑셀 기기 번호)',
  `stations_address_id` int(11) NOT NULL COMMENT 'stations_address의 id(고유ID)를 참조',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_station_to_address` (`stations_address_id`),
  CONSTRAINT `fk_station_to_address` FOREIGN KEY (`stations_address_id`) REFERENCES `stations_address` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

LOCK TABLES `stations` WRITE;
/*!40000 ALTER TABLE `stations` DISABLE KEYS */;

INSERT INTO `stations` (`id`, `stations_address_id`, `created_at`)
VALUES
	(124,124,'2025-12-19 15:28:30'),
	(125,125,'2025-12-19 15:28:30'),
	(126,126,'2025-12-19 15:28:30'),
	(127,127,'2025-12-19 15:28:30'),
	(128,128,'2025-12-19 15:28:30'),
	(129,129,'2025-12-19 15:28:30'),
	(130,130,'2025-12-19 15:28:30'),
	(131,131,'2025-12-19 15:28:30'),
	(201,201,'2025-12-19 15:28:30'),
	(202,202,'2025-12-19 15:28:30'),
	(203,203,'2025-12-19 15:28:30'),
	(204,204,'2025-12-19 15:28:30'),
	(205,205,'2025-12-19 15:28:30'),
	(206,206,'2025-12-19 15:28:30'),
	(207,207,'2025-12-19 15:28:30'),
	(208,208,'2025-12-19 15:28:30'),
	(209,209,'2025-12-19 15:28:30'),
	(210,210,'2025-12-19 15:28:30'),
	(211,211,'2025-12-19 15:28:30'),
	(212,212,'2025-12-19 15:28:30'),
	(213,213,'2025-12-19 15:28:30'),
	(214,214,'2025-12-19 15:28:30'),
	(215,215,'2025-12-19 15:28:30'),
	(216,216,'2025-12-19 15:28:30'),
	(217,217,'2025-12-19 15:28:30'),
	(218,218,'2025-12-19 15:28:30'),
	(219,219,'2025-12-19 15:28:30'),
	(220,220,'2025-12-19 15:28:30'),
	(221,221,'2025-12-19 15:28:30'),
	(222,222,'2025-12-19 15:28:30'),
	(223,223,'2025-12-19 15:28:30'),
	(224,224,'2025-12-19 15:28:30'),
	(225,225,'2025-12-19 15:28:30'),
	(226,226,'2025-12-19 15:28:30'),
	(227,227,'2025-12-19 15:28:30'),
	(228,228,'2025-12-19 15:28:30'),
	(229,229,'2025-12-19 15:28:30'),
	(230,230,'2025-12-19 15:28:30'),
	(231,231,'2025-12-19 15:28:30'),
	(232,232,'2025-12-19 15:28:30'),
	(233,233,'2025-12-19 15:28:30'),
	(234,234,'2025-12-19 15:28:30'),
	(235,235,'2025-12-19 15:28:30'),
	(236,236,'2025-12-19 15:28:30'),
	(237,237,'2025-12-19 15:28:30'),
	(238,238,'2025-12-19 15:28:30'),
	(239,239,'2025-12-19 15:28:30'),
	(240,240,'2025-12-19 15:28:30'),
	(241,241,'2025-12-19 15:28:30'),
	(242,242,'2025-12-19 15:28:30'),
	(243,243,'2025-12-19 15:28:30'),
	(244,244,'2025-12-19 15:28:30'),
	(245,245,'2025-12-19 15:28:30'),
	(246,246,'2025-12-19 15:28:30'),
	(247,247,'2025-12-19 15:28:30'),
	(311,311,'2025-12-19 15:28:30'),
	(312,312,'2025-12-19 15:28:30'),
	(313,313,'2025-12-19 15:28:30'),
	(314,314,'2025-12-19 15:28:30'),
	(315,315,'2025-12-19 15:28:30'),
	(316,316,'2025-12-19 15:28:30'),
	(317,317,'2025-12-19 15:28:30'),
	(318,318,'2025-12-19 15:28:30'),
	(319,319,'2025-12-19 15:28:30'),
	(320,320,'2025-12-19 15:28:30'),
	(321,321,'2025-12-19 15:28:30'),
	(322,322,'2025-12-19 15:28:30'),
	(323,323,'2025-12-19 15:28:30'),
	(324,324,'2025-12-19 15:28:30'),
	(325,325,'2025-12-19 15:28:30'),
	(326,326,'2025-12-19 15:28:30'),
	(327,327,'2025-12-19 15:28:30'),
	(328,328,'2025-12-19 15:28:30'),
	(329,329,'2025-12-19 15:28:30'),
	(330,330,'2025-12-19 15:28:30'),
	(331,331,'2025-12-19 15:28:30'),
	(332,332,'2025-12-19 15:28:30'),
	(333,333,'2025-12-19 15:28:30'),
	(334,334,'2025-12-19 15:28:30'),
	(335,335,'2025-12-19 15:28:30'),
	(336,336,'2025-12-19 15:28:30'),
	(337,337,'2025-12-19 15:28:30'),
	(338,338,'2025-12-19 15:28:30'),
	(339,339,'2025-12-19 15:28:30'),
	(340,340,'2025-12-19 15:28:30'),
	(341,341,'2025-12-19 15:28:30'),
	(342,342,'2025-12-19 15:28:30'),
	(343,343,'2025-12-19 15:28:30'),
	(344,344,'2025-12-19 15:28:30'),
	(411,411,'2025-12-19 15:28:30'),
	(412,412,'2025-12-19 15:28:30'),
	(413,413,'2025-12-19 15:28:30'),
	(414,414,'2025-12-19 15:28:30'),
	(415,415,'2025-12-19 15:28:30'),
	(416,416,'2025-12-19 15:28:30'),
	(417,417,'2025-12-19 15:28:30'),
	(418,418,'2025-12-19 15:28:30'),
	(419,419,'2025-12-19 15:28:30'),
	(420,420,'2025-12-19 15:28:30'),
	(421,421,'2025-12-19 15:28:30'),
	(422,422,'2025-12-19 15:28:30'),
	(423,423,'2025-12-19 15:28:30'),
	(424,424,'2025-12-19 15:28:30'),
	(425,425,'2025-12-19 15:28:30'),
	(426,426,'2025-12-19 15:28:30'),
	(427,427,'2025-12-19 15:28:30'),
	(428,428,'2025-12-19 15:28:30'),
	(429,429,'2025-12-19 15:28:30'),
	(430,430,'2025-12-19 15:28:30'),
	(431,431,'2025-12-19 15:28:30'),
	(432,432,'2025-12-19 15:28:30'),
	(433,433,'2025-12-19 15:28:30'),
	(434,434,'2025-12-19 15:28:30'),
	(435,435,'2025-12-19 15:28:30'),
	(436,436,'2025-12-19 15:28:30'),
	(901,901,'2025-12-19 15:28:30'),
	(902,902,'2025-12-19 15:28:30'),
	(903,903,'2025-12-19 15:28:30');

/*!40000 ALTER TABLE `stations` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table stations_address
# ------------------------------------------------------------

DROP TABLE IF EXISTS `stations_address`;

CREATE TABLE `stations_address` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '시스템 관리용 ID',
  `name` varchar(100) NOT NULL COMMENT '충전소명 (예: 종각역)',
  `address` varchar(255) NOT NULL COMMENT '기본 주소 (서울)',
  `detail_location` varchar(255) DEFAULT NULL COMMENT '상세 위치 설명',
  `status_id` int(11) DEFAULT 1 COMMENT '현재 운영 상태',
  `failure_reason_id` varchar(255) DEFAULT NULL COMMENT '고장 원인 참조 (예: 1,2 / 정상은 NULL)',
  PRIMARY KEY (`id`),
  KEY `fk_address_to_failure` (`failure_reason_id`),
  KEY `fk_address_to_status` (`status_id`),
  CONSTRAINT `fk_address_to_status` FOREIGN KEY (`status_id`) REFERENCES `station_statuses` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

LOCK TABLES `stations_address` WRITE;
/*!40000 ALTER TABLE `stations_address` DISABLE KEYS */;

INSERT INTO `stations_address` (`id`, `name`, `address`, `detail_location`, `status_id`, `failure_reason_id`)
VALUES
	(124,'동묘앞역(1호선)','서울','4, 5번 출구 방면 30m 지점',3,'1,2,4'),
	(125,'청량리역(1호선)','서울','광장 방면 40m 지점',3,'2,3'),
	(126,'제기동역','서울','1, 5번 출구 방면 35m 지점',3,'2'),
	(127,'신설동역(1호선)','서울','3, 4, 5번 출구 방면 45m 지점',3,'2'),
	(128,'동대문역(1호선)','서울','1, 10번 출구 방면 40m 지점',3,'1'),
	(129,'종로5가역','서울','8번 출구 방면 50m 지점',3,'2'),
	(130,'종로3가역(1호선)','서울','12번 출구로 내려와서 20m 지점',3,'1'),
	(131,'종각역','서울','3, 4번 출구쪽 게이트 방면 45m 지점',3,'1'),
	(201,'시청역(2호선)','서울','1, 12번 출구 방면 45m 지점',3,'2'),
	(202,'을지로입구역','서울','1, 8번 출구 방면 50m 지점',1,NULL),
	(203,'을지로3가역(2호선)','서울','1, 12번 출구 방면 40m 지점',2,NULL),
	(204,'을지로4가역(2호선)','서울','1, 10번 출구 방면 45m 지점',3,NULL),
	(205,'동대문역사문화공원역(2호선)','서울','1, 14번 출구 방면 55m 지점',3,NULL),
	(206,'신당역(2호선)','서울','1, 10번 출구 방면 40m 지점',3,NULL),
	(207,'상왕십리역','서울','1, 6번 출구 방면 45m 지점',1,NULL),
	(208,'왕십리역(2호선)','서울','5, 11번 출구 방면 50m 지점',2,NULL),
	(209,'한양대역','서울','1번 출구 방면 35m 지점',3,NULL),
	(210,'뚝섬역','서울','1, 8번 출구 방면 45m 지점',1,NULL),
	(211,'성수역','서울','1, 4번 출구 방면 40m 지점',3,NULL),
	(212,'건대입구역(2호선)','서울','1, 6번 출구 방면 55m 지점',1,NULL),
	(213,'구의역','서울','1, 4번 출구 방면 45m 지점',1,NULL),
	(214,'강변역','서울','1, 4번 출구 방면 50m 지점',1,NULL),
	(215,'잠실나루역','서울','1, 4번 출구 방면 40m 지점',1,NULL),
	(216,'잠실역(2호선)','서울','1, 11번 출구 방면 60m 지점',1,NULL),
	(217,'잠실새내역','서울','1, 8번 출구 방면 45m 지점',1,NULL),
	(218,'종합운동장역(2호선)','서울','1, 9번 출구 방면 50m 지점',1,NULL),
	(219,'삼성역','서울','1, 8번 출구 방면 55m 지점',1,NULL),
	(220,'선릉역(2호선)','서울','1, 10번 출구 방면 50m 지점',1,NULL),
	(221,'역삼역','서울','1, 8번 출구 방면 45m 지점',1,NULL),
	(222,'강남역(2호선)','서울','1, 12번 출구 방면 60m 지점',1,NULL),
	(223,'교대역(2호선)','서울','1, 14번 출구 방면 55m 지점',2,NULL),
	(224,'서초역','서울','1, 8번 출구 방면 45m 지점',1,NULL),
	(225,'방배역','서울','1, 4번 출구 방면 40m 지점',1,NULL),
	(226,'사당역(2호선)','서울','1, 14번 출구 방면 55m 지점',1,NULL),
	(227,'낙성대역','서울','1, 8번 출구 방면 45m 지점',1,NULL),
	(228,'서울대입구역','서울','1, 8번 출구 방면 50m 지점',1,NULL),
	(229,'봉천역','서울','1, 6번 출구 방면 40m 지점',1,NULL),
	(230,'신림역','서울','1, 8번 출구 방면 55m 지점',1,NULL),
	(231,'신대방역','서울','1, 4번 출구 방면 45m 지점',1,NULL),
	(232,'구로디지털단지역','서울','1, 6번 출구 방면 50m 지점',1,NULL),
	(233,'대림역(2호선)','서울','1, 8번 출구 방면 45m 지점',1,NULL),
	(234,'신도림역(2호선)','서울','1, 6번 출구 방면 50m 지점',1,NULL),
	(235,'문래역','서울','1, 6번 출구 방면 40m 지점',1,NULL),
	(236,'영등포구청역(2호선)','서울','1, 7번 출구 방면 45m 지점',1,NULL),
	(237,'당산역(2호선)','서울','1, 6번 출구 방면 50m 지점',1,NULL),
	(238,'합정역(2호선)','서울','1, 10번 출구 방면 45m 지점',1,NULL),
	(239,'홍대입구역(2호선)','서울','1, 9번 출구 방면 55m 지점',1,NULL),
	(240,'신촌역(2호선)','서울','1, 8번 출구 방면 50m 지점',1,NULL),
	(241,'이대역','서울','1, 6번 출구 방면 40m 지점',1,NULL),
	(242,'아현역','서울','1, 4번 출구 방면 45m 지점',1,NULL),
	(243,'충정로역(2호선)','서울','1, 9번 출구 방면 40m 지점',1,NULL),
	(244,'용답역','서울','1, 2번 출구 방면 35m 지점',1,NULL),
	(245,'신답역','서울','1번 출구 방면 30m 지점',1,NULL),
	(246,'신설동역(2호선)','서울','1번 출구 방면 30m 지점',1,NULL),
	(247,'용두역','서울','1, 5번 출구 방면 40m 지점',1,NULL),
	(311,'지축역(3호선)','서울','1, 2번 출구 방면 45m 지점',1,NULL),
	(312,'구파발역','서울','1, 4번 출구 방면 50m 지점',1,NULL),
	(313,'연신내역(3호선)','서울','1, 7번 출구 방면 45m 지점',1,NULL),
	(314,'불광역(3호선)','서울','1, 9번 출구 방면 50m 지점',1,NULL),
	(315,'녹번역','서울','1, 5번 출구 방면 40m 지점',1,NULL),
	(316,'홍제역','서울','1, 4번 출구 방면 45m 지점',1,NULL),
	(317,'무악재역','서울','1, 4번 출구 방면 40m 지점',1,NULL),
	(318,'독립문역','서울','1, 5번 출구 방면 45m 지점',1,NULL),
	(319,'경복궁역','서울','1, 7번 출구 방면 50m 지점',1,NULL),
	(320,'안국역','서울','1, 6번 출구 방면 45m 지점',1,NULL),
	(321,'종로3가역(3호선)','서울','1, 15번 출구 방면 55m 지점',1,NULL),
	(322,'을지로3가역(3호선)','서울','1, 12번 출구 방면 45m 지점',1,NULL),
	(323,'충무로역(3호선)','서울','1, 8번 출구 방면 50m 지점',1,NULL),
	(324,'동대입구역','서울','1, 6번 출구 방면 45m 지점',1,NULL),
	(325,'약수역(3호선)','서울','1, 10번 출구 방면 50m 지점',1,NULL),
	(326,'금호역','서울','1, 4번 출구 방면 40m 지점',1,NULL),
	(327,'옥수역(3호선)','서울','1, 7번 출구 방면 45m 지점',1,NULL),
	(328,'압구정역','서울','1, 6번 출구 방면 50m 지점',1,NULL),
	(329,'신사역(3호선)','서울','1, 8번 출구 방면 55m 지점',1,NULL),
	(330,'잠원역','서울','1, 4번 출구 방면 40m 지점',1,NULL),
	(331,'고속터미널역(3호선)','서울','1, 9번 출구 방면 60m 지점',1,NULL),
	(332,'교대역(3호선)','서울','1, 14번 출구 방면 55m 지점',1,NULL),
	(333,'남부터미널역','서울','1, 6번 출구 방면 45m 지점',1,NULL),
	(334,'양재역','서울','1, 12번 출구 방면 55m 지점',1,NULL),
	(335,'매봉역','서울','1, 4번 출구 방면 40m 지점',1,NULL),
	(336,'도곡역(3호선)','서울','1, 4번 출구 방면 45m 지점',1,NULL),
	(337,'대치역','서울','1, 8번 출구 방면 50m 지점',1,NULL),
	(338,'학여울역','서울','1번 출구 방면 35m 지점',1,NULL),
	(339,'대청역','서울','1, 8번 출구 방면 45m 지점',1,NULL),
	(340,'일원역','서울','1, 7번 출구 방면 40m 지점',1,NULL),
	(341,'수서역(3호선)','서울','1, 6번 출구 방면 55m 지점',1,NULL),
	(342,'가락시장역(3호선)','서울','1, 8번 출구 방면 45m 지점',1,NULL),
	(343,'경찰병원역','서울','1, 4번 출구 방면 40m 지점',1,NULL),
	(344,'오금역(3호선)','서울','1, 7번 출구 방면 45m 지점',1,NULL),
	(411,'당고개역','서울','1, 4번 출구 방면 40m 지점',1,NULL),
	(412,'상계역','서울','1, 4번 출구 방면 45m 지점',1,NULL),
	(413,'노원역(4호선)','서울','1, 10번 출구 방면 50m 지점',1,NULL),
	(414,'창동역(4호선)','서울','1, 2번 출구 방면 40m 지점',1,NULL),
	(415,'쌍문역','서울','1, 4번 출구 방면 45m 지점',1,NULL),
	(416,'수유역','서울','1, 8번 출구 방면 50m 지점',1,NULL),
	(417,'미아역','서울','1, 8번 출구 방면 40m 지점',1,NULL),
	(418,'미아사거리역','서울','1, 6번 출구 방면 55m 지점',1,NULL),
	(419,'길음역','서울','1, 10번 출구 방면 45m 지점',1,NULL),
	(420,'성신여대입구역','서울','1, 7번 출구 방면 50m 지점',1,NULL),
	(421,'한성대입구역','서울','1, 7번 출구 방면 45m 지점',1,NULL),
	(422,'혜화역','서울','1, 4번 출구 방면 50m 지점',1,NULL),
	(423,'동대문역(4호선)','서울','1, 10번 출구 방면 45m 지점',1,NULL),
	(424,'동대문역사문화공원역(4호선)','서울','1, 14번 출구 방면 55m 지점',1,NULL),
	(425,'충무로역(4호선)','서울','1, 8번 출구 방면 45m 지점',1,NULL),
	(426,'명동역','서울','1, 10번 출구 방면 50m 지점',1,NULL),
	(427,'회현역','서울','1, 7번 출구 방면 45m 지점',1,NULL),
	(428,'서울역(4호선)','서울','1, 15번 출구 방면 60m 지점',1,NULL),
	(429,'숙대입구역','서울','1, 10번 출구 방면 45m 지점',1,NULL),
	(430,'삼각지역(4호선)','서울','1, 14번 출구 방면 50m 지점',1,NULL),
	(431,'신용산역','서울','1, 6번 출구 방면 45m 지점',1,NULL),
	(432,'이촌역(4호선)','서울','1, 5번 출구 방면 40m 지점',1,NULL),
	(433,'동작역(4호선)','서울','1, 9번 출구 방면 55m 지점',1,NULL),
	(434,'총신대입구역','서울','1, 14번 출구 방면 50m 지점',1,NULL),
	(435,'사당역(4호선)','서울','1, 14번 출구 방면 55m 지점',1,NULL),
	(436,'남태령역','서울','1, 4번 출구 방면 45m 지점',1,NULL),
	(901,'방학역','서울','1번 출구 방면 35m 지점',1,NULL),
	(902,'망우역','서울','1번 출구 방면 35m 지점',1,NULL),
	(903,'수색역','서울','1번 출구 방면 35m 지점',1,NULL);

/*!40000 ALTER TABLE `stations_address` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table users
# ------------------------------------------------------------

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '사용자 고유 ID',
  `email` varchar(255) NOT NULL COMMENT '로그인 이메일 (계정 ID)',
  `password` varchar(255) NOT NULL COMMENT '비밀번호 해시 값',
  `name` varchar(100) NOT NULL COMMENT '사용자 실명',
  `role_id` int(11) NOT NULL DEFAULT 1 COMMENT '직급 ID (1:관리자, 2:점검자)',
  `created_at` timestamp NULL DEFAULT current_timestamp() COMMENT '계정 생성 일시',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='시스템 사용자 계정 정보 저장';

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;

INSERT INTO `users` (`id`, `email`, `password`, `name`, `role_id`, `created_at`)
VALUES
	(1,'admin@gmail.com','$2b$10$nzG4SHnKHDIa8S15tkZM5.O0d7TgSmTukEnCe48E.0u4ZmmOYAkSe','관리자',1,'2025-12-16 17:54:57'),
	(2,'Worker2@gmail.com','$2b$10$V8bvq3Jmn1pEKXpZ0u.9ieE0XIXVvCHc4B1XSS.rnQ/n2eJ1dCWuK','점검자2',2,'2025-12-16 17:54:57'),
	(4,'Worker3@gmail.com','$2b$10$arq1d76B7MQ3zEIzxtrLZuZ0hiEFwv8I1Su5IkL1wj4JCTvsuvGf2','점검자4',2,'2025-12-16 18:01:37'),
	(5,'Worker5@gmail.com','$2b$10$CNyQb2e2P8t/3GUIMws2L.RnNnx1EyUYttWEq14Z/sb3kyPD4zwaS','점검자5',2,'2025-12-19 10:41:32'),
	(6,'Worker6@gmail.com','$2b$10$7DfpenJf13WYMBkYme85quRXCfqE8nM8c3WTyHcTFFnbdD4rIRveK','점검자6',2,'2025-12-19 10:42:13'),
	(7,'Worker7@gmail.com','$2b$10$UndGtWdlrzLopz8w5.rmBuKUd7dBQDhscyNoWxlhLfW5U2mZQZv9W','점검자7',2,'2025-12-19 10:47:06'),
	(8,'Worker8@gmail.com','$2b$10$hBQpiqHREenuScsU1vK/3OiDmWhWznhSeBfkSsUgOZOqdVdw.nYJy','점검자8',2,'2025-12-19 11:00:16'),
	(9,'Worker9@gmail.com','$2b$10$5jII7nY/f5/gSZxoPGokR.kUcvHGfJhL5rVBURbUNDc4F.bQI67a6','점검자9',2,'2025-12-19 12:38:16'),
	(10,'Worker10@gmail.com','$2b$10$bVXUZXcEKWgZ449IIw9SQeJFwt7a2oNg12giqi3j6XFzXPcGq6AhO','점검자10',2,'2025-12-22 08:22:25'),
	(22,'admin2@gmail.com','$2b$10$UP9JCGmXkeT8rJEPdp6.c.2qbB0sZ34iCeOTYY2kIPpe06Iz24OJ2','관리자2',2,'2025-12-22 11:56:26'),
	(25,'c@gmail.com','$2b$10$vCq87A0FRoybiaGbNCO2ZO0rT9oeLkAFX6do7uD7f4Ru/BAuLkppy','임꺽정',2,'2025-12-23 10:06:12');

/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;



/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
