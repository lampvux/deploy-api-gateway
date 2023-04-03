export type Inputs = {
  /**
   * aws region: default us-east-1
   */
  region?: string
  /**
   * api name for api gateway
   */
  apiName: string
  /**
   * path to the swagger json file
   */
  swaggerFile: string
  /**
   * name of the stage to deploy the api gateway
   */
  deployStage?: string
  /**
   * types of api, rest/http/websocket
   */
  apiType?: string
}
export type Outputs = {
  /**
   * the api uri output after publish the api to stage
   */
  apiUri: string
}

export type RestAPIGet = {
  /**
   * <p>The current pagination position in the paged result set.</p>
   */
  position?: string
  /**
   * <p>The maximum number of returned results per page. The default value is 25 and the maximum value is 500.</p>
   */
  limit?: number
}
