# geo-backend

Geobackend is written in Node js. Its job is to scrapp tournaments from [FIDE website][1], and map them (geolocate) them in latitude-longtitue coordinates.
Every Tournament has a `location` field which is searched in the `greekCities.json` file. If it is not found there, a query in [nominatim api][2]
is send, for further mapping.

Then, every time the front-end askes for `/tournaments` the server repsonse with the `tournaments.json` file. The file should periodically been updated by running the main scrapping process.

[1]: https://ratings.fide.com/tournament_list.phtml?country=GRE
[2]: https://nominatim.org/release-docs/develop/api/Overview/

# how to run function main() for testing purposes

npx run-func scrapper-fide.js main
