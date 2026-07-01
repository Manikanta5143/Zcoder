const express = require("express");
const { getUpcomingContests } = require("../controllers/contest.controller");

const router = express.Router();

router.get("/", getUpcomingContests);

module.exports = router;