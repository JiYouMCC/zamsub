function Graph() {
    this.nodes = [];
    this.edges = {};
    this.addNode = function(nodeName) {
        if (!this.nodes.includes(nodeName)) {
            this.nodes.push(nodeName);
        }

    };
    this.addEdge = function(fromNodeName, toNodeName, length) {
        if (!this.edges[fromNodeName]) {
            this.edges[fromNodeName] = {};
        }
        this.edges[fromNodeName][toNodeName] = length;
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


var graph = new Graph();

for (line in subData['lines']) {
    for (station in subData['lines'][line]) {
        graph.addNode(subData['lines'][line][station]);
    }
}

for (var i = 0; i < subData['paths'].length; i++) {
    var edge = subData['paths'][i];
    graph.addEdge(edge[0], edge[1], edge[2])
}


var findPath = function(graph, start, end) {
    return Dijkstra(graph, start);
}


var start_lines = document.getElementById("start_lines");
var end_lines = document.getElementById("end_lines");
for (line in subData['lines']) {    
    var para = document.createElement("option");
    para.value = line;
    para.text = line;
    start_lines.appendChild(para);

    para = document.createElement("option");
    para.value = line;
    para.text = line;
    end_lines.appendChild(para);
}

var updateStation = function(type) {
    var station_select = document.getElementById(type + "_stations");
    var line_select = document.getElementById(type + "_lines");
    var line = line_select.value;
    station_select.value = '';
    station_select.innerHTML = '';

    for (var i = 0; i < subData['lines'][line].length; i++) {
        var station = subData['lines'][line][i];
        var para = document.createElement("option");
        para.value = station;
        para.text = station;
        station_select.appendChild(para);
    }
}


function getResult() {
    var start = document.getElementById("start_stations").value;
    var end = document.getElementById("end_stations").value;
    var result = findPath(graph, start, end);
    var length = result[0][end];
    var path = ToArray(result[1], end);
    document.getElementById("result_path").innerText = path.join(' -> ');
    document.getElementById("result_length").innerText = length.toString();
}

updateStation('start');
updateStation('end');