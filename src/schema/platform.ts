import {
  DEFAULT_GERRIT_PLATFORM,
  DEFAULT_GITHUB_PLATFORM,
  DEFAULT_GITLAB_PLATFORM,
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
      not: {
        type: "string",
        enum: [DEFAULT_GITHUB_PLATFORM.id, DEFAULT_GITLAB_PLATFORM.id, DEFAULT_GERRIT_PLATFORM.id]
      }
    },
    serverUrl: {
      type: "string",
    },
    type: {
      type: "string",
      enum: [PlatformType.GITHUB, PlatformType.GITLAB, PlatformType.GERRIT],
    },
    apiUrl: {
      type: "string",
    },
    tokenId: {
      type: "string"
    }
  },
  required: ["apiUrl", "id", "type", "serverUrl", "tokenId"],
  allOf: [
    {
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
            default: DEFAULT_GITHUB_PLATFORM.apiUrl,
          },
          serverUrl: {
            default: DEFAULT_GITHUB_PLATFORM.serverUrl,
          },
          tokenId: {
            default: DEFAULT_GITHUB_PLATFORM.tokenId
          }
        },
      },
    },
    {
      if: {
        properties: {
          type: {
            enum: [PlatformType.GITLAB],
          },
        },
      },
      then: {
        properties: {
          apiUrl: {
            default: DEFAULT_GITLAB_PLATFORM.apiUrl,
          },
          serverUrl: {
            default: DEFAULT_GITLAB_PLATFORM.serverUrl,
          },
          tokenId: {
            default: DEFAULT_GITLAB_PLATFORM.tokenId
          }
        },
      },
    }, 
    {
      if: {
        properties: {
          type: {
            enum: [PlatformType.GERRIT],
          },
        },
      },
      then: {
        properties: {
          apiUrl: {
            default: DEFAULT_GERRIT_PLATFORM.apiUrl,
          },
          serverUrl: {
            default: DEFAULT_GERRIT_PLATFORM.serverUrl,
          },
          tokenId: {
            default: DEFAULT_GERRIT_PLATFORM.tokenId
          }
        },
      },
    }
  ]
};
