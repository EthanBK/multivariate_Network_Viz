
var height = 750,
    width = 1500;

var selections = [],
    num_window = 0;

$.get('data/airports.json', function(data) {
    // var airports = data;
    low_level('#low_level', data)
});

function low_level(selector, airports) {
    
    // Expose an API to selection component
    var SelectionComponentObj = new SelectionComponent({
        selections: selections,
        buildSelection: buildSelection,
        deleteSelection: deleteSelection
    });
    //var airports = buildData(flight, ap_supplement, all_ap);

    var svg = d3.selectAll(selector).append('svg')
        .attr('id', 'low_svg')
        .attr('width', width)
        .attr('height', height)
        .style('background', '#131410');

    high_level('#high_level');


    var selection = null,
        selection_color = null,
        randomColor = null;


    // a random color generator to get get color for selection win.
    var getColor = d3.scaleLinear()
        .domain([0, 0.5, 1.0])
        .range(['#fc2b30', '#3f99d1', '#64be5c']);
        //.range(['red', 'orange', 'yellow', 'green', 'blue', 'purple']);


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
                buildSelection(start[0], start[1],
                    d3.mouse(parent)[0], d3.mouse(parent)[1],
                    selection_color, num_window-1);
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
        buildSelection(x1, y1, x2, y2, this.getAttribute('stroke'), +this.getAttribute('selection_id'));
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
        d3.selectAll("*[id*=btg"+ID+"]").remove();
    }

    // Draw dots in the selection window
    function buildSelection(x1, y1, x2, y2, color, ID) {

        // Only support make selection window to
        // bottom-right corner
        if (x1 >= x2 || y1 >= y2) {
            num_window -= 1;
            return;
        }

        // If this is new selection window or drag old window
        var isNew = false;

        // Case 1. Create new selection window
        if (ID >= selections.length) {
            isNew = true;
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

            // Update selections
            SelectionComponentObj.addSelection(ID, color);

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

        buildLinks(ID);

        buildBlock(ID, isNew);
    }

    function buildLinks (ID) {

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

                // draw 'in' edges
                if (in_edge.src_x < x1 || x2 < in_edge.src_x ||
                    in_edge.src_y < y1 || y2 < in_edge.src_y) {
                    selections[ID].num_edge_in ++;
                    drawEdge(ap.x, ap.y, in_edge.src_x, in_edge.src_y, 1,
                             ID, undefined, color, undefined);
                }

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
                    var radialGradient = svg.append("defs")
                        .append("radialGradient")
                        .attr("id", 'gradient_bg'+ID);
                    radialGradient.append("stop")
                        .attr("offset", "0%")
                        .attr("stop-color", color1);
                    radialGradient.append("stop")
                        .attr("offset", "100%")
                        .attr("stop-color", "#131410");
                }

                links
                    .attr('stroke', 'url(#gradient_bg'+ID+')')
                    .classed('bg_link'+ID, true)
                    .attr('visibility', 'hidden');
            }

            // from/to other selection windows
            else {
                var rec_len = Math.max(Math.abs(Dx-Sx),Math.abs(Dy-Sy));
                var X1 = (0.5 + (Sx - Dx)/2/rec_len)*100,
                    X2 = (0.5 - (Sx - Dx)/2/rec_len)*100,
                    Y1 = (0.5 + (Sy - Dy)/2/rec_len)*100,
                    Y2 = (0.5 - (Sy - Dy)/2/rec_len)*100;

                if (document.getElementById("btg" + ID + 'btg' + ID2) === null ||
                    document.getElementById("btg" + ID2 + 'btg' + ID) === null) {
                    var gradient = svg.append("defs")
                        .append("svg:linearGradient")
                        .attr("id", "btg" + ID + 'btg' + ID2)
                        .attr("x1", X1 + "%")
                        .attr("y1", Y1 + "%")
                        .attr("x2", X2 + "%")
                        .attr("y2", Y2 + "%");
                    gradient.append("stop")
                        .attr('class', 'start')
                        .attr("offset", "0%")
                        .attr("stop-color", color1);
                    gradient.append("stop")
                        .attr('class', 'end')
                        .attr("offset", "100%")
                        .attr("stop-color", color2);
                }

                links
                    .attr('stroke', 'url(#btg'+ID+'btg'+ID2+')')
                    .classed('from_link' + ID + 'to_link' + ID2, true);
            }
        }
    }

    function deleteSelection(ID) {
        d3.selectAll("*[class*=link"+ID+"]").remove();
        d3.selectAll('.selected'+ID).remove();
        d3.selectAll("*[id*=btg"+ID+"]").remove();
        d3.select('selection'+ID).remove();
        selections.splice(ID, 1)
    }
}
