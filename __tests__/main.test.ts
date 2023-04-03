import {mockClient} from 'aws-sdk-client-mock'
import {
  APIGatewayClient,
  GetRestApisCommand,
  CreateRestApiCommand,
  PutRestApiCommand,
  CreateDeploymentCommand,
  NotFoundException,
  BadRequestException
} from '@aws-sdk/client-api-gateway'
import {run} from '../src/run'

test('deploy rest api success when rest api existed', async () => {
  const apiGatewayClientMock = mockClient(APIGatewayClient)
  apiGatewayClientMock.on(GetRestApisCommand).resolves({
    $metadata: {},
    items: [
      {
        name: 'api-gateway-test',
        id: '123456'
      }
    ],
    position: '123456'
  })
  apiGatewayClientMock.on(PutRestApiCommand).resolves({
    $metadata: {},
    id: '123456'
  })
  apiGatewayClientMock.on(CreateDeploymentCommand).resolves({
    $metadata: {},
    id: '123456'
  })

  return await expect(
    run({
      region: 'us-east-1',
      apiName: 'api-gateway-test',
      swaggerFile: 'swagger.example.json',
      deployStage: 'dev',
      apiType: 'rest'
    })
  ).resolves.toStrictEqual({
    apiUri: `https://123456.execute-api.us-east-1.amazonaws.com/dev`
  })
})

test('get rest api error', async () => {
  const apiGatewayClientMock = mockClient(APIGatewayClient)
  apiGatewayClientMock
    .on(GetRestApisCommand)
    .rejects(new NotFoundException({message: 'notfound', $metadata: {}}))

  return await expect(
    run({
      region: 'us-east-1',
      apiName: 'api-gateway-test',
      swaggerFile: 'swagger.example.json',
      deployStage: 'dev',
      apiType: 'rest'
    })
  ).rejects.toThrowError()
})

test('deploy rest api success when rest api is not existed', async () => {
  const apiGatewayClientMock = mockClient(APIGatewayClient)
  apiGatewayClientMock.on(GetRestApisCommand).resolves({
    $metadata: {},
    items: [],
    position: undefined
  })
  apiGatewayClientMock.on(CreateRestApiCommand).resolves({
    $metadata: {},
    id: '123456'
  })
  apiGatewayClientMock.on(PutRestApiCommand).resolves({
    $metadata: {},
    id: '123456'
  })
  apiGatewayClientMock.on(CreateDeploymentCommand).resolves({
    $metadata: {},
    id: '123456'
  })

  return await expect(
    run({
      region: 'us-east-1',
      apiName: 'api-gateway-test',
      swaggerFile: 'swagger.example.json',
      deployStage: 'dev',
      apiType: 'rest'
    })
  ).resolves.toStrictEqual({
    apiUri: `https://123456.execute-api.us-east-1.amazonaws.com/dev`
  })
})

test('deploy rest api error when can not create new api', async () => {
  const apiGatewayClientMock = mockClient(APIGatewayClient)
  apiGatewayClientMock.on(GetRestApisCommand).resolves({
    $metadata: {},
    items: [],
    position: undefined
  })
  apiGatewayClientMock
    .on(CreateRestApiCommand)
    .rejects(new BadRequestException({$metadata: {}, message: 'bad request'}))

  return await expect(
    run({
      region: 'us-east-1',
      apiName: 'api-gateway-test',
      swaggerFile: 'swagger.example.json',
      deployStage: 'dev',
      apiType: 'rest'
    })
  ).rejects.toThrowError()
})

test('deploy rest api error when can not update api', async () => {
  const apiGatewayClientMock = mockClient(APIGatewayClient)
  apiGatewayClientMock.on(GetRestApisCommand).resolves({
    $metadata: {},
    items: [
      {
        name: 'api-gateway-test',
        id: '123456'
      }
    ],
    position: '123456'
  })

  apiGatewayClientMock
    .on(PutRestApiCommand)
    .rejects(new BadRequestException({$metadata: {}, message: 'bad request'}))

  return await expect(
    run({
      region: 'us-east-1',
      apiName: 'api-gateway-test',
      swaggerFile: 'swagger.example.json',
      deployStage: 'dev',
      apiType: 'rest'
    })
  ).rejects.toThrowError()
})

test('deploy rest api error when can not publish api', async () => {
  const apiGatewayClientMock = mockClient(APIGatewayClient)
  apiGatewayClientMock.on(GetRestApisCommand).resolves({
    $metadata: {},
    items: [
      {
        name: 'api-gateway-test',
        id: '123456'
      }
    ],
    position: '123456'
  })

  apiGatewayClientMock.on(PutRestApiCommand).resolves({
    $metadata: {},
    id: '123456'
  })
  apiGatewayClientMock
    .on(CreateDeploymentCommand)
    .rejects(new BadRequestException({$metadata: {}, message: 'bad request'}))

  return await expect(
    run({
      region: 'us-east-1',
      apiName: 'api-gateway-test',
      swaggerFile: 'swagger.example.json',
      deployStage: 'dev',
      apiType: 'rest'
    })
  ).rejects.toThrowError()
})
