import { School } from './School';
import { schools } from '../data';
import { City, Geo } from '../Cities';
import { CitiesController } from '../Cities/CitiesController';
import haversine from 'haversine';

type SchoolLookup = { [huddleId: string]: School };
type SchoolsByKeyword = { [keyword: string]: School[] };

console.info(`Converting list...`);
const schoolList: School[] = (() => {
  const jSchools = JSON.parse(JSON.stringify(schools));
  const result: School[] = [];
  for (let school of jSchools) {
      result.push(school);
  }
  return result;
})();

const citiesController = new CitiesController();

let schoolMap: SchoolLookup = {};
let schoolsByKeyword: SchoolsByKeyword = {};
let allKeywordSet = new Set<string>();
//let count = 0;

console.info(`Generating keywords...`);
schoolList.forEach( (school: School) => {
  //console.log(`processing school ${school.huddleId}   ${count++}`);
  //const percent = Number((count++ / schoolList.length * 100).toFixed(2));
  //if (percent === Math.floor(percent)) console.log(`${percent}`);
  schoolMap[school.huddleId] = school;
  GetKeywords(school)
    .then(keywords => {
      keywords.forEach(kw => {
        let schools: School[] = schoolsByKeyword[kw] || [];
        schools.push(school);
        schoolsByKeyword[kw] = schools;
      });
    });
});

function NormalizeSplitFilter(s: string): string[] {
  //console.debug(`NormalizeSplitFilter(s: ${typeof s} = "${s}")`);
  const forcedString = `${s}`;
  try {
    return forcedString.toUpperCase().split(' ').filter(s=>s!=='');
  } catch (e) {
    let message = 'shrug';

    if (typeof e === 'string') {
      message = e;
    } else if (e instanceof Error) {
      message = e.message;
    }

    console.error(`s is ${typeof s} ${message}`);
  }

  return [];
}

async function GetKeywords(school: School): Promise<string[]> {
  const schoolKeywords = new Set<string>();

  NormalizeSplitFilter(school.huddleId).forEach(s=>schoolKeywords.add(s));
  NormalizeSplitFilter(school.name).forEach(s=>schoolKeywords.add(s));
  NormalizeSplitFilter(school.mascot ?? '').forEach(s=>schoolKeywords.add(s));
  NormalizeSplitFilter(school.county ?? '').forEach(s=>schoolKeywords.add(s));
  NormalizeSplitFilter(school.city ?? '').forEach(s=>schoolKeywords.add(s));
  NormalizeSplitFilter(school.state ?? '').forEach(s=>schoolKeywords.add(s));

  let city: City | null;

  if (school.zipCode) {
    //console.log(`school has a zip code: ${school.zipCode}`);
    schoolKeywords.add(school.zipCode);
    city = await citiesController.getCity(school.zipCode!);
  } else if (school.latitude && school.longitude) {
    //console.log(`school has coords`);
    city = (await citiesController.getClosestCitiesGeo(school.latitude!, school.longitude!, 50))[0];
  } else {
    city = null;
  }

  if (city) {
    //console.log(`generating city keywords`);
    NormalizeSplitFilter(city.county ?? '').forEach(s=>schoolKeywords.add(s));
    NormalizeSplitFilter(city.name ?? '').forEach(s=>schoolKeywords.add(s));
    NormalizeSplitFilter(city.state ?? '').forEach(s=>schoolKeywords.add(s));
    NormalizeSplitFilter(city.zip_code ?? '').forEach(s=>schoolKeywords.add(s));
  }

  const keywords: string[] = [...schoolKeywords];
  keywords.forEach(kw=>allKeywordSet.add(kw));

  return keywords;
}

export class SchoolsService {
  public get(huddleId: string): School | null {
    const school = schoolMap[huddleId];
    return school ? school : null;
  }

  public search(terms: string[], geo: Geo | null): School[] {
    let schoolsSet = new Set<School>();

    allKeywordSet.forEach(kw => {
      terms.forEach(t => {
        // match the term to the keyword
        if (kw.startsWith(t.toUpperCase())) {
          // get the array of schools for the kw match, add each (m)atching (s)chool to the set
          schoolsByKeyword[kw].forEach(ms=>schoolsSet.add(ms));
        }
      });
    });

    let schools = [...schoolsSet];
    const distanceMap: { [huddleId: string]: number } = {};

    if (geo) {
      console.log(`calculating distances to ${JSON.stringify(geo)}`);
      schools.forEach(school => {
        const dist = haversine(geo, {latitude:school.latitude!, longitude:school.longitude!}, {"unit": "mile"});
        //if (isNaN(dist)) return;
        //console.log(`${JSON.stringify(school)} dist: ${dist}`);
        if (dist) distanceMap[school.huddleId] = dist;
      });

      console.debug(`distanceMap: ${JSON.stringify(distanceMap)}`);

      schools = schools.sort((a: School, b: School) => {
        const adist = distanceMap[a.huddleId];
        const bdist = distanceMap[b.huddleId];
        console.log(`sort   ${JSON.stringify({a: a.huddleId, b: b.huddleId, adist: adist, bdist: bdist})}`);

        if (!adist || !bdist) return Number.POSITIVE_INFINITY;

        return adist - bdist;
      });
    }

    let count = 0;
    schools = schools.filter(() => count++ < 20);

    return schools;
  }
};
