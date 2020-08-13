var http = require('http');
var static = require('node-static');
var file = new static.Server('.');
var nodemailer = require('nodemailer');
var cp = require("child_process");
var fs = require('fs');

// var request = require('request');

var config = fs.readFileSync('config.json', 'utf8');
config = JSON.parse(config);

function set_port(newPort, callback){
    var ipPattern = /[0-9]{1,5}$/;
    if (ipPattern.test(newPort)) {
        config.start_scan_port = newPort.toString();
        fs.writeFile('config.json', JSON.stringify(config, null, 2), function (err) {
            if (!err) {
                callback(200, "new port saved");
            } else {
                callback(400, "error");
            }
        })
    } else {
        callback(200, "error not valid port");
    }
}

function set_address(newAddress, callback){
    var ipPattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    if (ipPattern.test(newAddress)) {
        config.start_scan_address = newAddress;
        fs.writeFile('config.json', JSON.stringify(config, null, 2), function (err) {
            if (!err) {
                callback(200, "new ip-address saved");
            } else {
                callback(400, "error");
            }
        })
    } else {
        callback(200, "error not valid ip");
    }
}

var logError = [];

var g_known_ips = [
    {ip: "104.156.232.61", hostname: "syd3", mining_group: "pos"},
    {ip: "104.156.244.143", hostname: "mia1", mining_group: "pos"},
    {ip: "104.207.130.50", hostname: "fra3", mining_group: "pos"},
    {ip: "104.207.151.124", hostname: "sil1", mining_group: "pos"},
    {ip: "107.170.237.241", hostname: "sfo1", mining_group: "pow"},
    {ip: "107.191.46.239", hostname: "par1", mining_group: "pos"},
    {ip: "108.61.173.167", hostname: "lon3", mining_group: "pos"},
    {ip: "108.61.176.47", hostname: "par2", mining_group: "pos"},
    {ip: "108.61.176.5", hostname: "par3", mining_group: "pos"},
    {ip: "128.199.109.224", hostname: "sgp1", mining_group: "pow"},
    {ip: "138.197.140.129", hostname: "tor4", mining_group: "pow"},
    {ip: "138.68.168.153", hostname: "lon2", mining_group: "pow"},
    {ip: "138.68.40.246", hostname: "sfo2", mining_group: "pow"},
    {ip: "138.68.70.197", hostname: "fra2", mining_group: "pow"},
    {ip: "139.59.1.18", hostname: "blr1", mining_group: "pow"},
    {ip: "139.59.35.109", hostname: "blr2", mining_group: "pow"},
    {ip: "139.59.35.110", hostname: "blr3", mining_group: "pow"},
    {ip: "139.59.35.111", hostname: "blr4", mining_group: "pow"},
    {ip: "159.203.57.100", hostname: "tor1", mining_group: "pow"},
    {ip: "159.203.59.53", hostname: "tor3", mining_group: "pow"},
    {ip: "159.203.63.238", hostname: "tor2", mining_group: "pow"},
    {ip: "188.166.157.90", hostname: "lon1", mining_group: "pow"},
    {ip: "188.166.186.12", hostname: "sgp2", mining_group: "pow"},
    {ip: "188.166.3.6", hostname: "ams2", mining_group: "pow"},
    {ip: "192.241.152.52", hostname: "nyc1", mining_group: "pow"},
    {ip: "192.241.190.247", hostname: "nyc2", mining_group: "pow"},
    {ip: "45.32.144.120", hostname: "par4", mining_group: "pos"},
    {ip: "45.32.178.252", hostname: "lon4", mining_group: "pos"},
    {ip: "45.32.247.42", hostname: "syd1", mining_group: "pos"},
    {ip: "45.32.30.236", hostname: "tok3", mining_group: "pos"},
    {ip: "45.33.73.39", hostname: "", mining_group: ""},
    {ip: "45.63.29.148", hostname: "syd4", mining_group: "pos"},
    {ip: "45.76.105.157", hostname: "tok2", mining_group: "pos"},
    {ip: "45.76.113.92", hostname: "syd2", mining_group: "pos"},
    {ip: "45.76.154.96", hostname: "sgp3", mining_group: "pos"},
    {ip: "45.76.158.154", hostname: "sgp4", mining_group: "pos"},
    {ip: "45.76.217.36", hostname: "tok1", mining_group: "pos"},
    {ip: "45.76.220.252", hostname: "tok4", mining_group: "pos"},
    {ip: "45.76.81.219", hostname: "fra4", mining_group: "pos"},
    {ip: "46.101.99.181", hostname: "fra1", mining_group: "pow"},
    {ip: "95.85.29.162", hostname: "ams1", mining_group: "pow"},
];


