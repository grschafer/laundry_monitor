/*
things to do:
    clean up status page
        add big icons and styling to indicate usage/availability
    layout stuff
        title, tab positioning, status page formatting
    timezone issue for graphs
        CST = UTC +6
    
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
var charts_to_data = {
    '3W': ['3LW', '3RW'],
    '3D': ['3LD', '3RD'],
    '2W': ['2LW', '2RW'],
    '2D': ['2LD', '2RD'],
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
        for (var key in data) {
            if (key != "timestamp") {
                update_machine(key, data[key], data['timestamp'], true);
            }
        }
    });
}
function chart_options(target, series) {
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
            useUTC: true
        },
        tooltip: {
            formatter: function() {
                return '<b>'+ this.series.name +'</b><br/>'+
                Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) +'<br/>'+
                Highcharts.numberFormat(this.y, 2);
            }
        },
        legend: {
            align: 'left',
            verticalAlign: 'center',
            layout: 'vertical',
            x: 0,
            y: 60
        },
        credits: {
            enabled: false
        },
        exporting: {
            enabled: false
        },
        series: [
            {
                name: (target[0] == '3' ? '3rd Floor' : '2nd Floor') + ' Left ' + (target[1] == 'W' ? 'Washer' : 'Dryer'),
                data: series[0]
            },
            {
                name: (target[0] == '3' ? '3rd Floor' : '2nd Floor') + ' Right ' + (target[1] == 'W' ? 'Washer' : 'Dryer'),
                data: series[1]
            },
        ]
    }
}

$(document).ready(function() {
    $.getJSON("/get_state_history/all/50", function(data) {
        //update_all_from_json(data, false);
        
        for (var key in charts) {
            charts[key] = new Highcharts.Chart(chart_options(key,
                [data[charts_to_data[key][0]], data[charts_to_data[key][1]]]
                ));
        }
    });
    
    var intId = setInterval(get_state, 10000);
    
    $('#update_checkbox').change(function(evt) {
        if (this.checked) {
            intId = setInterval(get_state, 10000);
        }
        else {
            clearInterval(intId);
        }
    });
});