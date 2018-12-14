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

function InitGraph(data) {
    var graph = new Graph();
    for (line in data['lines']) {
        for (station in data['lines'][line]) {
            graph.addNode(data['lines'][line][station]);
        }
    }

    for (var i = 0; i < data['paths'].length; i++) {
        var edge = data['paths'][i];
        graph.addEdge(edge[0], edge[1], edge[2])
    }

    return graph;
}


function InitDom(data) {
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
    for (line in data['lines']) {
        para = document.createElement("option");
        para.value = line;
        para.text = line;
        start_lines.appendChild(para);

        para = document.createElement("option");
        para.value = line;
        para.text = line;
        end_lines.appendChild(para);
    }
    updateStation('start', data);
    updateStation('end', data);
}

function updateStation(type, data) {
    var station_select = document.getElementById(type + "_stations");
    var station_select_input = document.getElementById(type + "_stations_input");
    var line_select = document.getElementById(type + "_lines");
    var line = line_select.value;
    station_select_input.value = '';
    station_select.innerText = '';

    if (line == "all") {
        for (var i = 0; i < graph.nodes.length; i++) {
            var station = graph.nodes[i];
            var para = document.createElement("option");
            para.value = station;
            para.text = station;
            station_select.appendChild(para);
        }
        return;
    }

    for (var i = 0; i < data['lines'][line].length; i++) {
        var station = data['lines'][line][i];
        var para = document.createElement("option");
        para.value = station;
        para.text = station;
        station_select.appendChild(para);
    }
}

function findLine(station1, station2, data) {
    for (line in data['lines']) {
        var stations = data['lines'][line];
        if (stations.includes(station1) && stations.includes(station2)) {
            return line;
        }
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
        document.getElementById("result_path").value = "步行，飞行或游泳";
        document.getElementById("result_length").value = "反正坐地铁到不了，你可以跳车试一试"
        return;
    }
    var path = ToArray(result[1], end);
    var paths = path[0];
    for (var i = 0; i < path.length - 1; i++) {
        var s = path[i];
        var t = path[i + 1];
        paths += ' --(' + findLine(s, t,subData) + ')--> \n' + path[i + 1]

    }

    document.getElementById("result_path").value = paths;
    document.getElementById("result_path").rows = path.length; 
    document.getElementById("result_length").value = length.toString() + "(约" + Math.floor(length / 60 / 8) + "分钟)";
}

var graph = InitGraph(subData);

InitDom(subData);