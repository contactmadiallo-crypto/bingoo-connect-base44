// Bingoo server-side shipping policy. The server is authoritative.
// Rates are launch guardrails until live carrier/3PL quotes are connected.
export type ShippingQuote = {
  zone: string;
  service: string;
  amountCents: number;
  currency: 'usd';
  etaMinDays: number;
  etaMaxDays: number;
  dutiesTerms: 'domestic' | 'DAP';
};

const US = new Set(['US','USA','UNITED STATES','UNITED STATES OF AMERICA']);
const NORTH_AMERICA = new Set(['CA','CAN','CANADA','MX','MEX','MEXICO']);
const EUROPE = new Set(['GB','UK','UNITED KINGDOM','IE','IRELAND','FR','FRANCE','DE','GERMANY','ES','SPAIN','IT','ITALY','NL','NETHERLANDS','BE','BELGIUM','PT','PORTUGAL','CH','SWITZERLAND','AT','AUSTRIA','SE','SWEDEN','NO','NORWAY','DK','DENMARK','FI','FINLAND','PL','POLAND']);
const AFRICA = new Set(['GN','GUINEA','SN','SENEGAL','CI',"COTE D'IVOIRE",'GH','GHANA','NG','NIGERIA','GM','GAMBIA','SL','SIERRA LEONE','LR','LIBERIA','ML','MALI','BF','BURKINA FASO','KE','KENYA','ZA','SOUTH AFRICA','MA','MOROCCO','EG','EGYPT','ET','ETHIOPIA','TZ','TANZANIA','UG','UGANDA','RW','RWANDA']);
const ASIA_PACIFIC = new Set(['CN','CHINA','HK','HONG KONG','JP','JAPAN','KR','SOUTH KOREA','SG','SINGAPORE','IN','INDIA','AU','AUSTRALIA','NZ','NEW ZEALAND','AE','UNITED ARAB EMIRATES','UAE']);

function countryKey(value: string) { return String(value || '').trim().toUpperCase(); }

export function computeShipping(_subtotalCents: number, country: string): ShippingQuote {
  const c = countryKey(country);
  if (!c) throw new Error('Shipping country is required.');
  if (US.has(c)) return {zone:'US_DOMESTIC',service:'Bingoo Standard',amountCents:500,currency:'usd',etaMinDays:3,etaMaxDays:7,dutiesTerms:'domestic'};
  if (NORTH_AMERICA.has(c)) return {zone:'NORTH_AMERICA',service:'International Standard',amountCents:1499,currency:'usd',etaMinDays:5,etaMaxDays:12,dutiesTerms:'DAP'};
  if (EUROPE.has(c)) return {zone:'EUROPE',service:'International Standard',amountCents:1999,currency:'usd',etaMinDays:7,etaMaxDays:14,dutiesTerms:'DAP'};
  if (AFRICA.has(c)) return {zone:'AFRICA',service:'International Standard',amountCents:2499,currency:'usd',etaMinDays:8,etaMaxDays:18,dutiesTerms:'DAP'};
  if (ASIA_PACIFIC.has(c)) return {zone:'ASIA_PACIFIC',service:'International Standard',amountCents:2499,currency:'usd',etaMinDays:7,etaMaxDays:16,dutiesTerms:'DAP'};
  return {zone:'INTERNATIONAL_OTHER',service:'International Standard',amountCents:2999,currency:'usd',etaMinDays:10,etaMaxDays:21,dutiesTerms:'DAP'};
}