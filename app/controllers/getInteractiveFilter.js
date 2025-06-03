const { dbCredentials } = require("../config/oncodb.config.js");
const { databaseQueryHelper } = require("./databasequeryhelper.js");

async function getInteractiveFilter(req, res, next){
	if (req.method == 'POST') {
		try{
			var outputObject = {};
			var cancerType = req.body.data.cancerType;
			var selectedFilterName = req.body.data.name;
			var queryHelperMap = databaseQueryHelper(cancerType);
			var set = [];
			var colorMatchArray = {};
			var outputArray = {};
			var iSet = 0;
			var clinicalMetaDataQuery = "SELECT ".concat(selectedFilterName.toLowerCase()).concat(", uid ").concat(queryHelperMap["META"]["QUERY"]);
			console.log("clinicalMetaDataQuery", clinicalMetaDataQuery);

			try {
				var clinicalMetaDataResult = await dbCredentials.query(clinicalMetaDataQuery);
			} catch (queryError) {
				console.error("Database query failed:", queryError);
				var cancernameconcat = "'".concat(cancerType.toLowerCase()).concat("_").concat("meta").concat("'");
				var intermediateQuery = "SELECT column_name FROM information_schema.columns WHERE table_name = ".concat(cancernameconcat).concat(" AND table_schema = 'public' ORDER BY ordinal_position LIMIT 2");
				var intermediateResult = await dbCredentials.query(intermediateQuery);
				console.log("intermediateResult", intermediateResult);
				var newFilterName = intermediateResult.rows[1].column_name;
				var newFilterQuery = "SELECT ".concat(newFilterName).concat(", uid ").concat(queryHelperMap["META"]["QUERY"]);
				var clinicalMetaDataResult = await dbCredentials.query(newFilterQuery);
			}
			//When the above query fails, it's necessary to select the first available column in the metadata and use that instead
			/*var cancernameconcat = "'".concat(cancerType.toLowerCase()).concat("_").concat("meta").concat("'");
			"SELECT column_name FROM information_schema.columns WHERE table_name = ".concat(cancernameconcat).concat(" AND table_schema = 'public' ORDER BY ordinal_position LIMIT 2");*/
		


			clinicalMetaDataResult.rows.forEach(row => {
				var str_edit = (row['uid'].replace(/\.|\-/g, "_")).toLowerCase();
				outputArray[str_edit] = row[selectedFilterName.toLowerCase()];
				var foundFlag = 0;
			    for(let k = 0; k < set.length; k++)
			    {
			    	if(set[k] ==  row[selectedFilterName.toLowerCase()])
			    	{
			    		foundFlag = 1;
			    	}
			    }
			    if(foundFlag == 0)
			    {
			    	set[iSet] = row[selectedFilterName.toLowerCase()];
			    	iSet += 1;
			    }
			})

			for(let k = 0; k < set.length; k++)
			{
				colorMatchArray[set[k]] = k;
			}

			outputObject["set"] = set;
			outputObject["out"] = outputArray;
			outputObject["color"] = colorMatchArray;
			console.log("clinicalMetaDataQuery output object", outputObject);
			res.send(outputObject);
		}
		catch(error){
			res.send(error);
			return next(error);			
		}
	}
}

module.exports.getInteractiveFilter = getInteractiveFilter;