-- MySQL dump 10.13  Distrib 8.0.44, for Linux (x86_64)
--
-- Host: localhost    Database: koperasi_umb
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activity_logs`
--

DROP TABLE IF EXISTS `activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_logs` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userRole` enum('SUPER_ADMIN','ADMIN','SUPPLIER','USER','DEVELOPER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `module` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `metadata` json DEFAULT NULL,
  `ipAddress` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `userAgent` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isProduction` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `activity_logs_userId_idx` (`userId`),
  KEY `activity_logs_userRole_idx` (`userRole`),
  KEY `activity_logs_module_idx` (`module`),
  KEY `activity_logs_action_idx` (`action`),
  KEY `activity_logs_isProduction_idx` (`isProduction`),
  KEY `activity_logs_createdAt_idx` (`createdAt`),
  CONSTRAINT `activity_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_logs`
--

LOCK TABLES `activity_logs` WRITE;
/*!40000 ALTER TABLE `activity_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `activity_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `action` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entityId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `oldData` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `newData` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ipAddress` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `userAgent` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES ('audit-1762186726963-3qmpp6kdk','super-admin-001','LOGIN','USER','super-admin-001',NULL,'{\"email\":\"manager@umb.ac.id\",\"role\":\"SUPER_ADMIN\",\"timestamp\":\"2025-11-03T16:18:46.963Z\"}',NULL,NULL,'2025-11-03 16:18:46.963'),('audit-1762186851115-vre5kkgnl','admin-kasir-001','LOGIN','USER','admin-kasir-001',NULL,'{\"email\":\"kasir1@umb.ac.id\",\"role\":\"ADMIN\",\"timestamp\":\"2025-11-03T16:20:51.115Z\"}',NULL,NULL,'2025-11-03 16:20:51.115'),('audit-1762186894966-o1bzejr63','admin-kasir-001','LOGIN','USER','admin-kasir-001',NULL,'{\"email\":\"kasir1@umb.ac.id\",\"role\":\"ADMIN\",\"timestamp\":\"2025-11-03T16:21:34.966Z\"}',NULL,NULL,'2025-11-03 16:21:34.966'),('audit-1762186935615-10vrj6qxc','super-admin-001','LOGIN','USER','super-admin-001',NULL,'{\"email\":\"manager@umb.ac.id\",\"role\":\"SUPER_ADMIN\",\"timestamp\":\"2025-11-03T16:22:15.615Z\"}',NULL,NULL,'2025-11-03 16:22:15.615'),('audit-1762187189245-iyetea9o2','admin-kasir-001','LOGIN','USER','admin-kasir-001',NULL,'{\"email\":\"kasir1@umb.ac.id\",\"role\":\"ADMIN\",\"timestamp\":\"2025-11-03T16:26:29.245Z\"}',NULL,NULL,'2025-11-03 16:26:29.246'),('audit-1762187408975-h6mla11kv','admin-kasir-001','LOGIN','USER','admin-kasir-001',NULL,'{\"email\":\"kasir1@umb.ac.id\",\"role\":\"ADMIN\",\"timestamp\":\"2025-11-03T16:30:08.975Z\"}',NULL,NULL,'2025-11-03 16:30:08.975'),('audit-1762187441651-iahb0b2rq','admin-kasir-001','LOGOUT','USER','admin-kasir-001',NULL,'{\"email\":\"kasir1@umb.ac.id\",\"timestamp\":\"2025-11-03T16:30:41.652Z\"}',NULL,NULL,'2025-11-03 16:30:41.652'),('audit-1762187468059-tbwp9ay9j','super-admin-001','LOGIN','USER','super-admin-001',NULL,'{\"email\":\"manager@umb.ac.id\",\"role\":\"SUPER_ADMIN\",\"timestamp\":\"2025-11-03T16:31:08.059Z\"}',NULL,NULL,'2025-11-03 16:31:08.059'),('audit-1762230027293-fu6zuboh4','super-admin-001','LOGIN','USER','super-admin-001',NULL,'{\"email\":\"manager@umb.ac.id\",\"role\":\"SUPER_ADMIN\",\"timestamp\":\"2025-11-04T04:20:27.293Z\"}',NULL,NULL,'2025-11-04 04:20:27.293'),('audit-1762237867189-18tx8ozqu','super-admin-001','LOGIN','USER','super-admin-001',NULL,'{\"email\":\"manager@umb.ac.id\",\"role\":\"SUPER_ADMIN\",\"timestamp\":\"2025-11-04T06:31:07.189Z\"}',NULL,NULL,'2025-11-04 06:31:07.189'),('audit-1762237962525-pech9a23j','super-admin-001','LOGOUT','USER','super-admin-001',NULL,'{\"email\":\"manager@umb.ac.id\",\"timestamp\":\"2025-11-04T06:32:42.525Z\"}',NULL,NULL,'2025-11-04 06:32:42.525'),('audit-1762238002191-45yw133gu','super-admin-001','LOGIN','USER','super-admin-001',NULL,'{\"email\":\"manager@umb.ac.id\",\"role\":\"SUPER_ADMIN\",\"timestamp\":\"2025-11-04T06:33:22.191Z\"}',NULL,NULL,'2025-11-04 06:33:22.191'),('audit-1762238245908-po62kwtg4','super-admin-001','LOGIN','USER','super-admin-001',NULL,'{\"email\":\"manager@umb.ac.id\",\"role\":\"SUPER_ADMIN\",\"timestamp\":\"2025-11-04T06:37:25.908Z\"}',NULL,NULL,'2025-11-04 06:37:25.908'),('audit-1762403091718-dxoz5mgal','super-admin-001','LOGIN','USER','super-admin-001',NULL,'{\"email\":\"manager@umb.ac.id\",\"role\":\"SUPER_ADMIN\",\"timestamp\":\"2025-11-06T04:24:51.720Z\"}',NULL,NULL,'2025-11-06 04:24:51.720'),('audit-1762403348466-nflgtw7ai','super-admin-001','LOGIN','USER','super-admin-001',NULL,'{\"email\":\"manager@umb.ac.id\",\"role\":\"SUPER_ADMIN\",\"timestamp\":\"2025-11-06T04:29:08.466Z\"}',NULL,NULL,'2025-11-06 04:29:08.466'),('audit-1762403499010-kx9axmfgp','admin-kasir-001','LOGIN','USER','admin-kasir-001',NULL,'{\"email\":\"kasir1@umb.ac.id\",\"role\":\"ADMIN\",\"timestamp\":\"2025-11-06T04:31:39.010Z\"}',NULL,NULL,'2025-11-06 04:31:39.010'),('audit-1762403660813-p2mlt36ne','super-admin-001','LOGIN','USER','super-admin-001',NULL,'{\"email\":\"manager@umb.ac.id\",\"role\":\"SUPER_ADMIN\",\"timestamp\":\"2025-11-06T04:34:20.813Z\"}',NULL,NULL,'2025-11-06 04:34:20.813'),('audit-1762408653128-5edvobogg','admin-kasir-001','LOGIN','USER','admin-kasir-001',NULL,'{\"email\":\"kasir1@umb.ac.id\",\"role\":\"ADMIN\",\"timestamp\":\"2025-11-06T05:57:33.128Z\"}',NULL,NULL,'2025-11-06 05:57:33.155'),('audit-1762408785876-2ym2m7tws','admin-kasir-001','LOGIN','USER','admin-kasir-001',NULL,'{\"email\":\"kasir1@umb.ac.id\",\"role\":\"ADMIN\",\"timestamp\":\"2025-11-06T05:59:45.876Z\"}',NULL,NULL,'2025-11-06 05:59:45.876'),('audit-1762408814987-ofa6sigpa','admin-kasir-001','LOGOUT','USER','admin-kasir-001',NULL,'{\"email\":\"kasir1@umb.ac.id\",\"timestamp\":\"2025-11-06T06:00:14.987Z\"}',NULL,NULL,'2025-11-06 06:00:14.987'),('audit-1762408833227-3k1t54p0d','admin-kasir-001','LOGIN','USER','admin-kasir-001',NULL,'{\"email\":\"kasir1@umb.ac.id\",\"role\":\"ADMIN\",\"timestamp\":\"2025-11-06T06:00:33.227Z\"}',NULL,NULL,'2025-11-06 06:00:33.227');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `broadcasts`
--

DROP TABLE IF EXISTS `broadcasts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `broadcasts` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('ANNOUNCEMENT','URGENT','INFO','REMINDER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `targetAudience` enum('ALL','ACTIVE_MEMBERS','UNIT_SPECIFIC') COLLATE utf8mb4_unicode_ci NOT NULL,
  `unitTarget` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('DRAFT','SCHEDULED','SENT','FAILED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `scheduledAt` datetime(3) DEFAULT NULL,
  `sentAt` datetime(3) DEFAULT NULL,
  `totalRecipients` int NOT NULL DEFAULT '0',
  `successfulDeliveries` int NOT NULL DEFAULT '0',
  `failedDeliveries` int NOT NULL DEFAULT '0',
  `createdById` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `broadcasts_createdById_fkey` (`createdById`),
  CONSTRAINT `broadcasts_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `broadcasts`
--

LOCK TABLES `broadcasts` WRITE;
/*!40000 ALTER TABLE `broadcasts` DISABLE KEYS */;
/*!40000 ALTER TABLE `broadcasts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `icon` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT 0xF09F93A6,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `order` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_name_key` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES ('cat-1762228579247-obzw5','Makanan','Makanan ringan, berat, dan olahan','2025-11-04 03:56:19.252','2025-11-04 03:56:19.248','­ƒì£',1,1),('cat-1762228579302-m10cd5','Minuman','Minuman kemasan, air mineral, dan soft drink','2025-11-04 03:56:19.303','2025-11-04 03:56:19.302','­ƒÑñ',1,2),('cat-1762228579323-ikodoa','Snack','Camilan, keripik, dan makanan ringan','2025-11-04 03:56:19.324','2025-11-04 03:56:19.323','­ƒì┐',1,3),('cat-1762228579344-ewiuhi','Alat Tulis','Perlengkapan tulis menulis dan kantor','2025-11-04 03:56:19.345','2025-11-04 03:56:19.344','Ô£Å´©Å',1,4),('cat-1762228579376-2lnmkv','Sembako','Sembilan bahan pokok dan kebutuhan dapur','2025-11-04 03:56:19.378','2025-11-04 03:56:19.376','­ƒî¥',1,5),('cat-1762228579398-34ep29','Personal Care','Peralatan mandi dan perawatan pribadi','2025-11-04 03:56:19.399','2025-11-04 03:56:19.398','­ƒº┤',1,6),('cat-1762228579423-uppgi','Perlengkapan Rumah','Peralatan dan perlengkapan rumah tangga','2025-11-04 03:56:19.424','2025-11-04 03:56:19.423','­ƒÅá',1,7),('cat-1762228579461-qae3l','Lainnya','Produk lain yang tidak masuk kategori di atas','2025-11-04 03:56:19.464','2025-11-04 03:56:19.461','­ƒôª',1,99);
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `consignment_batches`
--

DROP TABLE IF EXISTS `consignment_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `consignment_batches` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `consignorId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `productId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `qtyIn` int NOT NULL,
  `qtySold` int NOT NULL DEFAULT '0',
  `qtyReturned` int NOT NULL DEFAULT '0',
  `qtyExpired` int NOT NULL DEFAULT '0',
  `qtyRemaining` int NOT NULL,
  `feeType` enum('PERCENTAGE','FLAT','HYBRID') COLLATE utf8mb4_unicode_ci NOT NULL,
  `feePercent` decimal(65,30) DEFAULT NULL,
  `feeFlat` decimal(65,30) DEFAULT NULL,
  `receivedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `expiryAt` datetime(3) DEFAULT NULL,
  `status` enum('ACTIVE','DEPLETED','RETURNED','EXPIRED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `note` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `consignment_batches_code_key` (`code`),
  KEY `consignment_batches_consignorId_receivedAt_idx` (`consignorId`,`receivedAt`),
  KEY `consignment_batches_productId_status_idx` (`productId`,`status`),
  KEY `consignment_batches_receivedAt_idx` (`receivedAt`),
  CONSTRAINT `consignment_batches_consignorId_fkey` FOREIGN KEY (`consignorId`) REFERENCES `consignors` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `consignment_batches_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consignment_batches`
--

LOCK TABLES `consignment_batches` WRITE;
/*!40000 ALTER TABLE `consignment_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `consignment_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `consignment_payments`
--

DROP TABLE IF EXISTS `consignment_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `consignment_payments` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `supplierId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `supplierName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` double NOT NULL,
  `period` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `periodStart` datetime(3) NOT NULL,
  `periodEnd` datetime(3) NOT NULL,
  `paymentMethod` enum('CASH','TRANSFER','CREDIT') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CASH',
  `transactionId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paidBy` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `note` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `accountNumber` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bankName` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `proofImageUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rejectedReason` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `requestedAt` datetime(3) DEFAULT NULL,
  `requestedBy` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reviewedAt` datetime(3) DEFAULT NULL,
  `reviewedBy` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('PENDING','APPROVED','PAID','REJECTED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  PRIMARY KEY (`id`),
  UNIQUE KEY `consignment_payments_transactionId_key` (`transactionId`),
  KEY `consignment_payments_supplierId_idx` (`supplierId`),
  KEY `consignment_payments_status_idx` (`status`),
  KEY `consignment_payments_createdAt_idx` (`createdAt`),
  KEY `consignment_payments_periodStart_periodEnd_idx` (`periodStart`,`periodEnd`),
  KEY `consignment_payments_paidBy_fkey` (`paidBy`),
  CONSTRAINT `consignment_payments_paidBy_fkey` FOREIGN KEY (`paidBy`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `consignment_payments_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `consignment_payments_transactionId_fkey` FOREIGN KEY (`transactionId`) REFERENCES `transactions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consignment_payments`
--

LOCK TABLES `consignment_payments` WRITE;
/*!40000 ALTER TABLE `consignment_payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `consignment_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `consignment_sales`
--

DROP TABLE IF EXISTS `consignment_sales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `consignment_sales` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batchId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `transactionItemId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `qtySold` int NOT NULL,
  `unitPrice` decimal(65,30) NOT NULL,
  `totalRevenue` decimal(65,30) NOT NULL,
  `feeType` enum('PERCENTAGE','FLAT','HYBRID') COLLATE utf8mb4_unicode_ci NOT NULL,
  `feeAmount` decimal(65,30) NOT NULL,
  `netToConsignor` decimal(65,30) NOT NULL,
  `settlementId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isSettled` tinyint(1) NOT NULL DEFAULT '0',
  `saleDate` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `isProduction` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `consignment_sales_batchId_idx` (`batchId`),
  KEY `consignment_sales_saleDate_idx` (`saleDate`),
  KEY `consignment_sales_settlementId_idx` (`settlementId`),
  KEY `consignment_sales_isProduction_idx` (`isProduction`),
  KEY `consignment_sales_transactionItemId_fkey` (`transactionItemId`),
  CONSTRAINT `consignment_sales_batchId_fkey` FOREIGN KEY (`batchId`) REFERENCES `consignment_batches` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `consignment_sales_settlementId_fkey` FOREIGN KEY (`settlementId`) REFERENCES `settlements` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `consignment_sales_transactionItemId_fkey` FOREIGN KEY (`transactionItemId`) REFERENCES `transaction_items` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consignment_sales`
--

LOCK TABLES `consignment_sales` WRITE;
/*!40000 ALTER TABLE `consignment_sales` DISABLE KEYS */;
/*!40000 ALTER TABLE `consignment_sales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `consignors`
--

DROP TABLE IF EXISTS `consignors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `consignors` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `feeType` enum('PERCENTAGE','FLAT','HYBRID') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PERCENTAGE',
  `defaultFeePercent` decimal(65,30) DEFAULT NULL,
  `defaultFeeFlat` decimal(65,30) DEFAULT NULL,
  `paymentSchedule` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `note` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `consignors_code_key` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consignors`
--

LOCK TABLES `consignors` WRITE;
/*!40000 ALTER TABLE `consignors` DISABLE KEYS */;
/*!40000 ALTER TABLE `consignors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loan_payments`
--

DROP TABLE IF EXISTS `loan_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loan_payments` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `loanId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(65,30) NOT NULL,
  `paymentDate` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `loan_payments_loanId_fkey` (`loanId`),
  CONSTRAINT `loan_payments_loanId_fkey` FOREIGN KEY (`loanId`) REFERENCES `loans` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loan_payments`
--

LOCK TABLES `loan_payments` WRITE;
/*!40000 ALTER TABLE `loan_payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `loan_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loans`
--

DROP TABLE IF EXISTS `loans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loans` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `memberId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(65,30) NOT NULL,
  `interestRate` decimal(65,30) NOT NULL,
  `tenor` int NOT NULL,
  `monthlyPayment` decimal(65,30) NOT NULL,
  `remainingAmount` decimal(65,30) NOT NULL,
  `status` enum('ACTIVE','COMPLETED','OVERDUE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `startDate` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `endDate` datetime(3) NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `loans_memberId_fkey` (`memberId`),
  CONSTRAINT `loans_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `members` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loans`
--

LOCK TABLES `loans` WRITE;
/*!40000 ALTER TABLE `loans` DISABLE KEYS */;
/*!40000 ALTER TABLE `loans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `members`
--

DROP TABLE IF EXISTS `members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `members` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nomorAnggota` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gender` enum('MALE','FEMALE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `unitKerja` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `joinDate` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `status` enum('ACTIVE','INACTIVE','SUSPENDED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `simpananPokok` decimal(65,30) NOT NULL DEFAULT '0.000000000000000000000000000000',
  `simpananWajib` decimal(65,30) NOT NULL DEFAULT '0.000000000000000000000000000000',
  `simpananSukarela` decimal(65,30) NOT NULL DEFAULT '0.000000000000000000000000000000',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `members_userId_key` (`userId`),
  UNIQUE KEY `members_nomorAnggota_key` (`nomorAnggota`),
  UNIQUE KEY `members_email_key` (`email`),
  CONSTRAINT `members_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `members`
--

LOCK TABLES `members` WRITE;
/*!40000 ALTER TABLE `members` DISABLE KEYS */;
/*!40000 ALTER TABLE `members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `categoryId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sku` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `buyPrice` decimal(65,30) DEFAULT NULL,
  `sellPrice` decimal(65,30) NOT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `threshold` int NOT NULL DEFAULT '5',
  `unit` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pcs',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `avgCost` decimal(65,30) DEFAULT NULL,
  `expiryPolicy` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isConsignment` tinyint(1) NOT NULL DEFAULT '0',
  `lastRestockAt` datetime(3) DEFAULT NULL,
  `ownershipType` enum('TOKO','TITIPAN') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'TOKO',
  `status` enum('ACTIVE','INACTIVE','SEASONAL') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `stockCycle` enum('HARIAN','MINGGUAN','DUA_MINGGUAN') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MINGGUAN',
  `supplierContact` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `supplierId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `products_sku_key` (`sku`),
  KEY `products_categoryId_fkey` (`categoryId`),
  KEY `products_supplierId_fkey` (`supplierId`),
  CONSTRAINT `products_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `products_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES ('prod-1762230723345-sejbsd','Indomie Goreng','Mie instan rasa original goreng','cat-1762228579247-obzw5','8993333501010',2500.000000000000000000000000000000,3000.000000000000000000000000000000,100,10,'pcs',1,'2025-11-04 04:32:03.345','2025-11-04 04:32:03.345',NULL,NULL,0,NULL,'TOKO','ACTIVE','MINGGUAN',NULL,'sup-1762230684361-6dm49g'),('prod-1762230723520-bv9mxd','Aqua 600ml','Air mineral kemasan 600ml','cat-1762228579302-m10cd5','8993333601011',2000.000000000000000000000000000000,3000.000000000000000000000000000000,50,20,'botol',1,'2025-11-04 04:32:03.520','2025-11-04 04:32:03.520',NULL,NULL,0,NULL,'TOKO','ACTIVE','MINGGUAN',NULL,'sup-1762230684530-yozqdh'),('prod-1762230723639-1uu7z','Teh Botol Sosro','Teh manis kemasan botol','cat-1762228579302-m10cd5','8993333701012',2500.000000000000000000000000000000,4000.000000000000000000000000000000,40,15,'botol',1,'2025-11-04 04:32:03.639','2025-11-04 04:32:03.639',NULL,NULL,0,NULL,'TOKO','ACTIVE','MINGGUAN',NULL,'sup-1762230684588-qmkk0f'),('prod-1762230723713-7ubc8j','Pulpen Standard','Pulpen warna biru/hitam','cat-1762228579344-ewiuhi','8993333801013',1500.000000000000000000000000000000,3000.000000000000000000000000000000,30,10,'pcs',1,'2025-11-04 04:32:03.713','2025-11-04 04:32:03.713',NULL,NULL,0,NULL,'TOKO','ACTIVE','MINGGUAN',NULL,'sup-1762230684643-nvtccs'),('prod-1762230723791-k8szxd','Mie Sedaap Goreng','Mie instant goreng','cat-1762228579247-obzw5','8993333901014',2400.000000000000000000000000000000,2900.000000000000000000000000000000,80,15,'pcs',1,'2025-11-04 04:32:03.791','2025-11-04 04:32:03.791',NULL,NULL,0,NULL,'TOKO','ACTIVE','MINGGUAN',NULL,'sup-1762230684672-myj39f'),('prod-1762230723884-6e6zb','Chitato BBQ','Keripik kentang rasa BBQ','cat-1762228579323-ikodoa','8994334001015',5000.000000000000000000000000000000,8000.000000000000000000000000000000,25,10,'pack',1,'2025-11-04 04:32:03.884','2025-11-04 04:32:03.884',NULL,NULL,0,NULL,'TOKO','ACTIVE','MINGGUAN',NULL,'sup-1762230684361-6dm49g'),('prod-1762230723945-3ks7r','Beras Premium','Beras premium kualitas terbaik','cat-1762228579376-2lnmkv','8994334101016',12000.000000000000000000000000000000,15000.000000000000000000000000000000,200,50,'kg',1,'2025-11-04 04:32:03.945','2025-11-04 04:32:03.945',NULL,NULL,0,NULL,'TOKO','ACTIVE','MINGGUAN',NULL,'sup-1762230684714-d6exqj'),('prod-1762230724034-cbydma','Sabun Mandi','Sabun mandi wangi','cat-1762228579398-34ep29','8994334201017',5000.000000000000000000000000000000,8000.000000000000000000000000000000,40,15,'pcs',1,'2025-11-04 04:32:04.034','2025-11-04 04:32:04.034',NULL,NULL,0,NULL,'TOKO','ACTIVE','MINGGUAN',NULL,'sup-1762230684743-t4rehf'),('prod-1762230724120-kecan4','Gula Pasir','Gula pasir putih','cat-1762228579376-2lnmkv','8994334301018',13000.000000000000000000000000000000,15000.000000000000000000000000000000,150,30,'kg',1,'2025-11-04 04:32:04.120','2025-11-04 04:32:04.120',NULL,NULL,0,NULL,'TOKO','ACTIVE','MINGGUAN',NULL,'sup-1762230684769-hqfkl'),('prod-1762230724187-5451wm','Tissue','Tissue wajah kemasan','cat-1762228579423-uppgi','8994334401019',8000.000000000000000000000000000000,12000.000000000000000000000000000000,60,20,'pack',1,'2025-11-04 04:32:04.187','2025-11-04 04:32:04.187',NULL,NULL,0,NULL,'TOKO','ACTIVE','MINGGUAN',NULL,'sup-1762230684799-6j5cvqa');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase_items`
--

DROP TABLE IF EXISTS `purchase_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_items` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `purchaseId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `productId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL,
  `unitCost` decimal(65,30) NOT NULL,
  `totalCost` decimal(65,30) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `purchase_items_productId_idx` (`productId`),
  KEY `purchase_items_purchaseId_idx` (`purchaseId`),
  CONSTRAINT `purchase_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `purchase_items_purchaseId_fkey` FOREIGN KEY (`purchaseId`) REFERENCES `purchases` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_items`
--

LOCK TABLES `purchase_items` WRITE;
/*!40000 ALTER TABLE `purchase_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `purchase_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchases`
--

DROP TABLE IF EXISTS `purchases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchases` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `supplierId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `totalAmount` decimal(65,30) NOT NULL DEFAULT '0.000000000000000000000000000000',
  `purchaseDate` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `receivedDate` datetime(3) DEFAULT NULL,
  `status` enum('PENDING','RECEIVED','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `paymentStatus` enum('UNPAID','PARTIAL','PAID','PAID_PENDING_APPROVAL','PAID_APPROVED','PAID_REJECTED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'UNPAID',
  `paymentDate` datetime(3) DEFAULT NULL,
  `note` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `purchases_code_key` (`code`),
  KEY `purchases_supplierId_purchaseDate_idx` (`supplierId`,`purchaseDate`),
  CONSTRAINT `purchases_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `suppliers` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchases`
--

LOCK TABLES `purchases` WRITE;
/*!40000 ALTER TABLE `purchases` DISABLE KEYS */;
/*!40000 ALTER TABLE `purchases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `savings`
--

DROP TABLE IF EXISTS `savings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `savings` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `memberId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('POKOK','WAJIB','SUKARELA','WITHDRAWAL') COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(65,30) NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `savings_memberId_fkey` (`memberId`),
  CONSTRAINT `savings_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `members` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `savings`
--

LOCK TABLES `savings` WRITE;
/*!40000 ALTER TABLE `savings` DISABLE KEYS */;
/*!40000 ALTER TABLE `savings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiresAt` datetime(3) NOT NULL,
  `ipAddress` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `userAgent` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lastActiveAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `sessions_token_key` (`token`),
  KEY `sessions_userId_idx` (`userId`),
  KEY `sessions_token_idx` (`token`),
  KEY `sessions_expiresAt_idx` (`expiresAt`),
  CONSTRAINT `sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settlements`
--

DROP TABLE IF EXISTS `settlements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `settlements` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `consignorId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `periodStart` datetime(3) NOT NULL,
  `periodEnd` datetime(3) NOT NULL,
  `totalRevenue` decimal(65,30) NOT NULL DEFAULT '0.000000000000000000000000000000',
  `totalFee` decimal(65,30) NOT NULL DEFAULT '0.000000000000000000000000000000',
  `totalPayable` decimal(65,30) NOT NULL DEFAULT '0.000000000000000000000000000000',
  `status` enum('PENDING','PAID','CANCELLED','DISPUTED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `paymentMethod` enum('CASH','TRANSFER','CREDIT') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paymentDate` datetime(3) DEFAULT NULL,
  `paymentRef` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `note` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `settlements_code_key` (`code`),
  KEY `settlements_consignorId_periodStart_idx` (`consignorId`,`periodStart`),
  KEY `settlements_status_idx` (`status`),
  CONSTRAINT `settlements_consignorId_fkey` FOREIGN KEY (`consignorId`) REFERENCES `consignors` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settlements`
--

LOCK TABLES `settlements` WRITE;
/*!40000 ALTER TABLE `settlements` DISABLE KEYS */;
/*!40000 ALTER TABLE `settlements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_movements`
--

DROP TABLE IF EXISTS `stock_movements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock_movements` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `productId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL,
  `note` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `movementType` enum('PURCHASE_IN','CONSIGNMENT_IN','SALE_OUT','RETURN_IN','RETURN_OUT','EXPIRED_OUT','ADJUSTMENT','TRANSFER_IN','TRANSFER_OUT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `occurredAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `referenceId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `referenceType` enum('PURCHASE','CONSIGNMENT_BATCH','SALE','ADJUSTMENT','EXPIRY') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unitCost` decimal(65,30) DEFAULT NULL,
  `isProduction` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `stock_movements_productId_occurredAt_idx` (`productId`,`occurredAt`),
  KEY `stock_movements_referenceType_referenceId_idx` (`referenceType`,`referenceId`),
  KEY `stock_movements_isProduction_idx` (`isProduction`),
  CONSTRAINT `stock_movements_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_movements`
--

LOCK TABLES `stock_movements` WRITE;
/*!40000 ALTER TABLE `stock_movements` DISABLE KEYS */;
/*!40000 ALTER TABLE `stock_movements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supplier_payments`
--

DROP TABLE IF EXISTS `supplier_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supplier_payments` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(65,30) NOT NULL,
  `paymentMethod` enum('CASH','TRANSFER','CREDIT') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'TRANSFER',
  `paymentDate` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `periodStart` datetime(3) NOT NULL,
  `periodEnd` datetime(3) NOT NULL,
  `referenceNo` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `verifiedBy` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `verifiedAt` datetime(3) DEFAULT NULL,
  `status` enum('PENDING','VERIFIED','REJECTED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `note` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `paymentProof` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `supplierId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `supplier_payments_supplierId_paymentDate_idx` (`supplierId`,`paymentDate`),
  CONSTRAINT `supplier_payments_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supplier_payments`
--

LOCK TABLES `supplier_payments` WRITE;
/*!40000 ALTER TABLE `supplier_payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `supplier_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suppliers` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `paymentTerms` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `note` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `approvedAt` datetime(3) DEFAULT NULL,
  `approvedById` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `businessName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isPaymentActive` tinyint(1) NOT NULL DEFAULT '0',
  `lastPaymentDate` datetime(3) DEFAULT NULL,
  `monthlyFee` decimal(65,30) NOT NULL DEFAULT '25000.000000000000000000000000000000',
  `nextPaymentDue` datetime(3) DEFAULT NULL,
  `ownerName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `paymentStatus` enum('UNPAID','PARTIAL','PAID','PAID_PENDING_APPROVAL','PAID_APPROVED','PAID_REJECTED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'UNPAID',
  `productCategory` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rejectedReason` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('PENDING','APPROVED','REJECTED','SUSPENDED','ACTIVE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  PRIMARY KEY (`id`),
  UNIQUE KEY `suppliers_code_key` (`code`),
  UNIQUE KEY `suppliers_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
INSERT INTO `suppliers` VALUES ('sup-1762230684361-6dm49g','SUP-1762230684361-0','-','sup-1762230684361-0@generated.supplier','-',NULL,1,NULL,'2025-11-04 04:31:24.362','2025-11-04 04:31:24.362','2025-11-04 04:31:24.362',NULL,'PT Indofood',NULL,0,NULL,25000.000000000000000000000000000000,NULL,'PT Indofood','changeme123','UNPAID',NULL,NULL,'APPROVED'),('sup-1762230684530-yozqdh','SUP-1762230684530-1','-','sup-1762230684530-1@generated.supplier','-',NULL,1,NULL,'2025-11-04 04:31:24.530','2025-11-04 04:31:24.530','2025-11-04 04:31:24.530',NULL,'PT Aqua',NULL,0,NULL,25000.000000000000000000000000000000,NULL,'PT Aqua','changeme123','UNPAID',NULL,NULL,'APPROVED'),('sup-1762230684588-qmkk0f','SUP-1762230684588-2','-','sup-1762230684588-2@generated.supplier','-',NULL,1,NULL,'2025-11-04 04:31:24.588','2025-11-04 04:31:24.588','2025-11-04 04:31:24.588',NULL,'PT Sosro',NULL,0,NULL,25000.000000000000000000000000000000,NULL,'PT Sosro','changeme123','UNPAID',NULL,NULL,'APPROVED'),('sup-1762230684643-nvtccs','SUP-1762230684643-3','-','sup-1762230684643-3@generated.supplier','-',NULL,1,NULL,'2025-11-04 04:31:24.643','2025-11-04 04:31:24.643','2025-11-04 04:31:24.643',NULL,'Supplier ATK',NULL,0,NULL,25000.000000000000000000000000000000,NULL,'Supplier ATK','changeme123','UNPAID',NULL,NULL,'APPROVED'),('sup-1762230684672-myj39f','SUP-1762230684671-4','-','sup-1762230684671-4@generated.supplier','-',NULL,1,NULL,'2025-11-04 04:31:24.672','2025-11-04 04:31:24.672','2025-11-04 04:31:24.672',NULL,'PT Wings',NULL,0,NULL,25000.000000000000000000000000000000,NULL,'PT Wings','changeme123','UNPAID',NULL,NULL,'APPROVED'),('sup-1762230684714-d6exqj','SUP-1762230684713-6','-','sup-1762230684713-6@generated.supplier','-',NULL,1,NULL,'2025-11-04 04:31:24.714','2025-11-04 04:31:24.714','2025-11-04 04:31:24.714',NULL,'Toko Beras',NULL,0,NULL,25000.000000000000000000000000000000,NULL,'Toko Beras','changeme123','UNPAID',NULL,NULL,'APPROVED'),('sup-1762230684743-t4rehf','SUP-1762230684743-7','-','sup-1762230684743-7@generated.supplier','-',NULL,1,NULL,'2025-11-04 04:31:24.743','2025-11-04 04:31:24.743','2025-11-04 04:31:24.743',NULL,'Supplier Sabun',NULL,0,NULL,25000.000000000000000000000000000000,NULL,'Supplier Sabun','changeme123','UNPAID',NULL,NULL,'APPROVED'),('sup-1762230684769-hqfkl','SUP-1762230684769-8','-','sup-1762230684769-8@generated.supplier','-',NULL,1,NULL,'2025-11-04 04:31:24.770','2025-11-04 04:31:24.770','2025-11-04 04:31:24.770',NULL,'Toko Gula',NULL,0,NULL,25000.000000000000000000000000000000,NULL,'Toko Gula','changeme123','UNPAID',NULL,NULL,'APPROVED'),('sup-1762230684799-6j5cvqa','SUP-1762230684799-9','-','sup-1762230684799-9@generated.supplier','-',NULL,1,NULL,'2025-11-04 04:31:24.799','2025-11-04 04:31:24.799','2025-11-04 04:31:24.799',NULL,'Supplier Tissue',NULL,0,NULL,25000.000000000000000000000000000000,NULL,'Supplier Tissue','changeme123','UNPAID',NULL,NULL,'APPROVED');
/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transaction_items`
--

DROP TABLE IF EXISTS `transaction_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transaction_items` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `transactionId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `productId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL,
  `unitPrice` decimal(65,30) NOT NULL,
  `totalPrice` decimal(65,30) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `cogsPerUnit` decimal(65,30) DEFAULT NULL,
  `grossProfit` decimal(65,30) DEFAULT NULL,
  `totalCogs` decimal(65,30) DEFAULT NULL,
  `isProduction` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `transaction_items_productId_idx` (`productId`),
  KEY `transaction_items_transactionId_idx` (`transactionId`),
  KEY `transaction_items_isProduction_idx` (`isProduction`),
  CONSTRAINT `transaction_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `transaction_items_transactionId_fkey` FOREIGN KEY (`transactionId`) REFERENCES `transactions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transaction_items`
--

LOCK TABLES `transaction_items` WRITE;
/*!40000 ALTER TABLE `transaction_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `transaction_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `memberId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` enum('SALE','PURCHASE','RETURN','INCOME','EXPENSE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `totalAmount` decimal(65,30) NOT NULL,
  `paymentMethod` enum('CASH','TRANSFER','CREDIT') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CASH',
  `status` enum('PENDING','COMPLETED','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'COMPLETED',
  `note` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `isProduction` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `transactions_isProduction_idx` (`isProduction`),
  KEY `transactions_memberId_fkey` (`memberId`),
  CONSTRAINT `transactions_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `members` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('SUPER_ADMIN','ADMIN','SUPPLIER','USER','DEVELOPER') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USER',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `lastLoginAt` datetime(3) DEFAULT NULL,
  `mustChangePassword` tinyint(1) NOT NULL DEFAULT '1',
  `passwordChangedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('admin-kasir-001','kasir1@umb.ac.id','$2a$10$M5Lnyhv1NDebenQZy0Iife11swy130L8E4C8fSd8AVOGfeEnm3zW.','Kasir Pagi','ADMIN',1,'2025-11-06 06:00:33.190',1,NULL,'2025-11-03 16:14:30.861','2025-11-06 06:00:33.190'),('admin-kasir-002','kasir2@umb.ac.id','$2a$10$Cgn4Z8SMGV68t.MReOtqouQJ.EE59ihfsrFpuZh4TRlZ2.dIPUyMe','Kasir Siang','ADMIN',1,NULL,1,NULL,'2025-11-03 16:14:31.192','2025-11-03 16:14:31.192'),('developer-aegner','aegner@umb.ac.id','$2a$10$S.Gcen4GVmJJlWQCEp.r8.QhxaGznYBn6Ulx9yEWeQZW.k102NLpS','Aegner Billik (Developer)','DEVELOPER',1,NULL,0,NULL,'2025-11-03 16:14:31.583','2025-11-03 16:14:31.583'),('super-admin-001','manager@umb.ac.id','$2a$10$8dK4gYZl0LM0yilp1NQ5rOz45MzJJ6VG74L7RZ7VB9TCwkYhdFkWi','Manajer Koperasi UMB','SUPER_ADMIN',1,'2025-11-06 04:34:20.718',1,NULL,'2025-11-03 16:14:30.575','2025-11-06 04:34:20.718');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-06  6:21:17