// constants section
const NODE_SCAN_TIMEOUT = 5000; // ms
const SCAN_PARALLEL_REQUESTS_MAX = 8; // max number of simultaneously requested peers, set to 1 to make debugging a little easier

const GRAPH_NODE_START_COLOR = 4; // index in color sheme
const GRAPH_NODE_NORMAL_COLOR = 0; // index in color sheme
const GRAPH_NODE_OUT_CONN_ONLY_COLOR = 15; // index in color sheme

var g_peers = {}; // global dict of detected peers indexed by peer_id
var g_peer_answer_awaits_count = 0; // how many peers were requested but not yet answered
var g_scan_queue = []; // global queue of peers (ip:port) to be scanned
var g_scan_enabled = false; // global flag enabling/disabling asyc scan process (used to stop it)

// graph data
var g_links = [];
var g_nodes = [];


var timerPeers;
var unique_peers = [];
var g_nodes_global = [];
var g_links_global = [];
var g_peers_global = {};
var last_update_time = 0;


function log(x, toLogError) {
    if ( toLogError ) logError.push({date: (new Date()).toLocaleString(), object: x});
    console.log(x);
}

function scan_peer(address, port, peer_id) {
    peer_id = (peer_id) ? peer_id : 0;
    if (!g_scan_enabled) return;
    var scan_peer_params =
        {
            "ip_address": address,
            "port": port,
            "timeout": NODE_SCAN_TIMEOUT,
            "peer_id": peer_id
        };

    ++g_peer_answer_awaits_count; // each time the request is sent -- increment the counter

    var launch_string = 'connectivity_tool --private_key='+config.connectivity_tool_private_key+' --request_net_state --request_stat_info';
    launch_string += ' --ip=' + scan_peer_params.ip_address;
    launch_string += ' --port=' + scan_peer_params.port;
    launch_string += ' --timeout=' + scan_peer_params.timeout;
    if (scan_peer_params.peer_id && scan_peer_params.peer_id > 0) {
        launch_string += ' --peer_id=' + scan_peer_params.peer_id;
    }


    //request.post("http://88.198.50.112:8090/scan_peer", {json: scan_peer_params}, function (stderr, response, stdout) {
    //    stdout = JSON.stringify(stdout);
    cp.exec(launch_string, function (err, stdout, stderr) {

        --g_peer_answer_awaits_count; //each time the response is received -- decrement the counter

        if (!g_scan_enabled) return;

        if (stderr) {
            log('Error response: ' + stderr, true);
        } else {
            var j_resp = JSON.parse(stdout);

            var source_peer_id = "";
            var conn_list = [];
            if (j_resp && j_resp.ns_rsp && j_resp.ns_rsp.connections_list && (typeof j_resp.ns_rsp.my_id !== undefined)) {
                conn_list = j_resp.ns_rsp.connections_list;
                source_peer_id = j_resp.ns_rsp.my_id;

                if (g_nodes.length == 0) {
                    // add the very first node
                    graph_add_node(source_peer_id, GRAPH_NODE_START_COLOR);
                    g_peers[source_peer_id] = {
                        address: scan_peer_params.ip_address,
                        port: scan_peer_params.port,
                        has_incoming_connections: false
                    };
                }
            }

            if (conn_list.length == 0) log("Can't obtain connection list: " + stdout, true);

            if (j_resp && j_resp.si_rsp && source_peer_id && (source_peer_id in g_peers)) {
                var p = g_peers[source_peer_id];
                p.json_response = stdout;
                p.connections_count = j_resp.si_rsp.connections_count;
                p.incoming_connections_count = j_resp.si_rsp.incoming_connections_count;
                p.alternative_blocks = j_resp.si_rsp.payload_info.alternative_blocks;
                p.blockchain_height = j_resp.si_rsp.payload_info.blockchain_height;
                p.mining_speed = j_resp.si_rsp.payload_info.mining_speed;
                p.top_block_id_str = j_resp.si_rsp.payload_info.top_block_id_str;
                p.tx_pool_size = j_resp.si_rsp.payload_info.tx_pool_size;
                p.epic_failure_happend = j_resp.si_rsp.payload_info.epic_failure_happend;
                p.version = j_resp.si_rsp.version;
                p.log_errors_core = 0;
                p.log_errors_total = 0;

                if (j_resp.si_rsp.payload_info.errors_stat && j_resp.si_rsp.payload_info.errors_stat.constructor === Array) {
                    p.log_errors_stats = j_resp.si_rsp.payload_info.errors_stat.sort(function (a, b) {
                        return a.err_count < b.err_count ? 1 : (a.err_count > b.err_count ? -1 : 0);
                    });
                    for (var el in p.log_errors_stats) {
                        p.log_errors_total += p.log_errors_stats[el].err_count;
                        if (p.log_errors_stats[el].channel == "core")
                            p.log_errors_core = p.log_errors_stats[el].err_count;
                    }
                }
            }

            for (var i = 0; i < conn_list.length; ++i) {
                var c = conn_list[i];
                var c_ip = c.ip;
                var c_port = c.port;
                var c_is_income = c.is_income == "1";
                var c_peer_id = c.peer_id;
                if (c_peer_id == 0)
                    continue;
                var c_age = undefined;
                if (c.time_started)
                    c_age = Math.floor(Date.now() / 1000) - c.time_started;
                if (c_peer_id in g_peers) {
                    // have already seen this peer - check conn direction
                    if (!c_is_income && !g_peers[c_peer_id].has_incoming_connections) {
                        g_peers[c_peer_id].has_incoming_connections = true;
                        g_peers[c_peer_id].port = c_port; // update port for incoming connections
                        graph_update_node_color(c_peer_id, GRAPH_NODE_NORMAL_COLOR);
                    }
                } else {
                    // new peer - add it to the peer list
                    g_peers[c_peer_id] = {
                        address: c_ip,
                        port: c_port,
                        has_incoming_connections: !c_is_income
                    };

                    graph_add_node(c_peer_id, c_is_income ? GRAPH_NODE_OUT_CONN_ONLY_COLOR : GRAPH_NODE_NORMAL_COLOR);

                    if (c_is_income) {
                        // it's unclear whether this new peer accepts incoming connections -- add it to the end of the queue with the default port (we don't know the actual port for sure)
                        g_scan_queue.push({
                            address: c_ip,
                            port: config.port_default,
                            peer_id: c_peer_id
                        });
                    } else {
                        // seems this new peer accepts incoming connections -- add it to the beginning of the queue
                        g_scan_queue.unshift({
                            address: c_ip,
                            port: c_port,
                            peer_id: c_peer_id
                        });
                    }
                }

                update_known_ips(c_ip, g_peers[c_peer_id]);

                if (c_is_income)
                    graph_add_link(c_peer_id, source_peer_id, c_age);
                else
                    graph_add_link(source_peer_id, c_peer_id, c_age);
            }
        }

        if (g_scan_queue.length == 0) {
            log("scan process finished! Peers:", true);
            var peers_count = 0;
            for (var peer_id in g_peers) {
                if (g_peers.hasOwnProperty(peer_id)) {
                    var p = g_peers[peer_id];
                    log("peer id: " + peer_id + ", address: " + p.address + ":" + p.port + " has_incoming_connections: " + p.has_incoming_connections, true);
                    ++peers_count;
                }
            }
            log("total peers found: " + peers_count, true);
            log_not_presented_known_ips();
        }
        else {
            var peers_count = 0;
            for (var peer_id in g_peers)
                if (g_peers.hasOwnProperty(peer_id))
                    ++peers_count;

            while (g_scan_queue.length != 0 && g_peer_answer_awaits_count < SCAN_PARALLEL_REQUESTS_MAX) {
                var next_peer = g_scan_queue.shift();
                log("Next peer: " + next_peer.peer_id + " at " + next_peer.address + ":" + next_peer.port, true);
                scan_peer(next_peer.address, next_peer.port, next_peer.peer_id);
            }
        }

        if (g_scan_queue.length == 0 && g_peer_answer_awaits_count == 0) {

            while (unique_peers.length > 0) {
                var next_peer_qqq = unique_peers.shift();
                if (g_peers[next_peer_qqq.peer_id] === undefined) {
                    scan_peer(next_peer_qqq.address, next_peer_qqq.port, next_peer_qqq.peer_id);
                    break;
                }
            }
            if (unique_peers.length == 0) {
                g_scan_enabled = false;
                log("scan process finished!", true);
                g_nodes_global = JSON.parse(JSON.stringify(g_nodes));
                g_links_global = JSON.parse(JSON.stringify(g_links));
                g_peers_global = JSON.parse(JSON.stringify(g_peers));
                last_update_time = Date.now();
                check_network_status();
                timerPeers = setTimeout(function () {
                    check_peers();
                }, 1000 * 60 * 5);
            }
        }
    });
}


