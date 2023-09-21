const express = require("express");
const { auth } = require("../middlewares/auth");
const { validateToy, ToyModel } = require("../models/toyModel");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    //?limit=X&page=X&sort=X&reveres=yes
    const limit = req.query.limit || 10;
    const page = req.query.page - 1 || 0;
    const sort = req.query.sort || "_id";
    const reverse = req.query.reverse == "yes" ? 1 : -1;
    const category = req.query.category;

    let filteFind = {};
    if (req.query.s) {
      const searchExp = new RegExp(req.query.s, "i");
      filteFind = { $or: [{ name: searchExp }, { info: searchExp }] };
    }
    if (category) {
      const searchExp = new RegExp(req.query.category, "i");

      filteFind = { ...filteFind, category: searchExp };
    }
    const data = await ToyModel.find(filteFind)
      .limit(limit)
      .skip(page * limit)
      .sort({ [sort]: reverse });
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});

router.post("/", auth, async (req, res) => {
  const validBody = validateToy(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    const toy = new ToyModel(req.body);
    toy.user_id = req.tokenData._id;
    await toy.save();
    res.status(201).json(toy);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});

router.put("/:id", auth, async (req, res) => {
  const validBody = validateToy(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    const id = req.params.id;
    const data = await ToyModel.updateOne(
      { _id: id, user_id: req.tokenData._id },
      req.body
    );
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;
    const data = await ToyModel.deleteOne({
      _id: id,
      user_id: req.tokenData._id,
    });
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});

module.exports = router;
