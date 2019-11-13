var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');
// use the current directory as root
var rootDirectory = __dirname;
var port = 2080
http.createServer(function (request, response) {
    try {
        var requestUrl = url.parse(request.url);
        // use path.normalize so people cannot access directories underneath rootDirectory
        var fsPath = rootDirectory + path.normalize(requestUrl.pathname);
        if (requestUrl.pathname == "/") {
            fs.readdir(fsPath, function (err, files) {
                //handling error
                if (err) {
                    response.write('Unable to read directory.');
                }
                //listing all files using forEach
                response.write('<html><body><table>');
                files.forEach(function (file) {
                    var lastmodified = fs.statSync(file).mtime;
                    response.write('<tr>');
                    response.write('<td><a href="' + file + '">' + file + '</a></td><td>' +
                        lastmodified.toLocaleDateString() + ' ' +
                        lastmodified.toLocaleTimeString() + '</td>');
                    response.write('</tr>');
                });
                response.write('</table></body></html>');
                response.end();
            });
        }
        else {
            var fileStream = fs.createReadStream(fsPath);
            fileStream.pipe(response);
            fileStream.on('open', function () {
                response.writeHead(200);
            })
            fileStream.on('error', function (e) {
                response.writeHead(404);     // assume the file doesn't exist
                response.end();
            })
        }
    } catch (e) {
        response.writeHead(500);
        response.end();     // end the response so browsers don't hang
        console.log(e.stack);
    }
}).listen(port)
console.log("listening on port " + port)