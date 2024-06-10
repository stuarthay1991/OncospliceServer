const { dbCredentials } = require("../config/oncodb.config.js");
const { colors } = require("../utilities/colorMapper.js");
const { databaseQueryHelper } = require("./databasequeryhelper.js");

//This function returns the values for plotting the venn diagram, it is executed by clicked on one of
//the concordance value bars.

async function getVennCircleValues(req, res, next){
    if (req.method == 'POST') {
		try{
			var postedComparedSignature = req.body.data.comparedSignature;
            var postedHomeSignature = req.body.data.homeSignature;
            var postedHomeCancer = req.body.data.cancer;
            var postedAnnot = req.body.data.annot;
            var annotString = "";
            if(postedAnnot != "none")
            {
                annotString = ("' AND eventannotation = '").concat(postedAnnot);
            }

            var outputDat = [];
            //Home number
            //Compared number
            //Intersection number                    
        }
        catch(error){
			res.send(error);
			return next(error);
		}
    }
}

module.exports.getVennCircleValues = getVennCircleValues;