import { City } from './City';
import { CitiesService } from './CitiesService';

export class CitiesController {
    public async getCity(zipCode: string): Promise<City | null> {
        return new CitiesService().get(zipCode);
    }

    public async getClosestCities(zipCode: string, withinRadius: number): Promise<City[]> {
        return new CitiesService().find({proximity: {zip: zipCode, distance: withinRadius}});
    }

    public async getClosestCitiesGeo(lat: number, lng: number, withinRadius: number): Promise<City[]> {
        return new CitiesService().find({proximity: {lat: lat, lng: lng, distance: withinRadius}});
    }
}
