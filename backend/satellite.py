from skyfield.api import Topos, load
import json
import os

class SatelliteTracker:
    def __init__(self, config_path):
        self.config_path = config_path
        self.config = self._load_or_create_config()
        
        station_info = self.config['spu_ground_station']
        self.station = Topos(
            latitude_degrees=station_info['latitude'], 
            longitude_degrees=station_info['longitude'], 
            elevation_m=station_info['elevation_m']
        )
        
        self.ts = load.timescale()
        self.satellites_data = {}
        self.update_tle()

    def _load_or_create_config(self):
        """ตั้งค่าโฟกัสดาวเทียมยอดฮิต 3 ดวง (ISS, SO-50, IO-86)"""
        default_config = {
            "spu_ground_station": {
                "name": "SPU SATELLITE OPERATIONS CENTER",
                "latitude": 13.8580,
                "longitude": 100.5875,
                "elevation_m": 15
            },
            "targets": [
                { "name": "ISS", "norad_id": 25544, "type": "Space Station" },
                { "name": "SO-50", "norad_id": 27607, "type": "FM Repeater" },
                { "name": "IO-86", "norad_id": 40931, "type": "FM/APRS" }
            ]
        }
        
        os.makedirs(os.path.dirname(self.config_path), exist_ok=True)
        
        # บังคับเขียนไฟล์ทับเพื่ออัปเดตเป็น 3 ดวงนี้
        with open(self.config_path, 'w', encoding='utf-8') as f:
            json.dump(default_config, f, indent=4)
            
        return default_config

    def update_tle(self):
        print("[System] Downloading TLE Data from CelesTrak... (Please wait)")
        try:
            stations_url = 'https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle'
            amateur_url = 'https://celestrak.org/NORAD/elements/gp.php?GROUP=amateur&FORMAT=tle'
            
            sats_stations = load.tle_file(stations_url)
            sats_amateur = load.tle_file(amateur_url)
            
            all_sats = sats_stations + sats_amateur
            for sat in all_sats:
                self.satellites_data[sat.model.satnum] = sat
                
            print(f"[System] TLE Update Complete. Loaded {len(self.satellites_data)} satellites.")
        except Exception as e:
            print(f"[Error] Failed to load TLE: {e}")

    def get_tracking_info(self):
        t = self.ts.now()
        results = []
        for target in self.config['targets']:
            norad_id = target['norad_id']
            if norad_id in self.satellites_data:
                sat = self.satellites_data[norad_id]
                difference = sat - self.station
                topocentric = difference.at(t)
                
                alt, az, distance = topocentric.altaz()
                subpoint = sat.at(t).subpoint()
                
                results.append({
                    "name": target['name'],
                    "norad_id": norad_id,
                    "type": target['type'],
                    "latitude": subpoint.latitude.degrees,
                    "longitude": subpoint.longitude.degrees,
                    "altitude_km": subpoint.elevation.km,
                    "azimuth": az.degrees,
                    "elevation": alt.degrees,
                    "range_km": distance.km,
                    "is_visible": alt.degrees > 0
                })
        return results