function clear_known_ips() {
    for (var i = 0; i < g_known_ips.length; ++i)
        g_known_ips[i].present = false;
}

function update_known_ips(c_ip, peer_obj) {
    var presented_known_ips_counter = 0;
    for (var i = 0; i < g_known_ips.length; ++i) {
        var v = g_known_ips[i];
        if (v.ip == c_ip) {
            v.present = true;
            peer_obj.net_info = v;
        }
        if (v.present === true) ++presented_known_ips_counter;
    }
}

function log_not_presented_known_ips() {
    log("These known IPs were not found during the scan:", true);
    log("IP/hostname/mining_group", true);
    for (var i = 0; i < g_known_ips.length; ++i) {
        var v = g_known_ips[i];
        if (!v.present) log(v.ip + "/" + (v.hostname ? v.hostname : "?") + "/" + (v.mining_group ? v.mining_group : "?"), true);
    }
}

function graph_add_node(id, color) {
    g_nodes.push({"id": id, "color": color});
}

function graph_update_node_color(id, new_color) {
    for (var i = 0; i < g_nodes.length; ++i) {
        if (g_nodes[i].id == id) {
            if (g_nodes[i].color == GRAPH_NODE_START_COLOR) return; // don't change color of start node
            g_nodes[i].color = new_color;
            break;
        }
    }
}

