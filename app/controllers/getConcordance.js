const { dbCredentials } = require("../config/oncodb.config.js");
const { colors } = require("../utilities/colorMapper.js");
const { getCancerNames } = require("../utilities/getCancerNames.js");
const { databaseQueryHelper } = require("./databasequeryhelper.js");

async function getConcordance(req, res, next){
	if (req.method == 'POST') {
		try{
						var outputObject = {};
            var cancerObject = {};
						var postedSignature = req.body.data.signature;
            var postedCancer = req.body.data.cancer;
            var postedType = req.body.data.type;
            var postedAnnot = req.body.data.annot;
						//console.log("req.body.data", req.body.data);
            var addOn = "";
            if(postedType == "doublebar"){
                console.log("goifd");
            }
            else
            {
                //console.log("goifd2");
                addOn = "' AND eventannotation LIKE '".concat(postedAnnot);
            }

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
                    tableNamesSet.add(parsedTableName.toUpperCase());
                }
            }
            })
    
            var full_cancer = [...tableNamesSet];
            //var full_cancer = getCancerNames();
            
            var color_dict = {};
            for(var i = 0; i < full_cancer.length; i++)
            {
                color_dict[full_cancer[i]] = colors[i];
            }
            //var fullResult = await dbCredentials.query("SELECT DISTINCT cancer_name, signature_name FROM SUPERSIG");
            //outputObject["out"] = fullResult.rows;
            const promises1 = full_cancer.map(async cancer => {
                var fullResult = await dbCredentials.query("SELECT DISTINCT signature_name FROM SUPERSIG WHERE cancer_name = '".concat(cancer).concat("'"));
								//console.log("fullResult", fullResult);
								cancerObject[cancer] = [];
                fullResult.rows.forEach(row => {
                    cancerObject[cancer].push(row["signature_name"]);
                })
            })
            /*var sigTest = "psi_tcga_hnscc_r3_v23_vs_others";
            var cancTest = "HNSCC_TCGA";
            var fancypantsquery1 = "SELECT firstjunc FROM supersig WHERE signature_name != 'psi_tcga_hnscc_r3_v23_vs_others' INTERSECT SELECT firstjunc FROM supersig WHERE signature_name = 'psi_tcga_hnscc_r3_v23_vs_others'";
            //fancypantsquery
            const fancyResult1 = await dbCredentials.query(fancypantsquery1);

            var sigTest = "psi_tcga_hnscc_r3_v23_vs_others";
            var cancTest = "HNSCC_TCGA";
            var fancypantsquery2 = "SELECT firstjunc, event_direction FROM supersig WHERE signature_name != 'psi_tcga_hnscc_r3_v23_vs_others' INTERSECT SELECT firstjunc, event_direction FROM supersig WHERE signature_name = 'psi_tcga_hnscc_r3_v23_vs_others'";
            //fancypantsquery
            const fancyResult2 = await dbCredentials.query(fancypantsquery2);
            outputObject["fancy"] =  fancyResult2.rows.length / fancyResult1.rows.length;*/
            //psi_rbm10_downreg+cnv_vs_others

            //psi_rbm10_mut_vs_others
            //psi_rbm10_mut+sox4_amp_vs_others
            var sig1 = postedSignature;
            var canc1 = postedCancer;
            await Promise.all(promises1);
						console.log("CALCULATE cancerObject", cancerObject, canc1);

            const promises2 = full_cancer.map(async cancer => {
								//console.log("1_cancer", cancer);
                //var fullResult = await dbCredentials.query("SELECT DISTINCT signature_name FROM SUPERSIG WHERE cancer_name = '".concat(cancer).concat("'"));
                const promise_set = cancerObject[cancer].map(async signature => {
                    var fancypantsquery1_1 = "SELECT COUNT(*) FROM (SELECT firstjunc FROM supersig WHERE signature_name = '";
                    var fancypantsquery1_2 = "' INTERSECT SELECT firstjunc FROM supersig WHERE signature_name = '"
                    const fancypantsquery1 = fancypantsquery1_1.concat(signature).concat("' AND cancer_name = '").concat(cancer).concat(addOn).concat(fancypantsquery1_2.concat(sig1).concat("' AND cancer_name = '").concat(canc1).concat(addOn).concat("') AS common_rows"));
                    const fancyResult1 = await dbCredentials.query(fancypantsquery1);
                    //console.log("fancypantsquery1", fancypantsquery1);
                    //console.log("fancyResult1", fancyResult1.rows[0]["count"]);
                    var fancypantsquery2_1 = "SELECT COUNT(*) FROM (SELECT firstjunc, event_direction FROM supersig WHERE signature_name = '";
                    var fancypantsquery2_2 = "' INTERSECT SELECT firstjunc, event_direction FROM supersig WHERE signature_name = '";
                    const fancypantsquery2 = fancypantsquery2_1.concat(signature).concat("' AND cancer_name = '").concat(cancer).concat(addOn).concat(fancypantsquery2_2.concat(sig1).concat("' AND cancer_name = '").concat(canc1).concat(addOn).concat("') AS common_rows2"));
                    //console.log(fancypantsquery2);
                    const fancyResult2 = await dbCredentials.query(fancypantsquery2);
                    var fancypantsquery3_1 = "SELECT COUNT(*) FROM (SELECT firstjunc, event_direction FROM supersig WHERE signature_name = '";
                    const fancypantsquery3 = fancypantsquery3_1.concat(signature).concat("' AND cancer_name = '").concat(cancer).concat(addOn).concat("') AS common_rows3");
                    const fancyResult3 = await dbCredentials.query(fancypantsquery3);
										//console.log("fancyResult1", fancyResult1);
                    if(fancyResult1.rows[0]["count"] > (postedType == "doublebar" ? 150 : 75))
                    {
                        outputObject[signature] = {};
                        outputObject[signature]["concordance"] = fancyResult2.rows[0]["count"] / fancyResult1.rows[0]["count"];
                        outputObject[signature]["cancer"] = cancer;
                        outputObject[signature]["color"] = color_dict[cancer];
                        outputObject[signature]["junctionAndDirection"] = fancyResult1.rows[0]["count"];
                        outputObject[signature]["junctionOnly"] = fancyResult2.rows[0]["count"];
                        outputObject[signature]["totalAmount"] = fancyResult3.rows[0]["count"];
                    }
                })
                await Promise.all(promise_set);
                //console.log("Cancer finished");
                /*fullResult.rows.forEach(row => {
                    cancerObject[]
                    cancerObject[cancer].push(row["signature_name"]);
                })*/
            });
            await Promise.all(promises2);
						//console.log("outputObject", outputObject);
            outputArray = [];
            var current_index = 0;
            for (const [signature_name, datapoints] of Object.entries(outputObject))
            {
                outputArray[current_index] = {};
                outputArray[current_index]["signature"] = datapoints["cancer"].concat("_").concat(signature_name);
                outputArray[current_index]["concordance"] = datapoints["concordance"];
                outputArray[current_index]["cancer"] = datapoints["cancer"];
                outputArray[current_index]["color"] = datapoints["color"];
                outputArray[current_index]["junctionOnly"] = datapoints["junctionOnly"];
                outputArray[current_index]["junctionAndDirection"] = datapoints["junctionAndDirection"];
                outputArray[current_index]["totalAmount"] = datapoints["totalAmount"];
                current_index = current_index + 1;
            }
            var fancypantsquery4_1 = "SELECT COUNT(*) FROM (SELECT firstjunc, event_direction FROM supersig WHERE signature_name = '";
            const fancypantsquery4 = fancypantsquery4_1.concat(sig1).concat("' AND cancer_name = '").concat(canc1).concat(addOn).concat("') AS common_rows4");
            var fancyResult4 = await dbCredentials.query(fancypantsquery4);
            var dataPush = {};
            dataPush["list"] = outputArray;
            dataPush["hS"] = {}
            dataPush["hS"].count = fancyResult4.rows[0]["count"];
            dataPush["hS"].name = sig1;
						//console.log("dataPush", dataPush);
            res.send(dataPush);
		}
		catch(error){
			res.send(error);
			return next(error);
		}
	}

}

module.exports.getConcordance = getConcordance;
