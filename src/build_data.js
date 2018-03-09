var fs = require('fs');
var d3 = require('d3');

var flight_str = fs.readFileSync('../data/routes.csv', 'UTF-8');
var ap_supplement_str = fs.readFileSync('../data/airport_supplement.csv', 'UTF-8');
var all_ap_str = fs.readFileSync('../data/all_airports.csv', 'UTF-8');

var flight = str_to_csv(flight_str);
var ap_supplement = str_to_csv(ap_supplement_str);
var all_ap = str_to_csv(all_ap_str);

//console.log(flight[2]);
//console.log(ap_supplement[5]);
//console.log(all_ap[6]);

var airports = BuildData(flight, ap_supplement, all_ap);
var json = JSON.stringify(airports);
fs.writeFile('airports.json', json);

function str_to_csv(str) {
    var csv = [];
    var rows = str.split("\n");
    var header = rows[0].split(',');
    header = header.map(function(e) {
        return e.trim();
    })
    for(var i = 0; i < rows.length; ++i) {
        var row = rows[i].split(',');
        var formatted_row = {}
        for(var n = 0; n < row.length; ++n) {
            formatted_row[header[n]] = row[n];
        }
       csv.push(formatted_row);
    }
    return csv;
}

// Build flights data
function BuildData(flight, ap_supplement, all_ap) {
    var airport_dic = [];
    var airports = [];
    
    var height = 750;
    var width = 1500;
    var padding = {top: 40, left: 20, right: 20, bottom: 0};

    // flights consists of all the flights information
    var flights = flight.map(function (flight) {
        return {
            al_name: flight.airline,
            al_id: +flight.airline_ID,
            al_src: flight.source_airport,
            al_srcID: +flight.source_airport_id,
            al_des: flight.destination_airport,
            al_desID: +flight.destination_airport_id
            //coshare: flight.coshare,
            //stops: +flight.stops,
            //equipment: flight.equipment
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
                            flight: [f.al_name]
                        };
                        airports[i].out_edges.push(edge_tmp);
                        airports[i].out_edge_dic.push(f.al_des);
                    }
                    // Existing edge, just need to update
                    else {
                        airports[i].out_edges.forEach(function (edge) {
                            if (edge.edge_des === f.al_des) {
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
                            flight: [f.al_name]
                        };
                        airports[i].in_edges.push(edge_tmp);
                        airports[i].in_edge_dic.push(f.al_src);
                    }

                    // Existing edge, just need to update
                    else {
                        airports[i].in_edges.forEach(function (edge) {
                            if (edge.edge_src === f.src) {
                                edge.flight.push(f.al_name);
                            }
                        });
                    }
                    break;
                }
            }
        }
    });


    var longitudeScale = d3.scaleLinear()
        .domain([-180.0, 180.0])
        .range([0, width - padding.left - padding.right]);

    var latitudeScale = d3.scaleLinear()
        .domain([-90, 90])
        .range([height - padding.top - padding.bottom + 40, 40]);

    // add extra airport information
    var order = 0;
    airports.forEach(function (airport) {
        var search_ap = ap_supplement.find(function (s) {
            return s.IATA === airport.code ||
                s.ICAO === airport.code
        });
        if (search_ap !== undefined) {
            airport.name = search_ap.name;
            airport.country = search_ap.country;
            airport.latitude = +search_ap.latitude;
            airport.longitude = +search_ap.longitude;
            airport.altitude = +search_ap.altitude;
        } else {
            search_ap = all_ap.find(function (s) {
                return airport.code === s.gps_code ||
                    airport.code === s.iata_code ||
                    airport.code === s.local_code
            });
            if (search_ap !== undefined) {
                airport.name = search_ap.name;
                airport.country = search_ap.iso_country;
                airport.latitude = +search_ap.latitude_deg;
                airport.longitude = +search_ap.longitude_deg;
                airport.altitude = +search_ap.elevation_ft;
            }
        }

        // modify data for undocumented airport;
        if (isNaN(airport.longitude) || isNaN(airport.latitude)) {
            airport.x = 0;
            airport.y = 0;
        } else {
            airport.x = +longitudeScale(airport.longitude);
            airport.y = +latitudeScale(airport.latitude);
        }

        if (isNaN(airport.id)) {
            airport.id = order--;
        }

    });

    airports.sort(function (a, b) {
        if (isNaN(a.id)) return -1;
        if (isNaN(b.id)) return 1;
        else {
            return a.id - b.id;
        }
    });

    // Build coordinate for edges.
    var ap_len = airports.length;
    airports.forEach(function (ap) {
        ap.out_edges.forEach(function (oe) {
            if (!isNaN(oe.edge_desId)) {
                for (var i = 0; i < ap_len; i++) {
                    if (oe.edge_desId === airports[i].id) {
                        oe.des_x = airports[i].x;
                        oe.des_y = airports[i].y;
                        break;
                    }
                }

            }
            else {
                for (i = 0; i < ap_len; i++) {
                    if (oe.edge_des === airports[i].name) {
                        oe.des_x = airports[i].x;
                        oe.des_y = airports[i].y;
                        break;
                    }
                }
            }
        });

        ap.in_edges.forEach(function (ie) {
            if (!isNaN(ie.edge_srcId)) {
                for (var i = 0; i < ap_len; i++) {
                    if (ie.edge_srcId === airports[i].id) {
                        ie.src_x = airports[i].x;
                        ie.src_y = airports[i].y;
                        break;
                    }
                }

            }
            else {
                for (i = 0; i < ap_len; i++) {
                    if (ie.edge_src === airports[i].name) {
                        ie.src_x = airports[i].x;
                        ie.src_y = airports[i].y;
                        break;
                    }
                }
            }
        })
    });
    return airports;
}

