// class 坐标
function Location(x, y, z) {
  this.x = x;
  this.y = y;
  this.z = z;
}

// class 地铁站
function Station(name, location, description, img) {
  this.name = name;
  this.location = location;
  this.description = description || '这个地铁站很懒，还没介绍自己。';
  this.img = img || 'station_none.svg'
}

// class 线路
function Line(name, color, description) {
  this.name = name;
  this.description = description || '这个地铁线路很懒，还没介绍自己。';
  this.stations = [];
  this.color = color;
  this.addStation = function(station) {
    if (!this.stations.includes(station)) {
      this.stations.push(station);
    }
  }
}

// class 边
function Edge(start, end, stationArray, line) {
  this.start = start;
  this.end = end;
  this.line = line;
  this.stationArray = stationArray || [0, 0];
  this.distance = Distance(start, end, stationArray);
}

// function 初始化
function InitStation(data) {
  var stations = [];
  for (name in data.stations) {
    var location = data.stations[name].location;
    var description = data.stations[name].description;
    var img = data.stations[name].img;
    var locations = [];
    if (typeof(location[0]) == "number") {
      locations.push(new Location(location[0], location[1], location[2]));
    } else {
      for (var i = 0; i < location.length; i++) {
        var l = location[i];
        locations.push(new Location(l[0], l[1], l[2]));
      }
    }
    stations.push(new Station(name, locations, description, img));
  }
  return stations;
}

function InitLine(data, stations) {
  var lines = [];
  for (name in data.lines) {
    var stationsName = data.lines[name].stations;
    var color = data.lines[name].color;
    var description = data.lines[name].description;
    var line = new Line(name, color, description);
    for (var i = 0; i < stationsName.length; i++) {
      var stationName = stationsName[i];
      line.addStation(FindStation(stationName, stations));
    }
    lines.push(line);
  }
  return lines;
}

function InitEdge(data, stations, lines) {
  var edges = [];
  for (var i = 0; i < data.paths.length; i++) {
    var path = data.paths[i];
    var edge = new Edge(
      FindStation(path.start, stations), 
      FindStation(path.end, stations), 
      path.stationArray,
      GetLine(path.line, lines)
      );
    edges.push(edge);
  }

  return edges;
}

// functions
function FindStation(name, stations) {
  for (var i = 0; i < stations.length; i++) {
    var station = stations[i];
    if (station.name == name) {
      return station;
    }
  }
}

function FindLine(station1, station2, lines) {
  for (index in lines) {
    var line = lines[index];
    if (line.stations.includes(station1) && line.stations.includes(station2)) {
      return line;
    }
  }
}

function GetLine(name, lines) {
  for (index in lines) {
    var line = lines[index];
    if (line.name == name) {
      return line;
    }
  }
}

function GetLines(station, lines) {
  var result = [];
  for (index in lines) {
    var line = lines[index];
    if (line.stations.includes(station)) {
      result.push(line);
    }
  }
  return result;
}

function Distance(station1, station2, index) {
  if (index == undefined) {
    index = [0, 0];
  }
  var location1 = station1.location[index[0]];
  var location2 = station2.location[index[1]];
  return Math.abs(location1.x - location2.x) + Math.abs(location1.z - location2.z)
}

function ConvertTime(length) {
  var minute = Math.floor(length / 60 / 8);
  var length_sec = length - minute * 60 * 8;
  var sec = Math.floor(length_sec / 8);
  var result = "";
  if (minute > 0) {
    result += minute + "分";
  }
  if (sec > 0) {
    result += sec + "秒";
  }
  if (result == "") {
    result = "瞬间"
  }
  return result;
}

function RanderSVG(path, lines, stations, parentID) {
  // 画布
  var width = 10 + 16 * 4 + 10 + 10 + 10 + 16 * 10 + 10;
  var height = path.length * 26 + 10;
  var svg = d3.select("#" + parentID)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  //分组
  var ruler = svg.append("g");
  var gPath = svg.append("g");
  var gPoint = svg.append("g");
  var gStation = svg.append("g");
  var gLine = svg.append("g");

  //路径
  for (var i = 0; i < path.length - 1; i++) {
    var start = path[i];
    var end = path[i + 1];
    var line = FindLine(FindStation(start, stations), FindStation(end, stations), lines);
    var lColor = line.color;
    gPath.append("line")
      .attr("x1", 10 + 16 * 4 + 10 + 5)
      .attr("y1", 26 * i + 10 + 8)
      .attr("x2", 10 + 16 * 4 + 10 + 5)
      .attr("y2", 26 * (i + 1) + 10 + 8)
      .attr("stroke-width", 5)
      .attr("stroke", lColor);
  }

  //点
  var circle = gPoint.selectAll("circle").data(path).enter().append("circle");
  circle.attr("cx", 10 + 16 * 4 + 10 + 5)
    .attr("cy", function(point) {
      return path.indexOf(point) * 26 + 18;
    })
    .attr("r", 4)
    .attr("stroke", "black")
    .attr("fill", "white")
    .attr("stroke-width", "2");

  //站名
  var station_text = gStation.selectAll("text")
    .data(path)
    .enter()
    .append("a")
    .classed('station',true);
  station_text.attr("xlink:href", function(d) {return "station.html?station=" + d;})
    .attr("xlink:target", "_blank")
    .append("text")
    .attr("x", 10 + 16 * 4 + 10 + 10 + 10)
    .attr("y", function(d) {
      return 10 + path.indexOf(d) * 26 + 10
    })
    .attr("alignment-baseline", "middle")
    .text(function(d) {
      return d;
    });

  //线路名
  var oldLine = undefined;
  for (var i = 0; i < path.length - 1; i++) {
    var start = path[i];
    var end = path[i + 1];
    var line = FindLine(FindStation(start, stations), FindStation(end, stations), lines);
    if (oldLine == line.name) {
      continue;
    }
    oldLine = line.name;
    var lColor = line.color;
    //框
    var ahref = gLine.append("a").attr("xlink:href", "line.html?line=" + line.name)
      .attr("xlink:target", "_blank")
      .classed('lineRect',true);
    ahref.append("rect")
      .attr("x", 10)
      .attr("y", 10 + 16 + 10 / 2 + 26 * i - 16 / 2)
      .attr("width", 16 * 4)
      .attr("height", 16)
      .attr("fill", lColor)
      .attr("stroke", lColor)
      .attr("rx", 5)
      .attr("ry", 5);
    //名字
    ahref
      .append("text")
      .attr("x", 10 + 16 * 4 / 2)
      .attr("y", 10 + 16 + 10 / 2 + 26 * i + 1)
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .text(line.name)
      .attr("font-size", "12px")
      .attr("fill", lColor);
    ahref
      .append("text")
      .classed('coverText',true)
      .attr("x", 10 + 16 * 4 / 2)
      .attr("y", 10 + 16 + 10 / 2 + 26 * i + 1)
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .text(line.name)
      .attr("font-size", "12px")
      .attr("fill", "white");
  }
}

