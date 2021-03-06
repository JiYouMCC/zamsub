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
    document.getElementById("s_img").src = "";
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
    table = document.getElementById("s_lines");
    document.getElementById("s_lines").innerText = "";
    // 按照拼音排序
    relatedLines = relatedLines.sort(function(line1, line2) {
      return line1.name.localeCompare(line2.name)
    });
    for (i in relatedLines) {
      var relatedLine = relatedLines[i];
      var tr = document.createElement("tr");
      var td1 = document.createElement("td");
      var a = document.createElement("a");
      a.innerText = relatedLine.name;
      a.href = "line.html?line=" + relatedLine.name;
      td1.appendChild(a);
      tr.appendChild(td1);
      table.appendChild(tr);
    }
  }
}

function getLinkParam() {
  var linkStr = document.URL.split('?');
  if (linkStr.length < 2) {
    return;
  }
  var param = linkStr[1];
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

function GetD(x, z, station) {
  var location = station.centerpoint();
  return Math.abs(location.x - x) + Math.abs(location.z - z)
}

function getNearestStation() {
  var x = document.getElementById("location_x").value;
  var z = document.getElementById("location_z").value;
  document.getElementById("stations_input").value = "";
  var minD = Number.MAX_VALUE;
  var results = null;
  for (i in stations) {
    if (GetD(x, z, stations[i]) < minD) {
      minD = GetD(x, z, stations[i]);
      results = stations[i];
    }
  }
  document.getElementById("distance").innerText = minD;
  var g_x = results.centerpoint().x - x;
  var g_z = results.centerpoint().z - z;
  var t_direction = "??";
  if (g_x > 0) {
    if (g_z > 0) {
      t_direction = "西南";
    } else if (g_z < 0) {
      t_direction = "西北";
    } else {
      t_direction = "正西";
    }
  } else if (g_x < 0) {
    if (g_z > 0) {
      t_direction = "东南";
    } else if (g_z < 0) {
      t_direction = "东北";
    } else {
      t_direction = "正东";
    }
  } else {
    if (g_z > 0) {
      t_direction = "正南";
    } else if(g_z < 0) {
      t_direction = "正北";
    } else{
      t_direction = "原地右转180°再左转180°";
    }
  }

  document.getElementById("direction").innerText = t_direction;
  innerUpdate(results.name);
}

var stations = InitStation(subData);
var lines = InitLine(subData, stations);
var edges = InitEdge(subData, stations, lines);
InitDom(stations, lines);
getLinkParam();