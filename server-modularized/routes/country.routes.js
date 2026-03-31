/**
 * routes/country.routes.js
 *
 * Static reference-data endpoints for countries, religions, and phone codes.
 * All data is sourced from the shared country-data-service module; no DB
 * queries are performed by these routes.
 *
 * Mount this router at /api:
 *   GET /api/countries              — full list of countries with phone codes
 *   GET /api/countries/by-continent — countries grouped by continent
 *   GET /api/countries/search       — fuzzy search (?q=)
 *   GET /api/countries/:code        — single country by ISO code
 *   GET /api/religions              — full list of religions
 *   GET /api/phone-code/:countryCode — phone dial code for a country
 */

import { Router } from 'express';
// country-data-service lives at the project root alongside server.js.
// Adjust this path if the modularized folder is nested differently.
import {
  getAllCountries,
  getCountryByCode,
  getReligions,
  getCountriesByContinent,
  searchCountries,
  getPhoneCode,
} from '../country-data-service.js';

const router = Router();

// ---------------------------------------------------------------------------
// GET /api/countries — all countries with phone codes
// ---------------------------------------------------------------------------

router.get('/countries', (req, res) => {
  try {
    const countries = getAllCountries();
    res.json({ success: true, count: countries.length, countries });
  } catch (err) {
    console.error('[Countries API Error]', err);
    res.status(500).json({ success: false, error: 'Failed to fetch countries' });
  }
});

// ---------------------------------------------------------------------------
// GET /api/countries/by-continent — grouped by continent
// Note: must be defined before /:code to avoid "by-continent" being caught
// ---------------------------------------------------------------------------

router.get('/countries/by-continent', (req, res) => {
  try {
    const grouped = getCountriesByContinent();
    res.json({ success: true, continents: grouped });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch countries' });
  }
});

// ---------------------------------------------------------------------------
// GET /api/countries/search — fuzzy search via ?q=
// ---------------------------------------------------------------------------

router.get('/countries/search', (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, error: 'Query parameter required' });
    }
    const results = searchCountries(q);
    res.json({ success: true, query: q, count: results.length, countries: results });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Search failed' });
  }
});

// ---------------------------------------------------------------------------
// GET /api/countries/:code — single country by ISO code
// ---------------------------------------------------------------------------

router.get('/countries/:code', (req, res) => {
  try {
    const { code } = req.params;
    const country = getCountryByCode(code.toUpperCase());
    if (!country) {
      return res.status(404).json({ success: false, error: 'Country not found' });
    }
    res.json({ success: true, country });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch country' });
  }
});

// ---------------------------------------------------------------------------
// GET /api/religions — full list of religions
// ---------------------------------------------------------------------------

router.get('/religions', (req, res) => {
  try {
    const religions = getReligions();
    res.json({ success: true, count: religions.length, religions });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch religions' });
  }
});

// ---------------------------------------------------------------------------
// GET /api/phone-code/:countryCode — phone dial code for a country
// ---------------------------------------------------------------------------

router.get('/phone-code/:countryCode', (req, res) => {
  try {
    const { countryCode } = req.params;
    const phoneCode = getPhoneCode(countryCode.toUpperCase());
    if (!phoneCode) {
      return res.status(404).json({ success: false, error: 'Country not supported' });
    }
    res.json({ success: true, countryCode: countryCode.toUpperCase(), phoneCode });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to get phone code' });
  }
});

export default router;
