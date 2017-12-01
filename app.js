var fs = require('fs');
require('dotenv').config();

//read CLAP Definition
var clapJson = fs.readFileSync(process.env.CLAP_DEF_FILE || 'config/clap.json');
// Define to JSON type
var clapJsonContent = JSON.parse(clapJson);

//configure
var config = setupClapConfig(clapJsonContent.clap);
//my modules
var svgGenerator = require('./modules/svg-generator.js')(config);

//generate CLAP SVG
generateClapSvg(clapJsonContent.clap);

//generate detailviews
var rows = {};
generateDetailViewsSvg(clapJsonContent.clap);


//=========================================================
// Main functions
//=========================================================

function generateClapSvg(clap) {
    var svgOutput = generateRteAndDpeSvg(clap, true);
    svgOutput = svgOutput + svgGenerator.getLeftSvgFragment();
    svgOutput = svgOutput + generateAppCommonServicesSvg(clap);
    svgOutput = svgOutput + generateInfraCommonServicesSvg(clap);

    svgOutput = svgGenerator.getHeaderSvgFragement() + svgOutput + svgGenerator.getFooterSvgFragement();

    writeSVG(svgOutput, process.env.CLAP_SVG_FILE || 'svg/clap_default.svg');
    writeHtml(svgOutput, process.env.CLAP_HTML_FILE || 'svg/clap_default.html');
}

//must be called after generateClapSvg!
function generateDetailViewsSvg(clap) {
    setupDetailViewConfig(clap);
    for (v = 0; v < clap.detailViews.length; v++) {
        var detailView = clap.detailViews[v];
        rows = {};
        generateDetailViewSvg(clap, detailView);
    }
}
function generateDetailViewSvg(clap, detailView) {
    //first set config values
    //setupIOConfig(clap);
    var svgOutput = generateRteAndDpeSvg(clap, false);


    svgOutput = svgOutput + generateDetailViewRowsSvg(detailView);
    svgOutput = svgOutput + generateDetailSvg(clap, detailView);
    svgOutput = svgOutput + svgGenerator.getDetailViewLeftSvgFragment(detailView);

    svgOutput = svgGenerator.getHeaderSvgFragement() + svgOutput + svgGenerator.getFooterSvgFragement();
    htmlFileName = process.env.DETAILVIEW_HTML_FILE || 'svg/detailView_default_XX.html';
    svgFileName = process.env.DETAILVIEW_SVG_FILE || 'svg/detailView_default_XX.svg';

    htmlFileName = htmlFileName.replace("XX", detailView.name).replace(/ /g, "_");
    svgFileName = svgFileName.replace("XX", detailView.name).replace(/ /g, "_");

    writeSVG(svgOutput, svgFileName);
    writeHtml(svgOutput, htmlFileName);
}

//=========================================================
// SVG Generation
//=========================================================
//calculate configuration
function setupClapConfig(clap) {
    //read CLAP Definition
    var configDataJson = fs.readFileSync(process.env.CONFIG_FILE || 'config/config.json');
    // Define to JSON type
    var config = JSON.parse(configDataJson);

    var y = config.svg.topBorder;
    var numInfraCS = clap.infraCS.length;
    var numAppCS = clap.appCS.length;

    config.left.appCS.height =
        Math.max((1 + numAppCS) * config.cs.spaceHeight + numAppCS * config.cs.height, config.left.appCS.heightMin);
    config.left.infraCS.height =
        Math.max((1 + numInfraCS) * config.cs.spaceHeight + numInfraCS * config.cs.height, config.left.infraCS.heightMin);

    config.rte.y = y;
    config.left.appCS.y = y;
    y = y + config.left.spaceHeight + config.left.appCS.height;
    config.left.rte.y = y;
    y = y + config.left.spaceHeight + config.left.rte.height;
    config.left.infraCS.y = y;
    y = y + config.left.infraCS.height;
    config.rte.height = y - config.rte.y;
    y = y + config.left.dpeRteSpaceHeight;
    config.dpe.y = y;
    y = y + config.dpe.height + config.svg.bottomBorder;
    config.svg.height = y;

    console.log("***** Configuration: ", config);

    return config;

}


