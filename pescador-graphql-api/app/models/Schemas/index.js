const { GraphQLString, GraphQLID, GraphQLList, GraphQLObjectType, GraphQLInt, GraphQLSchema, GraphQLFloat, GraphQLScalarType } = require('graphql')
const Water = require('../water')
const Station = require('../station')
const Trip = require('../trip')
const Fish = require('../fish')


// Custom Date Scalar because GraphQL doesn't do dates? Makes it work like a JS Date object
const dateScalar = new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    serialize(value) {
      return value.getTime(); // Convert outgoing Date to integer for JSON
    },
    parseValue(value) {
      return new Date(value); // Convert incoming integer to Date
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return new Date(parseInt(ast.value, 10)); // Convert hard-coded AST string to integer and then to Date
      }
      return null; // Invalid hard-coded value (not an integer)
    },
})
  
// **** TYPE DEFINITIONS ****
const WaterType = new GraphQLObjectType({
  name: 'Water',
  fields: () => ({
    _id: {type: GraphQLID },
    name: {type: GraphQLString },
    type: {type: GraphQLString },
    userId: {type: GraphQLID},
    stations: {type: new GraphQLList(StationType)}
  })
})

const StationType = new GraphQLObjectType({
  name: 'Station',
  fields: () => ({
    _id: { type: GraphQLID },
    name: { type: GraphQLString },
    usgsId: { type: GraphQLString },
    long: { type: GraphQLFloat },
    lat: { type: GraphQLFloat },
  })
})

const TripType = new GraphQLObjectType({
  name: 'Trip',
  fields: () => ({
    _id: { type: GraphQLID },
    date: { type: dateScalar },
    streamId: { type: GraphQLID },
    weather: { type: GraphQLString },
    description: { type: GraphQLString },
    fish: { type: GraphQLString }
  })
})

const FishType = new GraphQLObjectType({
  name: 'Fish',
  fields: () => ({
    _id: { type: GraphQLID },
    userId: { type: GraphQLID },
    tripId: { type: GraphQLID},
    species: { type: GraphQLString },
    length: { type: GraphQLFloat },
    weight: { type: GraphQLFloat },
    description: { type: GraphQLString },
    caughtOn: { type: GraphQLString }
  })
})



// The root provides a resolver function for each API endpoint
const RootQuery = new GraphQLObjectType({
    name: "RootQueryType",
    fields: {
      allWaters: {
        type: new GraphQLList(WaterType),
        resolve(parent, args) {
          return Water.find({})
        }
      },
      userWaters: {
        type: new GraphQLList(WaterType),
        args: { userId: {type: GraphQLID }},
        resolve(parent, { userId }) {
          return Water.find({userId: userId}).populate('stations')
        }
      }
      ,
      water: {
        type: WaterType,
        args: { _id: { type: GraphQLID } },
        resolve(parent, { _id }) {
          return Water.findById(_id).populate('stations')
        }
      },
      stations: {
        type: new GraphQLList(StationType),
        args: { _id: {type: GraphQLID }},
        resolve(parent, { _id }) {
          return Station.find({waterId: _id})
        }
      },
      station: {
        type: StationType,
        args: { _id: { type: GraphQLID } },
        resolve(parent, { _id }) {
          return Station.findOne({_id: _id}).populate('waterId')
        }
      },
      trips: {
        type: new GraphQLList(TripType),
        resolve(parent, args) {
          return Trip.find({})
        }
      },
      trip: {
        type: TripType,
        args: { _id: { type: GraphQLID } },
        resolve(parent, { _id }) {
          return Trip.findById(_id)
        }
      },
      fishes: {
        type: new GraphQLList(FishType),
        resolve(parent, args) {
          return Fish.find({})
        }
      },
      fish: {
        type: FishType,
        args: { _id: { type: GraphQLID } },
        resolve(parent, { _id }) {
          return Fish.findById(_id)
        }
      }, 
    }
})

// All possible data mutations: Creates, edits and deletes
const Mutation = new GraphQLObjectType({
    name: "Mutation",
    fields: {
      // *** DATA CREATIONS ***
      createWater: {
        type: WaterType,
        args: {
          name: {type: GraphQLString },
          type: { type: GraphQLString },
          userId: { type: GraphQLID }
        },
        resolve(parent, args) {
          return Water.create({
            name: args.name,
            type: args.type,
            userId: args.userId
          })
        }
      },
      createStation: {
        type: StationType,
        args: {
          name: { type: GraphQLString },
          usgsId: { type: GraphQLString },
          long: { type: GraphQLFloat },
          lat: { type: GraphQLFloat },
          waterId: {type: GraphQLID}
        },
        resolve(parent, args) {
          return (
            Station.findOneAndUpdate({ usgsId: args.usgsId }, {
              name: args.name,
              usgsId: args.usgsId,
              long: parseFloat(args.long),
              lat: parseFloat(args.lat)
            }, {new: true, upsert: true})
              .then(station => {
                console.log('station', station)
                console.log('args', args)
                let stationId = station._id
                Water.find({ _id: args.waterId })
                  .then(water => {
                    console.log('water', water[0].stations)
                    if(water[0].stations.includes(stationId)){
                      return water[0]
                    } else {
                      water[0].stations.push(stationId)
                      return water[0].save()
                    }
                  })
              })
          )
        }
      },
      createTrip: {
        type: TripType,
        args: {
          date: { type: dateScalar },
          weather: { type: GraphQLString },
          description: { type: GraphQLString },
          streamId: { type: GraphQLID },
          userId: { type: GraphQLID }
        },
        resolve(parent, args) {
          return (
            Trip.create({
              date: args.date,
              weather: args.weather,
              description: args.description,
              streamId: args.streamId,
              userId: args.userId
            })
          )
        }
      },
      createFish: {
        type: FishType,
        args: {
          userId: { type: GraphQLID },
          tripId: { type: GraphQLID},
          species: { type: GraphQLString },
          length: { type: GraphQLFloat },
          weight: { type: GraphQLFloat },
          description: { type: GraphQLString },
          caughtOn: { type: GraphQLString }
        },
        resolve(parent, args) {
          return (
            Fish.create({
              userId: args.userId,
              tripId: args.tripId,
              species: args.species,
              length: args.length,
              weight: args.weight,
              description: args.description,
              caughtOn: args.caughtOn
            })
          )
        }
      }
    }
})

module.exports = new GraphQLSchema({query: RootQuery, mutation: Mutation})