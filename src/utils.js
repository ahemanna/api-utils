const axios = require("axios").default;
const https = require("https");
const async = require("async");

function getApisUsingSf(config, done) {

    getApis(config)
        .then((apis) => {
            let apiArr = [];
            apis.forEach(api => {
                let { ...apiObj } = config;
                apiObj.api = api;

                if (api === "sf-kvm-test")
                    apiArr.push(apiObj);
            });

            async.map(apiArr, getDeployments, function (error, deployments) {
                if (error) {
                    return done(error);
                } else {
                    deployments = deployments.flat();

                    async.map(deployments, getPolicies, function (error, policies) {
                        if (error) {
                            return done(error);
                        } else {
                            policies = policies.flat();

                            async.map(policies, getSharedFlows, function (error, sharedFlows) {
                                if (error) {
                                    return done(error);
                                } else {
                                    sharedFlows = sharedFlows.filter(sfObj => {
                                        return sfObj.api;
                                    });
                                    return done(null, sharedFlows);
                                }
                            });
                        }
                    });
                }
            });
        })
        .catch((error) => {
            return done(error);
        });
}

function getUrl(key, config) {
    let URL;
    switch (key) {
        case "API_LIST":
            URL = config.host + "/v1/organizations/" + config.org + "/apis";
            break;
        case "API_DEPLOYMENTS":
            URL = config.host + "/v1/organizations/" + config.org + "/apis/" + config.api + "/deployments";
            break;
        case "API_POLICIES":
            URL = config.host + "/v1/organizations/" + config.org + "/apis/" + config.api + "/revisions/" + config.revision + "/policies";
            break;
        case "API_POLICY":
            URL = config.host + "/v1/organizations/" + config.org + "/apis/" + config.api + "/revisions/" + config.revision + "/policies/" + config.policy;
            break;
        default:
            break;
    }

    return URL;
}

function getHeaders(config) {
    return {
        Authorization: "Basic " + config.auth,
        Accept: "application/json"
    }
}

async function getApis(config) {
    let request = {
        method: "GET",
        url: getUrl("API_LIST", config),
        headers: getHeaders(config),
        httpsAgent: new https.Agent({ keepAlive: true })
    };

    try {
        const response = await axios(request);
        return await Promise.resolve(response.data);
    } catch (error) {
        return await Promise.reject(error);
    }
}

function getDeployments(config, callback) {
    let request = {
        method: "GET",
        url: getUrl("API_DEPLOYMENTS", config),
        headers: getHeaders(config),
        httpsAgent: new https.Agent({ keepAlive: true })
    };

    axios(request)
        .then(response => {
            let deployments = processDeployments(response.data, config);
            return callback(null, deployments);
        })
        .catch(error => {
            return callback(error);
        });
}

function processDeployments(obj, config) {
    let apiArr = [];

    let filterByEnv = obj.environment.filter(o => {
        return o.name == config.env;
    });

    if (filterByEnv.length != 0) {
        envObj = filterByEnv[0];
        envObj.revision.forEach(revision => {
            let { ...apiObj } = config;
            apiObj.revision = revision.name;

            apiArr.push(apiObj);
        });
    }

    return apiArr;
}

function getPolicies(config, callback) {
    let request = {
        method: "GET",
        url: getUrl("API_POLICIES", config),
        headers: getHeaders(config),
        httpsAgent: new https.Agent({ keepAlive: true })
    };

    axios(request)
        .then(response => {
            let policies = processPolicies(response.data, config);
            return callback(null, policies);
        })
        .catch(error => {
            return callback(error);
        });
}

function processPolicies(obj, config) {
    let apiArr = [];

    obj.forEach(o => {
        let { ...apiObj } = config;
        apiObj.policy = o;

        apiArr.push(apiObj);
    });

    return apiArr;
}

function getSharedFlows(config, callback) {
    let request = {
        method: "GET",
        url: getUrl("API_POLICY", config),
        headers: getHeaders(config),
        httpsAgent: new https.Agent({ keepAlive: true })
    };

    axios(request)
        .then(response => {
            let sharedFlows = processPolicyDetails(response.data, config);
            return callback(null, sharedFlows);
        })
        .catch(error => {
            return callback(error);
        });
}

function processPolicyDetails(obj, config) {

    let result = {};
    if (obj.policyType === "FlowCalloutBean" && obj.sharedFlowBundle === config.sf) {
        result = {
            api: config.api,
            revision: config.revision,
            policy: config.policy
        }
    }

    return result;
}

module.exports = {
    getApisUsingSf: getApisUsingSf
}