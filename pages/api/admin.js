import dbConnect, { AdSettings } from '../../lib/db';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const settings = await AdSettings.findOne();
      res.status(200).json(settings || {});
    } catch (error) {
      console.error('Error fetching ad settings:', error);
      res.status(500).json({ error: 'Failed to fetch ad settings' });
    }
  } else if (req.method === 'POST') {
    try {
      const {
        topBannerCode,
        middleBannerCode,
        bottomBannerCode,
        videoAdCode,
        interstitialAdCode,
        topBannerCount,
        middleBannerCount,
        bottomBannerCount,
        rewardsCardCount,
      } = req.body;

      const settings = await AdSettings.findOneAndUpdate(
        {},
        {
          topBannerCode: topBannerCode || '',
          middleBannerCode: middleBannerCode || '',
          bottomBannerCode: bottomBannerCode || '',
          videoAdCode: videoAdCode || '',
          interstitialAdCode: interstitialAdCode || '',
          topBannerCount: topBannerCount || 1,
          middleBannerCount: middleBannerCount || 1,
          bottomBannerCount: bottomBannerCount || 1,
          rewardsCardCount: rewardsCardCount || 5,
          updatedAt: new Date(),
        },
        { upsert: true, new: true }
      );

      res.status(200).json(settings);
    } catch (error) {
      console.error('Error saving ad settings:', error);
      res.status(500).json({ error: 'Failed to save ad settings' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}