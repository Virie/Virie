
// constants section
const GRAPH_NODE_START_COLOR = 4; // index in color sheme
const GRAPH_LINE_DIMMED_COLOR = "#ddd";

var g_peers = {}; // global dict of detected peers indexed by peer_id
var g_peer_answer_awaits_count = 0; // how many peers were requested but not yet answered
var g_scan_queue = []; // global queue of peers (ip:port) to be scanned
var g_scan_enabled = false; // global flag enabling/disabling asyc scan process (used to stop it)
var g_simulation_enabled = true;
var g_colorize_top_block = false;
var g_verbose_log = false;


// graph data
var g_links = [];
var g_nodes = [];


// setup slippers
var split_sizes_1 = localStorage.getItem('split-sizes-1')
split_sizes_1 = split_sizes_1 ? JSON.parse(split_sizes_1) : [67, 33];
var split_sizes_2 = localStorage.getItem('split-sizes-2')
split_sizes_2 = split_sizes_2 ? JSON.parse(split_sizes_2) : [67, 33];

var split_1 = Split(['#upper_box', '#log'], {
    direction: 'vertical',
    sizes: split_sizes_1,
    gutterSize: 5,
    onDragEnd: function () {
        localStorage.setItem('split-sizes-1', JSON.stringify(split_1.getSizes()));
    }
});
var split_2 = Split(['#svg_box', "#info_box"], {
    sizes: split_sizes_2, gutterSize: 7, onDragEnd: function () {
        localStorage.setItem('split-sizes-2', JSON.stringify(split_2.getSizes()));
    }
});

// settings
var buttonShowSettings = document.getElementById("nav_settings"),
    buttonHideSettings = document.getElementById("back"),
    settingBody = document.getElementById("settings");

function showSettings () {
    settingBody.classList.add('active');
}
function hideSettings() {
    settingBody.classList.remove('active');
}

settingBody.classList.remove('active');
buttonShowSettings.addEventListener("click", showSettings);
buttonHideSettings.addEventListener("click", hideSettings);

function getAddress() {
    var x = new XMLHttpRequest();
    var input = document.getElementById("address");
    x.open("GET", "/get_address", true);
    x.onload = function (){
        var ip = JSON.parse(x.responseText);
        input.value = ip.result;
    };
    x.send(null);
}
getAddress();
function getPort() {
    var x = new XMLHttpRequest();
    var input = document.getElementById("port");
    x.open("GET", "/get_port", true);
    x.onload = function (){
        var port = JSON.parse(x.responseText);
        input.value = port.result;
    };
    x.send(null);
}
getPort();
function saveAddress() {
    var xhr  = new XMLHttpRequest();
    var inputVal = document.getElementById("address").value;
    var params = JSON.stringify({'link': inputVal});
    xhr.open("POST", "/set_address", true);
    xhr.send(params);
    xhr.onreadystatechange = function() {
        if ( xhr.readyState !== 4 ) {
            return
        }
        if (xhr.status === 200) {
            console.log('address saved');
        } else {
            console.log('err', xhr.responseText)
        }
    }
}
function savePort() {
    var xhr  = new XMLHttpRequest();
    var inputVal = document.getElementById("port").value;
    var params = JSON.stringify({'link': parseInt(inputVal)});
    xhr.open("POST", "/set_port", true);
    xhr.send(params);
    xhr.onreadystatechange = function() {
        if ( xhr.readyState !== 4 ) {
            return
        }
        if (xhr.status === 200) {
            console.log('port saved');
        } else {
            console.log('err', xhr.responseText)
        }
    }
}

function refreshScan() {
    var xhr  = new XMLHttpRequest();
    xhr.open("POST", "/refreshScan", true);
    xhr.send();
}

function save_ip_port() {
    saveAddress();
    savePort();
    button_clear_log_click(); //clear log
    button_clear_click(); // clear graphic
    refreshScan();
    alert('ip-address end port saved');
}

//end settings
button_clear_log_click();
log_clear();

var error = {
    clearLog: function () {
        document.getElementById("log").innerHTML = "";
    },
    getError: function() {
      var x = new XMLHttpRequest();
      x.open("GET", "/get_error", true);
      x.onload = function (){
          var el = document.getElementById("log");
          var error = JSON.parse(x.responseText);
          var arr = error.result;
          var item, len, html = '';
          for (item = 0, len = arr.length; item < len; ++item) {
              html += "<pre>" + arr[item].date + "&nbsp;" + arr[item].object + "</pre>";
          }
          el.innerHTML = html;
          el.scrollTop = el.scrollHeight;
      };
      x.send(null);
    }
};
function showError() {
    error.clearLog();
    error.getError();
}


