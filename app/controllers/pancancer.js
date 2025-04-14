const { dbCredentials } = require("../config/oncodb.config.js");
const { databaseQueryHelper } = require("./databasequeryhelper.js");

async function pancancer(req, res, next) {
	if (req.method == 'POST') {
		try {
			const outputObject = {};
			const queryHelperMap = databaseQueryHelper(req.body.data.cancerName);

			// Get pancancer signature data
			var panquerystring = queryHelperMap["PAN"]["QUERY"];
			panquerystring = panquerystring.concat(" WHERE signature_name = '").concat(req.body.data.signature).concat("'");
			const panCancerSigResult = await dbCredentials.query(panquerystring);
			outputObject["pancancersignature"] = panCancerSigResult.rows;

			// Get cluster IDs
			var panclusteridsetstring = queryHelperMap["PAN"]["SET"];
			const panCancerClusterResult = await dbCredentials.query(panclusteridsetstring);

			var outputPanClust = {};
			var uniquesigstring = queryHelperMap["PAN"]["SETSIG"];
			const uniquesigResult = await dbCredentials.query(uniquesigstring);
			uniquesigResult.rows.forEach(row => {
				outputPanClust[row["signature_name"]] = [];
			})

			panCancerClusterResult.rows.forEach(row => {
				outputPanClust[row["signature_name"]].push(row["clusterid"]);
			})
			outputObject["uniqueclusters"] = outputPanClust;

			// Get differential expression data
			var uniqueDeString = "SELECT * FROM ".concat(req.body.data.cancerName).concat("_fulldegene WHERE signature_name = '").concat(req.body.data.signature).concat("'");
			const uniqueDeResult = await dbCredentials.query(uniqueDeString);
			outputObject["pancancerDE"] = uniqueDeResult.rows;

			// Get gene counts per signature
			outputObject["pancancerGeneCount"] = {}
			const listOfSignatures = Object.keys(outputPanClust);
			const geneCountPromises = listOfSignatures.map(async signature_i => {
				var countGeneQuery = "SELECT DISTINCT COUNT(symbol) FROM ".concat(req.body.data.cancerName).concat("_fulldegene WHERE signature_name = '").concat(signature_i).concat("';");
				var countGeneNumber = await dbCredentials.query(countGeneQuery);
				outputObject["pancancerGeneCount"][signature_i] = countGeneNumber.rows[0]["count"];
			})
			await Promise.all(geneCountPromises);
			
			res.send(outputObject);
		}
		catch(error) {
			res.send(error);
			return next(error);
		}
	}
}

module.exports.pancancer = pancancer;
