var webpack = require('webpack'),
    path = require('path'),
    LiveReloadPlugin = require('webpack-livereload-plugin'),
    UglifyJsPlugin = webpack.optimize.UglifyJsPlugin,

    env = process.env.WEBPACK_ENV, // dev | build
    isProduction = env === 'prod' || env === 'prodUMD',

    chartModulesPath = path.resolve('./src/charts'),
    fixturesPath = path.resolve('./test/fixtures'),
    vendorsPath = path.resolve('./node_modules'),

    projectName = 'britecharts',
    currentCharts = {
        'bar': './src/charts/bar.js',
        'donut': './src/charts/donut.js',
        'legend': './src/charts/legend.js',
        'line': './src/charts/line.js',
        'tooltip': './src/charts/tooltip.js',
        'mini-tooltip': './src/charts/mini-tooltip.js',
        'sparkline': './src/charts/sparkline.js',
        'stacked-area': './src/charts/stacked-area.js',
        'step': './src/charts/step.js',
        'brush': './src/charts/brush.js',
        // hack to make webpack use colors as an entry point while its also a dependency of the charts above
        'colors': ['./src/charts/helpers/colors.js']
    },

    defaultJSLoader = {
        test: /\.js$/,
        loader: 'babel',
        exclude: /(node_modules)/,
        query: {
            presets : ['es2015', 'stage-0']
        }
    },

    plugins = [],
    outputFile,
    config;


// Set up minification for production
if (isProduction) {
    plugins.push(new UglifyJsPlugin({ minimize: true }));
    outputFile = projectName + '.min.js';
}

config = {

    // Add here listener to sccs files?
    demos : {
        devtool: 'source-map',
        entry: [
            './demos/index.js'
        ],
        output: {
            path: './docs/scripts/',
            filename: 'bundle.js',
        },
        resolve:{
            root: [
                __dirname,
            ],
        },
        module: {
            loaders: [ defaultJSLoader ]
        },
        plugins : [
            new LiveReloadPlugin({appendScriptTag:true})
        ]
    },

    // Test configuration for Karma runner
    test: {
        resolve: {
            root: [chartModulesPath, fixturesPath],
            alias: {
                d3: vendorsPath + '/d3'
            }
        },
        module: {
            preLoaders: [
                {
                    test: /\.js$/,
                    include: /src/,
                    exclude: /(node_modules)/,
                    loader: 'babel',
                    query: {
                        presets: ['es2015', 'stage-0'],
                        cacheDirectory: true,
                    },
                },
                {
                    test: /\.js?$/,
                    include: /src/,
                    exclude: /(node_modules|__tests__)/,
                    loader: 'babel-istanbul',
                    query: {
                        presets: ['es2015', 'stage-0'],
                        cacheDirectory: true,
                    },
                }
            ],

            loaders: [ defaultJSLoader ]
        },
        plugins: plugins
    },

    // Creates a bundle with all britecharts
    prod: {
        entry:  currentCharts,

        devtool: 'source-map',

        output: {
            path: 'dist/bundled',
            filename: outputFile,
            libraryTarget: 'umd'
        },

        externals: {
            d3: 'd3',
            underscore: 'underscore'
        },

        module: {

            loaders: [ defaultJSLoader ],

            // Tell Webpack not to parse certain modules.
            noParse: [
                new RegExp(vendorsPath + '/d3/d3.js')
            ]
        },

        resolve: {
            alias: {
                d3: vendorsPath + '/d3'
            }
        },

        plugins: plugins
    },

    // Creates minified UMD versions of each chart
    prodUMD: {
        entry:  currentCharts,

        devtool: 'source-map',

        output: {
            path:     'dist/umd',
            filename: '[name].min.js',
            libraryTarget: 'umd'
        },

        externals: {
            d3: 'd3',
            underscore: 'underscore'
        },

        module: {

            loaders: [ defaultJSLoader ],

            // Tell Webpack not to parse certain modules.
            noParse: [
                new RegExp(vendorsPath + '/d3/d3.js')
            ]
        },

        resolve: {
            alias: {
                d3: vendorsPath + '/d3'
            }
        },

        plugins: plugins
    }
};


module.exports = config[env];


