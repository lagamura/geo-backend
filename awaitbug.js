const Tournaments = []


async function getTournament(url, tourName) {

    try {
        const response = await new Promise((resolve) => {
            setTimeout(() => resolve("1"))
        });

    }
    catch (error) {
        console.error(error)
    }
    return (5)

}

for (let i = 0; i < 10; i++) {
    const res = await getTournament()
    Tournaments.push(res)

}
console.log(Tournaments)