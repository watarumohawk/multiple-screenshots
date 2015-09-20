var fs = require("fs");
var JSON5 = require("json5");
var json = JSON5.parse( fs.read("urlList.json") );

var loadTime = 20000;
var index = 0;

scraper(json[index]);

function scraper(urlArray) {

    var webPage = require("webpage");
    var page = webPage.create();

    // iPhone5
    page.settings.userAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X; en-us) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53";
    console.info("opening URL:", urlArray["url"]);

    page.open(urlArray["url"], function(status) {

            console.log("open status:", status);

        if (status === "success") {
            page.evaluate(function() {
                document.body.bgColor = "white";
            });

            setTimeout(function() {
                takeScreenshot(page, urlArray);
                exitIfLast(index, json);
                index++;
                scraper(json[index]);
            }, loadTime);

        } else {
            console.error("Error: couldn't open the page!");
            page.close();
            console.info("The page is closing! URL: " + urlArray["url"]);

            exitIfLast(index, json);
            index++;
            scraper(json[index]);
        }
    });

    page.onError = function(msg, trace) {

        var msgStack = ['ERROR: ' + msg];

        if (trace && trace.length) {
            msgStack.push('TRACE:');
            trace.forEach(function(t) {
                msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function +'")' : ''));
            });
        }
        console.error(msgStack.join('\n'));
        console.error(msg);
    };

    page.onConsoleMessage = function(msg, lineNum, sourceId) {
        console.log('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
    };

    page.onResourceError = function(resourceError) {
        page.reason = resourceError.errorString;
        console.log(page.reason);
    };

}

function takeScreenshot(page, urlArray) {

    var fileName =  urlArray["name"];

    page.render("images/" + fileName + ".png");
    console.info("rendered: images/" + fileName + ".png");
}

function exitIfLast(index, json) {

    console.info( parseInt(json.length - index-1), "more screenshots to go!");
    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    if (index === json.length-1) {
        console.info("FINISHED");
        phantom.exit();
    }
}