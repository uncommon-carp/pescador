# Pescador

Weather and water data aggregation and prediction for angling and hunting.

## Tech Stack

Typescript, GraphQL, AWS (CDK)

## About

This app came about because I am an avid angler and I became frustrated with
moving through multiple apps to get an idea of fishing conditions for the day.

This app will allow users to use their location or plug in coords, zip code,
or city and state to receive weather and water information. The weather data
will be a short history, current, and future, mostly focused on precipitation,
barometric pressure, and cloud cover. Water information will come from USGS
and NOAA measuring sites, providing streamflow, gage heights, and temperature
where applicable.

Users will also be able to collect a small grouping of favorite measuring sites
to build a dashboard of information, to minimize searching and digging for
information.

## Current State

- Weather and nearby stations based on zip code
- User auth with profiles

## Coming Soon

- Site favoriting
- User dashboard
- Weather history

## For the Future

- Detailed weather maps with radar and wind overlays
- Fishing quality prediction
- Trip tracking
