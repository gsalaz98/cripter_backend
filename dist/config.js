"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = {
    prod: process.env.NODE_ENV === 'production' ? true : false,
    port: process.env.PORT || '8080',
    db_connection: 'mongodb://localhost:27017/cripter',
    database: process.env.DATABASE || 'cripter',
    salt_rounds: 16,
};