function log(x) {
    var el = document.getElementById("log");
    el.innerHTML += "<pre>" + x + "</pre>\n";
    el.scrollTop = el.scrollHeight;  // triggers reflow, so it's quite sloooow
}

function log_scroll_down() {
    var el = document.getElementById("log");
    el.scrollTop = el.scrollHeight;
}

function log_error(x) {
    var el = document.getElementById("log");
    el.innerHTML += "<pre><span class=\"error\">" + x + "</span></pre>\n";
    el.scrollTop = el.scrollHeight;
}

function log_clear() {
    document.getElementById("log").innerHTML = "";
}

function infobox_fill(x) {
    document.getElementById("info_box").innerHTML = "<pre>" + x + "</pre>\n";
}

function infobox_clear() {
    document.getElementById("info_box").innerHTML = "";
}

function clear_scan_results() {
    g_peers = {};
    g_scan_queue = [];
    g_scan_enabled = true;
    g_peer_answer_awaits_count = 0;
    update_known_ips_counter(0);
    infobox_clear();
    log("scan results cleared");
}

function button_clear_click() {
    clear_scan_results();

    g_links = [];
    g_nodes = [];
    d3.selectAll("circle").remove();
    d3.selectAll("line").remove();
    graph_restart();
    document.getElementById("colorize_default_radio").checked = true;
}

function button_clear_log_click() {
    log_clear();
}

function clear_node_selection(redraw) {

    if ( redraw == undefined ) redraw = true;

    for (var peer_id in g_peers_mini) {
        if (g_peers_mini.hasOwnProperty(peer_id)) {
            var p = g_peers_mini[peer_id];
            p.selected = false;
        }
    }
    if (redraw) redraw_node_selection();
}

function select_node_by_ip_or_hostname_press(event) {
    if (event.keyCode != 13)
        return;

    clear_node_selection(false);

    var needle_text = document.getElementById("search_node").value;
    var needles = needle_text.split(/[, ;]/);
    var selected_peers = 0;
    for (var i = 0; i < needles.length; ++i) {
        var el = needles[i];
        for (var peer_id in g_peers_mini) {
            if (g_peers_mini.hasOwnProperty(peer_id)) {
                var p = g_peers_mini[peer_id];
                if (p.address == el || (p.net_info && (p.net_info.hostname == el || p.net_info.mining_group == el))) {
                    g_peers_mini[peer_id].selected = true;
                    log("Peer selected: " + p.address + (p.net_info ? " " + p.net_info.hostname + "/" + p.net_info.mining_group : ""));
                    ++selected_peers;
                    if (selected_peers == 1)
                        infobox_show_peer_info(peer_id); // show the first one
                }
            }
        }
    }

    if (selected_peers == 0) {
        log("No peers selected for request '" + needle_text + "'");
    }
    else {
        log(selected_peers + " peers selected");
        redraw_node_selection();
    }

    log_scroll_down();
}

function update_peers_counter(x) {
    document.getElementById("peers_counter").innerHTML = x;
}

function set_network_status(x) {
    document.getElementById("network_status").style.color = x;
    document.getElementById("network_status").innerHTML = x;
}

function update_known_ips_counter(x, y) {
    document.getElementById("known_ips_counter").innerHTML = x + "/" + y;
}

function colorize_radio_click() {
    const NODE_DIMMED_COLOR = "#ddd";
    if (document.getElementById("colorize_top_radio").checked) {
        node.attr("fill", function (d) {
            if (!(d.id in g_peers_mini) || (typeof g_peers_mini[d.id].top_block_id_str) === undefined || g_peers_mini[d.id].top_block_id_str == undefined)
                return NODE_DIMMED_COLOR;

            return g_color_ord_top_block(g_peers_mini[d.id].top_block_id_str);
        });
    }
    else if (document.getElementById("colorize_mining_radio").checked) {
        node.attr("fill", function (d) {
            if (!(d.id in g_peers_mini))
                return NODE_DIMMED_COLOR;

            var v = g_peers_mini[d.id];
            if (!v.mining_speed && (!v.net_info || !v.net_info.mining_group))
                return NODE_DIMMED_COLOR;

            if (v.net_info && v.net_info.mining_group == "pos")
                return "#A0D639";

            if (v.net_info && v.net_info.mining_group == "pow" && !v.mining_speed)
                return "#d88";

            return "#b22";
        });
    }
    else if (document.getElementById("colorize_version_radio").checked) {
        node.attr("fill", function (d) {
            if (!(d.id in g_peers_mini) || g_peers_mini[d.id].version == undefined)
                return NODE_DIMMED_COLOR;

            return g_color_ord_top_block(g_peers_mini[d.id].version);
        });
    }
    else if (document.getElementById("colorize_tx_pool_size_radio").checked) {
        node.attr("fill", function (d) {
            if (!(d.id in g_peers_mini) || g_peers_mini[d.id].tx_pool_size == undefined)
                return NODE_DIMMED_COLOR;

            return g_color_ord_top_block(g_peers_mini[d.id].tx_pool_size);
        });
    }
    else if (document.getElementById("colorize_log_errors_radio").checked) {
        node.attr("fill", function (d) {
            if (!(d.id in g_peers_mini) || !g_peers_mini[d.id].log_errors_total)
                return NODE_DIMMED_COLOR;

            if (g_peers_mini[d.id].log_errors_core > 0)
                return "#b22";

            return "#d88";
        });
    }
    else // default
    {
        node.attr("fill", function (d) {
            return color_scheme[d.color];
        });
    }
}


