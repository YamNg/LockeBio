import express from "express";
import {
  addOrder,
  getAllOrders,
  getOrderById,
} from "../controllers/order.controller.js";

const router = express.Router();

router.get("/", getAllOrders);
router.get("/:orderId", getOrderById);
router.post("/:pharmacyId", addOrder);

export default router;
