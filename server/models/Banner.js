const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Заголовок обязателен"],
  },
  src: {
    type: String,
    required: [true, "Картинка (Base64) обязательна"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Banner", bannerSchema);
