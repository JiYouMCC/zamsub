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
    if (!start || !end || !stations.includes(FindStation(start, stations)) || !stations.includes(FindStation(end, stations))) {
        return;
    }
    var result = Dijkstra(stations, edges, start);;
    var length = result[0][end];
    var path = GetRoute(result[1], end);
    document.getElementById("result_svg").innerText = "";
    if (length == Number.MAX_VALUE) {
        document.getElementById("result_svg").innerText = "步行，飞行或游泳";
        document.getElementById("result_length").innerText = "反正坐地铁到不了，你可以跳车试一试"
        return;
    }

    document.getElementById("result_length").innerText = length.toString() + "米(约" + ConvertTime(length) + ")";
    RanderSVG(path, lines, stations, "result_svg");
}

function getLinkParam() {
    var linkStr = document.URL.split('?');
    if (linkStr.length < 2) {
        return;
    }
    var param = linkStr[1];
    var params = param.split('&');
    var result = {};
    for (p in params) {
        var keyvalue = params[p].split('=');
        result[keyvalue[0]] = decodeURI(keyvalue[1]);
    }
    document.getElementById('start_stations_input').value = result.start;
    document.getElementById('end_stations_input').value = result.end;
    getResult();
}

function setLinkParam() {
    var start = document.getElementById('start_stations_input').value;
    var end = document.getElementById('end_stations_input').value;
    window.history.pushState('', '', '?start=' + start + '&end=' + end);
}

var stations = InitStation(subData);
var lines = InitLine(subData, stations);
var edges = InitEdge(subData, stations, lines);
InitDom(stations, lines);
getLinkParam();