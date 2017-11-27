var ejs = require('ejs');
var fs = require('fs');

module.exports = SvgGenHelper;

function SvgGenHelper(config) {
    return new SvgGenerator(config);
};

function SvgGenerator(config) {

    this.config = config;

    //init rte's
    console.log("SvgGenerator - initialize data");
    var rteWidth = parseInt(process.env.RTE_WIDTH) || 200;
    var rteDatas = {
        red: { fill: "rgb(255,163,166)", stroke: "rgb(75,145,205)"},
        green: { fill: "rgb(0,176,80)", stroke: "rgb(75,145,205)"},
        yellow: { fill: "rgb(255,255,0)", stroke: "rgb(75,145,205)"},
        blue: { fill: "rgb(152,224,255)", stroke: "rgb(75,145,205)"},
        neutral: {fill: "rgb(200,200,200)", stroke: "rgb(100,100,100)"}
    };

    var rteEjsTemplate = fs.readFileSync(process.env.EJS_RTE_FILE || 'templates/rte.ejs', 'utf-8');
    var rteUncoloredEjsTemplate = fs.readFileSync(process.env.EJS_RTE_UNCOLORED_FILE || 'templates/rte-uncolored.ejs', 'utf-8');
    var dpeCloudEjsTemplate = fs.readFileSync(process.env.EJS_DPECLOUD_FILE || 'templates/dpe-cloud.ejs', 'utf-8');
    var dpeEjsTemplate = fs.readFileSync(process.env.EJS_DPE_FILE || 'templates/dpe.ejs', 'utf-8');
    var appCSEjsTemplate = fs.readFileSync(process.env.EJS_APP_CS_FILE || 'templates/appCS.ejs', 'utf-8');
    var infraCSEjsTemplate = fs.readFileSync(process.env.EJS_INFRA_CS_FILE || 'templates/infraCS.ejs', 'utf-8');
    var leftEjsTemplate = fs.readFileSync(process.env.EJS_LEFT_FILE || 'templates/left.ejs', 'utf-8');
    var headerEjsTemplate = fs.readFileSync(process.env.EJS_HEADER_FILE || 'templates/header.ejs', 'utf-8');
    var footerEjsTemplate = fs.readFileSync(process.env.EJS_FOOTER_FILE || 'templates/footer.ejs', 'utf-8');
    var lineEjsTemplate = fs.readFileSync(process.env.EJS_LINE_FILE || 'templates/line.ejs', 'utf-8');

    //IO - Templates
    var providerEjsTemplate = fs.readFileSync(process.env.EJS_PROVIDER_FILE || 'templates/provider.ejs', 'utf-8');
    var consumerEjsTemplate = fs.readFileSync(process.env.EJS_CONSUMER_FILE || 'templates/consumer.ejs', 'utf-8');

    //DetailView Templates
    var detailViewRowEjsTemplate = fs.readFileSync(process.env.EJS_DETAILVIEW_ROW_FILE || 'templates/detailview-row.ejs', 'utf-8');
    var leftDetailViewEjsTemplate = fs.readFileSync(process.env.EJS_LEFT_DETAILVIEW_FILE || 'templates/left-detailview.ejs', 'utf-8');
    var detailEjsTemplate = fs.readFileSync(process.env.EJS_DETAIL_FILE || 'templates/detail.ejs', 'utf-8');
 
    this.getRteSvgFragment = function getRteSvgFragment(x, rte, colored) {
        var rteData;
        var template;
        //todo -> das colored noch umbauen...
        if (colored) {
            rteData = rteDatas[rte.state];
            template = rteEjsTemplate;
        } else {
            rteData = rteDatas["neutral"];
            template = rteUncoloredEjsTemplate;
        }
        rteData.x = x;
        rteData.rte = rte;
        var ejsData = {data:rteData, config: config};
        var rteSVG = ejs.render(template, ejsData, {});
        console.log("svg fragment: ", rteSVG);
        return rteSVG;
    }

    this.getDpeCloudSvgFragment = function getDpeCloudSvgFragment(x, width, name, opacity) {
        var ejsData = {data:{"x":x, "width": width, "name": name, "fillOpacity": opacity}, config: config};
        var svg = ejs.render(dpeCloudEjsTemplate, ejsData, {});
        console.log("dpe-cloud svg fragment: ", svg);
        return svg;
    }

    this.getLineSvgFragement = function getLineSvgFragement(x) {
        //return '    <line x1="' + x + '" y1="150" x2="' + x + '" y2="4750" stroke-dasharray="25, 15" style="stroke:grey;stroke-width:10" />';
        var ejsData = {data:{x:x}, config: config};
        var svg = ejs.render(lineEjsTemplate, ejsData, {});
        console.log("line svg fragment: ", svg);
        return svg;
    
    }

    this.getDpeSvgFragement = function getDpeSvgFragement(x1, x2, name, details) {
        var ejsData = {data:{"x1":x1, "x2": x2, "name": name, "details": details}, config: config};
        var svg = ejs.render(dpeEjsTemplate, ejsData, {});
        console.log("dpe svg fragment: ", svg);
        return svg;
    }

    this.getLeftSvgFragment = function getLeftSvgFragment() {
        var ejsData = {data:{}, config: config};
        var svg = ejs.render(leftEjsTemplate, ejsData, {});
        console.log("left svg fragment: ", svg);
        return svg;
    }

    this.getAppCommonServiceSvgFragement = function getAppCommonServiceSvgFragement(name, y) {
        var ejsData = {data:{name: name, y: y}, config: config};
        var svg = ejs.render(appCSEjsTemplate, ejsData, {});
        console.log("app cs svg fragment: ", svg);
        return svg;
    }

    this.getInfraCommonServiceSvgFragement = function getInfraCommonServiceSvgFragement(name, y) {
        var ejsData = {data:{name: name, y: y}, config: config};
        var svg = ejs.render(infraCSEjsTemplate, ejsData, {});
        console.log("infra cs svg fragment: ", svg);
        return svg;
    }

    this.getHeaderSvgFragement = function getHeaderSvgFragement() {
        var ejsData = {config: config};
        var svg = ejs.render(headerEjsTemplate, ejsData, {});
        console.log("header svg fragment: ", svg);
        return svg;
    }


    this.getFooterSvgFragement = function getFooterSvgFragement() {
        var ejsData = {config: config};
        var svg = ejs.render(footerEjsTemplate, ejsData, {});
        console.log("footer svg fragment: ", svg);
        return svg;
    }

    var stateColors = {
        green: "rgb(0,191,0)",
        blue: "rgb(0,0,191)",
        red: "rgb(255,0,0)",
        grey: "rgb(150,150,150)",
        yellow: "rgb(255,255,0)"};

    //IO Functions
    this.getIoProvConsSvgFragement = function getIoProvConsSvgFragement(x, y, io) {
        var svgOutput = "";
        var ejsData = {config: config, data: {x: x, y: y}};
        if (io.provider) {
            ejsData.data.provFill = stateColors[io.provider];
            var svg = ejs.render(providerEjsTemplate, ejsData, {});
            console.log("IO prov-provider svg fragment: ", svg);
            svgOutput = svgOutput + svg;
        }
        if (io.consumer) {
            ejsData.data.consFill = stateColors[io.consumer];
            var svg = ejs.render(consumerEjsTemplate, ejsData, {});
            console.log("IO prov-consumer svg fragment: ", svg);
            svgOutput = svgOutput + svg;
        }
        return svgOutput;
    }

    //detailView Functions
    this.getDetailViewRowSvgFragement = function getDetailViewRowSvgFragement(row, y, gradient) {
        var ejsData = {data:{name: row.name, y: y, id: row.id}, config: config, gradient: gradient};
        var svg = ejs.render(detailViewRowEjsTemplate, ejsData, {});
        console.log("detailview row svg fragment: ", svg);
        return svg;
    }

    this.getDetailViewLeftSvgFragment = function getDetailViewLeftSvgFragment(detailView) {
        var ejsData = {data:detailView, config: config};
        var svg = ejs.render(leftDetailViewEjsTemplate, ejsData, {});
        console.log("left DetailView svg fragment: ", svg);
        return svg;
    }

    this.getDetailSvgFragement = function getDetailSvgFragement(x, y, color) {
        var ejsData = {config: config, data: {x: x, y: y}};
        ejsData.data.fill = stateColors[color];
        var svg = ejs.render(detailEjsTemplate, ejsData, {});
        console.log("detail svg fragment: ", svg);
        return svg;
    }
}