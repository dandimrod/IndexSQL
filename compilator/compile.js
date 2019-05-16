var UglifyJS = require("uglify-es");
var fs = require( "fs" );
function normalize( contents ){
    return process.platform === "win32" ? contents.replace( /\r\n/g, "\n" ) : contents;
}
function readFile( file ){
    return normalize( fs.readFileSync( file, "utf8" ) );
}
let code=readFile( "../src/IndexSQL.js" );
let result=UglifyJS.minify(code);
if(result.error){
    console.log(result.error);
}else{
    fs.writeFileSync("../src/IndexSQL.min.js",result.code);
}