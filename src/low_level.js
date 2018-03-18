
var height = 750,
    width = 1500;

var selections = [],
    num_window = 0;

$.get('data/test_data.json', function(data) {
    // var airports = data;
    low_level('#low_level', data)
});

function low_level(selector, airports) {

    //var airports = buildData(flight, ap_supplement, all_ap);

    // var zoom = d3.zoom()
    //     .scaleExtent([1, 10])
    //     .on('zoom', zoomed);

    var xAxisScale = d3.scaleLinear()
        .domain([-180, 180])
        .range([0, width]);

    var yAxisScale = d3.scaleLinear()
        .domain([-90, 90])
        .range([0, height]);

    var xAxis = d3.axisBottom(xAxisScale);
    var yAxis = d3.axisRight(yAxisScale);

    // Expose an API to selection component
    var SelectionComponentObj = new SelectionComponent({
        selections: selections,
        buildSelection: buildSelection,
        deleteSelection: deleteSelection,
        hideSelection: hideSelection,
        showSelection: showSelection
    });

    //var airports = buildData(flight, ap_supplement, all_ap);

    var svg = d3.selectAll(selector).append('svg')
        .attr('id', 'low_svg')
        .attr('width', width)
        .attr('height', height)
        .style('background', '#141411')
        ;

    var bg_rec = svg.append("rect")
        .classed('background', true)
        .attr("width", width)
        .attr("height", height)
        .attr('fill-opacity', 0)
        .on('click', resetClickSel);

    // svg.append("rect")
    //     .classed('background', true)
    //     .attr("width", width)
    //     .attr("height", height)

    // var gX = svg.append('g')
    //     .attr('class', 'axis axis--x')
    //     .attr('stroke', 'white')
    //     .call(xAxis);
    //
    // var gY = svg.append('g')
    //     .attr('class', 'axis axis--y')
    //     .attr('stroke', 'white')
    //     .call(yAxis);

    // var container_zoom = svg.append('g')
    //     .attr('id', 'container_zoom');

    // svg.call(zoom);

    high_level('#high_level');


    //
    // var drag = d3.behavior.drag()
    //     .orgin(function (d) { return d; })
    //     .on("dragstart", dragstarted_map)
    //     .on("drag", dragged_map)
    //     .on("dragend", dragended_map);
    //


    //
    // function dragstarted_map(d) {
    //     d3.event.sourceEvent.stopPropagation();
    //     d3.select(this).classed("dragging", true);
    // }
    //
    // function dragged_map(d) {
    //     d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
    // }
    //
    // function dragended_map(d) {
    //     d3.select(this).classed("dragging", false);
    // }

    var selection = null,
        selection_color = null,
        randomColor = null,
        sel_group = null;


    // a random color generator to get get color for selection win.
    var getColor = d3.scaleLinear()
        .domain([0, 0.5, 1.0])
        .range(['#fc2b30', '#3f99d1', '#64be5c']);
    //.range(['red', 'orange', 'yellow', 'green', 'blue', 'purple']);


    var startSelection = function(start) {
        // Set window and node color of this selection.
        selection_color = getColor(Math.random());
        randomColor = "hsl(" + Math.random() * 360 + ",100%,50%)";

        sel_group = svg.append('g')
            .classed('sel_group', true)
            .attr('id', 'sel_group' + num_window).on('click', clickRect)

            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        selection = sel_group.append("rect")
            .classed('selection', true)
            .attr("id", "selection"+num_window)
            .attr("visibility", "visible")
            .attr('selection_id', num_window)
            .attr('x', start[0])
            .attr('y', start[1])
            .attr('width', 0)
            .attr('height', 0)
            .attr("visibility", "visible")
            .attr('fill-opacity', '0')
            .attr('stroke', selection_color)
            //.attr('stroke', randomColor)
            .attr('stroke-width', 3)

            ;
        num_window += 1;
    };

    var moveSelection = function(start, moved) {
        selection
            .attr('width', moved[0]-start[0])
            .attr('height', moved[1]-start[1] )
    };

    var endSelection = function(start, end) {
        if (end[0] <= start[0] || end[1] <= start[1]) {
            // if click on svg, or invalid selection creation
            d3.select('#sel_group'+num_window).remove()
        }
        // sel_group.on('click', clickRect)
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

                endSelection(start, d3.mouse(parent));
            });
    });

    // Manipulate selection rect
    function dragstarted() {
        d3.select(this).raise().classed("active", true);
    }
    function dragged() {
        this.x = this.x || 0;
        this.y = this.y || 0;
        this.x += d3.event.dx;
        this.y += d3.event.dy;
        d3.select(this).attr("transform", "translate(" + this.x + "," + this.y + ")");
    }
    function dragended() {
        d3.select(this).classed("active", false);

        var trans_x = 0,
            trans_y = 0;
        if (this.getAttribute('transform') !== null) {
            var transform = this.getAttribute('transform'),
                regExp_x = /\(([^)]+),/,
                regExp_y = /,([^)]+)\)/;
                trans_x = +regExp_x.exec(transform)[1];
                trans_y = +regExp_y.exec(transform)[1];
        }

        var id = +this.getAttribute('id').substring(9),
            sel_dom = document.getElementById('selection' + id);

        var x1 = +sel_dom.getAttribute('x') + trans_x,
            y1 = +sel_dom.getAttribute('y') + trans_y,
            x2 = x1 + +sel_dom.getAttribute('width'),
            y2 = y1 + +sel_dom.getAttribute('height');

        deleteDot(id);
        buildSelection(x1, y1, x2, y2, sel_dom.getAttribute('stroke'), id);
    }

    var allDots = null;
    var selectedDots = null;

    // Draw all the dots
    allDots = svg.append('g')
        .attr('id', 'dot_group')
        .selectAll('.dot').data(airports);

    allDots.enter().append('circle')
        .attr('class', 'dot')
        .attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; })
        .attr('r', 1)
        .attr('fill', 'white');

    // delete dots move out of the selection window
    function deleteDot(ID) {
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

            // I moved your left_column function entrance to here,
            // so you can avoid creating selection component for
            // invalid selections
            //SelectionComponentObj.addSelection(ID, color);

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
                if(!selections[j]) continue;
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
                if(!selection) return true;
                if (selection.id === ID) {
                    selection.x1 = x1;
                    selection.x2 = x2;
                    selection.y1 = y1;
                    selection.y2 = y2;
                    selection.num_edge_within = 0;
                    selection.num_edge_out = 0;
                    selection.num_edge_in = 0;
                    selection.num_bg_in = 0;
                    selection.num_bg_out = 0;
                    selection.airport = null;
                    selection.between.forEach(function (be) {
                        be.num_be_in = 0;
                        be.num_be_out = 0;
                    })
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

        selectedDots = allDots.data(selected_ap)
            .enter().append('circle')
            .classed('selected'+ID, true)
            .attr('cx', function (d) { return d.x; })
            .attr('cy', function (d) { return d.y; })
            .attr('r', 1)
            .attr('fill', color)
            .exit().remove();

        buildLinks(ID);

        // Update num of background edges
        selections.forEach(function (selection) {
            if(!selection) return true;
            selection.num_bg_in = selection.num_edge_in;
            selection.num_bg_out = selection.num_edge_out;
            selection.between.forEach(function (be) {
                selection.num_bg_in -= be.num_be_in;
                selection.num_bg_out -= be.num_be_out
            });
        });

        high_level.buildBlock(ID, isNew)

        // build detailed view in agg_svg
        // Build default view (bubble chart + num_total_edge)
        aggregationView(ID, 0, 1)
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

                    if(!selections[i]) continue;
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

                        drawEdge(out_edge.des_x, out_edge.des_y, ap.x, ap.y, 1,
                            ID, i, color, window.color);
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
                    if(!selections[i]) continue;
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
                        drawEdge(ap.x, ap.y, in_edge.src_x, in_edge.src_y, 1,
                            i, ID, window.color, color, true);
                    }
                }
            })
        });

        // Draw links on given coordinate of the start point (Sx, Sy)
        // and end point (Ex, Ey)
        function drawEdge(Dx, Dy, Sx, Sy, ctg, ID, ID2, color1, color2) {

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
        d3.select('#selection'+ID).remove();
        d3.select('#handle_group'+ID).remove();
        d3.selectAll('#high_group'+ID).remove();
        d3.selectAll("*[id*=be_arrow_from"+ID+"]").remove();
        d3.selectAll("*[id*=be_arrow_to"+ID+"]").remove();
        d3.selectAll("*[id*=be_arrow_num"+ID+"]").remove();
        selections[ID] = null;
    }

    function hideSelection(ID) {
        $("*[class*=link"+ID+"]").css('display', 'none');
        $('.selected'+ID).css('display', 'none');
        $("*[id*=btg"+ID+"]").css('display', 'none');
        $('.selection'+ID).css('display', 'none');
    }

    function showSelection(ID) {
        $("*[class*=link"+ID+"]").css('display', 'block');
        $('.selected'+ID).css('display', 'block');
        $("*[id*=btg"+ID+"]").css('display', 'block');
        $('.selection'+ID).css('display', 'block');
    }

    function resetClickSel() {

        d3.selectAll('.handle').remove();

        d3.selectAll(".clicked")
            .classed('clicked', false)
            .attr('stroke-width', 3)
    }

    function clickRect() {
        resetClickSel();

        // console.log(selections)
        var group = d3.select(this);
        var id = +this.getAttribute('id').substring(9);

        var sel_dom = d3.select('#selection'+id);
        var sel_obj = selections.find(function (sel) {
                if (sel !== null)
                    return sel.id === id;
                else return false
            });

        if (sel_dom.attr('class').indexOf('clicked') > 0)
            return;

        // Increase stroke width
        sel_dom
            .classed('clicked', true)
            .attr('stroke-width', 6);

        var sq_width = 12;

        var x = +sel_obj.x1,
            y = +sel_obj.y1,
            sel_width = +sel_obj.x2 - +sel_obj.x1,
            sel_height = +sel_obj.y2 - +sel_obj.y1,
            color = sel_obj.color,
            trans_x = 0,
            trans_y = 0;

        if (this.getAttribute('transform') !== null) {
            var transform = this.getAttribute('transform'),
                regExp_x = /\(([^)]+),/,
                regExp_y = /,([^)]+)\)/;
            trans_x = +regExp_x.exec(transform)[1];
            trans_y = +regExp_y.exec(transform)[1];
        }

        var x_handle = x - sq_width / 2 - trans_x,
            y_handle = y - sq_width / 2 - trans_y;

        var pos = [
            {x: x_handle, y: y_handle},
            {x: x_handle + sel_width / 2, y: y_handle},
            {x: x_handle + sel_width, y: y_handle},
            {x: x_handle, y: y_handle + sel_height / 2},
            {x: x_handle + sel_width, y: y_handle + sel_height / 2},
            {x: x_handle, y: y_handle + sel_height},
            {x: x_handle + sel_width / 2, y: y_handle + sel_height},
            {x: x_handle + sel_width, y: y_handle + sel_height}
            ];

        // Add 8 handles, keep them in a group
       var handles = group.append('g')
           .attr('id', 'handle_group'+id);

           handles.selectAll('rect')
               .data(pos).enter()
               .append('rect')
               .classed('handle', true)
               .attr('id', function (d, i) { return 'handle_' + i; })
               .attr('x', function (d) { return d.x; })
               .attr('y', function (d) { return d.y; })
               .attr('width', sq_width)
               .attr('height', sq_width)
               .attr('fill', color)
               .attr('stroke', color);

        high_level.clicked(document.getElementById('high_level_rect'+id))
    }
}
