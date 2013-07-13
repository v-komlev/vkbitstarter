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
var restler = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://calm-retreat-3568.herokuapp.com/"

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var assertURLExists = function(infile) {
    var url = infile.toString();
    restler
    .get(url).
    on('complete',function(data, response) {
    if (response.statusCode != 200) {
      console.log("%s does not exist. Exiting.", instr);
      process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }});
    return url;
  };

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
  if (fs.existsSync(htmlfile)) {
    return cheerio.load(fs.readFileSync(htmlfile));
  }
  else {
    return cheerio.load(htmlfile);
  };
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
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

var check = function(target,checks){
  var checkJson = checkHtmlFile(target, checks);
  var outJson = JSON.stringify(checkJson, null, 4);
  console.log(outJson);
}

var checked = false;
var resultForUrl = "";

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <utl_to_html_file>', 'Url to index.html', clone(assertURLExists))
        .parse(process.argv);
    if(program.url)
    {
      restler.get(program.url).on('complete', function(result) {
        if (result instanceof Error) {
          console.log('Error: ' + result.message);
        } else {
        resultForUrl=result;
	}
      });
	check(resultForUrl,program.checks);
	checked = true;	
    }
    else if(program.file && !checked) {
    check(program.file,program.checks);
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
