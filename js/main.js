var fullData = NaN;

$(document).ready(function() {
  if (isAPIAvailable()) {
    $('#files').bind('change', handleFileSelect);
  }
});

function isAPIAvailable() {
  // Check for the various File API support.
  if (window.File && window.FileReader && window.FileList && window.Blob) {
    // Great success! All the File APIs are supported.
    return true;
  } else {
    alert("The browser you're using does not currently support\nthe HTML5 File API. As a result the file loading demo\nwon't work properly.");
    return false;
  }
}

function handleFileSelect(evt) {
  var files = evt.target.files; // FileList object
  var file = files[0];
  $('#filename').text(file.name);
  // read the file contents and chart the data
  chartFileData(file, function(parsed) {
    materialChart(parsed);
  });
}

function chartFileData(fileToParse, callback) {
  $('#dashboard').css({visibility: "visible"});
  $('#control').css({visibility: "visible"});
  var reader = new FileReader();
  reader.readAsText(fileToParse);
  reader.onload = function() {
    var csv = this.result;
    fullData = $.csv.toArrays(csv, {onParseValue: $.csv.hooks.castToScalar});
    callback(fullData);
  };
  reader.onerror = function() {
    alert('Unable to read ' + file.fileName);
  };
}

function drawDashboard(csvdata, chartType, controlType) {
  var data = new google.visualization.arrayToDataTable(csvdata);
  var dash = new google.visualization.Dashboard(document.getElementById('dashboard'));
  var control = new google.visualization.ControlWrapper({
    controlType: controlType,
    containerId: 'control',
    options: {
      filterColumnIndex: 0,
      ui: {
        chartOptions: {
          height: 75,
          width: 600
        },
        chartView: { columns: [0, 1] }
      }
    }
  });

  var chart = new google.visualization.ChartWrapper({
    chartType: chartType,
    containerId: 'chart',
    options: {
      legend: { position: 'right' },
      explorer: {
        keepInBounds: true,
        maxZoomIn: 0.05,
        maxZoomOut: 1.5,
        actions: ['dragToZoom', 'rightClickToReset']
      }
    }
  });

  dash.bind(control, chart);
  dash.draw(data);
}

function classicChart (setChartData) {
  google.charts.load('current', {'packages':['controls', 'corechart']});
  google.charts.setOnLoadCallback( function() {
    drawDashboard(setChartData, 'LineChart', 'ChartRangeFilter');
  });
}

function materialChart (setChartData) {
  google.charts.load('current', {'packages':['controls', 'line']});
  google.charts.setOnLoadCallback( function() {
    drawDashboard(setChartData, 'Line', 'NumberRangeFilter');
  });
}
