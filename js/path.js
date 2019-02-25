function Graph() {
    this.nodes = [];
    this.edges = {};
    this.addNode = function(node) {
        if (!this.nodes.includes(node)) {
            this.nodes.push(node);
        }

    };
    this.addEdge = function(fromNode, toNode, length) {
        if (!this.edges[fromNode]) {
            this.edges[fromNode] = {};
        }
        this.edges[fromNode][toNode] = length;
    };
}

function Dijkstra(graph, sourceName) {
    var q = [];
    var dist = {};
    var prev = {};
    var minDist = function(q, dist) {
        var minNode = undefined;
        for (var i = 0; i < q.length; i++) {
            var node = q[i];
            if (minNode == undefined) {
                minNode = node;
            } else if (dist[node] < dist[minNode]) {
                minNode = node;
            }
        }
        return minNode;
    }

    for (var i = 0; i < graph.nodes.length; i++) {
        var v = graph.nodes[i];
        dist[v] = Number.MAX_VALUE;
        prev[v] = Number.MAX_VALUE;
        q.push(v);
    }

    dist[sourceName] = 0;

    while (q.length > 0) {
        var u = minDist(q, dist);
        q.splice(q.indexOf(u), 1);
        if (graph.edges[u]) {
            for (toNodeName in graph.edges[u]) {
                var length = graph.edges[u][toNodeName];
                var alt = dist[u] + length;
                if (alt < dist[toNodeName]) {
                    dist[toNodeName] = alt;
                    prev[toNodeName] = u;
                }
            }
        }
    }
    return [dist, prev];
}

function ToArray(prev, fromNode) {
    var prevNode = prev[fromNode];
    var route = [fromNode];
    while (prevNode != Number.MAX_VALUE) {
        route.push(prevNode)
        var temp = prevNode;
        prevNode = prev[temp]
    }
    route = route.reverse();
    return route;
}

function InitGraph(data, stations) {
    var graph = new Graph();
    for (line in data['lines']) {
        for (station in data['lines'][line]['stations']) {
            graph.addNode(data['lines'][line]['stations'][station]);
        }
    }

    for (var i = 0; i < data['paths'].length; i++) {
        var edge = data['paths'][i];
        var distance = Distance(FindStation(edge[0], stations), FindStation(edge[1], stations), edge[3]);
        graph.addEdge(edge[0], edge[1], distance);
    }

    return graph;
}


function InitDom(stations, lines) {
    var start_lines = document.getElementById("start_lines");
    var end_lines = document.getElementById("end_lines");
    var para = document.createElement("option");
    para.value = 'all';
    para.text = "（所有线路）";
    start_lines.appendChild(para);

    para = document.createElement("option");
    para.value = 'all';
    para.text = "（所有线路）";
    end_lines.appendChild(para);
    for (index in lines) {
        var line = lines[index];
        para = document.createElement("option");
        para.value = line.name;
        para.text = line.name;
        start_lines.appendChild(para);

        para = document.createElement("option");
        para.value = line.name;
        para.text = line.name;
        end_lines.appendChild(para);
    }

    updateStation('start', stations, lines);
    updateStation('end', stations, lines);
}

// UI functions
function exchange() {
    var start_lines = document.getElementById("start_lines");
    var end_lines = document.getElementById("end_lines");
    var start_station = document.getElementById("start_stations_input");
    var end_station = document.getElementById("end_stations_input");

    var s_l = start_lines.value;
    var e_l = end_lines.value;

    var s_s = start_station.value;
    var e_s = end_station.value;

    start_lines.value = e_l;
    start_station.value = e_s;

    end_lines.value = s_l;
    end_station.value = s_s;
}

function cleanForm(stations, lines) {
    var start_lines = document.getElementById("start_lines");
    var end_lines = document.getElementById("end_lines");
    start_lines.value = "all";
    end_lines.value = "all";
    updateStation('start', stations, lines);
    updateStation('end', stations, lines);
}

function updateStation(type, stations, lines) {
    var station_select = document.getElementById(type + "_stations");
    var station_select_input = document.getElementById(type + "_stations_input");
    var line_select = document.getElementById(type + "_lines");
    var lineName = line_select.value;
    station_select_input.value = '';
    station_select.innerText = '';

    if (lineName == "all") {
        for (index in stations) {
            var station = stations[index];
            var para = document.createElement("option");
            para.value = station.name;
            para.text = station.name;
            station_select.appendChild(para);
        }
        return;
    }

    var line = GetLine(lineName, lines);
    for (index in line.stations) {
        var station = line.stations[index];
        var para = document.createElement("option");
        para.value = station.name;
        para.text = station.name;
        station_select.appendChild(para);
    }
}

function getResult() {
    var start = document.getElementById("start_stations_input").value;
    var end = document.getElementById("end_stations_input").value;
    if (!start || !end || !graph.nodes.includes(start) || !graph.nodes.includes(end)) {
        return;
    }
    var result = Dijkstra(graph, start);;
    var length = result[0][end];
    if (length == Number.MAX_VALUE) {
        document.getElementById("result_path").innerText = "步行，飞行或游泳";
        document.getElementById("result_length").innerText = "反正坐地铁到不了，你可以跳车试一试"
        return;
    }
    var path = ToArray(result[1], end);
    var paths = path[0];
    for (var i = 0; i < path.length - 1; i++) {
        var s = path[i];
        var t = path[i + 1];
        var line = FindLine(FindStation(s, stations), FindStation(t, stations), lines);
        paths += ' --(' + line.name + ')--> \n' + path[i + 1]

    }

    document.getElementById("result_path").innerText = paths;
    document.getElementById("result_length").innerText = length.toString() + "(约" + ConvertTime (length) + ")";
    document.getElementById("result_svg").innerText = "";
    RanderSVG(path,lines,stations,"result_svg");
}

var stations = InitStation(subData);
var lines = InitLine(subData, stations);
var graph = InitGraph(subData, stations);
InitDom(stations, lines);