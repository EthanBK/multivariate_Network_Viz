var data = [
    { id: 0, name: 'circle', path: 'M 0, 0  m -5, 0  a 5,5 0 1,0 10,0  a 5,5 0 1,0 -10,0', viewbox: '-6 -6 12 12' }
    , { id: 1, name: 'square', path: 'M 0,0 m -5,-5 L 5,-5 L 5,5 L -5,5 Z', viewbox: '-5 -5 10 10' }
    , { id: 2, name: 'arrow', path: 'M 0,0 m -5,-5 L 5,0 L -5,5 Z', viewbox: '-5 -5 10 10' }
    , { id: 2, name: 'stub', path: 'M 0,0 m -1,-5 L 1,-5 L 1,5 L -1,5 Z', viewbox: '-1 -5 2 10' }
];

var color = 'white';
    margin = {top: 50, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var svg = d3.select('#high_level_svg').append('svg:svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

var defs = svg.append('svg:defs')

var paths = svg.append('svg:g')
    .attr('id', 'markers')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

var marker = defs.selectAll('marker')
    .data(data)
    .enter()
    .append('svg:marker')
    .attr('id', function(d){ return 'marker_' + d.name})
    .attr('markerHeight', 5)
    .attr('markerWidth', 5)
    .attr('markerUnits', 'strokeWidth')
    .attr('orient', 'auto')
    .attr('refX', 0)
    .attr('refY', 0)
    .attr('viewBox', function(d){ return d.viewbox })
    .append('svg:path')
    .attr('d', function(d){ return d.path })
    .attr('fill', function(d,i) { return color(i)});

var path = paths.selectAll('path')
        .data(data)
        .enter()
        .append('svg:path')
        .attr('d', function(d,i){ return 'M 0,' + (i * 100) + ' L ' + (width - margin.right) + ',' + (i * 100) + '' })
        .attr('stroke', function(d,i) { return color(i)})
        .attr('stroke-width', 5)
        .attr('stroke-linecap', 'round')
        .attr('marker-start', function(d,i){ return 'url(#marker_' + d.name + ')' })
        .attr('marker-end', function(d,i){ return 'url(#marker_' + d.name  + ')' })
