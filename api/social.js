// Vercel Serverless Function to fetch LunarCrush data

export default async function handler(request, response) {
  // Get the asset symbol from the URL (e.g., ?asset_symbol=BTC)
  const { asset_symbol } = request.query;

  if (!asset_symbol) {
    return response.status(400).json({ error: 'asset_symbol parameter is required' });
  }

  // Access the secret API key from Vercel's Environment Variables
  const LUNARCRUSH_KEY = process.env.LUNARCRUSH_API_KEY;

  if (!LUNARCRUSH_KEY) {
    return response.status(500).json({ error: 'API key is not configured on the server' });
  }

  const apiUrl = `https://lunarcrush.com/api/v4/public/coins/${asset_symbol.toUpperCase()}/v1`;

  try {
    const fetchResponse = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${LUNARCRUSH_KEY}`
      }
    });

    if (!fetchResponse.ok) {
      throw new Error(`LunarCrush API responded with status: ${fetchResponse.status}`);
    }

    const data = await fetchResponse.json();
    const socialScore = data?.galaxy_score || 0;

    const responseBody = {
      asset: asset_symbol,
      source: "LunarCrushAPI_Vercel",
      score: socialScore,
      timestamp: new Date().toISOString()
    };

    // Send the successful response
    return response.status(200).json(responseBody);

  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}
