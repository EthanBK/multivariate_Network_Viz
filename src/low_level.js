// Process data
d3.queue()
    .defer(d3.csv, 'data/test_data.csv')
    .defer(d3.csv, 'data/airport_supplement.csv')
    .await(function (error, flight, ap_supt){
        if (error) {
            console.log(error)
        }
        low_level('#low_level', flight, ap_supt)
    });

// Build flights data
function BuildData(flight, ap_supplement) {
    var flights,
        airports = [],
        airport_dic = [];
    // flights consists of all the flights information
    flights = flight.map(function (flight) {
        return {
            al_name: flight.airline,
            al_id: +flight.airline_ID,
            al_src: flight.source_airport,
            al_srcID: +flight.source_airport_id,
            al_des: flight.destination_airport,
            al_desID: +flight.destination_airport_id,
            coshare: flight.coshare,
            stops: +flight.stops,
            equipment: flight.equipment
        };
    });

    // Build airport data
    flights.forEach(function (f) {
        // build or update al_src airport

        // al_src airport not in the dic.
        if (airport_dic.indexOf(f.al_src) < 0) {
            var ap_temp = {
                code: f.al_src,
                id: f.al_srcID,
                // edges is a list of dictionary consists
                // of all airports connected with this airport.
                // out_edges and in_edges.
                out_edges: [{
                    edge_des: f.al_des,
                    edge_desId: f.al_desID,
                    num_link: 1,
                    flight: [f.al_name]
                }],
                out_edge_dic: [f.al_des],
                num_out_airline: 1,
                // record in and out separately
                in_edges: [],
                in_edge_dic: [],
                num_in_airline: 0
            };
            airports.push(ap_temp);
            airport_dic.push(f.al_src);
        }

        // Existing airport, add this flight
        else {
            var num_ap = airports.length;
            for (var i = 0; i < num_ap; i++) {
                // update edge or create a new edge
                if (airports[i].code === f.al_src) {
                    airports[i].num_out_airline += 1;
                    // a new edge. Create a new edge and push
                    if (airports[i].out_edge_dic.indexOf(f.al_des) < 0) {
                        // new edge
                        var edge_tmp = {
                            edge_des: f.al_des,
                            edge_desId: f.al_desID,
                            num_link: 1,
                            flight: [f.al_name]
                        };
                        airports[i].out_edges.push(edge_tmp);
                        airports[i].out_edge_dic.push(f.al_des);
                    }
                    // Existing edge, just need to update
                    else {
                        airports[i].out_edges.forEach(function (edge) {
                            if (edge.edge_des === f.al_des) {
                                edge.num_link += 1;
                                edge.flight.push(f.al_name);
                            }
                        });
                    }
                    break;
                }
            }
        }

        // build or update al_des airport, basic the same for src airport
        if (airport_dic.indexOf(f.al_des) < 0) {
            ap_temp = {
                code: f.al_des,
                id: f.al_desID,
                out_edges: [],
                out_edge_dic: [],
                num_out_airline: 0,
                in_edges: [{
                    edge_src: f.al_src,
                    edge_srcId: f.al_srcID,
                    num_link: 1,
                    flight: [f.al_name]
                }],
                in_edge_dic: [f.al_src],
                num_in_airline: 1
            };
            airports.push(ap_temp);
            airport_dic.push(f.al_des);
        }
        else {
            num_ap = airports.length;
            for (i = 0; i < num_ap; i++) {
                // update edge or create a new edge
                if (airports[i].code === f.al_des) {
                    airports[i].num_in_airline += 1;
                    // a new edge. Create a new edge and push
                    if (airports[i].in_edge_dic.indexOf(f.al_src) < 0) {
                        // new edge
                        edge_tmp = {
                            edge_src: f.al_src,
                            edge_srcId: f.al_srcID,
                            num_link: 1,
                            flight: [f.al_name]
                        };
                        airports[i].in_edges.push(edge_tmp);
                        airports[i].in_edge_dic.push(f.al_des);
                    }

                    // Existing edge, just need to update
                    else {
                        airports[i].in_edges.forEach(function (edge) {
                            if (edge.edge_src === f.src) {
                                edge.num_link += 1;
                                edge.flight.push(f.al_name);
                            }
                        });
                    }
                    break;
                }
            }
        }
    });
    airports.sort(function (a, b) {
        if (isNaN(a.id)) return -1;
        if (isNaN(b.id)) return 1;
        else {
            return a.id - b.id;
        }
    });
    // add extra airport information
    airports.forEach(function (airport) {
        var search_ap = ap_supplement.filter(function (s) {
            return s.IATA === airport.code || s.ICAO === airport.code
        });
        if(search_ap[0] !== undefined) {
            airport.name = search_ap[0].name;
            airport.country = search_ap[0].country;
            airport.latitude = search_ap[0].latitude;
            airport.longitude = search_ap[0].longitude;
            airport.altitude = search_ap[0].altitude;
        } else {
            airport.name = null;
            airport.country = null;
            airport.latitude = null;
            airport.longitude = null;
            airport.altitude = null;
        }
    });
    return airports;
}

function low_level(selector, flight, ap_supplement) {

    var airports = BuildData(flight, ap_supplement);
    console.log('airport', airports);


}
