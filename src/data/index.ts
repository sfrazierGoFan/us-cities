import { CityCity } from '../Cities/City';
import { School } from '../Schools/School';
import CITY_DATA from './us_cities.json';
import SCHOOL_DATA from './schools.json';

const cities: CityCity[] = CITY_DATA.cities;
export { cities };

const schools: School[] = SCHOOL_DATA.schools;
export { schools };