///////////////////////////////////////////////////////////////////////////////
// graph visualization and simulation
///////////////////////////////////////////////////////////////////////////////
var svg = d3.select("svg");
var width = parseInt(svg.style("width"), 10);
var height = parseInt(svg.style("height"), 10);
var color_scheme = d3.schemeCategory20;
var top_block_cat = d3.schemeCategory10;
top_block_cat.splice(0, 3);
var g_color_ord_top_block = d3.scaleOrdinal(top_block_cat);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink()
        .id(function (d) {
            return d.id;
        })
        .strength(function (d) {
            return 0.05 /*/ Math.min(count(link.source), count(link.target))*/;
        })
        .distance(function (d) {
            return 50;
        })
    )
    .force("charge", d3.forceManyBody().strength(function (d) {
        return -50;
    }))
    .force("center", d3.forceCenter(width / 2, height / 2));

var link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(g_links);

var node = svg.append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(g_nodes);

simulation
    .nodes(g_nodes)
    .on("tick", ticked);

simulation.force("link")
    .links(g_links);

function ticked() {
    link
        .attr("x1", function (d) {
            return d.source.x;
        })
        .attr("y1", function (d) {
            return d.source.y;
        })
        .attr("x2", function (d) {
            return d.target.x;
        })
        .attr("y2", function (d) {
            return d.target.y;
        });

    node
        .attr("cx", function (d) {
            return d.x;
        })
        .attr("cy", function (d) {
            return d.y;
        });
}

function graph_nodes_general_update() {
    // Apply the general update pattern to the nodes.
    node = node.data(g_nodes, function (d) {
        return d.id;
    });
    node = node.enter()
        .append("circle")
        .attr("r", 5)
        .attr("fill", function (d) {
            return color_scheme[typeof d.color !== 'undefined' ? d.color : 12];
        })
        .style("stroke-width", function (d) {
            return node_stroke_width(d);
        })
        .style("stroke", function (d) {
            return node_stroke_color(d);
        })
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))

        .merge(node);
    node.exit().remove();
    node.append("svg:title").text(function (d, i) {
        if (!(d.id in g_peers_mini)) return "n/a";
        var p = g_peers_mini[d.id];
        var errors_info = "";
        if (p.log_errors_stats) {
            for (var el in p.log_errors_stats)
                errors_info += p.log_errors_stats[el].err_count > 0 ? (p.log_errors_stats[el].channel + ": " + p.log_errors_stats[el].err_count + "  ") : "";
        }
        return p.address + ":" + p.port +
            (p.net_info !== undefined ? " " + p.net_info.hostname + "/" + p.net_info.mining_group : "") + " id" + d.id + "\n" +
            "cons: " + (p.connections_count !== undefined ? p.connections_count : "?") + " (" + (p.incoming_connections_count !== undefined ? p.incoming_connections_count : "?") + " in)\n" +
            "top: " + (p.blockchain_height !== undefined ? p.blockchain_height : "?") + " " + (p.top_block_id_str ? p.top_block_id_str.substr(0, 6) + "..." + p.top_block_id_str.substr(-6, 6) : "") + "\n" +
            "alt blks: " + (p.alternative_blocks !== undefined ? p.alternative_blocks : "?") + ", mines @ " + (p.mining_speed !== undefined ? p.mining_speed : "?") + " H/s\n" +
            "txs in pool: " + (p.tx_pool_size !== undefined ? p.tx_pool_size : "?") + ", ver: " + (p.version ? p.version : "?") +
            (errors_info != "" ? "\nERRORS: " + errors_info : "");
    });
}

