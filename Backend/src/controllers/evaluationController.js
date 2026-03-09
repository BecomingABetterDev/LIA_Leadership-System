import Grade from "../models/Grade.js";
import Event from "../models/Event.js";

export const createGradeMapping = async (req, res) => {
  try {
    const { maximumValue, minimumValue, gradeLetter } = req.body;

    const grade = await Grade.create({
      maximumValue,
      minimumValue,
      gradeLetter: gradeLetter.toUpperCase()
    });

    res.status(201).json({
      message: "Grade mapping created",
      grade
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateGradeMapping = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedGrade = await Grade.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedGrade) {
      return res.status(404).json({ message: "Grade not found" });
    }

    res.status(200).json({
      message: "Grade mapping updated",
      grade: updatedGrade
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteGradeMapping = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Grade.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Grade not found" });
    }

    res.status(200).json({
      message: "Grade mapping deleted"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listAllGrades = async (req, res) => {
  try {
    const grades = await Grade.find().sort({ maximumValue: -1 });

    res.status(200).json(grades);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createFixedEvent = async (req, res) => {
  try {
    const { title, description, tokenValue } = req.body;

    const event = await Event.create({
      title,
      description,
      tokenValue,
      isFixed: true
    });

    res.status(201).json({
      message: "Fixed event created",
      event
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateFixedEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    if (!updatedEvent || !updatedEvent.isFixed) {
      return res.status(404).json({ message: "Fixed event not found" });
    }

    res.status(200).json({
      message: "Fixed event updated",
      event: updatedEvent
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteFixedEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedEvent = await Event.findByIdAndDelete(id);

    if (!deletedEvent || !deletedEvent.isFixed) {
      return res.status(404).json({ message: "Fixed event not found" });
    }

    res.status(200).json({
      message: "Fixed event deleted"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
