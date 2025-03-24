const { dbCredentials } = require("../../config/oncodb.config.js");
const { databaseQueryHelper } = require("../databasequeryhelper.js");
const { cleanUpTranslator } = require("../../utilities/parsingFunctions.js");

function translateSignatureName(name){
  name = name.replace("psi_", "");
  name = name.replace(/_/g, "-");
  return name;
}

async function collectSignatures(req, res, next){
  if (req.method == 'POST') {
      try{
        let outputObject = {};
        let sigTranslater = {};
        let postedData = req.body.data;
        let queryHelperMap = databaseQueryHelper(postedData);

        const sigNamesQuery = await dbCredentials.query(queryHelperMap["SIG"]["QUERY"]);
        //console.log(sigNamesQuery);
        sigNamesQuery.fields.forEach(element => {
          let fieldName = element["name"];
          if(fieldName != "uid")
          {
            sigTranslater[fieldName] = translateSignatureName(fieldName);
            //sigTranslater[fieldName] = fieldName;
          }
        })

        /*const sigTranslateQuery = await dbCredentials.query(queryHelperMap["SIG"]["TRANSLATE"]);
        console.log(queryHelperMap["SIG"]["TRANSLATE"]);
        sigTranslateQuery.rows.forEach(row => {
          //console.log(row)
  				let psiEventSignature = (cleanUpTranslator(row["psi_event_signatures"])).toLowerCase();
  				let simpleName = row["simple_name"];
          sigTranslater[psiEventSignature] = simpleName;
  			})*/
  			//console.log(sigTranslater);
  			outputObject["signatureTranslate"] = sigTranslater;
  			res.send(outputObject);
    }
    catch(error){
      res.send(error);
      return next(error);
    }
  }
}

module.exports.collectSignatures = collectSignatures;
