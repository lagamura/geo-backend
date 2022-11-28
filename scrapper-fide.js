const cheerio = require('cheerio')

const axios = require('axios')

const express = require('express');
const e = require('express');
const PORT = 8000;
const app = express()
let countermapped = 0;
let countermappedPlusNom = 0;
// const cors = require('cors');


// app.listen(PORT, () => console.log(`server running on PORT ${PORT}`))

app.get('/tournaments', async (req, res) => {
    const Tours = await fetchFideTours()
    console.log(Tournaments.length - 1)
    res.json(Tours)
})

app.get('/scraptournaments', async (req, res) => {
    const Tours = await fetchFideTours()
    console.log(Tournaments.length - 1)
    res.json(Tours) //send or json?
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
                        if (i == 3) {
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
        if (Tour.location == cityObj.city) {
            Tour.lat = cityObj.lat
            Tour.lon = cityObj.lng
            countermapped++
            LatLon = [Tour.lat, Tour.lon]
            break
        }
    }
    return (LatLon)
}


// import GreekCities from "./gr.json" assert { type: 'json' };

async function main() {
    const greekCities = require('./greekCities.json');
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
                })
            );
            const nominatim = await response.json();
            // add Tour marker
            if (!(Object.keys(nominatim).length === 0)) {
                // console.log(nominatim);
                countermappedPlusNom++
            }
        }
    }
    // console.log(Tournaments)
    console.log(countermapped, '->', countermappedPlusNom + countermapped, "from", Tournaments.length)
}
main();