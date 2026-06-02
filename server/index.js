const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Banner = require('./models/Banner');
const dotenv = require('dotenv');
const bannersCached = require('./cache.service');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

app.use(express.json({ limit: '10mb' }));
app.use(cors());

const mongoURL = `mongodb+srv://${process.env.USER_DB}:${process.env.PASSWORD_DB}@cluster0.82ubc4m.mongodb.net/?appName=Cluster0`;

mongoose
  .connect(mongoURL)
  .then(() => console.log('Успешно: Подключено к MongoDB'))
  .catch((err) => console.error('Ошибка БД:', err));

app.get('/banners', async (req, res) => {
  const cacheKey = 'banners_list';
  const cachedData = bannersCached.get(cacheKey);
  if (cachedData) {
    return res.json(cachedData);
  }
  try {
    const mongoBanners = await Banner.find().sort({ _id: -1 });

    const formattedBanners = mongoBanners.map((banner) => ({
      id: banner._id,
      title: banner.title,
      src: banner.src,
    }));
    bannersCached.set(cacheKey, formattedBanners, 1);
    console.log(`>>> Отправлено баннеров: ${formattedBanners.length}`);
    res.status(200).json(formattedBanners);
  } catch (err) {
    console.error('Ошибка при получении баннеров:', err);
    res.status(500).json({ message: 'Ошибка сервера при загрузке списка' });
  }
});
app.get('/banners/:id', async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({ message: 'Баннер не найден' });
    }

    res.status(200).json({
      id: banner._id,
      title: banner.title,
      src: banner.src,
    });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера при поиске' });
  }
});

app.put('/banners/:id', async (req, res) => {
  try {
    const { title, src } = req.body;
    const updatedBanner = await Banner.findByIdAndUpdate(
      req.params.id,
      { title, src },
      { new: true },
    );

    if (!updatedBanner) {
      return res.status(404).json({ message: 'Нечего обновлять' });
    }
    bannersCached.delete('banners_list');
    res.status(200).json({
      id: updatedBanner._id,
      title: updatedBanner.title,
      src: updatedBanner.src,
    });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при обновлении' });
  }
});

app.post('/banners', async (req, res) => {
  try {
    const { title, src } = req.body;

    if (!src) {
      return res.status(400).json({ message: 'Картинка обязательна' });
    }

    const newBanner = new Banner({ title, src });

    const savedDoc = await newBanner.save();

    console.log('Баннер успешно сохранен в БД под ID:', savedDoc._id);
    bannersCached.delete('banners_list');
    res.status(201).json({
      id: savedDoc._id,
      title: savedDoc.title,
      src: savedDoc.src,
    });
  } catch (err) {
    console.error('Ошибка при создании баннера:', err);
    res.status(500).json({ message: 'Не удалось сохранить баннер' });
  }
});

app.delete('/banners/:id', async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    bannersCached.delete('banners_list');
    res.status(200).json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Delete error' });
  }
});

app.listen(PORT, () => console.log(`Сервер летит на порту ${PORT}`));
