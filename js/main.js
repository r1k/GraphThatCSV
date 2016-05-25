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

  // create columns array
  var columns = [0];
  /* the series map is an array of data series
   * "column" is the index of the data column to use for the series
   * "roleColumns" is an array of column indices corresponding to columns with roles that are associated with this data series
   * "display" is a boolean, set to true to make the series visible on the initial draw
   */
  var seriesMap = [];

  for (var i = 1; i < csvdata[0].length; i++) {
    var _display = false;
    if (i < 2) {
        _display = true;
    }
    seriesMap.push({
    column: i,
    display: _display
    });
  }
  var columnsMap = {};
  var series = [];
  for (var i = 0; i < seriesMap.length; i++) {
    var col = seriesMap[i].column;
    columnsMap[col] = i;
    // set the default series option
    series[i] = {};
    if (seriesMap[i].display) {
        // if the column is the domain column or in the default list, display the series
        columns.push(col);
    }
    else {
      // otherwise, hide it
      columns.push({
        label: data.getColumnLabel(col),
        type: data.getColumnType(col),
        sourceColumn: col,
        calc: function () {
            return null;
        }
      });
      // backup the default color (if set)
      if (typeof(series[i].color) !== 'undefined') {
        series[i].backupColor = series[i].color;
      }
      series[i].color = '#CCCCCC';
    }
  }
  chart.setOption('series', series);

  function showHideSeries () {
    var sel = chart.getChart().getSelection();
    // if selection length is 0, we deselected an element
    if (sel.length > 0) {
      // if row is undefined, we clicked on the legend
      if (sel[0].row == null) {
        var col = sel[0].column;
        if (typeof(columns[col]) == 'number') {
          var src = columns[col];

          // hide the data series
          columns[col] = {
            label: data.getColumnLabel(src),
            type: data.getColumnType(src),
            sourceColumn: src,
            calc: function () {
              return null;
            }
          };

          // grey out the legend entry
          series[columnsMap[src]].color = '#CCCCCC';
        }
        else {
          var src = columns[col].sourceColumn;

          // show the data series
          columns[col] = src;
          series[columnsMap[src]].color = null;
        }
        var view = chart.getView() || {};
        view.columns = columns;
        chart.setView(view);
        chart.draw();
      }
    }
  }
  
  google.visualization.events.addListener(chart, 'select', showHideSeries);

  var view = {columns: columns};
  chart.setView(view);

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
