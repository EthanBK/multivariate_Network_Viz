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
        padding = {top: 40, left: 20,
            right: 20, bottom: 0 };

    var svg = d3.selectAll(selector).append('svg')
        .attr('id', 'low_svg')
        .attr('width', width)
        .attr('height', height)
        .style('background', '#131410');

    var longitudeScale = d3.scaleLinear()
        .domain([-180.0, 180.0])
        .range([0, width - padding.left - padding.right]);

    var latitudeScale = d3.scaleLinear()
        .domain([-90, 90])
        .range([height - padding.top - padding.bottom + 40, 40]);

    airports.forEach(function (ap) {
        if (ap.latitude !== undefined && ap.longitude !== undefined) {
            ap.x = +longitudeScale(ap.longitude);
            ap.y = +latitudeScale(ap.latitude);
        } else {
            ap.x = 0;
            ap.y = 0;
        }
    });

    var selection = null,
        selection_color = null,
        randomColor = null,
        win_id = 0;

    // a random color generator to get get color for selection win.
    var getColor = d3.scaleLinear()
        .domain([0, 0.5, 1.0])
        .range(['#fc2b30', '#3f99d1', '#64be5c']);


    var startSelection = function(start) {
        // Set window and node color of this selection.
        selection_color = getColor(Math.random());
        randomColor = "hsl(" + Math.random() * 360 + ",100%,50%)";


        selection = svg.append("rect")
            .attr("class", "selection"+win_id)
            .attr("visibility", "visible")
            .attr('selection_id', win_id);

        selection
            .attr('x', start[0])
            .attr('y', start[1])
            .attr('width', 0)
            .attr('height', 0)
            .attr("visibility", "visible")
            .attr('fill-opacity', '0')
            //.attr('stroke', selection_color)
            .attr('stroke', randomColor)
            .attr('stroke-width', 3)
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));
        win_id += 1;
    };

    var moveSelection = function(start, moved) {
        selection
            .attr('width', moved[0]-start[0])
            .attr('height', moved[1]-start[1] )
    };

    var endSelection = function(selection_color, start, end) {
        SelectionComponentObj.addSelection(selection_color);
        // selection.attr("visibility", "hidden");
    };

    svg.on("mousedown", function() {
        var subject = d3.select(window),
            parent = this.parentNode,
            start = d3.mouse(parent);
        startSelection(start);
        subject
            .on("mousemove.selection", function() {
                moveSelection(start, d3.mouse(parent));
            })
            .on("mouseup.selection", function() {
                selectNode(start[0], start[1],
                    d3.mouse(parent)[0], d3.mouse(parent)[1],
                    randomColor, win_id-1);
                subject
                    .on("mousemove.selection", null)
                    .on("mouseup.selection", null);
                endSelection(selection_color, start, d3.mouse(parent));
            });
    });

    // Manipulate selection rect
    function dragstarted() {
        d3.select(this).raise().classed("active", true);
    }

    function dragged() {
        d3.select(this)
            .attr('x', this.x.baseVal.value + d3.event.dx)
            .attr('y', this.y.baseVal.value + d3.event.dy)
    }

    function dragended() {
        d3.select(this).classed("active", false);
        var x1 = +this.getAttribute('x'),
            y1 = +this.getAttribute('y'),
            x2 = +this.getAttribute('x') + this.width.baseVal.value,
            y2 = +this.getAttribute('y') + this.height.baseVal.value;
        deleteDot(x1, y1, x2, y2, this.getAttribute('stroke'), +this.getAttribute('selection_id'));
        selectNode(x1, y1, x2, y2, this.getAttribute('stroke'), +this.getAttribute('selection_id'));
        // deleteDot(x1, y1, x2, y2, this.getAttribute('stroke'));
    }

    var allDots = null;
    var selectedDots = null;

    // Draw all the dots
    allDots = svg.selectAll('.dot').data(airports);

    allDots.enter().append('circle')
        .attr('class', 'dot')
        .attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; })
        .attr('r', 1)
        .attr('fill', 'white');

    // delete dots move out of the selection window
    function deleteDot(x1, y1, x2, y2, color, ID) {
        d3.selectAll("*[class~=link"+ID+"]").remove();
        d3.selectAll('.selected'+ID).remove();
    }


    // Draw dots in the selection window
    function selectNode(x1, y1, x2, y2, color, ID) {

        var selected_ap = airports.filter(function(d) {
            // if (x1 > x2) {
            //     var temp = x2;
            //     x2 = x1;
            //     x1 = temp;
            // }
            // if (y1 > y2) {
            //     temp = y2;
            //     y2 = y1;
            //     y1 = temp;
            // }
            return d.x > x1 && d.x < x2 &&
                d.y > y1 && d.y && d.y < y2
        });

        selectedDots = allDots.data(selected_ap)
            .enter().append('circle')
            .classed('selected'+ID, true)
            .attr('cx', function (d) { return d.x; })
            .attr('cy', function (d) { return d.y; })
            .attr('r', 1)
            .attr('fill', color)
            .exit().remove();

        BuildLinks(x1, y1, x2, y2, color, ID, selected_ap)
    }

    function BuildLinks (x1, y1, x2, y2, color, ID, selected_ap) {
        // Build links between selected nodes
        var links = [];
        selected_ap.forEach(function (ap) {
            // get destination of edges
            ap.out_edges.forEach(function (out_edge) {
                if (out_edge.des_y === undefined) {
                    var len = airports.length;
                    for (var i = 0; i < len; i++) {
                        if (airports[i].code === out_edge.edge_des) {
                            out_edge.des_x = airports[i].x;
                            out_edge.des_y = airports[i].y;
                            break;
                        }
                    }
                }
                // draw 'within' edges
                if (x1 < out_edge.des_x && out_edge.des_x < x2 &&
                    y1 < out_edge.des_y && out_edge.des_y < y2) {
                    drawEdge(out_edge.des_x, out_edge.des_y, ap.x, ap.y, 1,
                        ID, ID, color, undefined);
                }
                // // draw 'out' edges
                // if (out_edge.des_x < x1 || x2 < out_edge.des_x ||
                //     out_edge.des_y < y1 || y2 < out_edge.des_y) {
                //     drawEdge(out_edge.des_x, out_edge.des_y, ap.x, ap.y, 1,
                //      ID, undefined, color, undefined);
                // }

                // draw 'between-out' edges
                for (i = 0; i < win_id; i++) {
                    if (i === +ID) continue;
                    var window = d3.select('.selection'+i);
                    var w_x1 = +window.attr('x'),
                        w_y1 = +window.attr('y'),
                        w_x2 = w_x1 + (+window.attr('width')),
                        w_y2 = w_y1 + (+window.attr('height'));
                    if (w_x1 < out_edge.des_x && out_edge.des_x < w_x2 &&
                        w_y1 < out_edge.des_y && out_edge.des_y < w_y2) {
                        var color2 = window.attr('stroke');
                        drawEdge(out_edge.des_x, out_edge.des_y, ap.x, ap.y, 1,
                            ID, +window.attr('selection_id'), color, color2);
                    }
                }
            });
            ap.in_edges.forEach(function (in_edge) {
                if (in_edge.src_x === undefined) {
                    var len = airports.length;
                    for (var i = 0; i < len; i++) {
                        if (airports[i].code === in_edge.edge_src) {
                            in_edge.src_x = airports[i].x;
                            in_edge.src_y = airports[i].y;
                            break;
                        }
                    }
                }
                // // draw 'in' edges
                // if (in_edge.src_x < x1 || x2 < in_edge.src_x ||
                //     in_edge.src_y < y1 || y2 < in_edge.src_y) {
                //     drawEdge(ap.x, ap.y, in_edge.src_x, in_edge.src_y, 1,
                //              ID, undefined, color, undefined);
                // }

                // Draw 'between-in' edges
                for (i = 0; i < win_id; i++) {
                    if (i === +ID) continue;
                    var window = d3.select('.selection' + i);
                    var w_x1 = +window.attr('x'),
                        w_y1 = +window.attr('y'),
                        w_x2 = w_x1 + (+window.attr('width')),
                        w_y2 = w_y1 + (+window.attr('height'));
                    if (w_x1 < in_edge.src_x && in_edge.src_x < w_x2 &&
                        w_y1 < in_edge.src_y && in_edge.src_y < w_y2) {
                        var color2 = window.attr('stroke');
                        drawEdge(ap.x, ap.y, in_edge.src_x, in_edge.src_y, 1,
                            +window.attr("selection_id"), ID, color2, color, true);
                    }
                }
            })
        });

        // Draw links on given coordinate of the start point (Sx, Sy)
        // and end point (Ex, Ey)
        function drawEdge(Ex, Ey, Sx, Sy, ctg, ID, ID2, c1, c2, IN) {

            links = svg.append('path')
                .attr('d', 'M ' + Sx + ' ' + Sy + ' '
                    + 'Q' + ' ' + ((ctg * Ex + ctg * Sx + ctg * Sy - Ey) / (ctg + ctg)) + ' '
                    + ((ctg * Ey + ctg * Sy + ctg * Ex - Sx) / (ctg + ctg) + ' ' + Ex + ' ' + Ey))
                .attr('fill', 'none')
                .attr('stroke-width', 1)
                .attr('opacity', 0.5);
            // within edges
            if (ID === ID2) {
                links
                    .attr('stroke', c1)
                    .classed('link'+ID, true);
            }
            // background edges
            else if (ID2 === undefined) {
                links
                    .attr('stroke', 'url(#gradient_gray)')
                    .classed('link'+ID, true);
            }
            // from/to other selection windows
            else if (true) {
                var rec_len = Math.max(Math.abs(Ex-Sx),Math.abs(Ey-Sy));
                var X1 = (0.5 + (Sx - Ex)/2/rec_len)*100,
                    X2 = (0.5 - (Sx - Ex)/2/rec_len)*100,
                    Y1 = (0.5 + (Sy - Ey)/2/rec_len)*100,
                    Y2 = (0.5 - (Sy - Ey)/2/rec_len)*100;

                // if (d3.select('.selection' + ID).attr('stroke') !== c1) {
                //     console.log('switch');
                //     var temp = c1;
                //     c1 = c2;
                //     c2 = temp;
                // }
                console.log(c1, c2);
                console.log(ID, ID2);

                var defs = svg.append("defs");
                var gradient = defs.append("svg:linearGradient")
                    .attr("id", "gradient-"+ID+'-'+ID2)
                    .attr("x1", X1+"%")
                    .attr("y1", Y1+"%")
                    .attr("x2", X2+"%")
                    .attr("y2", Y2+"%");
                gradient.append("stop")
                    .attr('class', 'start')
                    .attr("offset", "0%")
                    .attr("stop-color", c1);
                gradient.append("stop")
                    .attr('class', 'end')
                    .attr("offset", "100%")
                    .attr("stop-color", c2);

                links.classed('link' + ID + ' link' + ID2, true)
                    .attr('stroke', 'url(#gradient-'+ID+'-'+ID2+')');
            }
        }
    }
}
