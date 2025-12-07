import { ParkingFeatures } from './types';
type RawParkingItem = any;

export function getParkingIdFromRaw(item: any): string {
  return (
    item.pklt_nm ||
    item.prkplceNm ||
    item.institutionNm ||
    'unknown'
  );
}

export function mapRawParkingToFeatures(item: RawParkingItem): ParkingFeatures {
  const id = getParkingIdFromRaw(item);
  return {
    id,   
    name: id   
  };
}