function line_width_by_link(l) {
    if (l.age) {
        if (l.age > 12 * 60 * 60)
            return 2;
        if (l.age > 1 * 60 * 60)
            return 1.5;
        if (l.age > 20 * 60)
            return 1;
    }
    return 0.5;
}

function line_color_by_link(l) {

    if (l.age) {
        if (l.age > 12 * 60 * 60)
            return "#0052cc";
        if (l.age > 1 * 60 * 60)
            return "#3385ff";
        if (l.age > 20 * 60)
            return "#80b3ff";
    }
    return "#ff3333";
}

function node_stroke_width(d) {
    var p = g_peers_mini[d.id];
    return (p && (p.epic_failure_happend || p.selected)) ? 1.8 : 1.5;
}

function node_stroke_color(d) {
    var p = g_peers_mini[d.id];
    if (!p)
        return "#fff";
    return p.epic_failure_happend ? "#d00" : (p.selected ? "#e22" : "#fff");
}

function redraw_node_selection() {
    node.style("stroke-width", function (d) {
        return node_stroke_width(d);
    })
        .style("stroke", function (d) {
            return node_stroke_color(d);
        });
}

function graph_links_general_update() {
    // Apply the general update pattern to the links.
    link = link.data(g_links, function (d) {
        return d.source.id + "-" + d.target.id;
    });
    link = link.enter()
        .append("line")
        .style("stroke", line_color_by_link)
        .attr("stroke-width", line_width_by_link)
        .merge(link);
    link.exit().remove();
}

function graph_restart() {
    // Update and restart the simulation.
    simulation.nodes(g_nodes);
    graph_nodes_general_update();

    simulation.force("link").links(g_links); // this function converts links array of {"source" : string, "target" : string} into array of {"source" : Object, "target" : Object}
    graph_links_general_update();
    if (g_simulation_enabled)
        simulation.alpha(0.1).restart();
}

function graph_add_node(id, color) {
    g_nodes.push({"id": id, "color": color, "x": width / 2, "y": height / 2});
}

function graph_update_node_color(id, new_color) {
    for (var i = 0; i < g_nodes.length; ++i) {
        if (g_nodes[i].id == id) {
            if (g_nodes[i].color == GRAPH_NODE_START_COLOR)
                return; // don't change color of start node
            g_nodes[i].color = new_color;
            break;
        }
    }

    node.attr("fill", function (d) {
        return color_scheme[d.color];
    });
}

function graph_update_node(id) {
    node.filter(function (d) {
        return d.id == id;
    }).remove();
    node = node.filter(function (d) {
        return d.id != id;
    });
}


function graph_update_link(id) {
    link.filter(function (d) {
        return d.source.id == id || d.target.id == id;
    }).remove();
    link = link.filter(function (d) {
        return d.source.id != id && d.target.id != id;
    });

}

age = undefined;
function graph_add_link( source_id, target_id, age) {
    for (var i = 0; i < g_links.length; ++i) {
        var l = g_links[i];
        if (((l.source.id == source_id) || l.source == source_id) && ((l.target.id == target_id) || l.target == target_id)) {
            g_links[i].age = age; // update age
            return; // such a link already exists
        }
    }

    g_links.push({"source": source_id, "target": target_id, "age": age});
}

d3.selection.prototype.moveToFront = function () {
    return this.each(function () {
        this.parentNode.appendChild(this);
    });
};

function dragstarted(d) {
    if (!d3.event.active && g_simulation_enabled)
        simulation.alphaTarget(0.1).restart();
    d.fx = d.x;
    d.fy = d.y;

    link.style("stroke", GRAPH_LINE_DIMMED_COLOR);
    link.filter(function (l) {
        return d.id == l.target.id;
    })
        .style("stroke", color_scheme[8])
        .moveToFront();
    link.filter(function (l) {
        return d.id == l.source.id;
    })
        .style("stroke", color_scheme[2])
        .moveToFront();

    node_clicked(d);
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active && g_simulation_enabled)
        simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;

    link.style("stroke", line_color_by_link).attr("stroke-width", line_width_by_link);
}

function node_clicked(d) {
    clear_node_selection(false);
    infobox_show_peer_info(d.id);
    if (d.id in g_peers_mini) {
        g_peers_mini[d.id].selected = true;
        redraw_node_selection();
    }
}

