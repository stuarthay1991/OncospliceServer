const { dbCredentials } = require("../config/oncodb.config.js");
const { colors } = require("../utilities/colorMapper.js");
const { databaseQueryHelper } = require("./databasequeryhelper.js");

//This function returns the values for plotting the table when a venn diagram number is selected.

async function getVennData(req, res, next){
    if (req.method == 'POST') {
		try{
			var postedComparedSignature = req.body.data.comparedSignature;
            var postedHomeSignature = req.body.data.homeSignature;
            var postedHomeCancer = req.body.data.cancer;
            var postedType = req.body.data.type;
            var postedAnnot = req.body.data.annot;
            //string parsing

            var annotString = "";
            if(postedAnnot != "none")
            {
                annotString = ("' AND eventannotation LIKE '").concat(postedAnnot);
            }

            var firstOccurence = postedComparedSignature.indexOf("_");
            var secondOccurence = postedComparedSignature.indexOf("_", firstOccurence+1);
            var comparedSignature = postedComparedSignature.substring(secondOccurence+1);
            var comparedCancer = postedComparedSignature.substring(0, secondOccurence);

            var initInterQ1 = "SELECT uid, firstjunc, event_direction FROM supersig WHERE signature_name = '";
            var initInterQ2 = "' INTERSECT SELECT uid, firstjunc, event_direction FROM supersig WHERE signature_name = '";
            const intersectionQuery = initInterQ1.concat(postedHomeSignature).concat("' AND cancer_name = '").concat(postedHomeCancer).concat(initInterQ2.concat(comparedSignature).concat("' AND cancer_name = '").concat(comparedCancer).concat("'"));
            const intersectionResult = await dbCredentials.query(intersectionQuery);
            var uidgroup3 = [];
            for(var i = 0; i < intersectionResult.rows.length; i++)
            {
                uidgroup3.push(intersectionResult.rows[i]["uid"]);
            }
            if(comparedCancer == "HNSCC" || comparedCancer == "GBM")
            {
                firstOccurence = comparedSignature.indexOf("_");
                secondOccurence =comparedSignature.indexOf("_", firstOccurence+1);
                comparedSignature = comparedSignature.substring(secondOccurence+1);
                firstOccurence = comparedSignature.indexOf("_");
                comparedSignature = comparedSignature.substring(firstOccurence+1);
                comparedSignature = "psi_".concat(comparedSignature);
            }
            if(comparedCancer == "AML_Leucegene")
            {
                firstOccurence = comparedSignature.indexOf("_");
                secondOccurence =comparedSignature.indexOf("_", firstOccurence+1);
                comparedSignature = comparedSignature.substring(secondOccurence+1);
                comparedSignature = "psi_".concat(comparedSignature);
            }
            var outputDat = [];
            if(postedType == "home")
            {
                /*var initHomeQuery = "SELECT uid, firstjunc FROM supersig WHERE signature_name = '";
                const homeSignatureQuery = initHomeQuery.concat(postedHomeSignature).concat("' AND cancer_name = '").concat(postedHomeCancer).concat("'");
                const homeSignatureResult = await dbCredentials.query(homeSignatureQuery);
                var uidgroup1 = [];
                for(var i = 0; i < homeSignatureResult.rows.length; i++)
                {
                    uidgroup1.push(homeSignatureResult.rows[i]["uid"]);
                }*/
                var initialQuery1 = "SELECT uid, event_direction, clusterid, eventannotation, coordinates, proteinpredictions, dpsi, rawp, adjp, avg_others FROM blca_fullsig WHERE signature_name = '";
                var signatureUIDSforHomeSigQuery = initialQuery1.concat(postedHomeSignature).concat(annotString).concat("' AND (");
                for(let i = 0; i < uidgroup3.length; i++)
                {
                    if(i != (uidgroup3.length - 1))
                    {
                        signatureUIDSforHomeSigQuery = signatureUIDSforHomeSigQuery.concat("uid != ").concat("'").concat(uidgroup3[i]).concat("' AND ");
                    }
                    else
                    {
                        signatureUIDSforHomeSigQuery = signatureUIDSforHomeSigQuery.concat("uid != ").concat("'").concat(uidgroup3[i]).concat("')");
                    }
                }
                const homeSignatureResult2 = await dbCredentials.query(signatureUIDSforHomeSigQuery);
                outputDat = homeSignatureResult2;
            }
            else if(postedType == "compared")
            {
                /*var firstOccurence = postedComparedSignature.indexOf("_");
                var secondOccurence = postedComparedSignature.indexOf("_", firstOccurence+1);
                var comparedSignature = postedComparedSignature.substring(secondOccurence+1);
                var comparedCancer = postedComparedSignature.substring(0, secondOccurence);*/

                /*const comparedSignatureQuery = "SELECT uid, firstjunc FROM supersig WHERE signature_name = '".concat(comparedSignature).concat(annotString).concat("' AND cancer_name = '").concat(comparedCancer).concat("'");
                const comparedSignatureResult = await dbCredentials.query(comparedSignatureQuery);
                var uidgroup2 = [];
                for(var i = 0; i < comparedSignatureResult.rows.length; i++)
                {
                    uidgroup2.push(comparedSignatureResult.rows[i]["uid"]);
                }*/
                var initialQuery2 = "SELECT uid, event_direction, clusterid, eventannotation, coordinates, proteinpredictions, dpsi, rawp, adjp, avg_others FROM ";
                var signatureUIDSforCompSigQuery = initialQuery2.concat(comparedCancer).concat("_fullsig WHERE signature_name = '").concat(comparedSignature).concat(annotString).concat("' AND (");
                for(let i = 0; i < uidgroup3.length; i++)
                {
                    if(i != (uidgroup3.length - 1))
                    {
                        signatureUIDSforCompSigQuery = signatureUIDSforCompSigQuery.concat("uid != ").concat("'").concat(uidgroup3[i]).concat("' AND ");
                    }
                    else
                    {
                        signatureUIDSforCompSigQuery = signatureUIDSforCompSigQuery.concat("uid != ").concat("'").concat(uidgroup3[i]).concat("')");
                    }
                }
                const comparedSignatureResult2 = await dbCredentials.query(signatureUIDSforCompSigQuery);
                outputDat = comparedSignatureResult2;
            }
            else{
                var initialQuery3 = "SELECT uid, event_direction, clusterid, eventannotation, coordinates, proteinpredictions, dpsi, rawp, adjp, avg_others FROM blca_fullsig WHERE signature_name = '";
                var signatureUIDSforIntersectionQuery = initialQuery3.concat(postedHomeSignature).concat(annotString).concat("' AND (");
                for(let i = 0; i < uidgroup3.length; i++)
                {
                    if(i != (uidgroup3.length - 1))
                    {
                        signatureUIDSforIntersectionQuery = signatureUIDSforIntersectionQuery.concat("uid = ").concat("'").concat(uidgroup3[i]).concat("' OR ");
                    }
                    else
                    {
                        signatureUIDSforIntersectionQuery = signatureUIDSforIntersectionQuery.concat("uid = ").concat("'").concat(uidgroup3[i]).concat("')");
                    }
                }
                const intersectionResult2 = await dbCredentials.query(signatureUIDSforIntersectionQuery);
                outputDat = intersectionResult2;
            }
            //Exclusionary: bubbles are EXCLUSIVE in the venn diagram. Not the whole circle!
            //Middle intersection is the HOME SIGNATURE CANCER!

            var dataPush = {"output":outputDat.rows};
            res.send(dataPush);
		}
		catch(error){
			res.send(error);
			return next(error);
		}
    }
}

module.exports.getVennData = getVennData;
