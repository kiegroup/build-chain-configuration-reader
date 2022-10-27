import { Node } from "@bc-cr/domain/node";
import * as reader from "@bc-cr/reader";
import { getTree, getTreeForProject, parentChainFromNode } from "@bc-cr/tree";
import * as constructTree from "@bc-cr/util/construct-tree";

test("get tree", async () => {
  const readDefinitionFileSpy = jest
    .spyOn(reader, "readDefinitionFile")
    .mockImplementation(async () => ({ dependencies: [], version: "2.1" }));
  const constructTreeSpy = jest
    .spyOn(constructTree, "constructTree")
    .mockImplementation(() => []);
  await expect(getTree("definitionFile")).resolves.toStrictEqual([]);
  expect(readDefinitionFileSpy).toHaveBeenCalledTimes(1);
  expect(constructTreeSpy).toHaveBeenCalledTimes(1);
});

const nodeChain: Node[] = [
  {
    project: "project1",
    children: [
      {
        project: "project4",
        children: [
          {
            project: "project6",
            children: [],
            parents: [
              {
                project: "project4",
                children: [],
                parents: [{ project: "project1", children: [], parents: [] }],
              },
            ],
          },
        ],
        parents: [{ project: "project1", children: [], parents: [] }],
      },
      {
        project: "project7",
        children: [],
        parents: [{ project: "project1", children: [], parents: [] }],
      },
    ],
    parents: [],
  },
  { project: "project2", children: [], parents: [] },
  {
    project: "project3",
    children: [
      {
        project: "project5",
        children: [],
        parents: [{ project: "project3", parents: [], children: [] }],
      },
    ],
    parents: [],
  },
];

test.each([
  ["root", "project2", nodeChain[1]],
  ["non-root", "project6", nodeChain[0].children[0].children[0]],
  ["not found", "project10", undefined],
])(
  "get tree for project - %p",
  async (_title: string, project: string, expected: Node | undefined) => {
    jest
      .spyOn(reader, "readDefinitionFile")
      .mockImplementation(async () => ({ dependencies: [], version: "2.1" }));
    jest
      .spyOn(constructTree, "constructTree")
      .mockImplementation(() => nodeChain);

    await expect(
      getTreeForProject("definitionFile", project)
    ).resolves.toStrictEqual(expected);
  }
);

test.each([
  ["no parents", nodeChain[1], [nodeChain[1]]],
  [
    "parents",
    nodeChain[0].children[0].children[0],
    [
      { project: "project1", children: [], parents: [] },
      {
        project: "project4",
        children: [],
        parents: [{ project: "project1", children: [], parents: [] }],
      },
      {
        project: "project6",
        children: [],
        parents: [
          {
            project: "project4",
            children: [],
            parents: [{ project: "project1", children: [], parents: [] }],
          },
        ],
      },
    ],
  ],
])(
  "get parent chain for node - %p",
  (_title: string, project: Node, expected: Node[] | undefined) => {
    jest
      .spyOn(reader, "readDefinitionFile")
      .mockImplementation(async () => ({ dependencies: [], version: "2.1" }));
    jest
      .spyOn(constructTree, "constructTree")
      .mockImplementation(() => nodeChain);

    expect(parentChainFromNode(project)).toStrictEqual(expected);
  }
);
