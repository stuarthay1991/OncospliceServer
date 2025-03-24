const { dbCredentials } = require("../../config/oncodb.config.js");
const { databaseQueryHelper } = require("../databasequeryhelper.js");

async function getNovelSplicingEvents(req, res, next){
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
            if(parsedTableName != "supersig" && parsedTableName != "sigtranslate" && parsedTableName != "hs")
            {
                //console.log(parsedTableName);
                tableNamesSet.add(parsedTableName);
            }
            })

            var tableNamesArray = [...tableNamesSet];
            let outputObject = {};
            var event_array = [];
            const promises1 = tableNamesArray.map(async cancer => {
              var fullResult = await dbCredentials.query("SELECT * FROM ".concat(cancer).concat("_splice").concat(" WHERE UID LIKE '%\_%' ESCAPE '\'"));
              fullResult.rows.forEach(row => {
                event_array.push(row.uid);
              })
            })
            await Promise.all(promises1);
            outputObject["novel_ids"] = event_array.length;
            res.send(outputObject);            

        }
        catch(error){
            res.send(error);
            return next(error);
        }
    }
}

module.exports.getNovelSplicingEvents = getNovelSplicingEvents;