function graph_add_link(source_id, target_id, age) {
    age = (age) ? age : undefined;
    for (var i = 0; i < g_links.length; ++i) {
        var l = g_links[i];
        if (((l.source.id == source_id) || l.source == source_id) && ((l.target.id == target_id) || l.target == target_id)) {
            g_links[i].age = age; // update age
            return; // such a link already exists
        }
    }
    g_links.push({"source": source_id, "target": target_id, "age": age});
}

function check_peers() {
    log("scan start", true);
    clear_known_ips();
    g_scan_enabled = true;
    logError = [];
    var next_peer;
    for (var p in g_peers) {
        if (g_peers[p].address == "") {
            next_peer = {
                address: g_peers[p].address,
                port: g_peers[p].port,
                peer_id: p
            };
        } else {
            unique_peers.push({
                address: g_peers[p].address,
                port: g_peers[p].port,
                peer_id: p
            });
        }
    }
    g_nodes = [];
    g_links = [];
    g_peers = {};

    if (!next_peer && unique_peers.length) next_peer = unique_peers.shift();
    if (next_peer) scan_peer(next_peer.address, next_peer.port, next_peer.peer_id);
}


// checking network status

var network_status = "green";

function getMedian(args) {
    if (!args.length) return 0;
    var numbers = args.slice(0).sort(function (a, b) {
        return a - b;
    });
    var middle = Math.floor(numbers.length / 2);
    var isEven = numbers.length % 2 === 0;
    return isEven ? (numbers[middle] + numbers[middle - 1]) / 2 : numbers[middle];
}

