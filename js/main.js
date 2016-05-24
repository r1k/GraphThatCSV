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
    dashboardChart(parsed);
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

function drawDashboard(csvdata) {
  var data = new google.visualization.arrayToDataTable(csvdata);
  var dash = new google.visualization.Dashboard(document.getElementById('dashboard'));
  var control = new google.visualization.ControlWrapper({
    controlType: 'ChartRangeFilter',
    containerId: 'control',
    options: {
      filterColumnIndex: 0,
      ui: {
        chartOptions: {
          height: 75
        },
        chartView: { columns: [0, 1] }
      }
    }
  });

  var chart = new google.visualization.ChartWrapper({
    chartType: 'Line',
    containerId: 'chart',
    options: {
      title: 'CSV Graph',
      legend: { position: 'right' },
      selectionMode: 'multiple',
      animation: { startup: true, duration: 2000, easing: 'in' },
      explorer: {
        keepInBounds: true,
        maxZoomIn: 0.05,
        maxZoomOut: 1.5,
        actions: ['dragToZoom', 'rightClickToReset']
      },
      focusTarget: 'category'
    }
  });

  dash.bind(control, chart);
  dash.draw(data);
}

function drawSimpleChart(csvdata) {
  var data = new google.visualization.arrayToDataTable(csvdata);

  var options = {
    title: 'CSV Graph',
    legend: { position: 'right' },
    selectionMode: 'multiple',
    animation: { startup: true, duration: 2000, easing: 'in' },
    explorer: {
      keepInBounds: true,
      maxZoomIn: 0.05,
      maxZoomOut: 1.5,
      actions: ['dragToZoom', 'rightClickToReset']
    },
    focusTarget: 'category'
  };

  var chart = new google.charts.Line(document.getElementById('chart'));

  chart.draw(data, options);
}

function simpleChart (setChartData) {
  google.charts.load('current', {'packages':['line']});
  google.charts.setOnLoadCallback( function() {
    drawSimpleChart(setChartData);
  });
}

function dashboardChart (setChartData) {
  google.charts.load('current', {'packages':['controls', 'line']});
  google.charts.setOnLoadCallback( function() {
    drawDashboard(setChartData);
  });
}
