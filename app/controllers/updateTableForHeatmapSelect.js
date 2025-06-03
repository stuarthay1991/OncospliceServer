const { dbCredentials } = require("../config/oncodb.config.js");
const { getCancerNames } = require("../utilities/getCancerNames.js");
const { databaseQueryHelper } = require("./databasequeryhelper.js");

async function getTableForHeatmapSelect(req, res, next){
	if (req.method == 'POST') {
		try{
            var outputObject = {};
			const cancerName = req.body.data.cancerName;
            const pageSizeSet =  req.body.data.newPageSize;
            const currentPage = req.body.data.pseudoPage;
            //console.log("currentCoord", currentCoord);
            //const queryHelperMap = databaseQueryHelper(cancerName);
            var goodness = currentPage * pageSizeSet;
            var goodness = goodness.toString();
            
            //Find like signatues; this is if an annotation was supplied on the splash page
            var annotationSignatureMatchObject = [];
            
            if(cancerName == "None")
            {
                //var panquerystring = queryHelperMap["PAN"]["QUERY"];
                var tableNamesQuery = "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'";
                var tableNamesSet = new Set();
                var tableNamesResult = await dbCredentials.query(tableNamesQuery);
                tableNamesResult.rows.forEach(row => {
                var tableName = row["table_name"];
                if(tableName != "gtex" && tableName != "supersig" && tableName != "sigtranslate" && tableName != "survival" && tableName != "cluster_annotation")
                {
                    var parsedTableName = tableName.split("_")[0];
                    //console.log(parsedTableName)
                    // Split at "_" and take the first part
                    if(parsedTableName != "hs")
                    {
                        tableNamesSet.add(parsedTableName);
                    }
                }
                })
        
                var tableNamesArray = [...tableNamesSet];

                console.log("tablenamesarray", tableNamesArray);

                var resultBox = [];
                const promises1 = tableNamesArray.map(async cancer => {
                    var singleCancerLookQuery = "SELECT original, cancer, datagroup, annotation FROM cluster_annotation WHERE cancer = '".concat(cancer.toUpperCase()).concat("';");
                    var singleCancerLookResult = await dbCredentials.query(singleCancerLookQuery);
                    for(var i = 0; i < singleCancerLookResult.rows.length; i++)
                    {
                        var obj = {};
                        obj["signature_name"] = singleCancerLookResult.rows[i]["original"];
                        obj["datagroup"] = singleCancerLookResult.rows[i]["datagroup"];
                        obj["annotation"] = singleCancerLookResult.rows[i]["annotation"];
                        obj["cancer_name"] = cancer;
                        resultBox.push(obj);
                    }
                })
                await Promise.all(promises1);
                //console.log(resultBox);
                outputObject["outputdata"] = resultBox;
                outputObject["totalentries"] = 999;
                res.send(outputObject);
            }
            else
            {
                var resultBox = [];
                var plainCancerLookQuery = "SELECT original, cancer, datagroup, annotation FROM cluster_annotation WHERE cancer = '".concat(cancerName).concat("';");
                console.log("plainCancerLookQuery", plainCancerLookQuery);
                var plainCancerLookResult = await dbCredentials.query(plainCancerLookQuery);
                for(var i = 0; i < plainCancerLookResult.rows.length; i++)
                {
                    var obj = {};
                    obj["signature_name"] = plainCancerLookResult.rows[i]["original"];
                    obj["datagroup"] = plainCancerLookResult.rows[i]["datagroup"];
                    obj["annotation"] = plainCancerLookResult.rows[i]["annotation"];
                    obj["cancer_name"] = cancerName.toLowerCase();
                    resultBox.push(obj);
                }
                console.log("resultBox", resultBox);  
                outputObject["outputdata"] = resultBox;   
                outputObject["totalentries"] = 999;          
                res.send(outputObject);
            }
            
            //const panCancerSigResult = await dbCredentials.query(panquerystring);
        }
		catch(error){
            
			res.send(error);
			return next(error);
		}
    }

}

module.exports.getTableForHeatmapSelect = getTableForHeatmapSelect;