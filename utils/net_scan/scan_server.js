var http = require('http');
var static = require('node-static');
var cp = require("child_process");
var file = new static.Server('./http');

function uber_escape(s) {
  var result = '';

  for(var i = 0; i < s.length; ++i) {
    var c = s.charCodeAt(i);
    if ((0x20 <= c && c <= 0x7e) || c == 0x0d || c == 0x0a)
      result += s[i];
    else
      result += (c >= 0x10 ? '\\u00' : '\\u000') + c.toString(16);
  }

  return result;
}

function log(msg) {
  console.log((new Date()).toISOString() + " " + msg);
}

function log2(ip, msg) {
  log('[' + ip + '] ' + msg);
}

http.createServer(function(req, res) 
{
  var ip = req.connection.remoteAddress;
  log2(ip, 'Request: ' + req.url);
  if(req.url === '/scan_peer')
  {
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
        var launch_string = 'connectivity_tool --private_key=PLACEHOLDER --request_net_state --request_stat_info';
        launch_string += ' --ip=' + params_object.ip_address;
        launch_string += ' --port=' + params_object.port;
        launch_string += ' --timeout=' + params_object.timeout;
        launch_string += ' --log_journal_len=' + params_object.log_journal_len;
      
        if(params_object.peer_id && params_object.peer_id > 0)
        {
          launch_string += ' --peer_id=' + params_object.peer_id;
        }
        log2(ip, 'Executing: ' + launch_string);

        cp.exec(launch_string, function (err, stdout, stderr) {
          res.writeHead(200,  {"Content-Type": "text/plain", 
             "Access-Control-Allow-Origin": "*"}); // TODO: remove Access-Control-Allow-Origin: * in production environment -- iwnvfysh
          res.end(uber_escape(stdout));
          log2(ip, 'Command\'s done. Sent ' + stdout.length + ' bytes as output');
        });

      });

  }
  else
  {
    file.serve(req, res);
  }

}).listen(8080);

console.log('Server running on port 8080');
