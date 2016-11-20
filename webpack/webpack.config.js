const Path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');

module.exports = (options) => {
  	const ExtractSASS = new ExtractTextPlugin(`/styles/${options.cssFileName}`);

  	const webpackConfig = {
    	devtool: options.devtool,
    	entry: [
      		`webpack-dev-server/client?http://localhost:${+ options.port}`,
      		'webpack/hot/dev-server',
      		Path.join(__dirname, '../src/app/index'),
    	],
    	output: {
      		path: Path.join(__dirname, '../dist'),
      		filename: `/scripts/${options.jsFileName}`,
    	},
    	resolve: {
      		extensions: ['', '.js', '.jsx'],
    	},
    	module: {
      		loaders: [{
        		test: /.jsx?$/,
        		include: Path.join(__dirname, '../src/app'),
        		loader: 'babel',
				},
			{
			test: /\.svg$/,
				loader: 'svg-sprite?' + JSON.stringify({
					name: '[name]_[hash]',
					prefixize: true
				})
			}],
    	},
		postcss: [ 
			autoprefixer({ browsers: ['last 2 versions'] })
		],
    	plugins: [
      		new Webpack.DefinePlugin({
        		'process.env': {
          			NODE_ENV: JSON.stringify(options.isProduction ? 'production' : 'development'),
        		},
      		}),
      		new HtmlWebpackPlugin({
        		template: Path.join(__dirname, '../src/index.html'),
      		}),
    	],
  	};

  	if (options.isProduction) {
    	webpackConfig.entry = [Path.join(__dirname, '../src/app/index')];

    	webpackConfig.plugins.push(
      		new Webpack.optimize.OccurenceOrderPlugin(),
      		new Webpack.optimize.UglifyJsPlugin({
        		compressor: {
          			warnings: false,
        		},
      		}),
      		ExtractSASS
    	);

    	webpackConfig.module.loaders.push({
      		test: /\.scss$/,
      		loader: ExtractSASS.extract(['css', 'postcss-loader', 'sass']),
    	});
	}
	else {
		webpackConfig.plugins.push(
			new Webpack.HotModuleReplacementPlugin()
		);

		webpackConfig.module.loaders.push({
			test: /\.scss$/,
			loaders: ['style', 'css', 'postcss-loader', 'sass'],
		});

    	webpackConfig.devServer = {
      		contentBase: Path.join(__dirname, '../'),
      		hot: true,
      		port: options.port,
      		inline: true,
      		progress: true,
      		historyApiFallback: true,
    	};
  	}

  	return webpackConfig;
};