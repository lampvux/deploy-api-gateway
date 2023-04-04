<p align="center">
  <a href="https://github.com/actions/typescript-action/actions"><img alt="typescript-action status" src="https://github.com/lampvux/deploy-api-gateway/workflows/build-test/badge.svg"></a>
</p>

# Deploy to AWS API Gateway Action using TypeScript

This action will create new API endpoints (rest, http,...) and add resources from Swagger yaml/json files & deploy to specific stage.

Return the invoke's URI of the API endpoint

## Available Parameters

- region (optional, default: us-east-1): The region of AWS services 
- apiName (required): name of the API endpoint
- swaggerFile (required): path to the swagger file
- deployStage (optional, default: dev): name of the deploy stage
- apiType (optional, default: rest): api type of the API (rest, http, etc...)


## Example Usage:

### Simple usage example

```yaml
uses: lampvux/deploy-api-gateway@v1
with:
  region: us-east-1
  api_name: 'rest api v1'
  swagger_file: './swagger.yaml'
  deployment_stage: 'staging'
  api_type: 'rest'
```

### Full usage example

```yaml
name: "Deploy API gateway"
on:
  push:
    branches:
      - main  
jobs:  
  build:    
    name: Build Image
    runs-on: ubuntu-latest   
    steps:
    # code checkout
    - name: Check out code
      uses: actions/checkout@v2    
    # config credentials
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v1
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1          
    # deploy to api gateway
    - name: Deploy to API gateway   
      uses: lampvux/deploy-api-gateway@v1
      with:
        region: us-east-1
        api_name: 'rest api v1'
        swagger_file: './swagger.yaml'
        deployment_stage: 'staging'
        api_type: 'rest'
```



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

Any folks, PRs are all welcome!