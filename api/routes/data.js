import express from 'express';
import { 
  getAllCountries, 
  getCountryByCode, 
  getReligions, 
  getCountriesByContinent,
  searchCountries,
  getPhoneCode
} from '../../country-data-service.js';

const router = express.Router();

router.get('/countries', (req, res) => {
  try {
    const countries = getAllCountries();
    res.json({ success: true, count: countries.length, countries });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch countries' });
  }
});

router.get('/countries/by-continent', (req, res) => {
  try {
    const grouped = getCountriesByContinent();
    res.json({ success: true, continents: grouped });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch countries' });
  }
});

router.get('/countries/search', (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, error: 'Query parameter required' });
    const results = searchCountries(q);
    res.json({ success: true, query: q, count: results.length, countries: results });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Search failed' });
  }
});

router.get('/countries/:code', (req, res) => {
  try {
    const { code } = req.params;
    const country = getCountryByCode(code.toUpperCase());
    if (!country) return res.status(404).json({ success: false, error: 'Country not found' });
    res.json({ success: true, country });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch country' });
  }
});

router.get('/religions', (req, res) => {
  try {
    const religions = getReligions();
    res.json({ success: true, count: religions.length, religions });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch religions' });
  }
});

router.get('/phone-code/:countryCode', (req, res) => {
  try {
    const { countryCode } = req.params;
    const phoneCode = getPhoneCode(countryCode.toUpperCase());
    if (!phoneCode) return res.status(404).json({ success: false, error: 'Country not supported' });
    res.json({ success: true, countryCode: countryCode.toUpperCase(), phoneCode });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to get phone code' });
  }
});

export default router;
