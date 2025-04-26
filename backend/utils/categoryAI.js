const axios = require("axios");

const predictCategory = async (title) => {
  try {
    const res = await axios.post("http://127.0.0.1:5001/predict", { title });
console.log("bhai mere category hai :",res.data.category);
      return res.data.category;
   
  }catch (error) {
    console.error("AI Prediction Error ", error.message);
    return "Other";
  }
};

module.exports = predictCategory;
