const PDFDocument = require('pdfkit');
const SVGtoPDF = require('svg-to-pdfkit');
const fs = require('fs');

const { dbCredentials } = require("../config/oncodb.config.js");
const { colors } = require("../utilities/colorMapper.js");
const { databaseQueryHelper } = require("./databasequeryhelper.js");

async function createPdfHeatmap(req, res, next){
    if (req.method == 'POST') {
		try{
            //console.log("pol",postedSvg);
            // Create a new PDF document
            var postedHeatmapSvg = req.body.data.heatmapSvg;
            var postedRowLabelSvg = req.body.data.heatmapRowLabelSvg;
            var postedLabelSvg = req.body.data.heatmapLabelSvg;
            var postedCcSvg = req.body.data.heatmapColumnClustersSvg;
            var postedOcSvg = req.body.data.heatmapOncospliceClustersSvg;
            var postedHeight = req.body.data.height;
            var postedHeatmapLabelHeight = parseInt(req.body.data.heatmapLabelHeight);
            var postedHeatmapColumnClustersHeight = parseInt(req.body.data.heatmapColumnClustersHeight);
            var postedHeatmapWidth = req.body.data.heatmapWidth;
            var postedRowLabelWidth = req.body.data.rowLabelWidth;
            var totalWidth = parseInt(postedHeatmapWidth)+parseInt(postedRowLabelWidth) + 40;
            var postedFilename = req.body.data.filename;
            var newFilename = postedFilename;
            var prefix_a = "attachment; filename=".concat(newFilename);
            const doc=new PDFDocument({
                size: [totalWidth,parseInt(postedHeight)*1.25],
                margins : { // by default, all are 72
                    top: 10,
                    bottom:10,
                    left: 10,
                    right: 10
                },
                compress: true
            })
            doc.rect(0, 0, doc.page.width, doc.page.height).fill('white');
            // Pipe the PDF data to the response
            doc.pipe(res);

            // Use SVGtoPDF to add the SVG to the document
            SVGtoPDF(doc, postedLabelSvg, 10, 10, {assumePt:true});
            SVGtoPDF(doc, postedCcSvg, 10, 10+postedHeatmapLabelHeight, {assumePt:true});
            SVGtoPDF(doc, postedOcSvg, 10, 10+postedHeatmapLabelHeight+postedHeatmapColumnClustersHeight, {assumePt:true});
            SVGtoPDF(doc, postedHeatmapSvg, 10, 10+postedHeatmapLabelHeight+postedHeatmapColumnClustersHeight+postedHeatmapColumnClustersHeight, {assumePt:true});
            SVGtoPDF(doc, postedRowLabelSvg, parseInt(postedHeatmapWidth) + 5, 12+postedHeatmapLabelHeight+postedHeatmapColumnClustersHeight+postedHeatmapColumnClustersHeight, {assumePt:true});

            // Finalize the PDF
            doc.end();

            // Set the headers to force a file download
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', prefix_a);
            //console.log("resmach");
        }
		catch(error){
			res.send(error);
			return next(error);
		}
	}
}

module.exports.createPdfHeatmap = createPdfHeatmap;
