const axios = require('axios');

function median(numbers) {
  if (!numbers || numbers.length === 0) return null;
  const arr = numbers.slice().sort((a, b) => a - b);
  const mid = Math.floor(arr.length / 2);
  if (arr.length % 2 === 0) {
    return (arr[mid - 1] + arr[mid]) / 2;
  }
  return arr[mid];
}

async function searchEbayCompletedAU(query) {
  const appId = process.env.EBAY_APP_ID;
  if (!appId) {
    return { success: false, reason: 'missing_app_id' };
  }
  const endpoint = 'https://svcs.ebay.com/services/search/FindingService/v1';
  const params = new URLSearchParams({
    'OPERATION-NAME': 'findCompletedItems',
    'SERVICE-VERSION': '1.13.0',
    'SECURITY-APPNAME': appId,
    'RESPONSE-DATA-FORMAT': 'JSON',
    'GLOBAL-ID': 'EBAY-AU',
    'keywords': query,
    'paginationInput.entriesPerPage': '25'
  });
  // Sold items only filters
  params.append('itemFilter(0).name', 'SoldItemsOnly');
  params.append('itemFilter(0).value', 'true');

  const url = `${endpoint}?${params.toString()}`;
  const res = await axios.get(url, { timeout: 5000 });
  const body = res.data;
  const response = body && body.findCompletedItemsResponse && body.findCompletedItemsResponse[0];
  const ack = response && response.ack && response.ack[0];
  if (ack !== 'Success') {
    return { success: false, reason: 'api_error' };
  }
  const items = (((response.searchResult || [])[0] || {}).item) || [];
  const prices = [];
  const listings = [];
  for (const it of items) {
    const selling = it.sellingStatus && it.sellingStatus[0];
    const priceObj = selling && selling.currentPrice && selling.currentPrice[0];
    const currency = priceObj && priceObj['@currencyId'];
    const valueStr = priceObj && priceObj['__value__'];
    const value = valueStr ? Number(valueStr) : NaN;
    if (currency === 'AUD' && Number.isFinite(value) && value > 0) {
      prices.push(value);
      listings.push({
        title: (it.title && it.title[0]) || '',
        price: value,
        currency: currency,
        viewItemURL: it.viewItemURL && it.viewItemURL[0]
      });
    }
  }
  if (prices.length === 0) {
    return { success: false, reason: 'no_prices' };
  }
  const med = median(prices);
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
  return {
    success: true,
    count: prices.length,
    medianPrice: med,
    averagePrice: avg,
    currency: 'AUD',
    source: 'eBay AU (Completed)',
    listings: listings.slice(0, 5)
  };
}

async function getComparablePrices(query) {
  try {
    // 3秒超时保护，避免拖慢估价
    const result = await Promise.race([
      searchEbayCompletedAU(query),
      new Promise((resolve) => setTimeout(() => resolve({ success: false, reason: 'timeout' }), 3000))
    ]);
    return result;
  } catch (err) {
    return { success: false, reason: 'exception', message: err.message };
  }
}

module.exports = { getComparablePrices };
