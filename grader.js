#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    //console.log(" Hello HTML ");
    $ = cheerioHtmlFile(htmlfile);
    //console.log($);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

/*
var resp = function (urlAdd){
console.log(urlAdd);
rest.get(urlAdd).on('complete', function(result) {
console.log(" Hello Niroj Manandhar ");
console.log(result);
    strResp(result);
  });
};

// data will be a Buffer
var strResp = function (data) {
console.log(" Here strResp ");
console.log(data.toString());
  // converting Buffers to strings is expensive, so I prefer
  // to do it explicitely when required
  return data.toString();
}
*/

var checkUrl = function(urlAdd, checksfile) {
    //console.log(" Hello URL " );
    $ = cheerio.load(urlAdd);
    //console.log($);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }    
    return out;
};


if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html')
        .option('-u, --url <url_file>', 'Path to url')
        .parse(process.argv);

    var checkJson ;
    if (program.file) 
    { 
     checkJson = checkHtmlFile(program.file, program.checks); 
     var outJson = JSON.stringify(checkJson, null, 4);
     console.log(outJson);
    } 
    if (program.url) 
    {
     //console.log(program.url);
     rest.get(program.url).on('complete', function(result) {
        var checkJson = checkUrl(result, program.checks);
        var outJson = JSON.stringify(checkJson, null, 4);
        console.log(outJson);
      });
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
