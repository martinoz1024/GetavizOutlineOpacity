let neo4jModelLoadController = (function () {

    //  Default config (Fallback in case it's a new setup without a proper config)
    let controllerConfig = {
        url: 'http://localhost:7474/db/data/transaction/commit',
        loadStartData: 'rootPackages',
        showLoadSpinner: true
    };

    function initialize() {
        // Override config with ones from setup
        if (setup.neo4jModelLoadConfig) {
            controllerConfig = {...controllerConfig, ...setup.neo4jModelLoadConfig}
        }
    };


    // load all model data and metadata that is necessary at launch
    async function loadInitialData() {
        const cypherQuery = `MATCH (p:ACityRep) RETURN p`;
        const data = await getNeo4jData(cypherQuery);
        // these can run in parallel and be awaited at the end
        const metadataDone = getMetadataFromResponse(data).then(model.initialize);
        const aframeDataDone = getAframeDataFromResponse(data).then(canvasManipulator.addElementsFromAframeData);

        await Promise.all([metadataDone, aframeDataDone]);
    }


    // get array of each element's parsed metadata
    async function getMetadataFromResponse(response) {
        if (!response[0].data) {
            return [];
        }

        return response[0].data.map((obj) => {
            return JSON.parse(obj.row[0].metaData);
        });
    }

    // get array of each element's parsed AFrame properties
    async function getAframeDataFromResponse(response) {
        if (!response[0].data) {
            return [];
        }

        return response[0].data.map((obj) => {
            return JSON.parse(obj.row[0].aframeProperty);
        });
    }


    // Universal method to load a data from Neo4j using imported cypher-query
    async function getNeo4jData(cypherQuery) {
        const payload = {
            'statements': [
                // neo4j requires keyword "statement", so leave as is
                { 'statement': `${cypherQuery}` }
            ]
        }

        try {
            let response = await fetch(controllerConfig.url, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            let data = await response.json();
            return data.results;
        } catch (error) {
            events.log.warning.publish({ text: error });
        }
    }


    return {
        initialize: initialize,
        loadInitialData: loadInitialData,
    };
})();