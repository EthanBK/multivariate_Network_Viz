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

var height = 750,
    width = 1500,
    padding = {top: 40, left: 20,
    right: 20, bottom: 0 };

var flights,
    airports = [],
    airport_dic = [],
    selections = [],
    num_window = 0;

// Build flights data
function BuildData(flight, ap_supplement, all_ap) {


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

function low_level(selector, flight, ap_supplement, all_ap) {

     var airports = BuildData(flight, ap_supplement, all_ap);
    // console.log('airport', airports);

    // downloadCSV(airports);

    var myJSON = JSON.stringify(airports);
    // var ls = localStorage.setItem("testJSON", myJSON);
    //
    // downloadCSV(myJSON);

    // var text = localStorage.getItem("testJSON");
    // airports = JSON.parse(text);
    // // downloadCSV(ls)
    // //
    //  console.log(airports);



    var svg = d3.selectAll(selector).append('svg')
        .attr('id', 'low_svg')
        .attr('width', width)
        .attr('height', height)
        .style('background', '#131410');


    var selection = null,
        selection_color = null,
        randomColor = null;


    // a random color generator to get get color for selection win.
    var getColor = d3.scaleLinear()
        .domain([0, 0.5, 1.0])
        .range(['#fc2b30', '#3f99d1', '#64be5c']);


    var startSelection = function(start) {
        // Set window and node color of this selection.
        selection_color = getColor(Math.random());
        randomColor = "hsl(" + Math.random() * 360 + ",100%,50%)";


        selection = svg.append("rect")
            .attr("class", "selection"+num_window)
            .attr("visibility", "visible")
            .attr('selection_id', num_window);

        selection
            .attr('x', start[0])
            .attr('y', start[1])
            .attr('width', 0)
            .attr('height', 0)
            .attr("visibility", "visible")
            .attr('fill-opacity', '0')
            .attr('stroke', selection_color)
            //.attr('stroke', randomColor)
            .attr('stroke-width', 3)
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));
        num_window += 1;
    };

    var moveSelection = function(start, moved) {
        selection
            .attr('width', moved[0]-start[0])
            .attr('height', moved[1]-start[1] )
    };

    var endSelection = function(start, end) {

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
                BuildSelection(start[0], start[1],
                    d3.mouse(parent)[0], d3.mouse(parent)[1],
                    selection_color, win_id-1);
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
        BuildSelection(x1, y1, x2, y2, this.getAttribute('stroke'), +this.getAttribute('selection_id'));
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
        // remove all edge classed:
        // 'within_linkID', 'bg_linkID', 'from_linkID', 'to_linkID'
        // --> contains linkID
        d3.selectAll("*[class*=link"+ID+"]").remove();
        d3.selectAll('.selected'+ID).remove();
    }


    // Draw dots in the selection window
    function BuildSelection(x1, y1, x2, y2, color, ID) {

        // Only support make selection window to
        // bottom-right corner
        if (x1 > x2 || y1 > y2) {
            num_window -= 1;
            return;
        }

        // Case 1. Create new selection window
        if (ID >= selections.length) {
            var newSelection = {
                id: ID,
                x1: x1,
                y1: y1,
                x2: x2,
                y2: y2,
                num_ap: 0,
                num_edge_within: 0,
                num_edge_out: 0,
                num_edge_in: 0,
                between: [],
                color: color,
                airport: null
            };

            // create empty sluts in newSelection.between
            // for other selections
            for (var i = 0; i < ID; i++) {
                if (i === ID) break;
                var temp = {
                    id_be: i,
                    num_be_out: 0,
                    num_be_in: 0
                };
                newSelection.between.push(temp)
            }
            selections.push(newSelection);

            // Create new empty slut in 'between' of other
            // existing selections for newSelection
            for (var j = 0; j < ID; j++) {
                if (j === ID) break;
                temp = {
                    id_be: ID,
                    num_be_out: 0,
                    num_be_in: 0
                };
                selections[j].between.push(temp)
            }
        }

        // Case 2. Update selection window ID (Dragging)
        // In this case
        // 0) update selection[ID]'s x,y data;
        // 1) reset selection[ID]'s ap count;
        // 2) reset selection[others].between[ID]'s data
        else {
            selections.forEach(function (selection) {
                if (selection.id === ID) {
                    selection.x1 = x1;
                    selection.x2 = x2;
                    selection.y1 = y1;
                    selection.y2 = y2;
                    selection.num_edge_within = 0;
                    selection.num_edge_out = 0;
                    selection.num_edge_in = 0;
                    selection.airport = null;
                }
                else {
                    selection.between.forEach(function (be) {
                        if (be.id_be === ID) {
                            be.num_be_in = 0;
                            be.num_be_out = 0;
                        }
                    });
                }
            })
        }

        // filter the airports within the selection window
        // from all airports
        var selected_ap = airports.filter(function(d) {
            return d.x > x1 && d.x < x2 &&
                d.y > y1 && d.y && d.y < y2
        });
        selections[ID].num_ap = selected_ap.length;
        selections[ID].airport = selected_ap;
        // todo use kd-tree for fast search

        selectedDots = allDots.data(selected_ap)
            .enter().append('circle')
            .classed('selected'+ID, true)
            .attr('cx', function (d) { return d.x; })
            .attr('cy', function (d) { return d.y; })
            .attr('r', 1)
            .attr('fill', color)
            .exit().remove();

        BuildLinks(ID);
    }

    function BuildLinks (ID) {

        var x1 = selections[ID].x1,
            y1 = selections[ID].y1,
            x2 = selections[ID].x2,
            y2 = selections[ID].y2,
            color = selections[ID].color,
            selected_ap = selections[ID].airport;

        // Build links between selected nodes
        var links = [];
        selected_ap.forEach(function (ap) {
            // get destination of edges
            ap.out_edges.forEach(function (out_edge) {

                // draw 'within' edges
                if (x1 < out_edge.des_x && out_edge.des_x < x2 &&
                    y1 < out_edge.des_y && out_edge.des_y < y2) {
                    selections[ID].num_edge_within ++;
                    drawEdge(out_edge.des_x, out_edge.des_y, ap.x, ap.y, 1,
                        ID, ID, color, undefined);
                }

                // draw 'out' edges
                if (out_edge.des_x < x1 || x2 < out_edge.des_x ||
                    out_edge.des_y < y1 || y2 < out_edge.des_y) {
                    selections[ID].num_edge_out ++;
                    drawEdge(out_edge.des_x, out_edge.des_y, ap.x, ap.y, 1,
                     ID, undefined, color, undefined);
                }

                // draw 'between-out' edges
                for (var i = 0; i < num_window; i++) {
                    if (i === +ID) continue;

                    var window = selections[i];

                    if (window.x1 < out_edge.des_x &&
                        out_edge.des_x < window.x2 &&
                        window.y1 < out_edge.des_y &&
                        out_edge.des_y < window.y2) {

                        selections[ID].between.find(function (value) {
                            return value.id_be === i
                        }).num_be_out ++;
                        selections[i].between.find(function (value) {
                            return value.id_be === ID
                        }).num_be_in ++;

                        var color2 = window.color;
                        drawEdge(out_edge.des_x, out_edge.des_y, ap.x, ap.y, 1,
                            ID, i, color, color2);
                    }
                }
            });
            ap.in_edges.forEach(function (in_edge) {

                /*// draw 'in' edges
                if (in_edge.src_x < x1 || x2 < in_edge.src_x ||
                    in_edge.src_y < y1 || y2 < in_edge.src_y) {
                    selections[ID].num_edge_in ++;
                    drawEdge(ap.x, ap.y, in_edge.src_x, in_edge.src_y, 1,
                             ID, undefined, color, undefined);
                }*/

                // Draw 'between-in' edges
                for (var i = 0; i < num_window; i++) {
                    if (i === +ID) continue;
                    var window = selections[i];
                    if (window.x1 < in_edge.src_x &&
                        in_edge.src_x < window.x2 &&
                        window.y1 < in_edge.src_y &&
                        in_edge.src_y < window.y2) {
                        selections[ID].between.find(function (value) {
                            return value.id_be === i
                        }).num_be_in ++;
                        selections[i].between.find(function (value) {
                            return value.id_be === ID
                        }).num_be_out ++;
                        var color2 = window.color;
                        drawEdge(ap.x, ap.y, in_edge.src_x, in_edge.src_y, 1,
                            i, ID, color2, color, true);
                    }
                }
            })
        });

        // console.log(selections[ID]);

        // Draw links on given coordinate of the start point (Sx, Sy)
        // and end point (Ex, Ey)
        function drawEdge(Dx, Dy, Sx, Sy, ctg, ID, ID2, color1, color2, IN) {

            links = svg.append('path')
                .attr('d', 'M ' + Sx + ' ' + Sy + ' '
                    + 'Q' + ' ' + ((ctg * Dx + ctg * Sx + ctg * Sy - Dy) / (ctg + ctg)) + ' '
                    + ((ctg * Dy + ctg * Sy + ctg * Dx - Sx) / (ctg + ctg) + ' ' + Dx + ' ' + Dy))
                .attr('fill', 'none')
                .attr('stroke-width', 1)
                .attr('opacity', 0.5);
            // within edges
            if (ID === ID2) {
                links
                    .attr('stroke', color1)
                    .classed('within_link'+ID, true);
            }
            // background edges
            else if (ID2 === undefined) {

                if (document.getElementById('gradient_bg'+ID) == null){
                    console.log('no')
                }

                var radialGradient = svg.append("defs")
                    .append("radialGradient")
                    .attr("id", 'gradient_bg'+ID);
                radialGradient.append("stop")
                    .attr("offset", "0%")
                    .attr("stop-color", color1);
                radialGradient.append("stop")
                    .attr("offset", "100%")
                    .attr("stop-color", "#131410");

                links
                    .attr('stroke', 'url(#gradient_bg'+ID+')')
                    .classed('bg_link'+ID, true);
            }
            // todo build background link gradient;

            // from/to other selection windows
            else {
                var rec_len = Math.max(Math.abs(Dx-Sx),Math.abs(Dy-Sy));
                var X1 = (0.5 + (Sx - Dx)/2/rec_len)*100,
                    X2 = (0.5 - (Sx - Dx)/2/rec_len)*100,
                    Y1 = (0.5 + (Sy - Dy)/2/rec_len)*100,
                    Y2 = (0.5 - (Sy - Dy)/2/rec_len)*100;

                // if (d3.select('.selection' + ID).attr('stroke') !== c1) {
                //     console.log('switch');
                //     var temp = c1;
                //     c1 = c2;
                //     c2 = temp;
                // }
                // console.log(c1, c2);
                // console.log(ID, ID2);

                var gradient = svg.append("defs")
                    .append("svg:linearGradient")
                    .attr("id", "gradient-"+ID+'-'+ID2)
                    .attr("x1", X1+"%")
                    .attr("y1", Y1+"%")
                    .attr("x2", X2+"%")
                    .attr("y2", Y2+"%");
                gradient.append("stop")
                    .attr('class', 'start')
                    .attr("offset", "0%")
                    .attr("stop-color", color1);
                gradient.append("stop")
                    .attr('class', 'end')
                    .attr("offset", "100%")
                    .attr("stop-color", color2);

                links
                    .attr('stroke', 'url(#gradient-'+ID+'-'+ID2+')')
                    .classed('from_link' + ID + 'to_link' + ID2, true);
            }
        }
    }
}
