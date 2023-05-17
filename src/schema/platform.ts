import {
  DEFAULT_GITHUB_API_URL,
  DEFAULT_GITHUB_SERVER_URL,
  DEFAULT_GITLAB_API_URL,
  DEFAULT_GITLAB_SERVER_URL,
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
  },
  required: ["apiUrl", "id", "type", "serverUrl"],
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
    },
  },
};
