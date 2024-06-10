const { samples } = require("../controllers/samples");
const { signatures } = require("../controllers/signatures");
const { heatmapData } = require("../controllers/heatmap/heatmapData");
const { getSingleUidData } = require("../controllers/getSingleUidData");
const { getGtexData } = require("../controllers/getGtexData");
const { cbioportalCurlCommand } = require("../controllers/cbioportalCurlCommand");
const { getExonViewerData } = require("../controllers/getExonViewerData");
const { getInteractiveFilter } = require("../controllers/getInteractiveFilter");
const { cbioportalStudyTranslate } = require("../controllers/cbioportalStudyTranslate");
const { defaultQuery } = require("../controllers/defaultQuery");
const { getPanTable } = require("../controllers/updatePanCancerTable");
const { getConcordance } = require("../controllers/getConcordance");
const { getStackedBarChartData } = require("../controllers/stackedBarChart");
const { getVennData } = require("../controllers/getVennData");
const { createPdf } = require("../controllers/createPdf");
const { createPdfHeatmap } = require("../controllers/createPdfHeatmap");
const { createPlotlyPdf } = require("../controllers/createPlotlyPdf");
const { getDoubleBarChartData } = require("../controllers/doubleBarChart");
const { getSplashData } = require("../controllers/getSplashData");
const cors = require("cors");

module.exports = app => {
    //const datasets = require("../controllers/cancerdata.controller.js");

    var router = require("express").Router();

    // Retrieve all Datasets
    //router.get("/", datasets.testQuery);

    router.post("/samples", samples);
    router.post("/signatures", signatures);
    router.post("/heatmapData",heatmapData);
    router.post("/singleUidData", getSingleUidData);
    router.post("/interactiveFilter", getInteractiveFilter);
    router.post("/gtexData", getGtexData);
    router.post("/cbioCurlCommand", cbioportalCurlCommand);
    router.post("/exonViewerData", getExonViewerData);
    router.post("/translatecbio", cbioportalStudyTranslate);
    router.post("/defaultQuery", defaultQuery);
    router.post("/updatepantable", getPanTable);
    router.post("/concordance", getConcordance);
    router.post("/stackedBarChart", getStackedBarChartData);
    router.post("/venn", getVennData);
    router.post("/createPdf", createPdf);
    router.post("/createPdfHeatmap", createPdfHeatmap);
    router.post("/createPlotlyPdf", createPlotlyPdf);
    router.post("/getdoublebarchartdata", getDoubleBarChartData);
    router.post("/getsplashdata", getSplashData);
    app.use('/api/datasets', router);
};
