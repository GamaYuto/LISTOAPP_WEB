"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const windowQuote_controller_1 = require("../controllers/windowQuote.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: path_1.default.join(__dirname, '../../uploads'),
        filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
    }),
    limits: { fileSize: 5 * 1024 * 1024 }
});
router.post('/', auth_middleware_1.authenticateToken, upload.single('image'), windowQuote_controller_1.createWindowQuote);
router.get('/', auth_middleware_1.authenticateToken, windowQuote_controller_1.getWindowQuotes);
router.get('/export-excel', auth_middleware_1.authenticateToken, windowQuote_controller_1.exportWindowQuotesExcel);
exports.default = router;
