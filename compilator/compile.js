var UglifyJS = require("uglify-es");
var fs = require( "fs" );
function normalize( contents ){
    return process.platform === "win32" ? contents.replace( /\r\n/g, "\n" ) : contents;
}
function readFile( file ){
    return normalize( fs.readFileSync( file, "utf8" ) );
}
// This minifies the library
let code=readFile( "../src/IndexSQL.js" );
let result=UglifyJS.minify(code);
if(result.error){
    console.log(result.error);
}else{
    fs.writeFileSync("../src/IndexSQL.min.js",result.code);
}

var exec = require('child_process').exec;
var cmd = 'documentation build ../src/IndexSQL.js -f md -o ../docs/doc.md';

exec(cmd, function(error, stdout, stderr) {
    console.log(error);
    var showdown  = require('showdown'),
    converter = new showdown.Converter(),
    text      = readFile( "../docs/doc.md" ),
    html      = converter.makeHtml(text);
    fs.writeFileSync("../docs/index.html",readFile("../docs/not-index.html")
    .replace('<div class="javascript-lib-content"></div>','<div class="javascript-lib-content">'+html+'</div>')
    .replace(/<h3 id="tableofcontents">Table of Contents<\/h3>(?:.|\n)*?<\/ul>\s*<h2/,"<h1 id='javascriptDocs'>Javascript Docs</h1>\n<h2"));
    fs.unlinkSync("../docs/doc.md");
});