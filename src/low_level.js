// Process data
d3.csv('data/routes.csv', function (error, data) {
    if (error) {
        console.log(error)
    }
    low_level('#low_level', data)
});

function low_level(selector, data) {
    var flights = [],
        airports = [];

    flights = data.map(function (flight) {
        return {
            airline: flight.airline,
            airlineID: flight.airline ID,
            source: flight.source airport,
            srcID: flight.source airport id,
            des: flight.destination airpoert,
            desID: flight.destination airport id,
            coshare: flight.coshare,
            stops: flight.stops,
            equipment: flight.equipment
        };
    });
}
