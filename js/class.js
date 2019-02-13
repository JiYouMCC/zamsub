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
function Line(name, description) {
    this.name = name;
    this.description = description;
    this.stations = [];
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
        var stationsName = data.lines[name];
        var line = new Line(name, "");
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

function Distance(station1, station2, index) {
    if (index == undefined) {
        index = [0, 0];
    }
    var location1 = station1.location[index[0]];
    var location2 = station2.location[index[1]];
    return Math.abs(location1.x - location2.x) + Math.abs(location1.z - location2.z)
}