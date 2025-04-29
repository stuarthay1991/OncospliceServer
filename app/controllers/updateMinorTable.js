const { dbCredentials } = require("../config/oncodb.config.js");
const { getCancerNames } = require("../utilities/getCancerNames.js");
const { databaseQueryHelper } = require("./databasequeryhelper.js");

async function getMinorTable(req, res, next){
	if (req.method == 'POST') {
		try{
            var outputObject = {};
			const cancerName = req.body.data.cancerName;
            const pageSizeSet =  req.body.data.newPageSize;
            const currentPage = req.body.data.pseudoPage;
            const currentGene = req.body.data.currentGene;
            const currentCoord = req.body.data.currentCoord;
            const currentAnnotation = req.body.data.currentAnnotation;
            //console.log("currentCoord", currentCoord);
            const queryHelperMap = databaseQueryHelper(cancerName);
            var goodness = currentPage * pageSizeSet;
            var goodness = goodness.toString();
            
            //Find like signatues; this is if an annotation was supplied on the splash page
            var annotationSignatureMatchObject = [];
            if(currentAnnotation != "None")
            {
                var annotationTakeQuery = "SELECT original FROM cluster_annotation WHERE annotation ILIKE '%".concat(currentAnnotation).concat("%'");
                console.log("annotationTakeQuery", annotationTakeQuery);
                var annotationTakeResult = await dbCredentials.query(annotationTakeQuery);
                annotationTakeResult.rows.forEach(row => {
                    annotationSignatureMatchObject.push(row["original"]);
                })
    
            }
            console.log("annotationSignatureMatchObject", annotationSignatureMatchObject);

            //Pull signature to annotation translator
            var clusterAnnotationQuery = "SELECT * FROM cluster_annotation";
            var clusterAnnotationResult = await dbCredentials.query(clusterAnnotationQuery);
            var clusterAnnotationObject = {}
            clusterAnnotationResult.rows.forEach(row => {
                if(clusterAnnotationObject[row["cancer"].toLowerCase()] == undefined)
                {
                    clusterAnnotationObject[row["cancer"].toLowerCase()] = {};
                }
                clusterAnnotationObject[row["cancer"].toLowerCase()][row["original"]] = {}
                clusterAnnotationObject[row["cancer"].toLowerCase()][row["original"]]["annotation"] = row["annotation"];
                clusterAnnotationObject[row["cancer"].toLowerCase()][row["original"]]["datagroup"] = row["datagroup"];
            })
            
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
                //console.log("tablenamesarray", tableNamesArray);

                var resultBox = []

                const promises1 = tableNamesArray.map(async cancer => {
                    var panquerystring = "SELECT uid, gene, signature_name, eventannotation, coordinates, dpsi, rawp, adjp FROM ".concat(cancer).concat("_fullsig");
                    if(currentGene != "None")
                    {
                        panquerystring = panquerystring.concat(" WHERE gene = '").concat(currentGene).concat("'");
                    }
                    if(currentCoord != "None")
                    {
                        panquerystring = panquerystring.concat(" WHERE coordinates LIKE '").concat(currentCoord).concat("%'");
                    }
                    if(currentAnnotation != "None")
                    {
                        if(currentCoord == "None" && currentGene == "None")
                        {
                            panquerystring = panquerystring.concat(" WHERE (");
                        }
                        else
                        {
                            panquerystring = panquerystring.concat(" AND (");
                        }
                    }
                    if(currentAnnotation != "None" && annotationSignatureMatchObject.length > 0)
                    {
                        var annotationToAdd = "signature_name = '".concat(annotationSignatureMatchObject[0]).concat("'");
                        if(annotationSignatureMatchObject.length > 1)
                        {
                            for(let i = 1; i < annotationSignatureMatchObject.length; i++)
                            {
                                annotationToAdd = annotationToAdd.concat(" OR signature_name = '").concat(annotationSignatureMatchObject[i]).concat("'");
                            }
                        }
                        panquerystring = panquerystring.concat(annotationToAdd).concat(")");
                    }
                    console.log("unhappy full", panquerystring);    
                    var fullResult = await dbCredentials.query(panquerystring);
                        for(let i = 0; i < fullResult.rows.length; i++)
                        {
                            let row = fullResult.rows[i];
                            row["cancer"] = cancer;
                            var promise_query = "SELECT lrtpvalue, zscore FROM survival".concat(" WHERE uid = '").concat(row["uid"]).concat("' AND cancer = '").concat(row["cancer"].toUpperCase()).concat("'");
                            //console.log("promise query", promise_query);
                            var survivalResult = await dbCredentials.query(promise_query);
                            if(survivalResult.rows.length > 0)
                            {
                                row["lrtp"] = survivalResult.rows[0]["lrtpvalue"];
                                row["zscore"] = survivalResult.rows[0]["zscore"];
                            }
                            else
                            {
                                row["lrtp"] = "None";
                                row["zscore"] = "None";                                
                            }
                            resultBox.push(row);
                        }
                })
                await Promise.all(promises1);
                //console.log("reultbox", resultBox);
                outputObject["outputdata"] = resultBox;
                outputObject["totalentries"] = 999;
                outputObject["clusterAnnotationDictionary"] = clusterAnnotationObject;
                res.send(outputObject);                        
            }
            else
            {
                var resultBox = []
                var panquerystring = "SELECT uid, gene, signature_name, eventannotation, coordinates, dpsi, rawp, adjp FROM ".concat(cancerName).concat("_fullsig");
                if(currentGene != "None")
                {
                    panquerystring = panquerystring.concat(" WHERE gene = '").concat(currentGene).concat("'");
                }
                if(currentCoord != "None")
                {
                    panquerystring = panquerystring.concat(" WHERE coordinates LIKE '").concat(currentCoord).concat("%'");
                }
                if(currentAnnotation != "None")
                {
                    if(currentCoord == "None" && currentGene == "None")
                    {
                        panquerystring = panquerystring.concat(" WHERE (");
                    }
                    else
                    {
                        panquerystring = panquerystring.concat(" AND (");
                    }
                }
                if(currentAnnotation != "None" && annotationSignatureMatchObject.length > 0)
                {
                    var annotationToAdd = "signature_name = '".concat(annotationSignatureMatchObject[0]).concat("'");
                    if(annotationSignatureMatchObject.length > 1)
                    {
                        for(let i = 1; i < annotationSignatureMatchObject.length; i++)
                        {
                            annotationToAdd = annotationToAdd.concat(" OR signature_name = '").concat(annotationSignatureMatchObject[i]).concat("'");
                        }
                    }
                    panquerystring = panquerystring.concat(annotationToAdd).concat(")");
                }
                console.log("unhappy", panquerystring);    
                var fullResult = await dbCredentials.query(panquerystring);
                for(let i = 0; i < fullResult.rows.length; i++)
                {
                    let row = fullResult.rows[i];
                    row["cancer"] = cancerName.toLowerCase();
                    var promise_query = "SELECT lrtpvalue, zscore FROM survival".concat(" WHERE uid = '").concat(row["uid"]).concat("' AND cancer = '").concat(row["cancer"].toUpperCase()).concat("'");
                    //console.log("promise query", promise_query);
                    var survivalResult = await dbCredentials.query(promise_query);
                    if(survivalResult.rows.length > 0)
                    {
                        row["lrtp"] = survivalResult.rows[0]["lrtpvalue"];
                        row["zscore"] = survivalResult.rows[0]["zscore"];
                    }
                    else
                    {
                        row["lrtp"] = "None";
                        row["zscore"] = "None";                                
                    }
                    resultBox.push(row);
                }
                outputObject["outputdata"] = resultBox;
                outputObject["totalentries"] = 999;
                outputObject["clusterAnnotationDictionary"] = clusterAnnotationObject;
                outputObject["matchedSignatures"] = annotationSignatureMatchObject;
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

module.exports.getMinorTable = getMinorTable;