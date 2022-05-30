const listService = require("../../models/list/list.service");

function responseInvalidQueryError(req, res) {
  return res.status(400).send({ error: "Invalid Query" });
}

async function addList(req, res) {
  if (await listService.isExists(req.body))
    return res.status(400).json({ error: "List already exist" });
  try {
    const list = await listService.addList(req.body);
    return res.status(201).json(list);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: "Something went wrong" });
  }
}

async function getRandomLists(req, res) {
  const { type, genre, limit } = req.query;
  try {
    const lists = await listService.getRandomLists(type, genre, +limit);
    return res.status(200).json(lists);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: "Something went wrong" });
  }
}

async function deleteList(req, res) {
  try {
    const deletedlist = await listService.deleteListByID(req.params.id);
    if (!deletedlist) {
      return res.status(404).send({ error: "Not found any matched user" });
    }
    return res.status(200).json(deletedlist);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: "Something went wrong" });
  }
}

module.exports = {
  addList,
  getRandomLists,
  deleteList,
};
