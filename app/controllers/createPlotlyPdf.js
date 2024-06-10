const PDFDocument = require('pdfkit');
const SVGtoPDF = require('svg-to-pdfkit');
const fs = require('fs');

const { dbCredentials } = require("../config/oncodb.config.js");
const { colors } = require("../utilities/colorMapper.js");
const { databaseQueryHelper } = require("./databasequeryhelper.js");

async function createPlotlyPdf(req, res, next){
    if (req.method == 'POST') {
		try{
            var postedSvg = req.body.data.svg;
            var postedHeight = req.body.data.height;
            var postedWidth = req.body.data.width;
            var postedFilename = req.body.data.filename;
            var newFilename = postedFilename;
            var prefix_a = "attachment; filename=".concat(newFilename);
            // Create a new PDF document
            const doc=new PDFDocument({
                size: [parseInt(postedWidth),parseInt(postedHeight)],
                margins : { // by default, all are 72
                    top: 10,
                    bottom:10,
                    left: 10,
                    right: 10
                },
                compress: false
            })
            doc.rect(0, 0, doc.page.width, doc.page.height).fill('white');
            // Pipe the PDF data to the response
            doc.pipe(res);

            // Use SVGtoPDF to add the SVG to the document
            SVGtoPDF(doc, postedSvg, 10, 10);
            // Finalize the PDF
            doc.end();

            // Set the headers to force a file download
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', prefix_a);
        }
		catch(error){
			res.send(error);
			return next(error);
		}
	}
}

module.exports.createPlotlyPdf = createPlotlyPdf;
