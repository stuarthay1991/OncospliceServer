const { dbCredentials } = require("../config/oncodb.config.js");
const { databaseQueryHelper } = require("./databasequeryhelper.js");

async function getDoubleBarChartData(req, res, next){
	if (req.method == 'POST') {
		try{
      var postedCancer = req.body.data.cancer;
      var signatureAttributes = {};
      var selectAllSignaturesQuery = "SELECT DISTINCT signature_name FROM ".concat(postedCancer).concat("_FULLSIG");
      const selectAllSignaturesResult = await dbCredentials.query(selectAllSignaturesQuery);
      const signaturePromises = selectAllSignaturesResult.rows.map(async row => {
          var current_signature = row["signature_name"];
          signatureAttributes[row["signature_name"]] = {};
      })
      await Promise.all(signaturePromises);

      //console.log(signatureAttributes);
      //Write a query to count all unique events for a given signature
      const signatureKeys = Object.keys(signatureAttributes);

      const numberOfEventsPerSignaturePromises = signatureKeys.map(async key => {
        var countEventQuery = "SELECT DISTINCT COUNT(uid) FROM ".concat(postedCancer).concat("_fullsig WHERE signature_name = '").concat(key).concat("';");
        var countEventNumber = await dbCredentials.query(countEventQuery);
        signatureAttributes[key]["uid"] = countEventNumber.rows[0]["count"];
      })
      await Promise.all(numberOfEventsPerSignaturePromises);

      //console.log(signatureAttributes);
      //Write a query to count all unique genes for a given signature
      const numberOfGenesPerSignaturePromises = signatureKeys.map(async key => {
        var countGeneQuery = "SELECT DISTINCT COUNT(symbol) FROM ".concat(postedCancer).concat("_fulldegene WHERE signature_name = '").concat(key).concat("';");
        var countGeneNumber = await dbCredentials.query(countGeneQuery);
        signatureAttributes[key]["gene"] = countGeneNumber.rows[0]["count"];
      })
      await Promise.all(numberOfGenesPerSignaturePromises);
      //SELECT DISTINCT symbol FROM blca_fulldegene WHERE signature_name = 'psi_r2_v24_vs_others';

      res.send(signatureAttributes);
    }
		catch(error){
			res.send(error);
			return next(error);
		}
	}
}

module.exports.getDoubleBarChartData = getDoubleBarChartData;
