import { type Lookup, lookup } from "geoip-lite";
import DeviceDetector, { type DetectResult } from "node-device-detector";
import countries from "i18n-iso-countries";

export const ipToData = (ipAddress: string) => {
  const location = lookup(ipAddress) as Lookup;

  return {
    	country: countries.getName(location.country, 'en') || 'Unknown',
			city: location.city || 'Unknown',
			latitude: location.ll[0] || 0,
			longitude: location.ll[1] || 0
  };
};

export const userAgentDetector = (userAgent: string): DetectResult => {
  const detector = new DeviceDetector({
    clientIndexes: true,
    deviceIndexes: true,
    osIndexes: true,
    deviceAliasCode: false,
    deviceTrusted: false,
    deviceInfo: false,
    maxUserAgentSize: 500,
  });
  return detector.detect(userAgent);
};
