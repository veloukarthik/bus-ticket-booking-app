// Usage: set PAYTM_MERCHANT_KEY env var and run `node scripts/generate_checksum.js`
// This script prints only the checksum string to stdout.
(async function(){
  try {
    const mod = await import('paytmchecksum').catch(e=>{ throw e; });
    const PaytmChecksum = mod.default ?? mod;
    if (!PaytmChecksum || typeof PaytmChecksum.generateSignature !== 'function') {
      throw new Error('paytmchecksum.generateSignature not available');
    }

    const MERCHANT_KEY = process.env.PAYTM_MERCHANT_KEY;
    if (!MERCHANT_KEY) {
      console.error('Missing PAYTM_MERCHANT_KEY env var');
      process.exit(2);
    }

    // Change payload here if you want to sign different fields
    const params = {
      ORDERID: process.env.TEST_ORDER_ID || 'ORDER_123',
      TXNAMOUNT: process.env.TEST_TXN_AMOUNT || '100.00',
      STATUS: process.env.TEST_STATUS || 'TXN_SUCCESS'
    };

    const checksum = await PaytmChecksum.generateSignature(params, MERCHANT_KEY);
    // print only checksum
    console.log(checksum);
  } catch (err) {
    console.error(err && err.message ? err.message : err);
    process.exit(1);
  }
})();
