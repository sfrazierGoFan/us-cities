import { City } from './City';
import haversine from 'haversine';
import { cities } from '../data';

type CityLookup = { [zip: string]: City };

const cityList: City[] = (() => {
    const jCities = JSON.parse(JSON.stringify(cities));
    const result: City[] = [];
    let k: string;
    for (k in jCities) {
        let i: number = parseInt(k);
        let c: City = cities[i];
        result.push(c);
    }

    return result;
})();

const cityMap: CityLookup = (() => {
    let lookup: CityLookup = {};
    cityList.forEach( (city: City) => {
        let zip: string = `${city.zip_code}`.padStart(5, '0');
        city.zip = zip;
        lookup[zip] = city
    });
    return lookup;
})();

export interface Proximity {
    zip: string;
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
            const dist = query.proximity!.distance;
            const myCity = cityMap[query.proximity.zip];
            results = cities
                .filter( city => {
                    city.distance = haversine(myCity, city);
                    return city.distance <= dist;
                })
                .filter( city => city.zip !== myCity.zip)
                .sort((a, b) => parseInt(a.zip) - parseInt(b.zip));
            return results;
        }

        if (query.name) {
            results = cities.filter( city => city.name.startsWith(query.name!));
            return results;
        }

        return results;
    }
};
