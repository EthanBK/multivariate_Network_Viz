var data = [
    {
        "color" : "red",
        "cx" : 25,
        "cy" : 25,
        "r" : 10
    },
    {
        "color" : "green",
        "cx" : 55,
        "cy" : 55,
        "r" : 20
    },
    {
        "color" : "blue",
        "cx" : 75,
        "cy" : 75,
        "r" : 30
    }
]

var dataNested = d3.nest()
    .key(function (d) { return d.color; })
    .entries(data)

d3.select('body').append('div')
    .append('select')
    .on('change',change)
    .selectAll('option')
    .data(dataNested)
    .enter()
    .append('option')
    .attr('value',function (d) { return d.key })
    .text(function (d) { return d.key })

var dataFiltered = dataNested.filter(function (d) { return d.key === 'red' })

var svg = d3.select('body').append('svg')
    .attr('height',150)
    .attr('width',150)

var circles = svg.selectAll('circle')
    .data(dataFiltered[0].values)

circles.enter()
    .append('circle')
    .attr('cx', function (d) { return d.cx })
    .attr('cy', function (d) { return d.cy })
    .attr('r', function (d) { return d.r })
    .attr('fill', function (d) { return d.color })

function change() {
    var value = this.value
    dataFiltered = dataNested.filter(function (d) { return d.key === value })
    circles.data(dataFiltered[0].values)
        .transition().duration(1000)
        .attr('cx', function (d) { return d.cx })
        .attr('cy', function (d) { return d.cy })
        .attr('r', function (d) { return d.r })
        .attr('fill', function (d) { return d.color })
}
