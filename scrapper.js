const cheerio = require('cheerio')

const axios = require('axios')

const express = require('express')
const PORT = 8000;
const app = express()
// const cors = require('cors');


app.listen(PORT, () => console.log(`server running on PORT ${PORT}`))

app.get('/tournaments', async (req, res) => {
    const Tours = await fetchChessRes()
    res.json(Tours)
})

app.get('/scraptournaments', async (req, res) => {
    const Tours = await fetchChessRes()
    res.json(Tours) //send or json?
})

async function fetchChessRes() {

    const baseUrl = "https://chess-results.com/"
    const Urls = new Map()
    const Tournaments = []

    async function getTours() {
        try {
            const response = await axios.get(baseUrl + "fed.aspx?lan=1&fed=GRE");
            const $ = cheerio.load(response.data)
            console.log($.text())
            //const table = $("#F7 > div:nth-child(5) > table > tbody") // this by copy js on dom element
            // console.log(table.html())
            $('tr .GRE').each(function (i, el) {
                const tourName = $(this).find('a').text()
                const tourUrl = $(this).find('a').attr('href')
                if (i < 50) {
                    Urls.set(tourUrl, tourName)
                }
            })
        }
        catch (error) {
            console.error(error)
        }
    }

    async function getTournament(url, tourName) {
        let Tournament = { TourName: tourName }

        try {
            const response = await axios.get(url);
            let $ = cheerio.load(response.data)

            $ = cheerio.load($("#F7 > div:nth-child(2) > table > tbody > tr > td:nth-child(1) > table:nth-child(1)").html(), null, false)
            //

            $('tr ').each(function (i, el) {
                let prop = $(this).find('td:nth-child(1)').text()
                let prop_value = $(this).find('td:nth-child(2)').text()
                prop = prop.replaceAll(' ', '_')
                prop = prop.replaceAll('(', '')
                prop = prop.replaceAll(')', '')
                Tournament[prop] = prop_value
            })
        }
        catch (error) {
            console.error(`ERROR ON:${url}`)
            console.error(error)
        }
        return (Tournament)

    }


    function logMapElements(value, key, map) {
        console.log(`m[${key}] = ${value}`);
    }

    await getTours()

    for (const Url of Urls) { // here maybe forEach is faster but needs special handling with await

        console.log(`visiting:${baseUrl + Url[0] + '&turdet=YES'}`)
        const Tour = await getTournament(baseUrl + Url[0] + '&turdet=YES', Url[1])
        // console.log(Tour)
        Tournaments.push(Tour)
    }
    return(Tournaments)
}


// console.log(Tournaments)




