const { errorResponse } = require("../../configs/route.config");
const listService = require("../../models/list/list.service");

async function addList(req, res) {
  if (await listService.isExists(req.body))
    return res.status(400).json({ error: "List already exist" });
  try {
    const list = await listService.addList(req.body);
    return res.status(201).json(list);
  } catch (error) {
    console.log(error);
    return res.status(500).send(errorResponse.DEFAULT_500_ERROR);
  }
}

async function getRandomLists(req, res) {
  const { type, genre, limit } = req.query;
  try {
    const lists = await listService.getRandomLists(type, genre, +limit);
    return res.status(200).json(lists);
  } catch (error) {
    console.log(error);
    return res.status(500).send(errorResponse.DEFAULT_500_ERROR);
  }
}

async function deleteList(req, res) {
  try {
    const deletedlist = await listService.deleteListByID(req.params.id);
    if (!deletedlist) {
      return res.status(404).send(errorResponse.DEFAULT_404_ERROR);
    }
    return res.status(200).json(deletedlist);
  } catch (error) {
    console.log(error);
    return res.status(500).send(errorResponse.DEFAULT_500_ERROR);
  }
}

module.exports = {
  addList,
  getRandomLists,
  deleteList,
};
