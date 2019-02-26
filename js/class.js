// class 坐标
function Location(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
}

// class 地铁站
function Station(name, location, description) {
    this.name = name;
    this.location = location;
    this.description = description;
}

// class 线路
function Line(name, color, description) {
    this.name = name;
    this.description = description;
    this.stations = [];
    this.color = color;
    this.addStation = function(station) {
        if (!this.stations.includes(station)) {
            this.stations.push(station);
        }
    }
}

// function 初始化
function InitStation(data) {
    var stations = [];
    for (name in data.stations) {
        var location = data.stations[name].location;
        var locations = [];
        if (typeof(location[0]) == "number") {
            locations.push(new Location(location[0], location[1], location[2]));
        } else {
            for (var i = 0; i < location.length; i++) {
                var l = location[i];
                locations.push(new Location(l[0], l[1], l[2]));
            }
        }
        stations.push(new Station(name, locations, ""));
    }
    return stations;
}

function InitLine(data, stations) {
    var lines = [];
    for (name in data.lines) {
        var stationsName = data.lines[name].stations;
        var color = data.lines[name].color;
        var line = new Line(name, color, "");
        for (var i = 0; i < stationsName.length; i++) {
            var stationName = stationsName[i];
            line.addStation(FindStation(stationName, stations));
        }
        lines.push(line);
    }
    return lines;
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
    var svg = d3.select("#"+parentID)
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
    for (var i = 0; i < path.length - 1; i++ ) {
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
        .attr("cy", function(point) {return path.indexOf(point) * 26 + 18;})
        .attr("r", 4)
        .attr("stroke", "black")
        .attr("fill", "white")
        .attr("stroke-width", "2");

    //站名
    var station_text = gStation.selectAll("text")
        .data(path)
        .enter()
        .append("text");
    station_text
     .attr("x", 10 + 16 * 4 + 10 + 10 + 10)
     .attr("y", function(d) {return 10 + path.indexOf(d) * 26 + 10})
     .attr("alignment-baseline", "middle")
     .text( function (d) { return d; });

    //线路名
    var oldLine = undefined;
    for (var i = 0; i < path.length - 1; i++ ) {
        var start = path[i];
        var end = path[i + 1];
        var line = FindLine(FindStation(start, stations), FindStation(end, stations), lines);
        if (oldLine == line.name) {
            continue;
        }
        oldLine = line.name;
        var lColor = line.color;
        //框
        gLine.append("rect")
         .attr("x", 10)
         .attr("y", 10 + 16 + 10 / 2 + 26 * i - 16 / 2)
         .attr("width", 16 * 4)
         .attr("height", 16)
         .attr("fill", lColor)
         .attr("rx", 5)
         .attr("ry", 5);
        //名字
        gLine.append("text")
            .attr("x", 10 + 16 * 4 / 2)
            .attr("y", 10 + 16 + 10 / 2 + 26 * i + 1)
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .text(line.name)
            .attr("font-size", "12px")
            .attr("fill", "white");
    }
}