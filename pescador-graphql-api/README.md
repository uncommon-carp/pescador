# Pescador API
---
GraphQL API for the Pescador client

## Tech Stack

API: Express.js | Node.js | MongoDB | GraphQL | Cloudinary

USGS Water Data Instantaneous Values Service and the OpenWeather API

## Quick Description

Pescador is an tool for the dedicated angler, of any style. It provides a single location for weather, stream conditions, and trip journaling. Pescador
aims to improve the angler's time on the water by streamlining research with pertinent, useful data that is easy to access and use.

## User Story

I am an angler, either hobbyist, journeyman, professional, or guide. I need a resource that provides up-to-date information about the waters I fish. I
need current and forecast weather conditions and moon phases. I need a central location to save information about my fishing trips including weather,
stream conditions, tackle, and fish caught. I need to keep a list of stream or lake stations to be shown at my dashboard.

I would like to see the measuring stations within a range of my current location or a placed pin. I would like to be able to store lists or groups of stations to access
regularly.

## GraphQL Queries Needed

- All for each owned model
- Single water with stations and fish
- Single station with fish and trips
- Single trip with water, station, and fish