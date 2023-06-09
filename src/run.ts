import * as core from '@actions/core'
import {
  APIGatewayClient,
  CreateDeploymentCommand,
  CreateRestApiCommand,
  GetRestApisCommand,
  //GetDeploymentCommand,
  PutRestApiCommand
} from '@aws-sdk/client-api-gateway'

import {Inputs, Outputs, RestAPIGet} from './types'
import {Buffer} from 'node:buffer'
import {readFileSync} from 'fs'

export const run = async (inputs: Inputs): Promise<Outputs> => {
  // Create a new API Gateway client
  const client = new APIGatewayClient({region: inputs.region})
  switch (inputs.apiType) {
    case 'rest':
      return restAPIFlow(client, inputs)

    case 'http':
      return restAPIFlow(client, inputs)

    default:
      return restAPIFlow(client, inputs)
  }
}

/**
 * REST API flow control
 * @param client APIGatewayClient
 * @param inputs Inputs
 * @returns API invoke URI
 */
const restAPIFlow = async (
  client: APIGatewayClient,
  inputs: Inputs
): Promise<Outputs> => {
  try {
    // check api id
    let restAPIId = await getRestApiId(client, inputs.apiName)
    // create new api if not existed
    if (!restAPIId) {
      restAPIId = await createRestApi(client, inputs.apiName)
    }
    // update api with schema
    if (restAPIId) return await putRestAPI(client, restAPIId, inputs)

    return {
      apiUri: `error`
    }
  } catch (error) {
    core.info(`error in rest api flow: ${JSON.stringify({error, inputs})}`)
    throw error
  }
}

/**
 * Create new REST API endpoint in AWS gateway
 * @param client APIGatewayClient
 * @param apiName api name
 * @returns rest api id or empty
 */
const createRestApi = async (
  client: APIGatewayClient,
  apiName: string
): Promise<string | undefined> => {
  try {
    const createRestApiCommand = new CreateRestApiCommand({name: apiName})
    const {id: restApiId} = await client.send(createRestApiCommand)
    return restApiId
  } catch (error) {
    core.error(
      `error when create new rest api: ${JSON.stringify({error, apiName})}`
    )
    throw error
  }
}

/**
 * get rest api id if available
 * @param client APIGatewayClient
 * @param apiName api name
 * @returns the api id
 */
const getRestApiId = async (
  client: APIGatewayClient,
  apiName: string
): Promise<string | undefined> => {
  try {
    const params: RestAPIGet = {}
    let restApiId
    do {
      const command = new GetRestApisCommand(params)
      const response = await client.send(command)
      if (response) {
        const api = response.items?.find(item => item.name === apiName)
        if (api) {
          restApiId = api.id
          break
        }
      }
      params.position = response.position
    } while (params.position)

    return restApiId
  } catch (error) {
    core.error(JSON.stringify({error, apiName}))
    throw error
  }
}

/**
 * update the Rest API with schema information
 * @param client APIGatewayClient
 * @param restApiId
 * @param inputs
 * @returns API invoke URI
 */
const putRestAPI = async (
  client: APIGatewayClient,
  restApiId: string,
  inputs: Inputs
): Promise<Outputs> => {
  try {
    // Read the Swagger YAML file contents
    const swaggerYaml = readFileSync(inputs.swaggerFile, 'utf8')
    const bodyBuffer = Buffer.from(swaggerYaml)
    // Update the REST API with the Swagger schema YAML
    const putRestApiCommand = new PutRestApiCommand({
      body: bodyBuffer,
      restApiId,
      mode: 'overwrite'
    })

    await client.send(putRestApiCommand)

    core.info(
      `Successfully created REST API '${inputs.apiName}' with ID '${restApiId}'.`
    )
    const stageName = inputs.deployStage ?? 'dev'

    await deployRestApi(client, restApiId, stageName)

    return {
      apiUri: `https://${restApiId}.execute-api.${inputs.region}.amazonaws.com/${stageName}`
    }
  } catch (error) {
    core.error(
      `error in deploying rest api: ${JSON.stringify({error, inputs})}`
    )
    throw error
  }
}

/**
 * Deploy the published API to specific stage
 * @param client APIGatewayClient
 * @param restApiId String - rest api id
 * @param stageName String - example: dev, prod
 * @returns the deploymentid if successful
 */
const deployRestApi = async (
  client: APIGatewayClient,
  restApiId: string,
  stageName: string
): Promise<string> => {
  try {
    // Create a new deployment stage
    const createDeploymentCommand = new CreateDeploymentCommand({
      restApiId,
      stageName
    })
    const {id: deploymentId} = await client.send(createDeploymentCommand)
    return deploymentId ?? 'undefined'
  } catch (error) {
    core.error(
      `error deploying to stage: ${JSON.stringify({
        error,
        restApiId,
        stageName
      })}`
    )
    throw error
  }
}
