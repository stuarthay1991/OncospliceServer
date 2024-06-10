const { dbCredentials } = require("../config/oncodb.config.js");
const { databaseQueryHelper } = require("./databasequeryhelper.js");

async function getPanTable(req, res, next){
	if (req.method == 'POST') {
		try{
            var outputObject = {};
						//console.log("Tabletastic!")
						const cancerName = req.body.data.cancerName;
            if(req.body.data.type == "splice")
            {
            const queryHelperMap = databaseQueryHelper(cancerName);
            var panquerystring = queryHelperMap["PAN"]["QUERY"];
            panquerystring = "SELECT uid, event_direction, clusterid, eventannotation, coordinates, proteinpredictions, dpsi, rawp, adjp, avg_others FROM ".concat(cancerName).concat("_fullsig WHERE signature_name = '").concat(req.body.data.signature).concat("'");
            //console.log("unhappy", panquerystring);
            const panCancerSigResult = await dbCredentials.query(panquerystring);
            outputObject["outputdata"] = panCancerSigResult.rows;
            }

            if(req.body.data.type == "gene")
            {
						//console.log("Genetastic!");
            var uniqueDeString = "SELECT geneid, logfold, rawp, adjp, symbol, avg_self, avg_others FROM ".concat(cancerName).concat("_fulldegene WHERE signature_name = '").concat(req.body.data.signature).concat("'");
						//console.log(uniqueDeString);
						const uniqueDeResult = await dbCredentials.query(uniqueDeString);
            outputObject["outputdata"] = uniqueDeResult.rows;
						//console.log("uniquederesult", uniqueDeResult.rows);
            }
						res.send(outputObject);
        }
		catch(error){
			res.send(error);
			return next(error);
		}
    }

}

module.exports.getPanTable = getPanTable;
