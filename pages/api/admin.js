import dbConnect, { AdSettings } from '../../lib/db';

export default async function handler(req, res) {
  await dbConnect();
  
  if (req.method === 'GET') {
    try {
      const settings = await AdSettings.findOne();
      res.status(200).json(settings || {});
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { topBannerCode, middleBannerCode, bottomBannerCode, videoAdCode, interstitialAdCode } = req.body;
      
      const settings = await AdSettings.findOneAndUpdate(
        {},
        {
          topBannerCode,
          middleBannerCode,
          bottomBannerCode,
          videoAdCode,
          interstitialAdCode,
          updatedAt: new Date(),
        },
        { upsert: true, new: true }
      );
      
      res.status(200).json(settings);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}