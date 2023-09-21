const express = require("express");
const router = express.Router();

router.get("/", async(req,res) => {
  res.json({msg:"express work 12:00"})
})

module.exports = router;