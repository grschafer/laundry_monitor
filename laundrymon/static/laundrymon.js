/*

For graph use:
highcharts: http://www.highcharts.com/demo/dynamic-update
smoothie: http://smoothiecharts.org/

Use Twitter Bootstrap to have 2 tabs
Update info for both tabs at same time
    (i.e. - fetching data adds to graph series and updates current states)

    
things to do
    remove graphs from the table, put labelling in the graph
    let width stretch
    make height smaller
    
    move graph javascript into template so it has starting values?
    OR add endpoint call to get history for a washer/dryer pair (OR FOR ALL 8)
        don't create chart until history has been filled
        don't start setInterval until all charts created?
        
    
    checkbox to turn off auto-update?
    
*/

var charts = {
    '3W': null,
    '3D': null,
    '2W': null,
    '2D': null,
};
var data_to_charts = {
    '3LW': '3W',
    '3RW': '3W',
    '3LD': '3D',
    '3RD': '3D',
    '2LW': '2W',
    '2RW': '2W',
    '2LD': '2D',
    '2RD': '2D',
}

function update_machine(key, val, timestamp, shift) {
    $('#' + key).text(key + ': ' + val);
    // DON'T ADD IF ALREADY IN SERIES?
    charts[data_to_charts[key]].series[Number(key.indexOf('L') != -1)].addPoint([timestamp * 1000, val], true, shift);
}

function update_all_from_json(json, shift) {
    for (var idx in json['states']) {
        var timestamp = json['states'][idx]['timestamp'];
        for (var key in json['states'][idx]) {
            if (key != "timestamp") {
                update_machine(key, json['states'][idx][key], timestamp, shift);
            }
        }
    }
}

function get_state() {
    $.getJSON("/get_state", function(data) {
        update_all_from_json(data, true);
    });
}
function chart_options(target) {
    return {
        chart: {
            renderTo: target + '_chart',
            type: 'spline',
            // events: {
                // load: function() {
                    // setInterval(get_state, 10000);
                // }
            // }
        },
        title: {
            text:''
        },
        xAxis: {
            type: 'datetime',
            tickPixelInterval: 150
        },
        yAxis: {
            title: {
                text:''
            }
        },
        global: {
            useUTC: false
        },
        tooltip: {
            formatter: function() {
                return '<b>'+ this.series.name +'</b><br/>'+
                Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) +'<br/>'+
                Highcharts.numberFormat(this.y, 2);
            }
        },
        credits: {
            enabled: false
        },
        legend: {
            enabled: false
        },
        exporting: {
            enabled: false
        },
        series: [
            {
                name: 'Left',
                data: []
            },
            {
                name: 'Right',
                data: []
            },
        ]
    }
}

$(document).ready(function() {
    for (var key in charts) {
        charts[key] = new Highcharts.Chart(chart_options(key));
    }
    
    var intId;
    $.getJSON("/get_state_history/50", function(data) {
        update_all_from_json(data, false);
        intId = setInterval(get_state, 10000);
    });
    
    $('#update_checkbox').change(function(evt) {
        if (this.checked) {
            intId = setInterval(get_state, 10000);
        }
        else {
            clearInterval(intId);
        }
    });
});