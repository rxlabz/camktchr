var path = require('path');
var webpack = require('webpack');
var node_modules = path.resolve(__dirname, 'node_modules');
var pathToReact = path.resolve(node_modules,'react/react.js');
var pathToReactDom = path.resolve(node_modules,'react-dom/dist/react-dom.js');
var pathToReactLib = path.resolve(node_modules,'react/lib');

module.exports = {
    /*devtool: 'source-map',*/
    entry: {
        app:[
            'webpack/hot/dev-server',
            'webpack-dev-server/client?http://localhost:8080',
            path.resolve(__dirname, "src/app.jsx")
        ],
        /*app:path.resolve(__dirname, "src/app.jsx"),*/
        vendors:['react-dom','react']
    },
    resolve:{
        alias : {
            'react/lib':pathToReactLib,
            'react-dom':pathToReactDom,
            'react':pathToReact
        }
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: "bundle.js"
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loaders: ["react-hot","babel-loader"],
                exclude: /node_modules/
            },
            {
                test: /\.html$/,
                loader: 'file?name=[name].[ext]'
            }
        ]
    },
plugins:[
    new webpack.optimize.CommonsChunkPlugin('vendors', 'vendors.js')
]
}