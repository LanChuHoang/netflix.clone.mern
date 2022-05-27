const { default: mongoose } = require("mongoose");
const userModel = require("../../models/user.model");
const aesCipher = require("../../services/aesCipher");

function responseInvalidQueryError(req, res) {
  return res.status(400).send({ error: "Invalid Query" });
}
// GET /user?after_id:0&limit=10&sort_by=_id:desc
async function getAllUsers(req, res) {
  const { after_id: afterID, limit, sort_by: sortOptions } = req.query;
  const sort = sortOptions ? {} : null;
  sortOptions?.split(",").forEach((option) => {
    [field, order] = option.split(":");
    sort[field] = order;
  });

  try {
    const users = await userModel.getAllUsers(afterID, limit, sort);
    const responseData = {
      docs: users,
      afterID: afterID ? afterID : null,
      limit: limit ? limit : 10,
      sort: sort,
    };
    return res.status(200).json(responseData);
  } catch (error) {
    console.log(error);
    if (
      error instanceof mongoose.Error.CastError ||
      error instanceof TypeError
    ) {
      return responseInvalidQueryError(req, res);
    }
    return res.status(500).send({ error: "Something went wrong" });
  }
}

async function getUser(req, res) {
  try {
    const user = await userModel.findUserByID(req.params.id);
    if (!user) {
      return res.status(404).send({ error: "Not found any matched user" });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: "Something went wrong" });
  }
}

async function updateUser(req, res) {
  try {
    if (req.body.password) {
      req.body.password = aesCipher.encrypt(req.body.password);
    }
    const updatedUser = await userModel.updateUser(req.params.id, req.body);
    if (!updatedUser) {
      return res.status(404).send({ error: "Not found any matched user" });
    }
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: "Something went wrong" });
  }
}

async function deleteUser(req, res) {
  try {
    const deletedUser = await userModel.deleteUserByID(req.params.id);
    if (!deletedUser) {
      return res.status(404).send({ error: "Not found any matched user" });
    }
    return res.status(200).json(deletedUser);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: "Something went wrong" });
  }
}

async function getNumUserPerMonth(req, res) {
  try {
    const data = await userModel.getNumUserPerMonth();
    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: "Something went wrong" });
  }
}

module.exports = {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  getNumUserPerMonth,
};
