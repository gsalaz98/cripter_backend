"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = __importDefault(require("redis"));
const config_1 = require("./config");
exports.redisClient = redis_1.default.createClient({
    url: config_1.config.redis_url,
    auth_pass: config_1.config.redis_auth,
});
