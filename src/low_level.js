// Process data
d3.queue()
    .defer(d3.csv, 'data/test_data.csv')
    .defer(d3.csv, 'data/airport_supplement.csv')
    .defer(d3.csv, 'data/all_airports.csv')
    .await(function (error, flight, ap_supt, all_ap){
        if (error) {
            console.log(error)
        }
        low_level('#low_level', flight, ap_supt, all_ap)
    });

// Build flights data
function BuildData(flight, ap_supplement, all_ap) {
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
                    flight: [f]
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
                            flight: [f]
                        };
                        airports[i].out_edges.push(edge_tmp);
                        airports[i].out_edge_dic.push(f.al_des);
                    }
                    // Existing edge, just need to update
                    else {
                        airports[i].out_edges.forEach(function (edge) {
                            if (edge.edge_des === f.al_des) {
                                edge.flight.push(f);
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
                    flight: [f]
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
                            flight: [f]
                        };
                        airports[i].in_edges.push(edge_tmp);
                        airports[i].in_edge_dic.push(f.al_src);
                    }

                    // Existing edge, just need to update
                    else {
                        airports[i].in_edges.forEach(function (edge) {
                            if (edge.edge_src === f.src) {
                                edge.flight.push(f);
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
            airport.latitude = +search_ap[0].latitude;
            airport.longitude = +search_ap[0].longitude;
            airport.altitude = +search_ap[0].altitude;
        } else {
            for (var i = 0; i < all_ap.length; i++) {
                if (airport.code === all_ap[i].gps_code ||
                    airport.code === all_ap[i].iata_code ||
                    airport.code === all_ap[i].local_code) {

                    airport.name = all_ap[i].name;
                    airport.country = all_ap[i].iso_country;
                    airport.latitude = +all_ap[i].latitude_deg;
                    airport.longitude = +all_ap[i].longitude_deg;
                    airport.altitude = +all_ap[i].elevation_ft;
                    break;
                }
            }
        }
    });
    return airports;
}

function low_level(selector, flight, ap_supplement, all_ap) {

    var airports = BuildData(flight, ap_supplement, all_ap);
    // console.log('airport', airports);

    var height = 750,
        width = 1500,
        padding = {top: 20, left: 20,
            right: 20, bottom: 20 };

    var svg = d3.selectAll(selector).append('svg')
        .attr('id', 'low_svg')
        .attr('width', width)
        .attr('height', height);

    var longitudeScale = d3.scaleLinear()
        .domain([-180.0, 180.0])
        .range([0, width - padding.left - padding.right]);

    var latitudeScale = d3.scaleLinear()
        .domain([-90, 90])
        .range([height - padding.top - padding.bottom, 0]);

    airports.forEach(function (ap) {
        if (ap.latitude !== undefined && ap.longitude !== undefined) {
            ap.x = +longitudeScale(ap.longitude);
            ap.y = +latitudeScale(ap.latitude);
        } else {
            ap.x = 0;
            ap.y = 0;
        }
    });



    // Draw select window
    function rect(x, y, w, h) {
        return "M"+[x,y]+" l"+[w,0]+" l"+[0,h]+" l"+[-w,0]+"z";
    }

    var selection = svg.append("path")
        .attr("class", "selection")
        .attr("visibility", "visible");

    var startSelection = function(start) {
        selection.attr("d", rect(start[0], start[0], 0, 0))
            .attr("visibility", "visible")
            .attr('fill-opacity', '0')
            .attr('stroke', 'red')
            .attr('stroke-width', 3)
            .attr('stroke-width', 3);
    };

    var moveSelection = function(start, moved) {
        selection.attr("d", rect(start[0], start[1], moved[0]-start[0], moved[1]-start[1]));
    };

    var endSelection = function(start, end) {
        //selection.attr("visibility", "hidden");
    };

    svg.on("mousedown", function() {
        // Clear previous selected nodes;
        d3.selectAll('.selected').remove('*');
        d3.selectAll('.link').remove('*');
        var subject = d3.select(window),
            parent = this.parentNode,
            start = d3.mouse(parent);
        startSelection(start);
        subject
            .on("mousemove.selection", function() {

                moveSelection(start, d3.mouse(parent));
            })
            .on("mouseup.selection", function() {
                selectNode(start[0], start[1], d3.mouse(parent)[0], d3.mouse(parent)[1]);
                endSelection(start, d3.mouse(parent));
                subject.on("mousemove.selection", null).on("mouseup.selection", null);
            });
    });


    var dots = svg.selectAll('.dot').data(airports)
        .enter().append('circle')
        .attr('class', 'dot')
        .attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; })
        .attr('r', 2);

    //console.log(dots);


    function selectNode(x1, y1, x2, y2) {

        var selected_ap = airports.filter(function(d) {
            return d.x > x1 && d.x < x2 &&
                d.y > y1 && d.y && d.y < y2
        });

        var sd = svg.selectAll('.selected')
            .data(selected_ap)
            .enter().append('circle')
            .classed('selected', true)
            .attr('cx', function (d) { return d.x; })
            .attr('cy', function (d) { return d.y; })
            .attr('r', 2)
            .attr('fill', 'red');
        console.log(sd)

        // Build links between nodes
        var links = [],
            len = selected_ap.length;
        selected_ap.forEach(function (ap) {
            var i = 0;
            ap.out_edges.forEach(function (out_edge) {
                for (i = 0; i < len; i++) {
                    if (airports[i].code === out_edge.edge_des) {
                        out_edge.des_x = airports[i].x;
                        out_edge.des_y = airports[i].y;
                        break;
                    }
                }
                var xs = out_edge.des_x, ys = out_edge.des_y,
                    xe = ap.x, ye = ap.y,
                    ctg = 1;
                links = svg.append('path')
                    .classed('link', true)
                    .attr('d', 'M '+ xe +' '+ ye +' '
                        + 'Q' + ' ' + ((ctg*xs+ctg*xe+ctg*ye-ys)/(ctg+ctg)) + ' '
                        + ((ctg*ys+ctg*ye+ctg*xs-xe)/(ctg+ctg) +' '+ xs + ' ' + ys))
                    .attr('stroke', 'red')
                    .attr('stroke-width', 1)
                    .attr('fill', 'none')
                    .attr('opacity', 0.3)
                    .attr('visibility', 'visible');
                //console.log(links)

            })
        })
    }




}
