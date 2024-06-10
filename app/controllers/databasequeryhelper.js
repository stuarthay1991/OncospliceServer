function databaseQueryHelper(cancerName)
{
	var cancerQuerySuffix = cancerName == "AML_Leucegene" ? "" : "";
	const queryHelperMap = {
		"META" : {
			"QUERY" : "FROM ".concat(cancerName).concat(cancerQuerySuffix).concat("_META"),
		},
		"SIG" : {
			"QUERY" : "SELECT * FROM ".concat(cancerName).concat(cancerQuerySuffix).concat("_SIGNATURE"),
			"COUNT" : "SELECT COUNT(uid) FROM ".concat(cancerName).concat(cancerQuerySuffix).concat("_SIGNATURE"),
			"TRANSLATE" : "SELECT * FROM SIGTRANSLATE WHERE cancer = '".concat(cancerName).concat(cancerQuerySuffix).concat("'")
		},
		"SPLC" : {
			"QUERY" : "SELECT * FROM ".concat(cancerName).concat(cancerQuerySuffix).concat("_SPLICE"),
			"ONE" : "SELECT * FROM ".concat(cancerName).concat(cancerQuerySuffix).concat("_SPLICE").concat(" LIMIT 1"),
			"COUNT" : "SELECT COUNT(uid) FROM ".concat(cancerName).concat(cancerQuerySuffix).concat("_SPLICE")
		},
		"COORD" : {
			"COUNT" : "SELECT COUNT(uid) FROM ".concat(cancerName).concat(cancerQuerySuffix).concat("_SPLICE")
		},
		"GENE" : {
			"COUNT" : "SELECT COUNT(uid) FROM ".concat(cancerName).concat(cancerQuerySuffix).concat("_SPLICE")
		},
		"PAN" : {
			"QUERY" : "SELECT uid, event_direction, clusterid, eventannotation, coordinates, proteinpredictions, dpsi, rawp, adjp, avg_others FROM ".concat(cancerName).concat(cancerQuerySuffix).concat("_FULLSIG"),
			"SET" : "SELECT DISTINCT signature_name, clusterid FROM ".concat(cancerName).concat(cancerQuerySuffix).concat("_FULLSIG"),
			"SETSIG" : "SELECT DISTINCT signature_name FROM ".concat(cancerName).concat(cancerQuerySuffix).concat("_FULLSIG")
		}
	}
	return queryHelperMap;
}