function check_network_status() {
    var problems = [];

    for (var n in g_peers_global) {
        if (g_peers_global[n].log_errors_core) {
            problems.push({type: "core error", node: g_peers_global[n]});
        }

        if (g_peers_global[n].json_response) {
            var rsp_local = JSON.parse(g_peers_global[n].json_response);

            if (rsp_local && rsp_local.ns_rsp && rsp_local.ns_rsp.connections_list) {
                var conn_list = rsp_local.ns_rsp.connections_list;

                var connection_age_list = [];
                for (var conn = 0; conn < conn_list.length; conn++) {
                    connection_age_list.push(rsp_local.ns_rsp.local_time - conn_list[conn].time_started);
                }

                var connection_age_median = getMedian(connection_age_list);

                if(connection_age_median < 5*60*1000 && rsp_local.ns_rsp.up_time > 10*60*1000){
                    problems.push({type: "connection error", node: g_peers_global[n]});
                }
            }
        }
    }

    if (network_status == "green" && problems.length) {
        network_status = "red";
        SendMail("Network changed status on RED<br><code>"+JSON.stringify(problems)+"</code>", function(status){
            if ( status=="success" ) log("email send"); else log("email sending error");
        });
    } else if (network_status == "red" && problems.length == 0) {
        network_status = "green";
        SendMail("Network changed status on GREEN", function(status){
            if ( status=="success" ) log("email send"); else log("email sending error");
        });
    }

}

function SendMail(data, callback) {
    var transporter = nodemailer.createTransport({
        sendmail: true,
        newline: 'unix',
        path: '/usr/sbin/sendmail'
    });

    var mailOptions = {
        from: 'Network status',
        to: config.email_to,
        subject: 'Network status',
        text: 'Network status',
        html: data
    };

    transporter.sendMail(mailOptions, function (error) {
        if (error) {
            callback('error');
        }else{
            callback('success');
        }
    });
}




// checking network status END
g_scan_enabled = true;
logError = [];
log("scan start. Port "+config.start_scan_port, true);
scan_peer(config.start_scan_address, config.start_scan_port);

var timerRefreshScan;

function refreshScan() {
    if (timerRefreshScan) clearTimeout(timerRefreshScan);

    if (!g_scan_enabled) {
        clearTimeout(timerPeers);
        g_peers = {};
        g_peer_answer_awaits_count = 0;
        g_scan_queue = [];

        g_links = [];
        g_nodes = [];

        unique_peers = [];
        g_nodes_global = [];
        g_links_global = [];
        g_peers_global = {};
        last_update_time = 0;

        g_scan_enabled = true;
        logError = [];
        console.log("scan start. Port "+config.start_scan_port, true);
        scan_peer(config.start_scan_address, config.start_scan_port);
    }else{
        timerRefreshScan = setTimeout(function () {
            refreshScan();
        }, 1000 * 10);
    }
}

