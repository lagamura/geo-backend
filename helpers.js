import NOCcode from './NOCcode.json' assert {type: 'json'};
import slim3countries from './slim3countries.json' assert {type: 'json'}
import fs from 'fs'



export function mergejson(slim3countries, NOCcode) {
    for (let country of NOCcode) {
        for (let slimcountry of slim3countries) {
            if (slimcountry.name === country.Country) {
                slimcountry["alpha-2"] = country["ISO code"]
                console.log('changed something')
            }
        }
    }
    let data = JSON.stringify(slim3countries);
    fs.writeFileSync('slim3countries.json', data);
}

mergejson(slim3countries, NOCcode)