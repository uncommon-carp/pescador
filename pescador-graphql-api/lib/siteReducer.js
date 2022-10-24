// This function is for creating a custom array of USGS sites to return to the client
// after the user searches for all sites within a bounding box. It's aim is to normalize and simplify the data
// the client receives.

function siteReducer(data) {
    let lakes = []
    let streams = []
    // for each site in timeSeries
    data.map(site => {
        // if LK
        if(site.sourceInfo.siteProperty[0].value === 'LK'){
            // extract name, type, lat, long, gage height
            lakes.push({
                name: site.sourceInfo.siteName,
                usgsId: site.sourceInfo.siteCode[0].value,
                lat: site.sourceInfo.geoLocation.geogLocation.latitude,
                lon: site.sourceInfo.geoLocation.geogLocation.longitude,
                gageHt: site.values[0].value[0].value
            })
        } else {
            if(site.variable.variableName[0] === "G"){
                if(streams.length === 0){
                    streams.push({
                        name: site.sourceInfo.siteName,
                        usgsId: site.sourceInfo.siteCode[0].value,
                        lat: site.sourceInfo.geoLocation.geogLocation.latitude,
                        lon: site.sourceInfo.geoLocation.geogLocation.longitude,
                        gageHt: site.values[0].value[0].value
                    })
                } else {
                    let exists = false
                    streams.forEach(stream => {
                        if(stream.name === site.sourceInfo.siteName && !stream.gageHt){
                            stream.gageHt = site.values[0].value[0].value
                            exists = true
                        }
                    })
                    if(!exists){
                        streams.push({
                            name: site.sourceInfo.siteName,
                            usgsId: site.sourceInfo.siteCode[0].value,
                            lat: site.sourceInfo.geoLocation.geogLocation.latitude,
                            lon: site.sourceInfo.geoLocation.geogLocation.longitude,
                            gageHt: site.values[0].value[0].value
                        })
                    }
                }
            } else {
                if(streams.length === 0){
                    streams.push({
                        name: site.sourceInfo.siteName,
                        usgsId: site.sourceInfo.siteCode[0].value,
                        lat: site.sourceInfo.geoLocation.geogLocation.latitude,
                        lon: site.sourceInfo.geoLocation.geogLocation.longitude,
                        flowRate: site.values[0].value[0].value
                    })
                } else {
                    let exists = false
                    streams.forEach(stream => {
                        if(stream.name === site.sourceInfo.siteName && !stream.flowRate){
                            stream.gageHt = site.values[0].value[0].value
                            exists = true
                        }
                    })
                    if(!exists){
                        streams.push({
                            name: site.sourceInfo.siteName,
                            usgsId: site.sourceInfo.siteCode[0].value,
                            lat: site.sourceInfo.geoLocation.geogLocation.latitude,
                            lon: site.sourceInfo.geoLocation.geogLocation.longitude,
                            flowRate: site.values[0].value[0].value
                        })
                    }
                }
            }
        }
    })
    console.log('streams:', streams, 'lakes:', lakes)
    return  {streams, lakes}
}

module.exports = siteReducer