function Dijkstra(stations, edges, s) {
  var Extract_Min = function(q, d) {
    var minNode = undefined;
    for (var i = 0; i < q.length; i++) {
      var node = q[i];
      if (minNode == undefined) {
        minNode = node;
      } else if (d[node] < d[minNode]) {
        minNode = node;
      }
    }
    return minNode;
  }

  var d = {};
  var prev = {};

  var Q = [];
  for (var i = 0; i < stations.length; i++) {
    var v = stations[i];
    d[v.name] = Number.MAX_VALUE;
    prev[v.name] = Number.MAX_VALUE;
    Q.push(v.name);
  }

  d[s] = 0;
  var S = [];
  while (Q.length > 0) {
    var u = Extract_Min(Q, d)
    Q.splice(Q.indexOf(u), 1);
    S.push(u);

    for (var i = 0; i < edges.length; i++) {
      var edge = edges[i];
      if (edge.start.name == u) {
        var v = edge.end.name;
        if (d[v] > d[u] + edge.distance) {
          d[v] = d[u] + edge.distance;
          prev[v] = u;
        }
      }
    }
  }
  return [d, prev];
}

function GetRoute(prev, end) {
  var prevNode = prev[end];
  var route = [end];
  while (prevNode != Number.MAX_VALUE) {
    route.push(prevNode)
    var temp = prevNode;
    prevNode = prev[temp]
  }
  route = route.reverse();
  return route;
}

function CalLineDistance(line, stations, edges) {
  var edgeArray = {};
  var sum = 0;
  for (i in edges) {
    var edge = edges[i];
    if (edge.line == line) {
      var tag = [edge.start.name, edge.end.name].sort().join();
      if (edgeArray[tag]) {
        edgeArray[tag] = Math.max(edge.distance, edgeArray[tag]);
      } else {
        edgeArray[tag] = edge.distance;
      }
    }
  }
  for (key in edgeArray) {
    sum += edgeArray[key];
  }
  return sum;
}

function RenderLineMap(line, edges, parentID) {
  var stations = line.stations;
  var x_min = Number.MAX_VALUE;
  var x_max = -Number.MAX_VALUE;
  var z_min = Number.MAX_VALUE;
  var z_max = -Number.MAX_VALUE;
  for (i in stations) {
    var station = stations[i];
    var locations = station.location;
    var x = 0;
    var y = 0;
    var z = 0;
    for (j in locations) {
      x += locations[j].x;
      y += locations[j].y;
      z += locations[j].z;
    }
    x /= locations.length;
    y /= locations.length;
    z /= locations.length;
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
  var width = 25 + (x_max - x_min) / 10 + 25;
  var height = 25 + (z_max - z_min) / 10 + 25;

  var svg = d3.select("#" + parentID)
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
      return 25 - x_min / 10 + station.location[0].x / 10
    })
    .attr("cy", function(station) {
      return 25 - z_min / 10 + station.location[0].z / 10
    })
    .attr("r", 4)
    .attr("stroke", "black")
    .attr("fill", "white")
    .attr("stroke-width", "2")
    .append("svg:title")
    .text(function(station) { return station.name; });

  var paths = [];
  for (i in edges) {
    var edge = edges[i];
    if (edge.line == line) {
        paths.push([edge.start, edge.end]);
    }
    var path_g = gPath.selectAll("polyline")
      .data(paths)
      .enter()
      .append("polyline");

    path_g.attr("points", function(p) {
        var x1 = 25 - x_min / 10 + p[0].location[0].x / 10;
        var y1 = 25 - z_min / 10 + p[0].location[0].z / 10;
        var x2 = 25 - x_min / 10 + p[1].location[0].x / 10;
        var y2 = 25 - z_min / 10 + p[1].location[0].z / 10;
        return x1 + "," + y1 + " " + x2 + "," + y2;
      })
      .attr("stroke-width", 5)
      .attr("stroke", function(p) {
        return line.color;
      });
  }
}