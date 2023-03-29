import * as core from '@actions/core'
import {Inputs, Outputs} from './types'
import {
  APIGatewayClient,
  CreateRestApiCommand,
  PutRestApiCommand,
  GetDeploymentCommand,
  CreateDeploymentCommand
} from '@aws-sdk/client-api-gateway'
import {readFileSync} from 'fs'

export const run = async (inputs: Inputs): Promise<Outputs> => {
  // Read the Swagger YAML file contents
  const swaggerYaml = readFileSync(inputs.swaggerFile, 'utf8')

  // Create a new API Gateway client
  const client = new APIGatewayClient({region: inputs.region})

  // Create a new REST API
  const createRestApiCommand = new CreateRestApiCommand({name: inputs.apiName})
  const {id: restApiId} = await client.send(createRestApiCommand)

  // Update the REST API with the Swagger schema YAML
  const putRestApiCommand = new PutRestApiCommand({
    body: swaggerYaml,
    restApiId,
    mode: 'overwrite'
  })

  await client.send(putRestApiCommand)

  core.info(
    `Successfully created REST API '${inputs.apiName}' with ID '${restApiId}'.`
  )

  const stage = getDeploymentStage(client)

  return {
    apiUri: `https://${restApiId}.execute-api.${inputs.region}.amazonaws.com/${stageName}`
  }
}

const getDeploymentStage = async (
  client: APIGatewayClient,
  apiId: string,
  stageName: string
): Promise<string | false> => {
  const input = {
    // GetDeploymentRequest
    restApiId: apiId, // required
    deploymentId: stageName // required
  }
  const command = new GetDeploymentCommand(input)
  try {
    const response = await client.send(command)
    return response?.item.stageName
  } catch (error) {
    core.info(`Get deployment stage failed .`, error.message)
    return false
  }
}

const createDeploymentStage = async (
  client: APIGatewayClient,
  stageName: string
): Promise<any> => {
  // Create a new deployment stage
  const createDeploymentCommand = new CreateDeploymentCommand({
    restApiId,
    stageName
  })
  const {id: deploymentId} = await client.send(createDeploymentCommand)
}
