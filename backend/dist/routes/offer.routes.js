"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const offer_controller_1 = require("../controllers/offer.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.post('/', auth_middleware_1.authenticateToken, offer_controller_1.createOffer);
router.put('/:id/accept', auth_middleware_1.authenticateToken, offer_controller_1.acceptOffer);
exports.default = router;
