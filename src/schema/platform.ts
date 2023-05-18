import {
  DEFAULT_GITHUB_API_URL,
  DEFAULT_GITHUB_SERVER_URL,
  DEFAULT_GITHUB_TOKEN_ID,
  DEFAULT_GITLAB_API_URL,
  DEFAULT_GITLAB_SERVER_URL,
  DEFAULT_GITLAB_TOKEN_ID,
  Platform,
  PlatformType,
} from "@bc-cr/domain/platform";
import { JSONSchemaType } from "ajv";

export const PlatformSchema: JSONSchemaType<Platform> = {
  type: "object",
  properties: {
    name: {
      type: "string",
      nullable: true,
    },
    id: {
      type: "string",
    },
    serverUrl: {
      type: "string",
    },
    type: {
      type: "string",
      enum: [PlatformType.GITHUB, PlatformType.GITLAB],
    },
    apiUrl: {
      type: "string",
    },
    tokenId: {
      type: "string"
    }
  },
  required: ["apiUrl", "id", "type", "serverUrl", "tokenId"],
  if: {
    properties: {
      type: {
        enum: [PlatformType.GITHUB],
      },
    },
  },
  then: {
    properties: {
      apiUrl: {
        default: DEFAULT_GITHUB_API_URL,
      },
      serverUrl: {
        default: DEFAULT_GITHUB_SERVER_URL,
      },
      tokenId: {
        default: DEFAULT_GITHUB_TOKEN_ID
      }
    },
  },
  else: {
    properties: {
      apiUrl: {
        default: DEFAULT_GITLAB_API_URL,
      },
      serverUrl: {
        default: DEFAULT_GITLAB_SERVER_URL,
      },
      tokenId: {
        default: DEFAULT_GITLAB_TOKEN_ID
      }
    },
  },
};
