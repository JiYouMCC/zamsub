// class 坐标
function Location(x, y, z) {
	this.x = x;
	this.y = y;
	this.z = z;
}

// class 地铁站
function Station(name, locations, description) {
	this.name = name;
	this.locations = locations;
	this.description = description;
}

// class 线路
function Line(name, description) {
	this.name = name;
	this.description = description;
	this.stations = [];
	this.addStation = function(station) {
		if (!this.stations.includes(station)) {
			this.stations.pop(station);
		}
	}
}