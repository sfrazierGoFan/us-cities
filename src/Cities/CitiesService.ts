import { CCtoC, City } from './City';
import haversine from 'haversine';
import { cities as ccities } from '../data';

type CityLookup = { [zip: string]: City };

const cityList: City[] = (() => {
    const jCities = JSON.parse(JSON.stringify(ccities));
    const result: City[] = [];
    let k: string;
    for (k in jCities) {
        let i: number = parseInt(k);
        let c: City = CCtoC(ccities[i]);
        result.push(c);
    }

    return result;
})();

const cityMap: CityLookup = (() => {
    let lookup: CityLookup = {};
    cityList.forEach( (city: City) => {
        let zip: string = `${city.zip_code}`.padStart(5, '0');
        city.zip_code = zip;
        lookup[zip] = city
    });
    return lookup;
})();

export interface Proximity {
    lat?: number;
    lng?: number;
    zip?: string;
    distance: number;
}

export interface CityQuery {
    proximity?: Proximity;
    name?: string;
};

export class CitiesService {
    public get(zip: string): City | null {
        return cityMap[zip] || null;
    }

    public find(query: CityQuery): City[] {
        let results: City[] = [];

        if (query.proximity) {
            const dist = query.proximity!.distance!;
            if (query.proximity.zip) {
                const myCity = cityMap[query.proximity.zip!];
                results = cityList
                    .filter( city => {
                        city.distance = haversine(myCity, city);
                        return city.distance <= dist;
                    })
                    .filter( city => city.zip_code !== myCity.zip_code)
                    .sort((a, b) => parseInt(a.zip_code) - parseInt(b.zip_code));
            } else if (query.proximity.lat && query.proximity.lng) {
                const lat = query.proximity!.lat!
                const lng = query.proximity!.lng!
                results = cityList
                    .filter( city => {
                        city.distance = haversine({latitude: lat, longitude: lng}, city);
                        return city.distance <= dist;
                    })
                    .sort((a, b) => a.distance! - b.distance!);
            }
        }

        if (results.length === 0 && query.name) {
            results = cityList.filter(city => city.name.startsWith(query.name!));
        }

        return results;
    }
};
