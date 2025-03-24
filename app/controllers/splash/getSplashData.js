const { dbCredentials } = require("../../config/oncodb.config.js");
const { databaseQueryHelper } = require("../databasequeryhelper.js");
const { getCancerNames } = require("../../utilities/getCancerNames.js");

function getUniqueElements(arr) {
    return [...new Set(arr)];
}

function signatureSplit(arr) {
  var newJsonArray = {};
  for(var i = 0; i < arr.length; i++)
  {
    var ok = arr[i];
    var cancerName = ok.split("_")[0];
    var d = ok.substring((ok.indexOf("_")+1));
    if(newJsonArray[cancerName] == undefined)
    {
      newJsonArray[cancerName] = [];
    }
    newJsonArray[cancerName].push(d);
  }
  return newJsonArray;
}

function returnArray(arr) {
  var newArray = [];
  for(var i = 0; i < arr.length; i++)
  {
    var ok = arr[i];
    newArray.push(ok);
  }
  return newArray;
}

async function getSplashData(req, res, next){
	if (req.method == 'POST') {
		try{
      var outputObject = {};
			var postedData = req.body.data;

      //var cancerList = getCancerNames();
      var tableNamesQuery = "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'";
      var tableNamesSet = new Set();
      var tableNamesResult = await dbCredentials.query(tableNamesQuery);
      tableNamesResult.rows.forEach(row => {
        var tableName = row["table_name"];
        var parsedTableName = tableName.split("_")[0];

        //console.log(parsedTableName)
        // Split at "_" and take the first part
        if(parsedTableName != "gtex" && parsedTableName != "supersig" && parsedTableName != "sigtranslate" && parsedTableName != "survival" && parsedTableName != "cluster_annotation"){
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

      //Get number of samples and metadata fields
      var sample_array = [];
      var meta_array = [];
      const promises2 = tableNamesArray.map(async cancer => {
        var fullResult2 = await dbCredentials.query("SELECT uid FROM ".concat(cancer).concat("_META"));
        fullResult2.rows.forEach(row => {
          sample_array.push(row.uid);
        })
        var lowercaseCancer = cancer.concat("_meta");
        lowercaseCancer = lowercaseCancer.toLowerCase();
        var fullResult3 = await dbCredentials.query("SELECT column_name FROM information_schema.columns WHERE table_name = '".concat(lowercaseCancer).concat("'"));
        fullResult3.rows.forEach(row => {
            meta_array.push(row.column_name);
        });
        //console.log(event_count);
      })

      var signature_array = [];
      await Promise.all(promises2);
      var fullResult4 = await dbCredentials.query("SELECT DISTINCT cancer_name, signature_name FROM supersig");
      fullResult4.rows.forEach(row => {
          signature_array.push(row.cancer_name.concat("_").concat(row.signature_name));
      });

      event_array = getUniqueElements(event_array);
      sample_array = getUniqueElements(sample_array);
      meta_array = getUniqueElements(meta_array);
      signature_array = returnArray(signature_array);

      var event_array_length = event_array.length;
      var sample_array_length = sample_array.length;
      var meta_array_length = meta_array.length - 1;
      var signature_array_length = signature_array.length;
      var cancer_length = tableNamesArray.length;

      var outArray = {"cancers": cancer_length,
      "events": event_array_length,
      "patients": sample_array_length,
      "metadata fields": meta_array_length,
      "signatures": signature_array_length};

      var fs = require('fs');
      fs.writeFile('statisticsFile.json', JSON.stringify(outArray), 'utf8', function (err) {
      if (err) {
          console.error('Error writing file:', err);
      } else {
          console.log('File written successfully');
      }
      });
      res.send(outArray);

    }
		catch(error){
			res.send(error);
			return next(error);
		}
  }
}

module.exports.getSplashData = getSplashData;
