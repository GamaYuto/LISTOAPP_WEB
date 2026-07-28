"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfferStatus = exports.ServiceStatus = exports.Role = void 0;
var Role;
(function (Role) {
    Role["CLIENT"] = "CLIENT";
    Role["PROVIDER"] = "PROVIDER";
})(Role || (exports.Role = Role = {}));
var ServiceStatus;
(function (ServiceStatus) {
    ServiceStatus["PENDING"] = "PENDING";
    ServiceStatus["ACCEPTED"] = "ACCEPTED";
    ServiceStatus["IN_PROGRESS"] = "IN_PROGRESS";
    ServiceStatus["COMPLETED"] = "COMPLETED";
})(ServiceStatus || (exports.ServiceStatus = ServiceStatus = {}));
var OfferStatus;
(function (OfferStatus) {
    OfferStatus["PENDING"] = "PENDING";
    OfferStatus["ACCEPTED"] = "ACCEPTED";
    OfferStatus["REJECTED"] = "REJECTED";
})(OfferStatus || (exports.OfferStatus = OfferStatus = {}));
