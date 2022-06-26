import { BASE_WEB_DOMAIN, BASE_WEB_DOMAIN_PUBLIC_HOSTED_ZONE_ID } from "../constants";

export interface IStackConfig {
    readonly stackName: string;
    readonly account: string;
    readonly region: string;
}

export class StackConfig {
    readonly #stackName: string;
    readonly #account: string;
    readonly #region: string;

    constructor(accountId: string, awsRegion: string, stackName?: string | null) {
        if (stackName == null) {
            this.#stackName = accountId + "_" + awsRegion;
        } else {
            this.#stackName = stackName;
        }
        this.#account = accountId;
        this.#region = awsRegion;
    }

    get stackName() {
        return this.#stackName;
    }

    get account() {
        return this.#account;
    }

    get region() {
        return this.#region;
    }
}

export class AppStackConfig extends StackConfig {
    readonly #stageType: StageType;
    readonly #zoneName: string;

    constructor(accountId: string, awsRegion: string, stageType: StageType, zoneName: string, stackName?: string | null) {
        super(accountId, awsRegion, stackName)
        this.#stageType = stageType;
        this.#zoneName = zoneName;
    }
    
    get stageType() {
        return this.#stageType;
    }
    
    get zoneName() {
        return this.#zoneName;
    }

    isAlpha() {
        return this.#stageType == StageType.ALPHA;
    }

    isBeta() {
        return this.#stageType == StageType.BETA;
    }
    
    isProd() {
        return this.#stageType == StageType.PROD;
    }
}

export enum StageType {
    ALPHA = "ALPHA",
    BETA = "BETA",
    PROD = "PROD",
}

export const DEFAULT_STACK_ACCOUNT = "YOUR_AWS_ACCOUNT_HERE";
export const ALPHA_STACK_REGION = "us-east-1";
export const BETA_STACK_REGION = "us-east-2";
export const PROD_STACK_REGION = "us-west-2";

// Stack config used to create pipeline
export const PIPELINE_STACK_CONFIG: StackConfig = new StackConfig(DEFAULT_STACK_ACCOUNT, PROD_STACK_REGION);

// Stacks configs used to deploy resources regionally via a CodePipeline
export const STACK_CONFIGS: AppStackConfig[] = [
    new AppStackConfig(DEFAULT_STACK_ACCOUNT, ALPHA_STACK_REGION, StageType.ALPHA, `${StageType.ALPHA.toLowerCase()}.${BASE_WEB_DOMAIN}`),
    new AppStackConfig(DEFAULT_STACK_ACCOUNT, BETA_STACK_REGION, StageType.BETA, `${StageType.BETA.toLowerCase()}.${BASE_WEB_DOMAIN}`),
    new AppStackConfig(DEFAULT_STACK_ACCOUNT, PROD_STACK_REGION, StageType.PROD, BASE_WEB_DOMAIN)
];