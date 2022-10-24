// Functionality for sorting and paring down USGS site requests time series
// The data received for each type of site is different dependent on whether it is
// is a stream or lake.


function streamSort(data) {
    // This is the data format we want on the client
    const sorted = {
        gageHeight: [],
        flowRate: []
    }
    // We want to limit the data arrays to 30ish points for 3 days of data
    // Find integer needed to pare data
    let interval = Math.floor(data[0].values[0].value.length / 30)
    // For each value at interval, add a new object to the corresponding array
    data.forEach(obj => {
        obj.values[0].value.forEach((value, i) => {
            if(i === 0 || i % interval === 0){
                let newObject = {date: value.dateTime, value: Number(value.value)}
                if (obj.variable.variableCode[0].value === "00060"){
                    sorted.flowRate.push(newObject)
                } else {
                    sorted.gageHeight.push(newObject)
                }
        }
        })
    })

    return sorted
}

function lakeSort(data) {
    console.log('inside lake sort:', data)
    const sorted = {
        level: []
    }

    let interval = Math.floor(data[0].values[0].value.length / 30)

    data[0].values[0].value.forEach((value, i) => {
        if(i ===0 || i % interval === 0){
            let newObject = {date: value.dateTime, value: Number(value.value)}
            sorted.level.push(newObject)
        }
    })
    return sorted
}

function stationSort(data) {
    console.log('data:', data)
    if(data[0].sourceInfo.siteProperty[0].value === "ST"){
        return streamSort(data)
    } else {
        return lakeSort(data)
    }
}

module.exports = stationSort