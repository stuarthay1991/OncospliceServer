const { dbCredentials } = require("../config/oncodb.config.js");
const { databaseQueryHelper } = require("./databasequeryhelper.js");

async function getMajorTable(req, res, next){
	if (req.method == 'POST') {
		try{
            var outputObject = {};
			const cancerName = req.body.data.cancerName;
            const pageSizeSet =  req.body.data.newPageSize;
            const currentPage = req.body.data.pseudoPage;
            const queryHelperMap = databaseQueryHelper(cancerName);
            const querytotalstring = 'SELECT COUNT(*) AS total_entries FROM '.concat(cancerName).concat("_fullsig");
            const queryTotalResult = await dbCredentials.query(querytotalstring);
            const totalEntries = queryTotalResult.rows[0].total_entries;
            console.log("goodness", currentPage, pageSizeSet);
            var goodness = currentPage * pageSizeSet;
            var goodness = goodness.toString();
            console.log("goodness2", goodness);
            var panquerystring = queryHelperMap["PAN"]["QUERY"];
            panquerystring = "SELECT uid, eventannotation, coordinates, dpsi, rawp, adjp FROM ".concat(cancerName).concat("_fullsig LIMIT ").concat(pageSizeSet).concat(" OFFSET ").concat(goodness);
            console.log("unhappy", panquerystring);
            const panCancerSigResult = await dbCredentials.query(panquerystring);
            outputObject["outputdata"] = panCancerSigResult.rows;
            outputObject["totalentries"] = totalEntries;
			res.send(outputObject);
        }
		catch(error){
			res.send(error);
			return next(error);
		}
    }

}

module.exports.getMajorTable = getMajorTable;
