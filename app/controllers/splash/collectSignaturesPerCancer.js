const { dbCredentials } = require("../../config/oncodb.config.js");
const { databaseQueryHelper } = require("../databasequeryhelper.js");
const { cleanUpTranslator } = require("../../utilities/parsingFunctions.js");
const { cancerToTissueMap, tissueToCancerMap } = require("../../utilities/tissueMap.js");

function translateSignatureName(name){
  name = name.replace("psi_", "");
  name = name.replace(/_/g, "-");
  return name;
}

async function collectSignaturesPerCancer(req, res, next){
  if (req.method == 'POST') {
      try{
        var tableNamesQuery = "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'";
        var tableNamesSet = new Set();
        var tableNamesResult = await dbCredentials.query(tableNamesQuery);
        tableNamesResult.rows.forEach(row => {
          var tableName = row["table_name"];
          var parsedTableName = tableName.split("_")[0];
  
          //console.log(parsedTableName)
          // Split at "_" and take the first part
          if(parsedTableName != "supersig" && parsedTableName != "sigtranslate" && parsedTableName != "hs"){
            //console.log(parsedTableName);
            tableNamesSet.add(parsedTableName);
          }
        })
  
        var tableNamesArray = [...tableNamesSet];
  
        //Get number of events
        var event_array = [];
        const promises1 = tableNamesArray.map(async cancer => {
          var fullResult = await dbCredentials.query("SELECT uid FROM ".concat(cancer).concat("_SPLICE"));
          fullResult.rows.forEach(row => {
            event_array.push(row.uid);
          })
        })
        await Promise.all(promises1);

        const outputObject = {};
        const sigTranslater = {};
        let postedData = req.body.data;
        const promises2 = tableNamesArray.map(async cancer => {
            cancer = cancer.toUpperCase();
            var queryHelperMap = databaseQueryHelper(cancer);
            const sigNamesQuery = await dbCredentials.query(queryHelperMap["SIG"]["QUERY"]);
            sigTranslater[cancer] = {};
            //console.log(sigNamesQuery);
            sigNamesQuery.fields.forEach(element => {
              let fieldName = element["name"];
              if(fieldName != "uid")
              {
                sigTranslater[cancer][fieldName] = translateSignatureName(fieldName);
              }
            })
            //var sigTranslateQuery = await dbCredentials.query(queryHelperMap["SIG"]["TRANSLATE"]);
            //console.log(queryHelperMap["SIG"]["TRANSLATE"]);
            //sigTranslater[cancer] = {};
            //sigTranslateQuery.rows.forEach(row => {
              //console.log(row)
                    //let psiEventSignature = (cleanUpTranslator(row["psi_event_signatures"])).toLowerCase();
                    //let simpleName = row["simple_name"];
                    //sigTranslater[cancer][psiEventSignature] = simpleName;
              //})
        })
        await Promise.all(promises2);

        for(var i = 0; i < tableNamesArray.length; i++)
        {
            sigTranslater[tableNamesArray[i].toUpperCase()] = Object.keys(sigTranslater[tableNamesArray[i].toUpperCase()]).length;
        }

        //Set up signatures per tissue
        var tissueGroup = {};
        var tissueArray = Object.keys(tissueToCancerMap);
        for(var i = 0; i < Object.keys(tissueArray).length; i++)
        {
            tissueGroup[tissueArray[i]] = 0;
        }
        for(var i = 0; i < Object.keys(tissueArray).length; i++)
        {
            var tissueLook = tissueToCancerMap[tissueArray[i]];
            for(var k = 0; k < tissueLook.length; k++)
            {
                tissueGroup[tissueArray[i]] += sigTranslater[tissueLook[k]]
            }
        }

  		//console.log(sigTranslater);
  		outputObject["signatureTranslate"] = sigTranslater;
        outputObject["tissueSignatureCount"] = tissueGroup;
  		res.send(outputObject);
    }
    catch(error){
      res.send(error);
      return next(error);
    }
  }
}

module.exports.collectSignaturesPerCancer = collectSignaturesPerCancer;
