import { School } from './School';
import { SchoolsService } from './SchoolsService';
import { Geo } from '../Cities';

export class SchoolsController {
  public async getSchool(huddleId: string): Promise<School | null> {
    return new SchoolsService().get(huddleId);
  }

  public async searchSchools(terms: string[], geo: Geo | null): Promise<School[] | string> {
    console.log(`terms: ${terms}`);
    return new SchoolsService().search(terms, geo);
  }
}