http.createServer(function (req, res) {
    log('request: ' + req.url);
    if (req.url === '/get_list') {
        res.writeHead(200, {"Content-Type": "text/plain", "Access-Control-Allow-Origin": "*"});
        var peers_count = 0;
        for (var peer_id in g_peers_global) if (g_peers_global.hasOwnProperty(peer_id)) ++peers_count;

        var presented_known_ips_counter = 0;
        for (var i = 0; i < g_known_ips.length; ++i) if (g_known_ips[i].present === true) ++presented_known_ips_counter;

        var g_peers_mini = {};
        for (var peer_id in g_peers_global) {
            var p = g_peers_global[peer_id];
            g_peers_mini[peer_id] = {
                epic_failure_happend: p.epic_failure_happend,
                log_errors_stats: p.log_errors_stats,
                log_errors_total: p.log_errors_total,
                log_errors_core: p.log_errors_core,
                address: p.address,
                port: p.port,
                net_info: p.net_info,
                connections_count: p.connections_count,
                incoming_connections_count: p.incoming_connections_count,
                blockchain_height: p.blockchain_height,
                top_block_id_str: p.top_block_id_str,
                alternative_blocks: p.alternative_blocks,
                mining_speed: p.mining_speed,
                tx_pool_size: p.tx_pool_size,
                version: p.version
            };
        }

        var send = {
            g_peers_mini: g_peers_mini,
            presented_known_ips_counter: presented_known_ips_counter,
            g_known_ips_counter: g_known_ips.length,
            peers_count: peers_count,
            g_nodes: g_nodes_global,
            g_links: g_links_global,
            network_status: network_status
        };
        res.end(JSON.stringify(send));
    } else if (req.url === '/get_one_peer') {
        var body = [];
        req.on('data', function (chunk) {
            body.push(chunk);
        }).on('end', function () {
            body = Buffer.concat(body).toString();
            var params_object = JSON.parse(body);
            res.writeHead(200, {"Content-Type": "text/plain", "Access-Control-Allow-Origin": "*"});
            if (params_object.peer_id in g_peers_global) {
                res.end(JSON.stringify(g_peers_global[params_object.peer_id]));
            } else {
                res.end("");
            }
        });
    } else if (req.url === '/get_last_update_time') {
        res.writeHead(200, {"Content-Type": "text/plain", "Access-Control-Allow-Origin": "*"});
        res.end(JSON.stringify(last_update_time));
    } else if (req.url === '/refresh_peers_list') {
        if (!g_scan_enabled) {
            clearTimeout(timerPeers);
            check_peers();
        }
        res.writeHead(200, {"Content-Type": "text/plain", "Access-Control-Allow-Origin": "*"});
        res.end(JSON.stringify("wait"));
    } else if (req.url === '/get_connections_json') {
        var list = {};
        for (var i = 0; i < g_nodes_global.length; i++) {
            if (g_peers_global[g_nodes_global[i].id])
                list[g_peers_global[g_nodes_global[i].id].address + ":" + g_peers_global[g_nodes_global[i].id].port] = [];
        }
        for (var j = 0; j < g_links_global.length; j++) {
            if (g_peers_global[g_links_global[j].source] && g_peers_global[g_links_global[j].target])
                list[g_peers_global[g_links_global[j].source].address + ":" + g_peers_global[g_links_global[j].source].port].push(g_peers_global[g_links_global[j].target].address + ":" + g_peers_global[g_links_global[j].target].port);
        }

        var list2 = [];
        for (var ip in list) {
            var obj = {
                ip: ip,
                connections: list[ip].sort(function (a, b) {
                    var a_local = a.split(".");
                    var b_local = b.split(".");
                    for (var i = 0; i < a_local.length; i++) {
                        if (parseInt(a_local[i]) < parseInt(b_local[i])) return -1;
                        if (parseInt(a_local[i]) > parseInt(b_local[i])) return 1;
                    }
                    return 0;
                })
            };
            list2.push(obj);
        }

        list2.sort(function (a, b) {
            var a_local = a.ip.split(".");
            var b_local = b.ip.split(".");
            for (var i = 0; i < a_local.length; i++) {
                if (parseInt(a_local[i]) < parseInt(b_local[i])) return -1;
                if (parseInt(a_local[i]) > parseInt(b_local[i])) return 1;
            }
            return 0;
        });

        res.writeHead(200, {"Content-Type": "text/plain", "Access-Control-Allow-Origin": "*"});
        res.end(JSON.stringify(list2, null, 4));
    } else if (req.url === '/set_address') {
        var body = [];
        req.on('data', function (chunk) {
            body.push(chunk);
        }).on('end', function () {
            if (!body.length) {
                res.writeHead(400, {"Content-Type": "text/plain"});
                res.end("Error. Need 'link' param");
                return;
            }
            body = Buffer.concat(body).toString();
            var params_object = JSON.parse(body);

            if (params_object.link != undefined) {
                set_address(params_object.link, function (code, data) {
                    res.writeHead(code, {"Content-Type": "text/plain"});
                    res.end(JSON.stringify(data));
                });
            } else {
                res.writeHead(400, {"Content-Type": "text/plain"});
                res.end("Error. Need 'link' param");
            }
        });
    } else if (req.url === '/set_port') {
        var body = [];
        req.on('data', function (chunk) {
            body.push(chunk);
        }).on('end', function () {
            if (!body.length) {
                res.writeHead(400, {"Content-Type": "text/plain"});
                res.end("Error. Need 'link' param");
                return;
            }
            body = Buffer.concat(body).toString();
            var params_object = JSON.parse(body);

            if (params_object.link != undefined) {
                set_port(params_object.link, function (code, data) {
                    res.writeHead(code, {"Content-Type": "text/plain"});
                    res.end(JSON.stringify(data));
                });
            } else {
                res.writeHead(400, {"Content-Type": "text/plain"});
                res.end("Error. Need 'link' param");
            }
        });
    } else if (req.url === '/get_address') {
        if ( config.start_scan_address ){
            res.writeHead(200, {"Content-Type": "text/plain"});
            res.end(JSON.stringify({result:config.start_scan_address}));
        } else {
            res.writeHead(400, {"Content-Type": "text/plain"});
            res.end("start scan address not found");
        }
    } else if (req.url === '/get_port') {
        if ( config.start_scan_port ){
            res.writeHead(200, {"Content-Type": "text/plain"});
            res.end(JSON.stringify({result:config.start_scan_port}));
        } else {
            res.writeHead(400, {"Content-Type": "text/plain"});
            res.end("start scan port not found");
        }
    }
    else if(req.url === '/refreshScan') {
        if ( config.start_scan_port &&  config.start_scan_address ) {
            res.writeHead(200, {"Content-Type": "text/plain"});
            refreshScan();
            res.end("refresh peers list");
        } else {
            res.writeHead(400, {"Content-Type": "text/plain"});
            res.end("start scan port || start scan address not found");
        }
    }else if(req.url === '/scan_peer') {
        var body = [];
        req.on('error', function(err) {
            console.error(err);
        }).on('data', function(chunk) {
            body.push(chunk);
        }).on('end', function() {
            body = Buffer.concat(body).toString();
            // At this point, we have the headers, method, url and body, and can now
            // do whatever we need to in order to respond to this request.
            //console.log('request_body ' + body);
            var params_object = JSON.parse(body);
            var launch_string = 'connectivity_tool --private_key='+config.connectivity_tool_private_key+' --request_net_state --request_stat_info';
            launch_string += ' --ip=' + params_object.ip_address;
            launch_string += ' --port=' + params_object.port;
            launch_string += ' --timeout=' + params_object.timeout;
            if(params_object.peer_id && params_object.peer_id > 0)
            {
                launch_string += ' --peer_id=' + params_object.peer_id;
            }
            console.log('Executing: ' + launch_string);

            cp.exec(launch_string, function (err, stdout, stderr) {
                res.writeHead(200,	{"Content-Type": "text/plain", "Access-Control-Allow-Origin": "*"});
                res.end(stdout);
                console.log('Done.');
            });
        })
    } else if (req.url === '/get_error') {
        if (logError.length > 0) {
            res.writeHead(200, {"Content-Type": "text/plain"});
            res.end(JSON.stringify({result:logError}));
        } else {
            res.writeHead(400, {"Content-Type": "text/plain"});
            res.end("log error is empty");
        }
    } else {
        file.serve(req, res);
    }
}).listen(parseInt(config.server_port));