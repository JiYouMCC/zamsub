var stations = InitStation(subData);
var lines = InitLine(subData, stations);
var edges = InitEdge(subData, stations, lines);
var x_min = Number.MAX_VALUE;
var x_max = -Number.MAX_VALUE;
var z_min = Number.MAX_VALUE;
var z_max = -Number.MAX_VALUE;
var zoomRatio = 15;
for (i in stations) {
    var centerpoint = stations[i].centerpoint();
    var x = centerpoint.x;
    var y = centerpoint.y;
    var z = centerpoint.z;
    if (x < x_min) {
        x_min = x;
    }
    if (z < z_min) {
        z_min = z;
    }
    if (x > x_max) {
        x_max = x;
    }
    if (z > z_max) {
        z_max = z;
    }
}
var width = 10 + (x_max - x_min) / zoomRatio + 10;
var height = 10 + (z_max - z_min) / zoomRatio + 10;

var svg = d3.select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

//分组
var gPath = svg.append("g");
var gPoint = svg.append("g");
var gStation = svg.append("g");
var gLine = svg.append("g");

//点
var circle = gPoint.selectAll("circle")
    .data(stations)
    .enter()
    .append("circle");
circle.attr("cx", function(station) {
        return 10 - x_min / zoomRatio + station.location[0].x / zoomRatio
    })
    .attr("cy", function(station) {
        return 10 - z_min / zoomRatio + station.location[0].z / zoomRatio
    })
    .attr("r", 50/zoomRatio)
    .attr("stroke", "black")
    .attr("fill", "white")
    .attr("stroke-width", "2")
    .attr("data-toggle", "tooltip")
    .attr("data-placement", "top")
    .attr("title", function(station) { return station.name});

var paths = [];
for (i in edges) {
    var path = subData.paths[i];
    var edge = edges[i];
    if (IsDuplicatePath(edge, edges)) {
        continue;
    }
    if (edge.polyline.length > 0) {
        paths.push([edge.start, edge.end, edge.polyline]);
    } else {
        paths.push([edge.start, edge.end]);
    }
}
var path_g = gPath.selectAll("polyline")
    .data(paths)
    .enter()
    .append("polyline");

path_g.attr("points", function(p) {
        if (p.length == 2) {
            var x1 = 10 - x_min / zoomRatio + p[0].location[0].x / zoomRatio;
            var y1 = 10 - z_min / zoomRatio + p[0].location[0].z / zoomRatio;
            var x2 = 10 - x_min / zoomRatio + p[1].location[0].x / zoomRatio;
            var y2 = 10 - z_min / zoomRatio + p[1].location[0].z / zoomRatio;
            return x1 + "," + y1 + " " + x2 + "," + y2;
        } else {
            var result = "";
            for (var i = 0; i < p[2].length; i++) {
                var x = 10 - x_min / zoomRatio + p[2][i].x / zoomRatio;
                var y = 10 - z_min / zoomRatio + p[2][i].z / zoomRatio;
                result += x + "," + y + " ";
            }
            return result;
        }
    })
    .attr("fill", "none")
    .attr("stroke-width", 50 / zoomRatio)
    .attr("stroke-linecap", "round")
    .attr("stroke-dasharray", function(p) {
        var line = FindLine(p[0], p[1], edges);
        if (line.selfemployed) {
            return 100 / zoomRatio + "," + 100 / zoomRatio;
        }
        return ""
    })
    .attr("stroke", function(p) {
        var line = FindLine(p[0], p[1], edges);
        return line.color;
    })
    .attr("data-toggle", "tooltip")
    .attr("data-placement", "top")
    .attr("title", function(p) { 
        var line = FindLine(p[0], p[1], edges);
        return line.name;
    });
$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})