function infobox_show_peer_info(peer_id) {
    d3.request("/get_one_peer").post(JSON.stringify({peer_id: peer_id}), function (error, response) {
        var text = "";
        if (response.responseText != "") {
            var p = JSON.parse(response.responseText);
            text = "peer id: " + peer_id + ", ip: " + p.address + ":" + p.port + (p.net_info !== undefined ? " " + p.net_info.hostname + "/" + p.net_info.mining_group : "") + ", response: \n" + (p.json_response ? JSON.stringify(JSON.parse(p.json_response), null, 2) : "n/a");
        }
        if (text != "") {
            infobox_fill(text);
        }
        else {
            infobox_fill("information for peer " + peer_id + " is not available");
            log_error("can't find peer by id " + peer_id);
        }
    });
}

///////////////////////////////////////////////////////////////////////////////
// END of graph visualization and simulation
///////////////////////////////////////////////////////////////////////////////


function button_export_click() {
    d3.request("/get_connections_json").post(JSON.stringify({}), function (error, response) {
        if (error) {
            log("error export data");
            return;
        }

        var downloadLink = document.createElement("a");
        downloadLink.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(response.responseText);
        downloadLink.download = "data.json";

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    });
}


var g_peers_mini = {};

function button_refresh_click() {
    d3.request("/refresh_peers_list").post(JSON.stringify({}), function (error, response) {
        if (!error) log("updating peers info, please wait");
    });
}


function get_list() {
    d3.request("/get_list").post(JSON.stringify({}), function (error, response) {

        var lists = JSON.parse(response.responseText);

        var g_peers_mini_prev = g_peers_mini;
        g_peers_mini = lists.g_peers_mini;

        if (Object.keys(g_peers_mini).length > 0) {
            console.log("success");
        } else {
            showError();
        }
        set_network_status(lists.network_status);

        update_peers_counter(lists.peers_count);
        update_known_ips_counter(lists.presented_known_ips_counter, lists.g_known_ips_counter);

        for (var nodeIndex1 = g_nodes.length - 1; nodeIndex1 >= 0; nodeIndex1--) {
            var exist = false;
            for (var nodeIndex2 = 0; nodeIndex2 < lists.g_nodes.length; nodeIndex2++) {
                if (g_nodes[nodeIndex1].id == lists.g_nodes[nodeIndex2].id) {
                    exist = true;
                    if (g_nodes[nodeIndex1].color != lists.g_nodes[nodeIndex2].color) {
                        log("color " + g_peers_mini[g_nodes[nodeIndex1].id].address + ":" + g_peers_mini[g_nodes[nodeIndex1].id].port + "  " + g_nodes[nodeIndex1].id + "  " + lists.g_nodes[nodeIndex2].color);
                        graph_update_node_color(g_nodes[nodeIndex1].id, lists.g_nodes[nodeIndex2].color);
                    }
                    break;
                }
            }
            if (exist == false) {
                log("remove " + g_peers_mini_prev[g_nodes[nodeIndex1].id].address + ":" + g_peers_mini_prev[g_nodes[nodeIndex1].id].port + "  " + g_nodes[nodeIndex1].id);
                graph_update_node(g_nodes[nodeIndex1].id);
                graph_update_link(g_nodes[nodeIndex1].id);
                g_nodes.splice(nodeIndex1, 1);
            }
        }

        for (var nodeIndex1 = 0; nodeIndex1 < lists.g_nodes.length; nodeIndex1++) {
            var exist = false;
            for (var nodeIndex2 = 0; nodeIndex2 < g_nodes.length; nodeIndex2++) {
                if (lists.g_nodes[nodeIndex1].id == g_nodes[nodeIndex2].id) {
                    exist = true;
                    break;
                }
            }
            if (exist == false) {
                log("add " + g_peers_mini[lists.g_nodes[nodeIndex1].id].address + ":" + g_peers_mini[lists.g_nodes[nodeIndex1].id].port + "  " + lists.g_nodes[nodeIndex1].id);
                graph_add_node(lists.g_nodes[nodeIndex1].id, lists.g_nodes[nodeIndex1].color);
            }
        }

        g_links = [];

        d3.selectAll("line").remove();
        graph_restart();

        for (var linkIndex = 0; linkIndex < lists.g_links.length; linkIndex++) {
            graph_add_link(lists.g_links[linkIndex].source, lists.g_links[linkIndex].target, lists.g_links[linkIndex].age);
        }

        graph_restart();
    });
}

var last_update_time_frontend = 0;

var check_last_update_time = function () {
    d3.request("/get_last_update_time").post(JSON.stringify({}), function (error, response) {
        var last_update_time_backend = JSON.parse(response.responseText);
        if (last_update_time_frontend < last_update_time_backend) {
            last_update_time_frontend = last_update_time_backend;
            get_list();
        }
    });
};

check_last_update_time();

setInterval(function () {
    check_last_update_time();
}, 10000);

