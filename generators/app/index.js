const mkdirp = require("mkdirp")
const chalk = require("chalk")
const Generator = require("yeoman-generator")

module.exports = class extends Generator {
	constructor(args, options) {
		super(args, options)

		this.packageJson = this.fs.readJSON(this.destinationPath("package.json"))
		if (!this.packageJson || !(this.packageJson.dependencies && this.packageJson.dependencies["react-native"])) {
			console.log(chalk.red("There is not a react-native project, please use create-react-native-app or react-native init to create one."))
			console.log(chalk.blue("https://facebook.github.io/react-native/docs/getting-started.html"))
			process.exit()
		}

		this.argument("appname", { type: String, required: false, default: this.determineAppname() })
		this.argument("yarn", { type: Boolean, required: false, default: this.fs.exists(this.destinationPath("yarn.lock")) })
		this.argument("expo", { type: Boolean, required: false, default: (this.packageJson.dependencies && this.packageJson.dependencies["expo"]) ? true : false })
	}

	prompting() {
		const prompts = []
		prompts.push({
			type: "input",
			name: "appname",
			message: "Project name:",
			default: this.determineAppname(),
		})

		const YARN = "yarn, use yarn add instead npm install?"
		const EXPO = "expo, this project is create by create-react-native-app?"

		return this.prompt(prompts)
			.then((answers) => {
				this.options.appname = answers.appname
			})
	}

	configuring() {
		// 複製 eslint config
		this.fs.copy(
			this.templatePath(".eslintrc"),
			this.destinationPath(".eslintrc")
		)
	}

	writing() {
		this._constructFileStruct()
		this._copyEnterPoint()
	}

	install() {
		this._installDependencies()
	}

	end() {
		const pkg = this.options.yarn ? "yarn" : "npm"
		console.log("")
		console.log("Success!")
		console.log("")
		if (this.options.expo) {
			console.log(chalk.cyan("  Start dev server"))
			console.log(`    ${pkg} start`)
		} else {
			console.log(chalk.cyan("  Run your app"))
			console.log("    react-native run-ios")
			console.log("    react-native run-android")
			console.log("    or run ios/android project in XCode/Android Studio")
		}
	}

	_installDependencies() {
		const dependencies = [
			"immutable",
			"prop-types",
			"react-native-router-flux",
			"react-redux",
			"redux",
			"redux-immutable",
			"redux-thunk"
		]
		if (this.options.yarn) {
			this.yarnInstall(dependencies)
		} else {
			this.npmInstall(dependencies, { "save": true })
		}
	}

	_copyEnterPoint() {
		if (this.options.expo) {
			this.fs.copyTpl(
				this.templatePath("App.js"),
				this.destinationPath("App.js"),
				{
					path: "src",
				}
			)
		} else {
			this.fs.copyTpl(
				this.templatePath("index.js"),
				this.destinationPath("index.js"),
				{
					appname: this.options.appname,
					path: "src",
				}
			)
		}
	}

	_constructFileStruct() {
		// 複製 src 資料夾
		this.fs.copy(
			this.templatePath("babel/src"),
			this.destinationPath("src")
		)

		// 建立空資料夾
		mkdirp("src/components")
		mkdirp("src/images")
		mkdirp("src/lib")
	}
}
