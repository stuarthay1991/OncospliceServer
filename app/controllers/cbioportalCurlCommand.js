const querystring = require("querystring");
//const { Curl } = require("node-libcurl");
const axios = require('axios');

async function cbioportalCurlCommand(req, res, next){
	if(req.method == "POST"){
		/*const curlRequest = new Curl();
		const terminate = curlRequest.close.bind(curlRequest);

		curlRequest.setOpt(Curl.option.URL, "https://www.cbioportal.org/api/session/comparison_session");
		curlRequest.setOpt(Curl.option.POST, true);
		//curlTest.setOpt(Curl.option.RETURNTRANSFER, true);
		curlRequest.setOpt(Curl.option.HTTPHEADER, ["authority: www.cbioportal.org","content-type: application/json"]);

		var data = JSON.stringify(req.body);
		curlRequest.setOpt(Curl.option.POSTFIELDS, data);
		curlRequest.setOpt(Curl.option.SSL_VERIFYHOST, false);
		curlRequest.setOpt(Curl.option.SSL_VERIFYPEER, false);

		curlRequest.on("end", function (statusCode, data, headers) {
			res.send(data);
			this.close();
		});
		curlRequest.on("error", terminate);
		curlRequest.perform();*/
        try {
            const response = await axios.post(
                "https://www.cbioportal.org/api/session/comparison_session",
                req.body,
                {
                    headers: {
                        "authority": "www.cbioportal.org",
                        "content-type": "application/json"
                    },
                    // Axios automatically handles SSL verification
                }
            );
            res.send(response.data);
        } catch (error) {
            console.error(error);
            res.status(error.response?.status || 500).send(error.message);
        }

	}
	console.log("burger");
}

module.exports.cbioportalCurlCommand = cbioportalCurlCommand;