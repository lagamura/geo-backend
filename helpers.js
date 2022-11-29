async function addTourMarkers() {
    for (let Tour of Tours) {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search/${Tour.location}?` +
            new URLSearchParams({
                format: "json",
                countrycodes: "gr",
                limit: "1",
            })
        );
        // translate Tour to geodata
        const nominatim = await response.json();
        // add Tour marker
        if (!(Object.keys(nominatim).length === 0)) {
            console.log(nominatim);
            L.marker([nominatim[0].lat, nominatim[0].lon]) //[lat,lon]
                .addTo(map)
                .bindPopup(
                    `${nominatim[0].display_name} \n ----
         ${Tour.name} ----- ${Tour.location} ----- ${Tour.linkInfo}`
                )
                .openPopup();
        }
    }
}