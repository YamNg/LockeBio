import express from "express";
import pharmacyRoutes from "./pharmacy.routes.js";
import orderRoutes from "./order.routes.js";

const router = express.Router();

router.use("/pharmacy", pharmacyRoutes);
router.use("/orders", orderRoutes);

export default router;
