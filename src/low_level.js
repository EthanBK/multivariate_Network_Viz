// Process data
d3.csv('data/test_data.csv', function (error, data) {
    if (error) {
        console.log(error)
    }
    low_level('#low_level', data)
});

function low_level(selector, data) {
    var flights,
        airports = [];


    // Build flights data
    // flights consists of all the flights information
    var airport_dic = [];
    flights = data.map(function (flight) {
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
                name: f.al_src,
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
                out_airlines: [f.al_name],
                num_out_airline: 1,
                // record in and out separately
                in_edges: [],
                in_edge_dic: [],
                in_airlines: [],
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
                if (airports[i].al_name === f.al_src) {
                    airports[i].airline.push(f);
                    airports[i].num_airline += 1;
                    // a new edge. Create a new edge and push
                    if (airports[i].out_edge_dic.indexOf(f.al_des) < 0) {
                        // new edge
                        var edge_tmp = {
                            link_with: f.al_des,
                            num_link: 1,
                            flight: [f.al_name]
                        };
                        airports[i].out_edges.push(edge_tmp);
                        airports[i].out_edge_dic.push(f.al_des);
                    }

                    // Existing edge, just need to update
                    else {
                        airports[i].out_edges.forEach(function (edge) {
                            if (edge.link_with === f.al_des) {
                                edge.num_link += 1;
                                edge.flight.push(f.airline);
                            }
                        });
                    }
                    break;
                }
            }
        }

        // build or update al_des airport, basic the same for src airport
        if (airport_dic.indexOf(f.al_desID) < 0) {
            ap_temp = {
                al_name: f.al_des,
                al_id: f.al_desID,
                out_edges: [],
                out_edge_dic: [],
                in_edges: [{
                    link_with: f.al_des,
                    num_link: 1,
                    flight: [f.airline]
                }],
                in_edge_dic: [f.al_src],
                airlines: [f.airline],
                num_airline: 1
            };
            airports.push(ap_temp);
            airport_dic.push(f.al_des);
        }
        else {
            num_ap = airports.length;
            for (i = 0; i < num_ap; i++) {
                airports[i].in_airlines.push(f);
                airports[i].num_in_airline += 1;
                // update edge or create a new edge
                if (ap === f.al_des) {
                    // a new edge. Create a new edge and push
                    if (ap.in_edge_dic.indexOf(f.al_src) < 0) {
                        // new edge
                        edge_tmp = {
                            link_with: f.al_src,
                            num_link: 1,
                            flight: [f.airline]
                        };
                        ap.in_edges.push(edge_tmp);
                        ap.in_edge_dic.push(f.al_des);
                    }

                    // Existing edge, just need to update
                    else {
                        ap.in_edges.forEach(function (edge) {
                            if (edge.link_with === f.src) {
                                edge.num_link += 1;
                                edge.flight.push(f.airline);
                            }
                        });
                    }
                }
            }
        }
    });
    // console.log('flight', flights);
    console.log('airport', airports);
    // airport_dic.sort(function (a, b) {
    //     if (isNaN(a)) return -1;
    //     if (isNaN(b)) return 1;
    //     else {
    //         return a - b;
    //     }
    // });
}
