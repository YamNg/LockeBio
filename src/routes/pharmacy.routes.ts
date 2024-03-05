import express from "express";
import {
  addPharmacy,
  addPharmacyProducts,
  deletePharmacy,
  deletePharmacyProduct,
  getAllPharmacies,
  getPharmacyById,
  updatePharmacy,
  updatePharmacyProduct,
} from "../controllers/pharmacy.controller.js";

const router = express.Router();

router.get("/", getAllPharmacies);
router.get("/:pharmacyId", getPharmacyById);
router.post("/", addPharmacy);
router.patch("/:pharmacyId", updatePharmacy);
router.delete("/:pharmacyId", deletePharmacy);

router.post("/:pharmacyId/products", addPharmacyProducts);
router.patch("/:pharmacyId/products/:pharmacyProductId", updatePharmacyProduct);
router.delete(
  "/:pharmacyId/products/:pharmacyProductId",
  deletePharmacyProduct
);

export default router;
