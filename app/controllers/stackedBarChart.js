const { dbCredentials } = require("../config/oncodb.config.js");
const { databaseQueryHelper } = require("./databasequeryhelper.js");

async function getStackedBarChartData(req, res, next){
	if (req.method == 'POST') {
		try{
            var postedCancer = req.body.data.cancer;
            var signatureAttributes = {};
            var selectAllSignaturesQuery = "SELECT DISTINCT signature_name FROM BLCA_FULLSIG";
            var annotation_names = ["alt-3", "alt-5", "alt-C-term", "altPromoter", "cassette-exon", "intron-retention", "trans-splicing"];
            const selectAllSignaturesResult = await dbCredentials.query(selectAllSignaturesQuery);
            const signaturePromises = selectAllSignaturesResult.rows.map(async row => {
                var current_signature = row["signature_name"];
                signatureAttributes[row["signature_name"]] = {};
                const annotationPromises = annotation_names.map(async annotation => {
                    var annotationQuery = "";
                    annotationQuery = "SELECT COUNT(eventannotation) FROM BLCA_FULLSIG WHERE signature_name = '".concat(current_signature).concat("' AND eventannotation LIKE '").concat(annotation).concat("'");
                    const annotationResult = await dbCredentials.query(annotationQuery);
                    signatureAttributes[row["signature_name"]][annotation] = annotationResult.rows[0]["count"];
                })
                await Promise.all(annotationPromises);
            })
            await Promise.all(signaturePromises);
            res.send(signatureAttributes);
		}
		catch(error){
			res.send(error);
			return next(error);
		}
	}

}

module.exports.getStackedBarChartData = getStackedBarChartData;