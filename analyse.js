/**
 * Created by kidtronnix on 15/05/14.
 */

var extend = require('extend');

// Housekeeping?...
var startTime, currentURL, previousURL;


// base report
var Reports = {};
//
//var _hop = function(from, to) {
//    return
//}


// Okay business taken care of
// Let's start using casper
var casper = require('casper').create({
    verbose: false,
    logLevel: "debug",
    timeout: 60000 // 1 minute
});

// Get url from CLI argument
if (casper.cli.args.length < 1) {
    casper
        .echo("Usage: $ casperjs analyse.js http://googlemaps.com")
        .exit(1)
    ;
} else {
    // Get starting URL from CLI
    var startingURL = casper.cli.args[0];
    casper.echo("Starting @ "+startingURL);

    var viewports =[
        {
            'name': 'samsung-galaxy_y-portrait',
            'viewport': {width: 240, height: 320}
        }
    ];
}

// Start casper browser simulation
casper.start(startingURL);

// Go through each viewports
casper.each(viewports, function(casper, viewport) {


    // set current viewport as current array element
    this.then(function() {
        this.viewport(viewport.viewport.width, viewport.viewport.height);
    });

    // Open and wait 5 seconds
    this.thenOpen(startingURL, function() {

        // Housekeeping?...
        this.echo('/////////// OPENING BROWSER ')
        this.echo(JSON.stringify(viewport, null, 2));
        this.echo('Waiting 5 seconds for everything to load...', 'info');



        // Begin timer and wait for any redirects to occur
        startTime = new Date().getTime();
        this.wait(5000);



        // let's definte some event processing
        this.on('navigation.requested', function(url, viewport) {

            // Woooop hop happened
            this.echo('Hop!');

            // Move current -> previous
            previousURL = currentURL;
            currentURL = url;

            // make report
            var hop = {
                from: previousURL,
                to: url,
                time: new Date().getTime() - startTime
            }

            // this.echo(JSON.stringify(hop, null, 2));

            if(typeof Reports[viewport.name] == 'undefined') {
                // does not exist
                Reports[viewport.name] = {
                    hops: []
                };
            }


            // Add it to the reports object
            Reports[viewport.name].hops.push(hop);
            this.echo(JSON.stringify(Reports[viewport.name], null, 2));

        });


    });

    // Ok we have waited 5 seconds on the page
    this.then(function() {

        this.echo('Landed @ ' + this.getCurrentUrl(), 'info');

        this.echo('Screenshot for ' + viewport.name + ' (' + viewport.viewport.width + 'x' + viewport.viewport.height + ')', 'info');
        this.capture('screenshots/' + viewport.name + '-' + viewport.viewport.width + 'x' + viewport.viewport.height + '.png', {
            top: 0,
            left: 0,
            width: viewport.viewport.width,
            height: viewport.viewport.height
        });
    });
});

// Report back with Report
casper.on('exit', function() {
    this.echo('')
    this.echo('////////////////////// ')
    this.echo('/////////// HOP REPORT ')
    this.echo(JSON.stringify(Reports, null, 2));
})



casper.run();