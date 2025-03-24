const { dbCredentials } = require("../config/oncodb.config.js");
const { cleanUpTranslator } = require("../utilities/parsingFunctions.js");
const { databaseQueryHelper } = require("./databasequeryhelper.js");
const { containsObject } = require("../utilities/generalFunctions.js")

function translateSignatureName(name){
	name = name.replace("psi_", "");
	name = name.replace(/_/g, "-");
	return name;
  }

//This function records the signatures and signature data that exist for a given selection.
async function signatures(req, res, next){
	if (req.method == 'POST') {
		try{
			let outputObject = {};
			let postedData = req.body.data;
			let queryHelperMap = databaseQueryHelper(postedData);
			let sigNamesList = [];
			let sigTranslater = {};

			//console.log("Starting signature names query...");
			const sigNamesQuery = await dbCredentials.query(queryHelperMap["SIG"]["QUERY"]);
			//console.log(sigNamesQuery);
			sigNamesQuery.fields.forEach(element => {
				let fieldName = element["name"];
				if(fieldName != "uid")
				{
					sigTranslater[fieldName] = translateSignatureName(fieldName);
				}
			})

			/*console.log("Starting signature translate query...");
			console.log(queryHelperMap["SIG"]["TRANSLATE"]);
			const sigTranslateQuery = await dbCredentials.query(queryHelperMap["SIG"]["TRANSLATE"]);
			//console.log(sigTranslateQuery);
			sigTranslateQuery.rows.forEach(row => {
				let psiEventSignature = (cleanUpTranslator(row["psi_event_signatures"])).toLowerCase();
				let simpleName = row["simple_name"];
				if(sigTranslater[psiEventSignature] != undefined)
				{
					sigTranslater[psiEventSignature] = simpleName;
				}
			})*/
			//console.log(sigTranslater);
			//outputObject["signatureTranslate"] = sigTranslater;
			outputObject["signatureTranslate"] = sigTranslater;
			res.send(outputObject);
		}
		catch(error){
			res.send(error);
			return next(error);
		}
	}
}

module.exports.signatures = signatures;
