var webpack = require('webpack'),
    ExtractTextPlugin = require('extract-text-webpack-plugin'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    bemLinter = require('postcss-bem-linter'),
    atImport = require('postcss-import'),
    customProperties = require('postcss-custom-properties'),
    autoprefixer = require('autoprefixer');

module.exports = {
    entry: {
        bundle: './src/app.js'
    },

    output: {
        path: __dirname + '/dist',
        filename: '/bundle.js'
    },

    uglifyJsPlugin: new webpack.optimize.UglifyJsPlugin({
        compressor: {
            screw_ie8: true,
            warnings: false
        },
        output: {
            comments: false
        }
    }),

    resolve: {
        extensions: ['', '.js', '.pug'],
        modulesDirectories: [
            './',
            'js',
            'node_modules'
        ]
    },

    resolveLoader: {
        modulesDirectories: ['node_modules'],
        extensions: ['', '.js', '.jsx']
    },

    devtool: 'eval-source-map',

    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            Tether: "tether",
            "window.Tether": "tether",
            Backbone: "backbone"
        }),
        new webpack.optimize.UglifyJsPlugin({
            compressor: {
                screw_ie8: true,
                warnings: false
            },
            output: {
                comments: false
            }
        }),
        new ExtractTextPlugin('styles.css'),
        new HtmlWebpackPlugin({
            title: 'Backbone App',
            template: './src/index.html',
            filename: 'index.html',
            inject: 'body' // Inject all scripts into the body
        })
    ],

    postcss: [
        atImport({
            path: ['node_modules', './src']
        }),
        autoprefixer({ browsers: ['last 2 versions'] }),
        customProperties(),
        bemLinter()
    ],

    module: {
        loaders: [
            {test: /bootstrap\/js\//, loader: 'imports?jQuery=$' },
            {test: /\.html?$/, loader: 'file?name=[name].[ext]'},
            {test: /\.pug$/, loader: 'pug-loader'},
            {test: /\.js?$/, exclude: /node_modules/, loader: 'babel-loader'},
            {test: /\.handlebars$/, loader: "handlebars-loader"},
            {test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader!postcss-loader')},
            {test: /\.scss$/, loaders: ['style', 'css', 'autoprefixer', 'sass']},
            {test: /\.png$/, loader: 'url?limit=8192&mimetype=image/png'},
            {test: /\.jpe?g$/, loader: 'url?limit=8192&mimetype=image/jpg'},
            {test: /\.gif$/, loader: 'url?limit=8192&mimetype=image/gif'},
            {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=8192&mimetype=image/svg+xml'},
            {test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=8192&mimetype=application/font-woff2'},
            {test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=8192&mimetype=application/font-woff'},
            {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=8192&mimetype=application/octet-stream'},
            {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file'},
            {test: /\.md$/, loaders: ['html', 'markdown']}
        ]
    },

    devServer: {
        historyApiFallback: true
    },
};