function setUpHeatmapQuery(postedData)
{
	let cancerTableName = postedData.cancerName;
	if(postedData.comparedCancer != undefined)
	{
		var comparedCancerTableName = postedData.comparedCancer;
	}
	else
	{
		var comparedCancerTableName = undefined;
	}
	let coords = postedData.coords;
	let genes = postedData.genes;
	let signatures = postedData.signatures;
	let samples = postedData.samples;
	let oncospliceClusters = postedData.oncospliceClusters;
	let eventType = postedData.eventType;

	//if(coords.length)

	var heatmapQueries = {
		"cancerTableName": cancerTableName,
		"comparedCancerTableName": comparedCancerTableName,
		"coordQuery" : undefined,
		"geneQuery" : undefined,
		"signatureQuery" : undefined,
		"sampleQuery" : undefined,
		"oncospliceClusterQuery" : {
			exists: false,
			key: undefined
		}
	}

	if(coords != undefined)
	{
		coords.forEach(coordSet => {
			coordSet = coordSet.replace(/\r|\n/g, "");
			let coord1ChrmSplit = coordSet.split(":");
			let coord1Chrm = coord1ChrmSplit[0];
            let coord1PosSplit = coord1ChrmSplit[1].split("-");
            let coord1Start = coord1PosSplit[0];
            let coord1End = coord1PosSplit[1];
            let preCoordQuery = " ((chromosome = '".concat(coord1Chrm).concat("') AND ((coord1 = '").concat(coord1Start).concat("' OR coord2 = '").concat(coord1Start).concat("' OR coord3 = '").concat(coord1Start).concat("' OR coord4 = '").concat(coord1Start).concat("') OR (coord1 = '").concat(coord1End).concat("' OR coord2 = '").concat(coord1End).concat("' OR coord3 = '").concat(coord1End).concat("' OR coord4 = '").concat(coord1End).concat("')))");
			if(heatmapQueries.coordQuery == undefined)
			{
				heatmapQueries.coordQuery = " WHERE ".concat(preCoordQuery);
			}
			else
			{
				heatmapQueries.coordQuery = heatmapQueries.coordQuery.concat(" OR").concat(preCoordQuery);
			}
		})
	}
	if(genes != undefined)
	{
		genes.forEach(geneSymbol => {
			if(heatmapQueries.geneQuery == undefined)
			{
				heatmapQueries.geneQuery = " WHERE (".concat(" symbol = '").concat(geneSymbol).concat("'");
			}
			else
			{
				heatmapQueries.geneQuery = heatmapQueries.geneQuery.concat(" OR symbol = '").concat(geneSymbol).concat("'");
			}		
		})
		heatmapQueries.geneQuery = heatmapQueries.geneQuery.concat(")");
	}
	if(signatures != undefined)
	{
		signatures.forEach(signature => {
			signature = signature.replace(/\)|\(|\+|\-/g, "_");
			if(heatmapQueries.signatureQuery == undefined)
			{
				heatmapQueries.signatureQuery = "SELECT * FROM ".concat(comparedCancerTableName).concat("_SIGNATURE WHERE ").concat(signature).concat(" = '1'");
			}
			else
			{
				heatmapQueries.signatureQuery = heatmapQueries.signatureQuery.concat(" OR ").concat(heatmapQueries.signature).concat(" = '1'");
			}				
		})
	}
	if(samples != undefined && samples != null)
	{
		//Determine if it is numerical or string
		samples.forEach(object => {
			if(object.value.indexOf("-") != -1)
			{
				let numbersToSearch = object.value.split("-");
				if(heatmapQueries.samplesQuery != undefined){
					heatmapQueries.samplesQuery = " AND ".concat(object.key).concat(" >= '").concat(numbersToSearch[0]).concat("'");
				}
				else{
					heatmapQueries.samplesQuery = "SELECT * FROM ".concat(cancerTableName).concat("_META WHERE ").concat(object.key).concat(" >= '").concat(numbersToSearch[0]).concat("'");
				}
				heatmapQueries.samplesQuery = " AND ".concat(object.key).concat(" <= '").concat(numbersToSearch[1]).concat("'");
			}
			else
			{
				if(heatmapQueries.samplesQuery != undefined){
                	heatmapQueries.samplesQuery = " AND ".concat(object.key).concat(" = '").concat(object.value).concat("'");
                }
                else{
                    heatmapQueries.samplesQuery = "SELECT * FROM ".concat(cancerTableName).concat("_META WHERE ").concat(object.key).concat(" = '").concat(object.value).concat("'");
                }
			}
		});
	}
	if(oncospliceClusters != undefined)
	{
		if(oncospliceClusters.indexOf("(") != -1)
		{
        	let keySplit = oncospliceClusters.split("_(");
        	oncospliceClusters = keySplit[0];	
		}
		heatmapQueries.oncospliceClusterQuery.key = oncospliceClusters;
		heatmapQueries.oncospliceClusterQuery.exists = true;
	}
	if(eventType == "Signature")
	{
		heatmapQueries.coordQuery = undefined;
		heatmapQueries.geneQuery = undefined;
			
	}
	else if(eventType == "Genes")
	{
		heatmapQueries.coordQuery = undefined;
		heatmapQueries.signatureQuery = undefined;
	}
	else
	{
		heatmapQueries.geneQuery = undefined;
		heatmapQueries.signatureQuery = undefined;
	}

	return heatmapQueries;
}

module.exports.databaseQueryHelper = databaseQueryHelper;
module.exports.setUpHeatmapQuery = setUpHeatmapQuery;