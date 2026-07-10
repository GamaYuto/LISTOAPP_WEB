"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const service_controller_1 = require("../controllers/service.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get('/pending', auth_middleware_1.authenticateToken, service_controller_1.getPendingServices);
router.get('/my-requests', auth_middleware_1.authenticateToken, service_controller_1.getMyRequests);
router.post('/', auth_middleware_1.authenticateToken, service_controller_1.createServiceRequest);
exports.default = router;
//# sourceMappingURL=service.routes.js.map