import { env } from '../config/env';

export interface GstDetails {
  gstin: string;
  legalName: string;
  tradeName: string;
  status: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

// Indian state codes for GSTIN (first 2 digits)
const STATE_CODES: Record<string, string> = {
  '01': 'Jammu & Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '25': 'Daman & Diu',
  '26': 'Dadra & Nagar Haveli',
  '27': 'Maharashtra',
  '29': 'Karnataka',
  '30': 'Goa',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman & Nicobar',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
  '38': 'Ladakh',
  '97': 'Other Territory',
};

/**
 * Validates GSTIN format:
 * - 15 characters long
 * - First 2 digits: valid state code (01-38, 97)
 * - Next 10 chars: PAN number (AAAAA9999A format)
 * - 13th char: entity number (1-9 or A-Z)
 * - 14th char: 'Z' by default
 * - 15th char: checksum digit
 */
const isValidGstinFormat = (gstin: string): boolean => {
  if (!gstin || gstin.length !== 15) return false;
  const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$/;
  if (!regex.test(gstin)) return false;
  const stateCode = gstin.substring(0, 2);
  if (!STATE_CODES[stateCode]) return false;
  return true;
};

/**
 * Fetches real company details for a given GST number using the GSTINCheck free API.
 *
 * To use real verification:
 *   1. Go to https://gstincheck.co.in and enter your email to get a free API key (20 free lookups)
 *   2. Set GST_API_KEY in your .env file
 *
 * If no API key is configured, falls back to GSTIN format validation only.
 */
export const verifyGstNumber = async (gstin: string): Promise<GstDetails> => {
  const upperGstin = gstin.toUpperCase().trim();

  if (!isValidGstinFormat(upperGstin)) {
    throw new Error(
      'Invalid GSTIN format. Must be 15 characters: 2-digit state code + 10-char PAN + entity number + Z + checksum. Example: 27AAPFU0939F1ZV',
    );
  }

  const apiKey = env.gstApiKey;

  // ─── Real API call using GSTINCheck (free tier: 20 requests) ───
  if (apiKey) {
    try {
      const response = await fetch(
        `https://sheet.gstincheck.co.in/check/${apiKey}/${upperGstin}`,
        {
          method: 'GET',
          headers: { Accept: 'application/json' },
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('GSTINCheck API HTTP error:', response.status, errorText);
        throw new Error(`GST API returned HTTP ${response.status}`);
      }

      const data = await response.json();

      // GSTINCheck returns { flag: true/false, data: { ... } }
      if (data.flag === true && data.data) {
        const d = data.data;
        // Extract address components
        const addr = d.pradr?.addr || {};
        const fullAddress =
          d.pradr?.adr ||
          [addr.bno, addr.flno, addr.bnm, addr.st, addr.loc]
            .filter((v) => v && v !== '0')
            .join(', ') ||
          '';
        const city = addr.dst || addr.loc || addr.city || '';
        const state =
          addr.stcd || STATE_CODES[upperGstin.substring(0, 2)] || '';
        const pincode = addr.pncd || '';

        return {
          gstin: d.gstin || upperGstin,
          legalName: d.lgnm || '',
          tradeName: d.tradeNam || d.lgnm || '',
          status: d.sts || 'Unknown',
          address: fullAddress,
          city,
          state,
          pincode,
        };
      }

      // API returned but flag is false — GSTIN not found or invalid
      if (data.flag === false) {
        throw new Error(
          data.message ||
            'GSTIN not found in government records. Please check the number and try again.',
        );
      }

      throw new Error('Unexpected response from GST verification service');
    } catch (err: any) {
      // If the error is from our own validation, re-throw it
      if (err.message && !err.message.includes('fetch')) {
        throw err;
      }
      console.error('GSTINCheck API call failed:', err.message);
      throw new Error(
        'GST verification service is temporarily unavailable. Please try again later.',
        { cause: err },
      );
    }
  }

  // ─── No API key: format-validated fallback ───
  // Returns data derived from the GSTIN structure itself (state code + PAN)
  const stateCode = upperGstin.substring(0, 2);
  const state = STATE_CODES[stateCode] || 'Unknown State';

  // Build a helpful message about what we can tell from the format
  const panPart = upperGstin.substring(2, 12);
  const entityType = panPart.charAt(3); // 4th char of PAN indicates entity type
  const entityTypes: Record<string, string> = {
    A: 'Association of Persons (AOP)',
    B: 'Body of Individuals (BOI)',
    C: 'Company',
    F: 'Firm/LLP',
    G: 'Government',
    H: 'Hindu Undivided Family (HUF)',
    J: 'Artificial Juridical Person',
    L: 'Local Authority',
    P: 'Individual',
    T: 'Trust',
  };
  const entityDesc = entityTypes[entityType] || 'Business Entity';

  // Simulate network delay for consistency
  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    gstin: upperGstin,
    legalName: `[Format Valid] ${entityDesc} — PAN: ${panPart}`,
    tradeName: `${entityDesc} (${state})`,
    status: 'Format Valid — Set GST_API_KEY in .env for live verification',
    address: 'N/A — Real address requires API key',
    city: 'N/A',
    state,
    pincode: 'N/A',
  };
};
