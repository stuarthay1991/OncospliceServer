async function getCancerNames(){
      var tableNamesQuery = "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'";
      var tableNamesSet = new Set();
      var tableNamesResult = await dbCredentials.query(tableNamesQuery);
      tableNamesResult.rows.forEach(row => {
        var tableName = row["table_name"];
        var parsedTableName = tableName.split("_")[0];
        //console.log(parsedTableName)
        // Split at "_" and take the first part
        tableNamesSet.add(parsedTableName);
      })

      var tableNamesArray = [...tableNamesSet];
      return tableNamesArray;
}

module.exports.getCancerNames = getCancerNames;
