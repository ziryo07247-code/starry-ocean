const express = require("express");
const router = express.Router();
const {
  getAllIslands,
  createIsland,
  deleteIsland,
} = require("../controllers/islandController");

router.get("/", getAllIslands);
router.post("/", createIsland);
router.delete("/:id", deleteIsland);

module.exports = router;
