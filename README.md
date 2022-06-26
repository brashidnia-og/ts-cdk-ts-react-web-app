# Welcome to your CDK TypeScript project!

This is a Blank project for TypeScript development with CDKv2 to deploy multi-stage, cross-region Application via CDK pipeline

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Special Files
* `infrastructure/bin/cdk_app.ts` Root file of the CDK app initialization
* `infrastructure/lib/constants.ts` File with constants used in the package
  * `CODE_COMMIT_REPO_NAME` the name of the repository you want to store in CodeCommit
    * **NOTE: Changes to this will require changes to the `deploy_pipeline` scripts**
* `infrastructure/lib/config/stack_config.ts` File with configurations for Pipeline stages
  * `STACK_CONFIGS` in `lib/config/stack_config.ts` define all AWS accounts/regions for stages in the CDKPipeline
* `infrastructure/deploy_pipeline.sh` is executable to deploy CDK stack(s)
* `infrastructure/test/` contains all the tests for the .ts files defining the stacks
* `infrastructure/package.json` Where all the application dependencies are defined


## CI/CD build information

CodePipeline Stages
1. Source
* Part of default steps defined in `CodePipeline()` construct in `infrastructure/lib/stacks/pipeline_stack.ts`
* Pulls source code from the defined repo
2. Build
* Part of default steps defined in `CodePipeline()` construct in `infrastructure/lib/stacks/pipeline_stack.ts`
* Runs the `synth` commands in CodeBuild to generate the build files (typescript cdk + java lambda)
*
3. UpdatePipeline
* Part of default steps defined in `CodePipeline()` construct in `infrastructure/lib/stacks/pipeline_stack.ts`
* This mutates the pipeline
  * NOTE: If you change the CDK CodePipeline definition and it doesnt pass step 1 or 2 (Source or Build) you MUST run `cdk deploy {CLOUDFORMATION_STACK}` again to update the Source / Build / UpdatePipeline stages, otherwise you will never be able to update the pipeline
4. Assets
* Build assets
5. GlobalEnv
* Used to create resources that will be globally shared across other stacks
6. AlphaEnv
* Alpha stack deploys to the alpha.domain_name
7. BetaEnv
* Beta stack deploys to the beta.domain_name 
8. Prod stack
* Deploys to the main domain

# React app

In the `software/` directory, the frontend react app (typescript) is the website deployed
across the different stacks. These resources are built, deployed, and connected to a web domain in AWS using the CDK build logic defined in `infrastructure`

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
