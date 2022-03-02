function InitDom(lines) {
  var lines_dom = document.getElementById("lines");
  for (index in lines) {
    var line = lines[index];
    para = document.createElement("option");
    para.value = line.name;
    para.text = line.name;
    lines_dom.appendChild(para);
  }
  document.getElementById('lines').value = "";
}

function updateInfo() {
  var lineName = document.getElementById("lines").value;
  var line = GetLine(lineName, lines);
  if (line) {
    document.getElementById("map").innerText = "";
    document.getElementById("l_title").innerText = line.name;
    document.getElementById("l_title").setAttribute("style", "color:" + line.color + ";text-shadow: 0px 1px #888888,1px 0px #888888,0px -1px #888888,-1px 0px #888888;")
    RenderLineMap(line, edges, "map") 
    document.getElementById("l_selfdeployed").innerText = line.selfemployed? "是":"否";
    document.getElementById("l_description").innerText = line.description;
    document.getElementById("l_distance").innerText = CalLineDistance(line, stations,edges) + "米";

    var table = document.getElementById("l_stations");
    document.getElementById("l_stations").innerText = "";
    for (i in line.stations) {
      var station = line.stations[i];
      var tr = document.createElement("tr");
      var td = document.createElement("td");
      var a = document.createElement("a");
      a.innerText = station.name;
      a.href = "station.html?station=" + station.name;
      td.appendChild(a);
      tr.appendChild(td);
      table.appendChild(tr);
    }

    var relatedLines = [];
    for (i in line.stations) {
      var station = line.stations[i];
      var stationLines = GetLines(station, lines);
      for (l in stationLines) {
        var stationLine = stationLines[l];
        if (stationLine != line && !relatedLines.includes(stationLine)) {
          relatedLines.push(stationLine);
        }
      }
    }
    // 按照拼音排序
    relatedLines = relatedLines.sort(function(line1, line2){
      return line1.name.localeCompare(line2.name)
    });
    table = document.getElementById("l_lines");
    document.getElementById("l_lines").innerText = ""
    for (i in relatedLines) {
      var relatedLine = relatedLines[i];
      var tr = document.createElement("tr");
      var td = document.createElement("td");
      var a = document.createElement("a");
      a.innerText = relatedLine.name;
      a.href = "javascript:void(0)";
      a.setAttribute('onclick', 'innerUpdate("' + relatedLine.name + '")')
      td.appendChild(a);
      tr.appendChild(td);
      table.appendChild(tr);

    }
    if (relatedLines.length == 0) {
      var tr = document.createElement("tr");
      var td = document.createElement("td");
      td.innerText = "（无）";
      tr.appendChild(td);
      table.appendChild(tr);
    }
  }
  $(function () {
    $('[data-toggle="tooltip"]').tooltip()
  });
}

function toggleTips() {
  $('[data-toggle="tooltip"]').tooltip("toggle")
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
    document.getElementById('lines').value = result.line;
    updateInfo();
}

function setLinkParam() {
    var line = document.getElementById('lines').value;
    window.history.pushState('', '', '?line=' + line);
}

function innerUpdate(lineName) {
  document.getElementById('lines').value = lineName;
  updateInfo();
  setLinkParam();
  window.scrollTo(0, 0);
}

var stations = InitStation(subData);
var lines = InitLine(subData, stations);
var edges = InitEdge(subData, stations, lines);
InitDom(lines);
getLinkParam();
