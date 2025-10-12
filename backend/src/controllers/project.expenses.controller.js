import mongoose from "mongoose";
import Project from "../models/Project.js";

function assertOwner(doc, userId) {
  if (!doc || String(doc.owner) !== String(userId)) {
    const err = new Error("Project not found");
    err.status = 404;
    throw err;
  }
}

/** POST /api/projects/:id/expenses  { name, allocated?, actual? } */
export async function addExpenseCategory(req, res) {
  try {
    const { id } = req.params;
    const { name, allocated = 0, actual = 0 } = req.body;

    if (!name?.trim()) return res.status(400).json({ message: "name is required" });

    const project = await Project.findById(id);
    assertOwner(project, req.user._id);

    project.expenses.push({
      _id: new mongoose.Types.ObjectId(),
      name: name.trim(),
      allocated: Number(allocated || 0),
      actual: Number(actual || 0),
    });

    await project.save(); // triggers validations
    return res.status(201).json({ project });
  } catch (err) {
    return res.status(err.status || 400).json({ message: err.message || "Failed to add category" });
  }
}

/** PATCH /api/projects/:id/expenses/:expId  { name?, allocated?, actual? } */
export async function updateExpenseCategory(req, res) {
  try {
    const { id, expId } = req.params;
    const { name, allocated, actual } = req.body;

    const project = await Project.findById(id);
    assertOwner(project, req.user._id);

    const cat = project.expenses.id(expId);
    if (!cat) return res.status(404).json({ message: "Category not found" });

    if (name != null) cat.name = String(name).trim();
    if (allocated != null) cat.allocated = Number(allocated);
    if (actual != null) cat.actual = Number(actual);

    await project.save();
    return res.json({ project });
  } catch (err) {
    return res.status(err.status || 400).json({ message: err.message || "Failed to update category" });
  }
}

/** DELETE /api/projects/:id/expenses/:expId */
export async function removeExpenseCategory(req, res) {
  try {
    const { id, expId } = req.params;

    const project = await Project.findById(id);
    assertOwner(project, req.user._id);

    // const cat = project.expenses.id(expId);
    // if (!cat) return res.status(404).json({ message: "Category not found" });

    // cat.remove();
    // await project.save();

    const cat = project.expenses.id(expId);
    if (!cat) return res.status(404).json({ message: "Category not found" });

    // Mongoose v7: use deleteOne() on the subdoc, or pull() on the array
    // cat.deleteOne();              //  option A
    project.expenses.pull({ _id: cat._id }); //option B (safe with string/ObjectId)
    await project.save();

    return res.json({ project });
  } catch (err) {
    return res.status(err.status || 400).json({ message: err.message || "Failed to remove category" });
  }
}
