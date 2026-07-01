const axios = require("axios");

const getUpcomingContests = async (req, res) => {

module.exports = {
    getUpcomingContests
};
  try {
    const currentDate = new Date().toISOString();

    const url = `https://clist.by/api/v1/contest/?username=${process.env.CLIST_USERNAME}&api_key=${process.env.CLIST_API_KEY}&start__gt=${currentDate}&resource__id__in=1,2,102,93&limit=15`;

    const response = await axios.get(url);

    res.status(200).json(response.data.objects);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to fetch contests"
    });
  }
};
module.exports = {
    getUpcomingContests
};