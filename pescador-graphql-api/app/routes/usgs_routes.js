// Express docs: http://expressjs.com/en/api.html
const { default: axios } = require('axios')
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')
// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')
require('dotenv').config()

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { example: { title: '', text: 'foo' } } -> { example: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })
const boundingBox = require('../../lib/bounding_box')
const siteReducer = require('../../lib/siteReducer')
const fips = require('../../lib/fips_lookup_by_state')
const states = Object.values(fips)

const stationSort = require('../../lib/station_sort')

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// Filter objects by site name
const uniqBy = (a, key) => {
    let seen = {};
    return a.filter(item => {
        let k = key(item.sourceInfo.siteName);
        return seen.hasOwnProperty(k) ? false : (seen[k] = true);
    })
}

// transform state abbreviation and county name into FIPS county code
const getCountyCode = (s, n) => {
	let code
	states.forEach(state => {
		if (s === state._abbrev) {
			let foundState = Object.entries(state)
			foundState.forEach(county => {
				if (county[0].includes(n)) {
					code = county[1]
				}
			})
		}
	})
	return code
}
const geoKey = process.env.MAPQUEST_API_KEY
// Get long and lat for a zipcode
const getZipCoords = (query) => {
	const params = {
		key: geoKey,
		postalCode: query
	}
	// return axios.get(`http://api.positionstack.com/v1/forward`, {params})
	return axios.get('http://www.mapquestapi.com/geocoding/v1/address', {params})
}

const getWeather = (lat, long) => {
	const params = {
		appid: process.env.WEATHER_API_KEY,
		lat: lat,
		lon: long,
		exclude: 'minutely',
		units: 'imperial'
	}

	return axios.get('https://api.openweathermap.org/data/2.5/onecall', {params})
}

const getConditionsBbox = (lat, long) => {
	let {west, east, north, south} = boundingBox(lat, long)
	return axios({
		method: 'get',
		url:`http://waterservices.usgs.gov/nwis/iv/?format=json&bBox=${west},${south},${east},${north}&parameterCd=00060,00065&siteType=LK,ST&siteStatus=all`
	})
}

// *********** ROUTES **************

// Send a request to the USGS Instantaneous Water Values service and send that response back to client
router.get('/waterData/site/:siteId', (req, res, next) => {
	// axios req with params filled in, will be extracted from client request
	axios({
		method: 'get',
		url: 'http://waterservices.usgs.gov/nwis/iv/',
		params: {
			format: 'json',
			sites: req.params.siteId,
			siteStatus: 'active',
			period: 'P3D'
		}
	})
		.then(resp => {
			// need to break down the response into data that the client can turn into a chart
			// resp.data.value.timeSeries has an array containing data for each measurement (streamflow, gage height, etc)
			// that is available for each Water (unless specified otherwise)
			const station = {
				name: resp.data.value.timeSeries[0].sourceInfo.siteName,
				values: stationSort(resp.data.value.timeSeries)
			}
			res.send(station)
			// timeSeries breaks down days and stations if multiples are selected. If requesting a specific id and no date range
			// only current values will be sent with a single item in the timeSeries array
		})
		.catch(next)
})

// Get a list of sites within a county code
router.get('/waterData/county', (req, res, next) => {	
	// First we get the county code from the JSON file
	let countyCode = getCountyCode(req.query.state, req.query.countyName)
	// Then we query USGS for all sites in that county
	console.log("countyCode:\n", countyCode)
	if(countyCode){
		axios({
			method: 'get',
			url: 'http://waterservices.usgs.gov/nwis/iv/',
			params: {
				format: 'json',
				countyCd: countyCode,
				siteType: 'LK,ST',
				siteStatus: 'active'
			}
		})
		.then(resp => {
			// remove duplicate objects because of two value params default
			const sites = uniqBy(resp.data.value.timeSeries, JSON.stringify)
			console.log("sites:\n", sites)
			// create an array of pared down objects to display on client side
			const siteData = sites.map(site => {
				return {
					usgsId: site.sourceInfo.siteCode[0].value,
					name: site.sourceInfo.siteName,
					long: site.sourceInfo.geoLocation.geogLocation.longitude,
					lat: site.sourceInfo.geoLocation.geogLocation.latitude,
				}
			})
			res.send(siteData)
		})
			.catch(next)
	} else {
		res.send(null)
	}
	
})

router.post('/search/zip', removeBlanks, (req, res) => {
	// get a coord for the zip code
	getZipCoords(req.body.search.zip)
		.then(resp => {
			// simultaneously retrieve weather data for the coords and
			// build a bounding box around those coords and get stations in them
			let latitude = resp.data.results[0].locations[0].latLng.lat
			let longitude = resp.data.results[0].locations[0].latLng.lng
			Promise.all([
				getWeather(latitude, longitude),
				getConditionsBbox(latitude, longitude)
			])
				.then(resp => {
					let sites = siteReducer(resp[1].data.value.timeSeries)					
					res.send({
						weather: resp[0].data,
						sites: sites	
					})
				})
		})
		.catch(err => {
			console.log(err.message)
			res.status(204).send({})
		})
})

router.post('/search/coords', removeBlanks, (req, res) => {
	Promise.all([
		getWeather(req.body.search.lat, req.body.search.long),
		getConditionsBbox(req.body.search.lat, req.body.search.long)
	])
	.then(resp => {
		let sites = siteReducer(resp[1].data.value.timeSeries)
		// send the pair of response objects back to client
		res.send({
			weather: resp[0].data,
			sites: sites	
		})
	})
	.catch(err => {
		console.log(err.message)
		res.status(204).send({})
	})
})

module.exports = router