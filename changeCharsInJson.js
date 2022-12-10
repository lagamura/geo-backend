// let GreekCities = require("./gr.json")
import cities from './cities.json' assert {type: 'json'}
import fs from 'fs'
import axios from 'axios'
import cheerio from 'cheerio'



let countriesFide = []

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

function traversereplacer() {
    for (let obj of cities) {
        // console.log(obj)
        traverse(obj, replaceChars)
    }
}

// console.log(GreekCities)

let data = JSON.stringify(cities);
fs.writeFileSync('cities.json', data);


export async function test_scrapper(url) {
    const Tournaments = []

    const ObjFields = {
        2: 'name',
        3: 'location',
        4: 'system',
        5: 'startingDate',
        6: 'linkInfo'
    }

    if (url == undefined) {
        url = "https://ratings.fide.com/tournament_list.phtml"
    }
    try {
        const response = await axios.get(url, {
            headers: {
                "Accept-Encoding": null
            }
        });
        const body = await response.data;
        let $ = cheerio.load(body);

        let tbrow = $('select[id=country]')

        tbrow.children('option').each(function (i, el) {
            countriesFide.push($(el).text())
        })
    }
    catch (error) {
        console.error(error)
    }
    console.log(countriesFide);
}

test_scrapper()


