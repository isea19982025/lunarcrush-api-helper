// Vercel Serverless Function that uses a real browser via Browserless.io

export default async function handler(request, response) {
  const { asset_symbol } = request.query;

  if (!asset_symbol) {
    return response.status(400).json({ error: 'asset_symbol parameter is required' });
  }

  // Get the secret API key from Vercel's Environment Variables
  const BROWSERLESS_KEY = process.env.BROWSERLESS_API_KEY;

  if (!BROWSERLESS_KEY) {
    return response.status(500).json({ error: 'Browserless API key not configured' });
  }

  // The target URL we want to scrape
  const targetUrl = `https://lunarcrush.com/coins/${asset_symbol.toLowerCase()}`;

  // The Browserless.io API endpoint for scraping content
  const browserlessApiUrl = `https://chrome.browserless.io/scrape?token=${BROWSERLESS_KEY}`;

  try {
    // Tell Browserless to go to the page and grab a specific element
    const fetchResponse = await fetch(browserlessApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: targetUrl,
        // We are targeting an element with a specific "data-testid" attribute
        // This is a reliable way to find the Galaxy Score on their page
        elements: [{ selector: '[data-testid="galaxy-score-metric"]' }],
      }),
    });

    if (!fetchResponse.ok) {
      throw new Error(`Browserless API responded with status: ${fetchResponse.status}`);
    }

    const data = await fetchResponse.json();

    // Extract the score from the browser's results
    const scoreText = data.data[0]?.results[0]?.text || '0';
    const socialScore = parseFloat(scoreText) || 0;

    const responseBody = {
      asset: asset_symbol,
      source: "Browserless.io_Scrape",
      score: socialScore,
      timestamp: new Date().toISOString(),
    };

    return response.status(200).json(responseBody);

  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}
