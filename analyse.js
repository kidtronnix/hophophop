/**
 * Created by kidtronnix on 15/05/14.
 */

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
    currentURL = startingURL;
    casper.echo("Starting @ "+startingURL);

    var viewports =[
        {
            'name': 'Ubuntu 12.04',
            'userAgent': 'Mozilla/5.0 (X11; Linux i686) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/34.0.1847.116 Chrome/34.0.1847.116 Safari/537.36',
            'viewport': {width: 1440, height: 813}
        },
        {
            'name': 'Iphone',
            'userAgent': 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_0 like Mac OS X; en-us) AppleWebKit/532.9 (KHTML, like Gecko) Version/4.0.5 Mobile/8A293 Safari/6531.22.7',
            'viewport': {width: 1440, height: 813}
        }
    ];
}

// Start casper browser simulation
casper.start(startingURL, function() {

});

// Go through each viewports
casper.each(viewports, function(casper, viewport) {


    // set current viewport as current array element
    this.then(function() {
        this.userAgent(viewport.userAgent);
        this.viewport(viewport.viewport.width, viewport.viewport.height);
    });

    // Open and wait 5 seconds
    this.thenOpen(startingURL, function() {

        // Housekeeping?...
        this.echo('/////////// OPENING BROWSER ')
        this.echo(JSON.stringify(viewport, null, 2));
        this.echo('Waiting 5 seconds for everything to load...', 'info');

        // Make viewport
        var view = viewport.name;
        Reports[view] = {
            hops: []
        };

        // Begin timer and wait for any redirects to occur
        startTime = new Date().getTime();
        this.wait(5000);



        // let's definte some event processing
        this.on('navigation.requested', function(url, navigationType, navigationLocked, isMainFrame) {

            // Woooop hop happened
            this.echo('Hop! '+view);

            // Move current -> previous
            previousURL = currentURL;
            currentURL = url;

            // make report
            var hop = {
                from: previousURL,
                to: url,
                time: new Date().getTime() - startTime
            }

            // Add it to the reports object
            Reports[view].hops.push(hop);
//            this.echo(JSON.stringify(Reports[viewport.name], null, 2));

        });

        // Report back with Report
        this.on('http.status.200', function(resource) {
            this.echo('Something Landed @ '+ resource.url);
        })
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