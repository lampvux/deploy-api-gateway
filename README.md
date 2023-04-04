<p align="center">
  <a href="https://github.com/actions/typescript-action/actions"><img alt="typescript-action status" src="https://github.com/lampvux/deploy-api-gateway/workflows/build-test/badge.svg"></a>
</p>

# Deplot to AWS API Gateway Action using TypeScript

This action will create new API endpoints (rest, http,...) and add resources from Swagger yaml/json files & deploy to specific stage.

Return the invoke's URI of the API endpoint

## Development

> First, you'll need to have a reasonably modern version of `node` handy. This won't work with versions older than 9, for instance.

Install the dependencies  
```bash
$ npm install
```

Build the typescript and package it for distribution
```bash
$ npm run build && npm run package
```

Run the tests :heavy_check_mark:  
```bash
$ npm test
...
```

## Change action.yml

The action.yml defines the inputs and output for your action.

Update the action.yml with your name, description, inputs and outputs for your action.

See the [documentation](https://help.github.com/en/articles/metadata-syntax-for-github-actions)

## Change the Code

Most toolkit and CI/CD operations involve async operations so the action is run in an async function.

```javascript
import * as core from '@actions/core';
...

async function main() {
  try { 
      ...
  } 
  catch (error) {
    core.setFailed(error.message);
  }
}

main()
```

See the [toolkit documentation](https://github.com/actions/toolkit/blob/master/README.md#packages) for the various packages.

## Available Parameters

- region (optional, default: us-east-1): The region of AWS services 
- apiName (required): name of the API endpoint
- swaggerFile (required): path to the swagger file
- deployStage (optional, default: dev): name of the deploy stage
- apiType (optional, default: rest): api type of the API (rest, http, etc...)


## Publish to a distribution branch

Actions are run from GitHub repos so we will checkin the packed dist folder. 

Then run [ncc](https://github.com/zeit/ncc) and push the results:
```bash
$ npm run package
$ git add dist
$ git commit -a -m "prod dependencies"
$ git push origin releases/v1
```

Your action is now published! :rocket: 

See the [versioning documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)

## Validate

You can now validate the action by referencing `./` in a workflow in your repo (see [test.yml](.github/workflows/test.yml))

```yaml
uses: ./
with:
  region: 1000
```

See the [actions tab](https://github.com/actions/typescript-action/actions) for runs of this action! :rocket:

## Example Usage:

After testing you can [create a v1 tag](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md) to reference the stable and latest V1 action

```yaml
uses: lampvux/deploy-api-gateway@v1
with:
  region: us-east-1
  apiName: 'rest api v1'
  swaggerFile: './swagger.yaml'
  deployStage: 'staging'
  apiType: 'rest'
```