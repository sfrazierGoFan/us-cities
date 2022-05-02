
export interface City {
    zip_code: string;
    county?: string;
    name: string;
    state: string;
    latitude: number;
    longitude: number;
    distance?: number;
}

export interface CityCity {
    zip_code: string;
    county?: string;
    city: string;
    state: string;
    latitude: number;
    longitude: number;
    distance?: number;
}

export function CCtoC(cc: CityCity): City {
    const city: City = {name: cc.city, ...cc};
    return city;
}

export type Geo = {latitude:number,longitude:number};
