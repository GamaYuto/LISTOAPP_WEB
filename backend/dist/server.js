"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const service_routes_1 = __importDefault(require("./routes/service.routes"));
const offer_routes_1 = __importDefault(require("./routes/offer.routes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || '*'
}));
app.use(express_1.default.json());
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'ListoApp Backend is running!' });
});
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/services', service_routes_1.default);
app.use('/api/offers', offer_routes_1.default);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
