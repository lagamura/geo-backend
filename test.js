// let GreekCities = require("./gr.json")
import cities from './cities.json' assert {type: 'json'}
import fs from 'fs'



function traverse(o, func) {
    o.name = replaceChars(o.name)
}


function replaceChars(CityName) {
    // console.log(`Working with ${CityName}`)
    CityName = CityName.replaceAll('í', 'i')
        .replaceAll('Í', 'I')
        .replaceAll('á', 'a')
        .replaceAll('é', 'e')
        .replaceAll('ó', 'o')
        .replaceAll('ý', 'y')
        .replaceAll('ú', 'u');

    // console.log(`Parsed to ${CityName}`)
    return CityName
}

for (let obj of cities) {
    // console.log(obj)
    traverse(obj, replaceChars)
}

// console.log(GreekCities)

let data = JSON.stringify(cities);
fs.writeFileSync('cities.json', data);