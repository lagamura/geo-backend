import cheerio from 'cheerio'
import axios from 'axios'
import express, { json } from 'express';
import greekCities from './greekCities.json' assert {type: 'json'}
import tournaments from './tournaments.json' assert {type: 'json'}
import compression from 'compression';
import helmet from 'helmet';

import fs from 'fs'

const PORT = 8000;
const app = express()
app.use(helmet())
app.use(compression()); // Compress all routes
let countermapped = 0;
let countermappedPlusNom = 0;
// const cors = require('cors');
 

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`))

app.get('/api/tournaments', async (req, res) => {
    // const Tournaments = await main()

    res.json(tournaments)
})

async function fetchFideTours() {

    const baseUrl = "https://ratings.fide.com/tournament_list.phtml?country=GRE"
    const Tournaments = []

    // const Urls = new Map()

    const ObjFields = {
        2: 'name',
        3: 'location',
        4: 'system',
        5: 'startingDate',
        6: 'linkInfo'
    }

    console.log("Welcome to GeoChess...")
    try {
        const response = await axios.get(baseUrl, {
            headers: {
                "Accept-Encoding": null
            }
        });
        const body = await response.data;
        let $ = cheerio.load(body);


        let table = $("#main-col > table:nth-child(2) > tbody > tr:nth-child(3) > td > table:nth-child(11) > tbody") // this by copy js on dom element

        table.children('tr').each(function (i, el) {
            if (i > 0) {
                let tour = {}


                // let children = el.children()
                $(this).find('td').each((i, el) => {
                    if (i > 1 && i < 6) {
                        if (i == 3 || i == 5) {
                            tour[ObjFields[i]] = $(el).text().trim()
                        }
                        else {
                            tour[ObjFields[i]] = $(el).text()
                        }
                    }
                    if (i == 6) {
                        tour[ObjFields[i]] = $(el).find('a').attr('href')
                    }
                })
                Tournaments.push(tour)
            }

        })
    }
    catch (error) {
        console.error(error)
    }
    return (Tournaments)

}


function mapLoLa(Tour, GreekCities) {
    let LatLon = null
    for (let cityObj of GreekCities) {
        if ((String(Tour.location).localeCompare(String(cityObj.city), 'en-US', { ignorePunctuation: true, sensitivity: 'base' })) == 0) {
            // console.log(Tour.location," -- matched --", cityObj.city )
            Tour.lat = Number(cityObj.lat)
            Tour.lon = Number(cityObj.lng)
            Tour.region = cityObj.admin_name
            countermapped++
            LatLon = [Tour.lat, Tour.lon]
            break
        }
    }
    return (LatLon)
}


// import GreekCities from "./gr.json" assert { type: 'json' };

async function main() {
    countermapped = 0;
    countermappedPlusNom = 0;
    const Tournaments = await fetchFideTours()
    for (let Tour of Tournaments) {
        if (mapLoLa(Tour, greekCities)) {

        }
        else {
            // console.log("Not found teri: " + Tour.location)
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search/${Tour.location}?` +
                new URLSearchParams({
                    format: "json",
                    countrycodes: "gr",
                    limit: "1",
                    addressdetails: "1",
                    "accept-language": "en-US,en"
                })
            );
            const nominatim = await response.json();

            // add Tour marker
            if (!(Object.keys(nominatim).length === 0)) {
                // console.log(`${Tour.location}<-Mapped->`);
                // console.log(nominatim[0])
                Tour.lat = Number(nominatim[0].lat)
                Tour.lon = Number(nominatim[0].lon)
                countermappedPlusNom++
            }
        }
    }
    // console.log(Tournaments)
    console.log(countermapped, '->', countermappedPlusNom + countermapped, "from", Tournaments.length)
    let data = JSON.stringify(Tournaments);
    fs.writeFileSync('tournaments.json', data);
    return (Tournaments)
}