//Infra Common Services - bottom up
function generateInfraCommonServicesSvg(clap) {
    var dynSvgOutput = "";
    var y = config.left.infraCS.y + config.left.infraCS.height;

    for (i = 0; i < clap.infraCS.length; i++) {
        y = y - config.cs.spaceHeight - config.cs.height;
        var infraCS = clap.infraCS[i];
        dynSvgOutput = dynSvgOutput + svgGenerator.getInfraCommonServiceSvgFragement(infraCS, y);
    }
    return dynSvgOutput;
}

//App Common Services - top down
function generateAppCommonServicesSvg(clap) {
    var dynSvgOutput = "";
    var y = config.left.appCS.y;

    for (i = 0; i < clap.appCS.length; i++) {
        y = y + config.cs.spaceHeight;
        var appCS = clap.appCS[i];
        dynSvgOutput = dynSvgOutput + svgGenerator.getAppCommonServiceSvgFragement(appCS, y);
        y = y + config.cs.height;
    }
    return dynSvgOutput;
}


//RTE & DPE
function generateRteAndDpeSvg(clap, colored) {
    var dynSvgOutput = "";
    var dynSvgOutputTopLayer = "";

    //Configuration
    var rteSpace = config.rte.space;
    var rteWidth = config.rte.width;

    var xRTE = config.rte.startX;
    var xDpeCLoud = config.dpe.startX;

    //iterate over DPE-Clouds

    //add first vertical line
    //dynSvgOutput = dynSvgOutput + svgGenerator.getLineSvgFragement(xRTE);
    xRTE = xRTE + 1 * rteSpace;
    xDpeCLoud = xDpeCLoud + rteSpace;


    for (d = 0; d < clap.dpeCloud.length; d++) {
        var dpeCloud = clap.dpeCloud[d];

        var xDpe;

        //iterate over dpe
        for (i = 0; i < dpeCloud.dpe.length; i++) {
            var dpe = dpeCloud.dpe[i];
            xDpe = xRTE;

            //iterate over rte
            for (j = 0; j < dpe.rte.length; j++) {
                var rte = dpe.rte[j];
                rte.x = xRTE;
                if (rte.state != "invisible") {
                    dynSvgOutput = dynSvgOutput + svgGenerator.getRteSvgFragment(xRTE, rte, colored);
                }
                xRTE = xRTE + rteWidth + rteSpace;
            }

            var x1 = xDpe;
            var x2 = xRTE - 50;
            //first dpe in dpe-cloud
            if (i == 0) {
                x1 = x1 + 2 * rteSpace;
            }

            //last dpe in dpe-cloud
            if (i == dpeCloud.dpe.length - 1) {
                x2 = x2 - 2 * rteSpace;
            }

            //don't show dpe's with no name
            if (dpe.name != "") {
                dynSvgOutputTopLayer = dynSvgOutputTopLayer + svgGenerator.getDpeSvgFragement(x1, x2, dpe);
            }

            //another dpe within the same dpe cloud, or next dpe Cloud
            //2 * rte space, line 2 * rte space
            xRTE = xRTE + rteSpace;
            if (i == dpeCloud.dpe.length - 1) {
                xRTE = xRTE + rteSpace;
            }
            //do not show last line
            if ((d < clap.dpeCloud.length - 1) || (i < dpeCloud.dpe.length - 1)) {
                dynSvgOutput = dynSvgOutput + svgGenerator.getLineSvgFragement(xRTE);
            }
            if (i == dpeCloud.dpe.length - 1) {
                xRTE = xRTE + rteSpace;
            }
            xRTE = xRTE + rteSpace + rteSpace;
        }

        dynSvgOutput = dynSvgOutput + svgGenerator.getDpeCloudSvgFragment(xDpeCLoud, xRTE - xDpeCLoud - 5 * rteSpace, dpeCloud.name, dpeCloud.opacity);
        //xRTE = xRTE + rteSpace;
        xDpeCLoud = xRTE;
    };

    //update config
    config.cs.width = xRTE - config.rte.startX - 4 * rteSpace;
    config.svg.width = xRTE - 4 * rteSpace + config.svg.rightBorder;

    return dynSvgOutput + dynSvgOutputTopLayer;
}


