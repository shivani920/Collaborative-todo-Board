const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const webpack = require("webpack")

module.exports = {
  entry: "./src/main.jsx",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
    publicPath: "/",
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      filename: "index.html",
    }),
    // Define environment variables for the browser
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development"),
      "process.env.REACT_APP_SERVER_URL": JSON.stringify(process.env.REACT_APP_SERVER_URL || "http://localhost:5000"),
      "process.env.REACT_APP_API_URL": JSON.stringify(process.env.REACT_APP_API_URL || "http://localhost:5000/api"),
    }),
  ],
  devServer: {
    port: 3000,
    historyApiFallback: true,
    hot: true,
    open: true,
    static: {
      directory: path.join(__dirname, "public"),
    },
    compress: true,
  },
  resolve: {
    extensions: [".js", ".jsx"],
    fallback: {
      process: require.resolve("process/browser"),
    },
  },
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
}
