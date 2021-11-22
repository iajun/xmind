import createGraph from "../index";
import IManager from "../command/manager";
import IGraph from "../graph";

let graph!: IGraph;
let manager!: IManager;

const leaf1 = {
  id: "2",
  parentId: "1",
  nextId: "3",
  label: "leaf1",
};

const leaf2 = {
  id: "3",
  parentId: "1",
  nextId: null,
  label: "leaf1",
};

const data = {
  id: "1",
  parentId: null,
  nextId: null,
  label: "root",
  children: [leaf1, leaf2],
};

const getData = () => graph.get("data");

beforeEach(() => {
  document.body.innerHTML = "<div id='mindmap'></div>";

  graph = createGraph({
    data,
    container: "mindmap",
    width: 1400,
    height: 800,
  });
  manager = graph.get("command");
});

it("cut & paste", () => {
  graph.setSelectedItems(["2"]);
  expect(manager.command.cut.canExecute()).toBe(true);
  manager.execute("cut");
  expect(getData()).toMatchObject({
    id: "1",
    parentId: null,
    nextId: null,
    children: [
      {
        id: "3",
        parentId: "1",
        nextId: null,
      },
    ],
  });

  graph.setSelectedItems(["3"]);
  manager.execute("paste");
  expect(getData()).toMatchObject({
    id: "1",
    parentId: null,
    nextId: null,
    children: [
      {
        id: "3",
        parentId: "1",
        nextId: null,
        children: [
          {
            parentId: "3",
            nextId: null,
          },
        ],
      },
    ],
  });
});


it("topic", () => {
  graph.setSelectedItems(["2"]);
  // manager.execute("topic");
  console.log(getData())

  // expect(getData()).toMatchObject({
  //   id: "1",
  //   parentId: null,
  //   nextId: null,
  //   children: [
  //     {
  //       id: '2',
  //       parentId: '1',
  //       nextId: '3',
  //     },
  //     {
  //       parentId: '1',
  //       nextId: '3'
  //     },
  //     {
  //       id: "3",
  //       parentId: "1",
  //       nextId: null
  //     },
  //   ],
  // });

});


