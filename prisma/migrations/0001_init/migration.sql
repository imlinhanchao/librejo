-- CreateTable
CREATE TABLE `lib_account` (
    `id` VARCHAR(36) NOT NULL,
    `username` VARCHAR(20) NOT NULL,
    `nickname` VARCHAR(20) NOT NULL,
    `passwd` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `motto` VARCHAR(200) NOT NULL,
    `avatar` VARCHAR(200) NOT NULL,
    `lastlogin` INTEGER NULL,
    `create_time` INTEGER NULL,
    `update_time` INTEGER NULL,

    UNIQUE INDEX `lib_account_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lib_book_info` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `dbId` VARCHAR(20) NOT NULL,
    `img` VARCHAR(400) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `author` VARCHAR(100) NOT NULL,
    `publisher` VARCHAR(100) NOT NULL,
    `page` INTEGER NOT NULL,
    `ISBN` VARCHAR(100) NOT NULL,
    `pub_date` VARCHAR(20) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `create_time` INTEGER NULL,
    `update_time` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lib_book_note` (
    `id` VARCHAR(36) NOT NULL,
    `bookId` VARCHAR(36) NOT NULL,
    `page` INTEGER NOT NULL,
    `ISBN` VARCHAR(100) NOT NULL,
    `section` VARCHAR(200) NOT NULL DEFAULT '',
    `content` TEXT NOT NULL,
    `favcount` INTEGER NOT NULL DEFAULT 0,
    `create_time` INTEGER NULL,
    `update_time` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lib_read_record` (
    `id` VARCHAR(36) NOT NULL,
    `bookId` VARCHAR(36) NOT NULL,
    `ISBN` VARCHAR(100) NOT NULL,
    `status` INTEGER NOT NULL,
    `page` INTEGER NOT NULL,
    `create_time` INTEGER NULL,
    `update_time` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lib_lend_record` (
    `id` VARCHAR(36) NOT NULL,
    `bookId` VARCHAR(36) NOT NULL,
    `accountId` VARCHAR(36) NOT NULL,
    `remark` VARCHAR(800) NOT NULL,
    `status` INTEGER NOT NULL,
    `lend_date` INTEGER NULL,
    `back_date` INTEGER NULL,
    `create_time` INTEGER NULL,
    `update_time` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