//=========================================================
// DetailView generation methods
//=========================================================

//calculate io configuration --> needs to be called after RTE's were generated!
function setupDetailViewConfig(clap) {
    config.detailView.row.startX = config.svg.leftBorder;
    //adjust width to more space to the left
    config.svg.width = config.svg.width - config.rte.startX + config.detailView.startX;
    config.detailView.row.width = config.svg.width - config.svg.leftBorder - config.svg.rightBorder;

    //set new startX
    config.left.width = config.left.width + config.detailView.startX - config.rte.startX;
    config.rte.startX = config.detailView.startX;
    config.dpe.startX = config.detailView.startX;
}

//Detail View  - bottom up
function generateDetailViewRowsSvg(detailView) {
    var dynSvgOutput = "";
    //naja etwas getrickst
    var y = config.left.infraCS.y + config.left.infraCS.height;

    for (i = 0; i < detailView.row.length; i++) {
        y = y - config.detailView.row.spaceHeight - config.detailView.row.height;
        var row = detailView.row[i];
        row.y = y;

        //evaluate gradient
        var gradient = row.gradient || detailView.gradient || config.detailView.row.gradient;
        dynSvgOutput = dynSvgOutput + svgGenerator.getDetailViewRowSvgFragement(row, y, gradient);

        rows[row.id] = row;
    }
    
    detailView.detail = {};
    detailView.rte = {};
    
    //config.left.io.y
    detailView.detail.y = y - config.detailView.row.spaceHeight - config.left.detailView.height;
    //config.left.ioRte.y 
    detailView.rte.y = config.rte.y;
    //config.left.ioRte.height 
    detailView.rte.height = detailView.detail.y - detailView.rte.y - config.left.spaceHeight;
    
    return dynSvgOutput;
}

function generateDetailSvg(clap, detailView) {
    var dynSvgOutput = "";

    for (d = 0; d < clap.dpeCloud.length; d++) {
        var dpeCloud = clap.dpeCloud[d];

        //iterate over dpe
        for (i = 0; i < dpeCloud.dpe.length; i++) {
            var dpe = dpeCloud.dpe[i];

            //iterate over rte
            for (j = 0; j < dpe.rte.length; j++) {
                var rte = dpe.rte[j];
                if (rte.state != "invisible") {
                    //iterate over detail
                    if (rte.detail) {
                        var detailConf = rte.detail[detailView.id];
                        if (detailConf) {
                            for (k = 0; k < detailConf.length; k++) {
                                var detail = detailConf[k];
                                var x = rte.x + config.rte.width/2;
                                var y = rows[detail.row].y + config.detailView.row.height/2;
                                if (detailView.id != "io") {
                                    dynSvgOutput = dynSvgOutput + 
                                    svgGenerator.getDetailSvgFragement(x, y, detail);
                                } else {
                                    //kosmetische Korrektur
                                    x = x - 5;
                                    dynSvgOutput = dynSvgOutput + 
                                    svgGenerator.getIoProvConsSvgFragement(x, y, detail);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    return dynSvgOutput;
}

//=========================================================
// Output file writing methods
//=========================================================


function writeSVG(dynSVG, filename) {

    console.log("Going to write into svg file");
    console.log("svg: ", dynSVG);
    fs.writeFile(filename, dynSVG, function (err) {
        if (err) {
            return console.error(err);
        }
        console.log("Data written successfully! ", filename);
    });
}

function writeHtml(dynSVG, filename) {
    console.log("Going to write into html file");
    var output = "<html><body>" + dynSVG + "</html>";
    console.log("html: ", output);
    fs.writeFile(filename, output, function (err) {
        if (err) {
            return console.error(err);
        }
        console.log("Data written successfully! ", filename);
    });
}