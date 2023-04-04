import * as core from '@actions/core'
import {run} from './run'

async function main(): Promise<void> {
  try {
    const outputs = await run({
      region: core.getInput('region') || 'us-east-1',
      apiName: core.getInput('api-name', {required: true}),
      swaggerFile: core.getInput('swagger_file', {required: true}),
      deployStage: core.getInput('deploy_stage') || 'dev',
      apiType: core.getInput('api_type') || 'rest'
    })
    core.setOutput('api_uri', outputs.apiUri)
  } catch (error) {
    if (error instanceof Error) core.setFailed(`Error :  ${error.message}`)
  }
}

main()
