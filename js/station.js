function updateStation(stations, lines) {
  var station_select = document.getElementById("stations");
  var station_select_input = document.getElementById("stations_input");
  var line_select = document.getElementById("lines");
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

  var l = GetLine(lineName, lines);
  for (index in l.stations) {
    var station = l.stations[index];
    var para = document.createElement("option");
    para.value = station.name;
    para.text = station.name;
    station_select.appendChild(para);
  }
}

function InitDom(stations, lines) {
  var lines_dom = document.getElementById("lines");
  var para = document.createElement("option");
  para.value = 'all';
  para.text = "（所有线路）";
  lines_dom.appendChild(para);

  for (index in lines) {
    var line = lines[index];
    para = document.createElement("option");
    para.value = line.name;
    para.text = line.name;
    lines_dom.appendChild(para);
  }

  updateStation(stations, lines);
}

function updateInfo() {
  var stationName = document.getElementById("stations_input").value;
  var station = FindStation(stationName, stations);
  if (station) {
    document.getElementById("s_title").innerText = station.name;
    document.getElementById("s_img").src = "img/" + station.img;
    document.getElementById("s_description").innerText = station.description;
    document.getElementById("s_location").innerText = "";
    for (i in station.location) {
      var locaion = station.location[i];
      document.getElementById("s_location").innerText += locaion.x + ', ' + locaion.y + ', ' + locaion.z + '\r\n'
    }

    var result = Dijkstra(stations, edges, stationName);
    var nears = [];
    for (name in result[0]) {
      nears.push([name, result[0][name]]);
    }
    nears = nears.sort(function(a, b) {
      return a[1] - b[1]
    })
    var table = document.getElementById("s_near");
    document.getElementById("s_near").innerText = "";
    for (var i = 1; i < 6; i++) {
      if (nears[i][1] > 100000000) {
        break
      }
      var tr = document.createElement("tr");
      var td1 = document.createElement("td");
      var a = document.createElement("a");
      a.innerText = nears[i][0];
      a.href = "javascript:void(0)";
      a.setAttribute('onclick', 'innerUpdate("' + nears[i][0] + '")')
      td1.appendChild(a);
      var td2 = document.createElement("td");
      td2.innerText = nears[i][1] + "米";
      tr.appendChild(td1);
      tr.appendChild(td2);
      table.appendChild(tr);
    }

    var relatedLines = GetLines(station, lines);
    document.getElementById("s_lines").innerText = ""
    for (i in relatedLines) {
      var relatedLine = relatedLines[i];
      document.getElementById("s_lines").innerText += relatedLine.name + '\r\n';
    }
  }
}

function getLinkParam() {
    var param = document.URL.split('?')[1]
    var params = param.split('&')
    var result = {};
    for (p in params) {
        var keyvalue = params[p].split('=');
        result[keyvalue[0]] = decodeURI(keyvalue[1])
    }
    document.getElementById('stations_input').value = result.station;
    updateInfo();
}

function setLinkParam() {
    var station = document.getElementById('stations_input').value;
    window.history.pushState('', '', '?station=' + station);
}

function innerUpdate(stationName) {
  document.getElementById('stations_input').value = stationName;
  updateInfo();
  setLinkParam();
  window.scrollTo(0, 0);
}

var stations = InitStation(subData);
var lines = InitLine(subData, stations);
var edges = InitEdge(subData, stations);
InitDom(stations, lines);
getLinkParam();