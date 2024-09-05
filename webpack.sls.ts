import * as path from "path";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import slsw = require("serverless-webpack");
import * as webpack from "webpack";

const config: webpack.Configuration = {
  entry: slsw.lib.entries,
  mode: slsw.lib.webpack.isLocal ? "development" : "production",
  node: {
    __dirname: true,
    __filename: true,
  },
  devtool: "source-map",
  resolve: {
    extensions: [".mjs", ".json", ".js", ".ts", ".tsx"],
    plugins: [],
  },
  plugins: [new webpack.DefinePlugin({ "global.GENTLY": false })],
  output: {
    /**
     * Ensure that we are creating relative paths based on the project root and not system root
     */
    devtoolModuleFilenameTemplate(info: { absoluteResourcePath: string }) {
      return `webpack:///${path.relative(__dirname, info.absoluteResourcePath)}`;
    },
    libraryTarget: "commonjs",
    path: path.join(process.cwd(), ".webpack"),
    filename: "[name].js",
    sourceMapFilename: "[file].map",
  },
  optimization: {
    minimize: false,
  },
  target: "node",
  // misc workarounds for various things that trip up webpack
  externals: ["aws-sdk", "utf-8-validate", "bufferutil", "pino-pretty"],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        options: {
          happyPackMode: true,
          transpileOnly: true,
        },
      },
      {
        test: /\.(graphql|gql)$/,
        exclude: /node_modules/,
        loader: "graphql-tag/loader",
      },
      {
        test: /\.mjs$/,
        include: /node_modules/,
        exclude: /node_modules\/@sinclair\/typebox/,
        type: "javascript/auto",
      },
      {
        test: /\.js$/,
        include: /node_modules\/@sinclair\/typebox/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
};

module.exports = config;
