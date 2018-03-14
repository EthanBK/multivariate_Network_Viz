var high_level_svg,
    maxWithin = 0;

var block_width = 300,
    block_height = 300;

var square_width = block_width / 2;

function high_level() {

    var width = 1500,
        height = 750;

    high_level_svg = d3.selectAll('#high_level')
        .append('svg')
        .attr('id', "high_level_svg")
        .attr('width', width)
        .attr('height', height)
}

function buildBlock(ID, isNew) {

    var selection = selections[ID];

    maxWithin = Math.max(maxWithin, selection.num_edge_within);

    var arrow_width_scale = d3.scaleLinear()
        .domain([0, maxWithin])
        .range([0, 20]);


    if (isNew) {
        // Create New Block
        var nodes = high_level_svg.append('g')
            .attr('id', 'group'+ selection.id)
            .attr('width', block_width)
            .attr('height', block_height)
            .attr('x', selection.x1)
            .attr('y', selection.y1);

        var rect = nodes.append('rect')
            .attr('width', square_width)
            .attr('height', square_width)
            .attr('stroke', selection.color)
            .attr('stroke-width', 3)
            .attr('fill', '#1f201c')
            .attr('x', selection.x1)
            .attr('y', selection.y1);

        // Within Arrow
        var path_start_within = parseInt(selection.x1 + square_width) +
                                ' ' + parseInt(selection.y1 + square_width / 2),
            path_end_within = parseInt(selection.x1 + square_width / 2) +
                                ' ' + (+selection.y1 - 10) ;
        nodes.append('path')
            .classed('within_arrow' + selection.id, true)
            .attr('stroke', selection.color)
            .attr('stroke-width', arrow_width_scale(selection.num_edge_within))
            .attr('fill-opacity', 0)
            .attr('d', 'M ' + path_start_within +
                        ' A ' + square_width/2 + ' ' + square_width/2 +
                        ', 1, 1, 0, ' + path_end_within)
            .attr('marker-end', 'url(#arrow' + selection.id + ')');

        // out arrow
        var path_start_out = parseInt(selection.x1 + square_width) +
            ' ' + parseInt(selection.y1 + square_width * 3 / 4),
            path_end_out = parseInt(selection.x1 + square_width * 2) +
                ' ' + parseInt(selection.y1  + square_width * 2);
        nodes.append('path')
            .classed('out_arrrow' + selection.id, true)
            .attr('stroke', 'url(#in_out' + selection.id + ')')
            .attr('stroke-width', 5)
            .attr('fill-opacity', 0)
            .attr('d', 'M ' + path_start_out +
                ' A ' + square_width*2 + ' ' + square_width*2 +
                ', 0, 0, 1, ' + path_end_out)
            .attr('marker-end', 'url(#arrow_bg' + selection.id + ')');

        // in arrow
        var path_start_in = parseInt(selection.x1 + square_width * 7 / 4) +
                ' ' + parseInt(selection.y1 + square_width * 2),
            path_end_in = parseInt(selection.x1 + square_width * 3 / 4) + ' ' +
            parseInt(selection.y1 + square_width + 10);
        nodes.append('path')
            .classed('in_arrow' + selection.id, true)
            .attr('stroke', 'url(#in_out' + selection.id + ')')
            .attr('stroke-width', 5)
            .attr('fill-opacity', 0)
            .attr('d', 'M ' + path_start_in +
                ' A ' + square_width*2 + ' ' + square_width*2 +
                ', 1, 0, 1, ' + path_end_in)
            .attr('marker-end', 'url(#arrow' + selection.id + ')');

        // Between
        for (var i = 0; i < selections.length; i++) {
            if (i === selection.id) continue;

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
            high_level_svg.append('path')
                .classed('be_arrow' + selection.id +
                    'be_arrow' + selections[i].id, true)
                .attr('stroke', 'url(#bag' + selection.id +
                    'bag' + selections[i].id + ")")
                .attr('stroke-width', 5)
                .attr('fill-opacity', 0)
                .attr('d', 'M ' + (xs - xm) + ' ' + (ys + ym) +
                    ' A ' + radian + ' ' + radian +
                    ', 1, 0, 0, ' + (xe - xm) + ' ' + (ye + ym))
                .attr('marker-end', 'url(#arrow' + selections[i].id + ')');

            // Between in
            high_level_svg.append('path')
                .classed('be_arrow' + selection.id +
                    'be_arrow' + selections[i].id, true)
                .attr('stroke', 'url(#bag' + selection.id +
                    'bag' + selections[i].id + ")")
                .attr('stroke-width', 5)
                .attr('fill-opacity', 0)
                .attr('d', 'M ' + (xe + xm) + ' ' + (ye - ym) +
                    ' A ' + radian + ' ' + radian +
                    ', 0, 0, 0, ' + (xs + xm) + ' ' + (ys - ym))
                .attr('marker-end', 'url(#arrow' + selection.id + ')');

            // Between gradient
            var rec_len = Math.max(Math.abs(xe-xs),Math.abs(ye-ys));
            var X1 = (0.5 + (xs - xe)/2/rec_len)*100,
                X2 = (0.5 - (xs - xe)/2/rec_len)*100,
                Y1 = (0.5 + (ys - ye)/2/rec_len)*100,
                Y2 = (0.5 - (ys - ye)/2/rec_len)*100;
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

        // Every aggregation has its own Arrow id
        defs = nodes.append('defs');
        // normal arrow
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
        // background arrow
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

        //todo drag

        buildLinks(selection);

        // in and out edges gradient
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
    else {

    }

}


function buildLinks() {

}

function update_arrow_width(ID) {

}
