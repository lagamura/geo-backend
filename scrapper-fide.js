import cheerio from 'cheerio'
import axios from 'axios'
import express, { json } from 'express';
import greekCities from './countrycities/greekCities.json' assert {type: 'json'};
import tournaments from './tournaments.json' assert {type: 'json'};
import slim3countries from './slim3countries.json' assert { type: 'json' };
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors'
import fs from 'fs'
import cron from 'node-cron';
import nodemailer from 'nodemailer'
import multer from 'multer'


var corsOptions = {
    origin: 'https://www.geochess.eu/',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

const PORT = 8000;
const app = express()
app.use(cors());
app.use(helmet())
app.use(compression()); // Compress all routes
// app.use(express.json());
let countermapped = 0;
let countermappedPlusNom = 0;
// const cors = require('cors');


app.listen(PORT, () => console.log(`server running on PORT ${PORT}`))

app.get('/tournaments', async (req, res) => {
    // const Tournaments = await main()

    res.json(tournaments)
})

// END --- express config --- //

//Globals Start

const urls = ['GRE', 'BUL', 'ROU', 'MKD', 'ALB']


// CountryJson = new Map()


async function fetchFideTours(url) {

    if (url == undefined) {
        url = "https://ratings.fide.com/tournament_list.phtml?country=GRE"
    }
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
        const response = await axios.get(url, {
            headers: {
                "Accept-Encoding": null
            }
        });
        const body = await response.data;
        let $ = cheerio.load(body);


        const tbrow = $('tr > td > b').filter(function () {
            return $(this).text().trim() === 'PGN';
        })

        // let tbody = (tbrow.parent().parent().parent().text())
        const table = (tbrow.closest('tbody'))
        if (table.html() == null) {
            console.log("Fide page changed html structure")
            return (false)
        }
        // console.log(table)
        // document.querySelector("#main-col > table:nth-child(2) > tbody > tr:nth-child(3) > td > table:nth-child(10) > tbody")
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


function mapLoLa(Tour, CountryCities) {
    let LatLon = null
    for (let cityObj of CountryCities) {
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



export async function main() {
    countermapped = 0;
    countermappedPlusNom = 0;
    const Tournaments = []
    for (let url of urls) {
        let tours = await fetchFideTours(`https://ratings.fide.com/tournament_list.phtml?country=${url}`)
        for (const tour of tours) {
            Tournaments.push(tour)
        }
    }
    // console.log(Tournaments)
    if (!Tournaments) {
        console.log("Abort...Tournaments from scrapping Error")
        return;
    }
    for (let Tour of Tournaments) {

        if (mapLoLa(Tour, greekCities)) {

        }
        else {
            // console.log("Not found teri: " + Tour.location)
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search/${Tour.location}?` +
                new URLSearchParams({
                    format: "json",
                    countrycodes: "gr,bg,ro,mk",
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
    if (Tournaments.length > 1) {
        let data = JSON.stringify(Tournaments);
        fs.writeFileSync('tournaments.json', data);
    }
    // return (Tournaments)
    return ('success') // for testing purposes
}

//cron job scheduler
cron.schedule(`0 0 * * *`, async () => {
    main();
});

// app.get('/contact', (req, res) => {
//     // res.render('contact.html');
//     res.json(req.body);

// });


app.post('/contact', multer().none(), (req, res) => {
    // console.log('request body: ', req.body)
    const parsedData = JSON.stringify(req.body)
    // console.log(parsedData)
    // https://miracleio.me/snippets/use-gmail-with-nodemailer/ 
    // https://codex.so/handling-any-post-data-in-express

    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'stelioslagaras@gmail.com',
            pass: 'nzlmbdwqnacykccr',
        }
    });

    const mailOptions = {
        from: req.body.name,
        to: 'stelioslagaras@gmail.com',
        subject: 'Geochess Contact Form',
        text: `Name:${req.body.name} --- Message:${req.body.inputMessage}`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
            // do something useful
        }
    });

    res.send({ status: 'SUCCESS' });

})

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
        url = "https://ratings.fide.com/tournament_list.phtml?country=BUL"
    }
    try {
        const response = await axios.get(url, {
            headers: {
                "Accept-Encoding": null
            }
        });
        const body = await response.data;
        let $ = cheerio.load(body);

        let tbrow = $('tr > td > b').filter(function () {
            return $(this).text().trim() === 'PGN';
        })

        // let tbody = (tbrow.parent().parent().parent().text())
        let tbody = (tbrow.closest('tbody'))
        // console.log(tbody.text())
        // console.log('-------------')
        // tbody = (tbrow.parent().parent().parent().text())
        // console.log(tbody)

        tbody.children('tr').each(function (i, el) {
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

