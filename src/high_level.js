function high_level() {

    var high_level_svg,
        container_zoom = null,
        maxWithin = 0,
        active = d3.select('null');

    var block_width = 300,
        square_width = block_width / 2;

    var width = 1500,
        height = 750;

    var zoom = d3.zoom()
        .scaleExtent([1, 10])
        .on('zoom', zoomed);

    high_level_svg = d3.selectAll('#high_level')
        .append('svg')
        .attr('id', "high_level_svg")
        .attr('width', width)
        .attr('height', height)
        .on('click', stopped, true);

    high_level_svg.append("rect")
        .classed('background', true)
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .on('click', reset);

    container_zoom = high_level_svg.append('g')
        .attr('id', 'container_zoom');

    high_level_svg.call(zoom);

    function buildBlock(ID, isNew) {

        var selection = selections[ID];

        maxWithin = Math.max(maxWithin, selection.num_edge_within);

        var arrow_width_scale = d3.scaleLinear()
            .domain([0, maxWithin])
            .range([0, 15]);


        if (isNew) {
            // Create New Block
            var nodes = container_zoom.append('g')
                .classed('high_group', true)
                .attr('id', 'high_group' + selection.id)
                .call(d3.drag()
                    .on("start", dragstarted_hi)
                    .on("drag", dragged_hi)
                    .on("end", dragended_hi));

            var rect = nodes.append('rect')
                .classed('high_level_rect', true)
                .attr('id', 'high_level_rect'+ID)
                .attr('width', square_width)
                .attr('height', square_width)
                .attr('stroke', selection.color)
                .attr('stroke-width', 3)
                .attr('fill', '#1f201c')
                .attr('x', selection.x1)
                .attr('y', selection.y1)
                .on('click', clicked);

            var aggr_svg = nodes.append('svg')
                .classed('agg_svg', true)
                .attr('id', 'agg_svg'+ID)
                .attr('x', selection.x1)
                .attr('y', selection.y1)
                .attr('width', square_width)
                .attr('height', square_width);

            // var cover = nodes.append('rect')
            //     .classed('high_level_cover', true)
            //     .attr('id', 'high_level_cover'+ID)
            //     .attr('width', square_width)
            //     .attr('height', square_width)
            //     .attr('stroke', 'none')
            //     .attr('fill', 'black')
            //     .attr('fill-opacity', 0)
            //     .attr('x', selection.x1)
            //     .attr('y', selection.y1)
            //     .on('click', clicked);

            // Build Within, background_in, background_out arrows
            {
                // Within Arrow
                var path_start_within = (selection.x1 + square_width) +
                    ' ' + (selection.y1 + square_width / 2),
                    path_end_within = (selection.x1 + square_width / 2) +
                        ' ' + (+selection.y1 - 10);
                nodes.append('path')
                    .classed('within_arrow' + selection.id, true)
                    .attr('stroke', selection.color)
                    .attr('stroke-width', arrow_width_scale(selection.num_edge_within))
                    .attr('fill-opacity', 0)
                    .attr('d', 'M ' + path_start_within +
                        ' A ' + square_width / 2 + ' ' + square_width / 2 +
                        ', 1, 1, 0, ' + path_end_within)
                    .attr('marker-end', 'url(#arrow' + selection.id + ')');

                // out arrow
                var path_start_out = (selection.x1 + square_width) +
                    ' ' + (selection.y1 + square_width * 3 / 4),
                    path_end_out = (selection.x1 + square_width * 2) +
                        ' ' + (selection.y1 + square_width * 2);
                nodes.append('path')
                    .classed('out_arrow' + selection.id, true)
                    .attr('stroke', 'url(#in_out' + selection.id + ')')
                    .attr('stroke-width', 5)
                    .attr('fill-opacity', 0)
                    .attr('d', 'M ' + path_start_out +
                        ' A ' + square_width * 2 + ' ' + square_width * 2 +
                        ', 0, 0, 1, ' + path_end_out)
                    .attr('marker-end', 'url(#arrow_bg' + selection.id + ')');

                // in arrow
                var path_start_in = (selection.x1 + square_width * 7 / 4) +
                    ' ' + (selection.y1 + square_width * 2),
                    path_end_in = (selection.x1 + square_width * 3 / 4) + ' ' +
                        (selection.y1 + square_width + 10);
                nodes.append('path')
                    .classed('in_arrow' + selection.id, true)
                    .attr('stroke', 'url(#in_out' + selection.id + ')')
                    .attr('stroke-width', 5)
                    .attr('fill-opacity', 0)
                    .attr('d', 'M ' + path_start_in +
                        ' A ' + square_width * 2 + ' ' + square_width * 2 +
                        ', 1, 0, 1, ' + path_end_in)
                    .attr('marker-end', 'url(#arrow' + selection.id + ')');
            }

            // Build Three types of number display for the above arrows
            {
                // within text
                nodes.append('text')
                    .attr('x', (selection.x1 + square_width * 3 / 2 - 60))
                    .attr('y', (selection.y1))
                    .attr('id', 'within_num' + selection.id)
                    .attr('font-size', 30)
                    .attr('fill', 'white')
                    .text(selection.num_edge_within);

                // bg out text
                nodes.append('text')
                    .attr('x', selection.x1 + square_width * 3 / 2)
                    .attr('y', selection.y1 + square_width * 11 / 8)
                    .attr('id', 'out_num' + selection.id)
                    .attr('font-size', 30)
                    .attr('fill', 'white')
                    .text(selection.num_bg_out);

                // bg in text
                nodes.append('text')
                    .attr('x', selection.x1 + square_width * 4 / 5)
                    .attr('y', selection.y1 + square_width * 3 / 2 + 5)
                    .attr('id', 'in_num' + selection.id)
                    .attr('font-size', 30)
                    .attr('fill', 'white')
                    .text(selection.num_bg_in);
            }

            // Build Between Arrows and Number Display
            for (var i = 0; i < selections.length; i++) {
                if (i === selection.id) continue;
                if (!selections[i]) continue;

                // Update self-loop arrow width
                d3.select('.within_arrow' + selections[i].id)
                    .attr('stroke-width',
                        arrow_width_scale(selections[i].num_edge_within));

                var between_obj = selection.between.find(function (value) {
                    return value.id_be === selections[i].id
                });
                var num_be_in = between_obj.num_be_in,
                    num_be_out = between_obj.num_be_out;

                var xo1 = selection.x1 + square_width / 2,
                    yo1 = selection.y1 + square_width / 2,
                    xo2 = selections[i].x1 + square_width / 2,
                    yo2 = selections[i].y1 + square_width / 2,
                    radian = Math.abs(selection.x1 - selections[i].x1);

                var p = 0.3,
                    tana = (xo1 - xo2) / (yo1 - yo2);
                if (Math.abs(yo1 - yo2) < Math.abs(xo1 - xo2)) {
                    var ym = 10,
                        xm = ym / tana;
                } else {
                    xm = 10;
                    ym = xm * tana;
                }
                var xs = xo1 + p * (xo2 - xo1),
                    xe = xo2 + p * (xo1 - xo2),
                    ys = yo1 + p * (yo2 - yo1),
                    ye = yo2 + p * (yo1 - yo2);

                // Between out
                container_zoom.append('path')
                    .attr('id', 'be_arrow_from' + selection.id +
                        'be_arrow_to' + selections[i].id)
                    .attr('stroke', 'url(#bag' + selection.id +
                        'bag' + selections[i].id + ")")
                    .attr('stroke-width', 5)
                    .attr('fill-opacity', 0)
                    .attr('d', 'M ' + (xs - xm) + ' ' + (ys + ym) +
                        ' A ' + radian + ' ' + radian +
                        ', 1, 0, 0, ' + (xe - xm) + ' ' + (ye + ym))
                    .attr('marker-end', 'url(#arrow' + selections[i].id + ')');

                // between out num
                container_zoom.append('text')
                    .attr('x', (xs + xe) / 2 - xm)
                    .attr('y', (ys + ye) / 2 + ym)
                    .attr('id', 'be_arrow_num' + selection.id + 'be_arrow_num' + selections[i].id)
                    .attr('font-size', 30)
                    .attr('fill', 'white')
                    .text(num_be_out);

                // Between in
                container_zoom.append('path')
                    .attr('id', 'be_arrow_to' + selection.id +
                        'be_arrow_from' + selections[i].id)
                    .attr('stroke', 'url(#bag' + selection.id +
                        'bag' + selections[i].id + ")")
                    .attr('stroke-width', 5)
                    .attr('fill-opacity', 0)
                    .attr('d', 'M ' + (xe + xm) + ' ' + (ye - ym) +
                        ' A ' + radian + ' ' + radian +
                        ', 0, 0, 0, ' + (xs + xm) + ' ' + (ys - ym))
                    .attr('marker-end', 'url(#arrow' + selection.id + ')');

                // Between in num
                container_zoom.append('text')
                    .attr('x', (xs + xe) / 2 + xm)
                    .attr('y', (ys + ye) / 2 - ym)
                    .attr('id', 'be_arrow_num' + selections[i].id + 'be_arrow_num' + selection.id)
                    .attr('font-size', 30)
                    .attr('fill', 'white')
                    .text(num_be_in);

                // Between gradient
                var rec_len = Math.max(Math.abs(xe - xs), Math.abs(ye - ys));
                var X1 = (0.5 + (xs - xe) / 2 / rec_len) * 100,
                    X2 = (0.5 - (xs - xe) / 2 / rec_len) * 100,
                    Y1 = (0.5 + (ys - ye) / 2 / rec_len) * 100,
                    Y2 = (0.5 - (ys - ye) / 2 / rec_len) * 100;
                var gradient_be = high_level_svg.append("defs")
                    .append("svg:linearGradient")
                    .attr("id", "bag" + selection.id + 'bag' + selections[i].id)
                    .attr("x1", X1 + "%")
                    .attr("y1", Y1 + "%")
                    .attr("x2", X2 + "%")
                    .attr("y2", Y2 + "%");
                gradient_be.append("stop")
                    .attr('class', 'start')
                    .attr("offset", "0%")
                    .attr("stop-color", selection.color);
                gradient_be.append("stop")
                    .attr('class', 'end')
                    .attr("offset", "100%")
                    .attr("stop-color", selections[i].color);
            }

            // Marker for each box
            {
                // todo work on the size of the marker
                defs = nodes.append('defs');
                // normal arrow marker
                defs.append('svg:marker')
                    .attr('markerHeight', 5)
                    .attr('markerWidth', 5)
                    .attr('markerUnits', 'strokeWidth')
                    .attr('orient', 'auto')
                    .attr('viewBox', '-5 -5 10 10')
                    .attr('id', 'arrow' + selection.id)
                    .attr('fill', selection.color)
                    .attr('stroke-width', 10)
                    .append('svg:path')
                    .attr('d', 'M 0,0 m -5,-5 L 5,0 L -5,5 Z');
                // background arrow marker
                defs.append('svg:marker')
                    .attr('id', 'arrow_bg' + selection.id)
                    .attr('markerHeight', 5)
                    .attr('markerWidth', 5)
                    .attr('markerUnits', 'strokeWidth')
                    .attr('orient', 'auto')
                    .attr('viewBox', '-5 -5 10 10')
                    .attr('fill', selection.color)
                    .attr('opacity', 0.1)
                    .attr('stroke-width', 10)
                    .append('svg:path')
                    .attr('d', 'M 0,0 m -5,-5 L 5,0 L -5,5 Z');

            }

            // in and out edges gradient
            {
                var gradient = high_level_svg.append("defs")
                    .append("svg:linearGradient")
                    .attr("id", "in_out" + selection.id)
                    .attr("x1", '0%')
                    .attr("y1", '0%')
                    .attr("x2", '100%')
                    .attr("y2", '100%');
                gradient.append("stop")
                    .attr('class', 'start')
                    .attr("offset", "0%")
                    .attr("stop-color", selection.color);
                gradient.append("stop")
                    .attr('class', 'end')
                    .attr("offset", "100%")
                    .attr("stop-color", '#131410');
            }
        }
        // Update number display for all boxes
        else {
            d3.selectAll('#group' + ID);
            var num_within = selections[ID].num_edge_within,
                num_bg_out = selections[ID].num_bg_out,
                num_bg_in = selections[ID].num_bg_in;

            // Update Arrow count
            d3.selectAll('#within_num' + ID)
                .text(num_within);

            d3.selectAll('#out_num' + ID)
                .text(num_bg_out);

            d3.selectAll('#in_num' + ID)
                .text(num_bg_in);

            for (i = 0; i < selection.between.length; i++) {
                var target_id = selection.between[i].id_be;
                if (target_id === ID) continue;

                d3.selectAll('#from' + ID + 'to' + target_id + '_num')
                    .text(selection.between[i].num_be_out);

                d3.selectAll('#from' + target_id + 'to' + ID + '_num')
                    .text(selection.between[i].num_be_in);
            }
        }

        // Drag helper Functions
        function dragstarted_hi() {
            d3.select(this).raise().classed("active", true);
        }
        function dragged_hi() {
            this.x = this.x || 0;
            this.y = this.y || 0;
            this.x += d3.event.dx;
            this.y += d3.event.dy;
            d3.select(this).attr("transform", "translate(" + this.x + "," + this.y + ")");

            // console.log(this)
            var id = this.getAttribute('id').substring(10)
            var path_out = document.getElementById('be_arrow_from' + id)
            // console.log(path_out)
            // todo drag effect between path
        }
        function dragended_hi() {
            d3.select(this).classed("active", false);
        }
    }

    high_level.buildBlock = buildBlock;

    function zoomed() {
        container_zoom.attr("transform", d3.event.transform);
    }

    function stopped() {
        if (d3.event.defaultPrevented)
            d3.event.stopPropagation();
    }

    function reset() {
        active.classed("active", false);
        active = d3.select(null);

        high_level_svg.transition()
            .duration(750)
            .call(zoom.transform, d3.zoomIdentity);
    }

    function clicked(input) {

        var rect_dom = this;
        if (input)
            rect_dom = input;

        if (active.node === rect_dom) return reset();
        active.classed('active', rect_dom);

        var id = rect_dom.getAttribute('id').substring(15);
        var parentGroup = document.getElementById('high_group' + id)


        var trans_x = 0,
            trans_y = 0;

        if (parentGroup.getAttribute('transform') !== null) {
            var transform = parentGroup.getAttribute('transform'),
                regExp_x = /\(([^)]+),/,
                regExp_y = /,([^)]+)\)/;
            trans_x = +regExp_x.exec(transform)[1];
            trans_y = +regExp_y.exec(transform)[1];
        }

        var x1 = +rect_dom.getAttribute('x') + trans_x,
            y1 = +rect_dom.getAttribute('y') + trans_y;

        var x = x1 + square_width / 2,
            y = y1 + square_width / 2;
        var scale = Math.max(1, Math.min(8, 0.9 * height/ square_width));
        var translate = [width / 2 - x * scale, height / 2 - y * scale];

        high_level_svg.transition()
            .duration(750)
            .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale))
    }

    high_level.clicked = clicked;
}


